BEGIN;

-- The signing key is writable by the owner/migration role only. Runtime API code
-- cannot read this table; it can only call the RLS helper that verifies a signature.
CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC;
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;
CREATE TABLE IF NOT EXISTS private.rls_secret (
  singleton BOOLEAN PRIMARY KEY DEFAULT TRUE CHECK (singleton = TRUE),
  secret TEXT NOT NULL CHECK (length(secret) >= 64)
);
REVOKE ALL ON TABLE private.rls_secret FROM PUBLIC;

CREATE TABLE IF NOT EXISTS learner_profiles (
  user_id TEXT PRIMARY KEY,
  email TEXT,
  display_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS learning_progress (
  user_id TEXT NOT NULL REFERENCES learner_profiles(user_id) ON DELETE CASCADE,
  item_id TEXT NOT NULL CHECK (length(item_id) BETWEEN 1 AND 128),
  status TEXT NOT NULL CHECK (status IN ('not_started', 'in_progress', 'completed')),
  percent SMALLINT NOT NULL CHECK (percent BETWEEN 0 AND 100),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(metadata) = 'object'),
  last_activity_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, item_id),
  CHECK (status <> 'completed' OR percent = 100)
);

CREATE TABLE IF NOT EXISTS learner_notes (
  note_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES learner_profiles(user_id) ON DELETE CASCADE,
  title TEXT NOT NULL CHECK (length(title) BETWEEN 1 AND 160),
  content TEXT NOT NULL CHECK (length(content) <= 20000),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS evidence_records (
  evidence_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES learner_profiles(user_id) ON DELETE CASCADE,
  evidence_type TEXT NOT NULL CHECK (length(evidence_type) BETWEEN 1 AND 80),
  title TEXT NOT NULL CHECK (length(title) BETWEEN 1 AND 180),
  summary TEXT NOT NULL DEFAULT '' CHECK (length(summary) <= 4000),
  private_object_key TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(metadata) = 'object'),
  evidence_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS learning_progress_updated_idx ON learning_progress(user_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS learner_notes_updated_idx ON learner_notes(user_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS evidence_records_created_idx ON evidence_records(user_id, created_at DESC);

CREATE OR REPLACE FUNCTION public.ocp_set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = pg_catalog
AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$;

-- Verify a signed identity context rather than trusting a user_id setting alone.
-- A compromised/mis-scoped query cannot impersonate another user by merely
-- changing app.current_user_id; it would also need the backend HMAC secret.
CREATE OR REPLACE FUNCTION public.ocp_current_user_id()
RETURNS TEXT
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, private, public
AS $$
DECLARE
  request_user TEXT;
  request_signature TEXT;
  signing_secret TEXT;
  expected_signature TEXT;
BEGIN
  request_user := current_setting('app.current_user_id', TRUE);
  request_signature := current_setting('app.current_user_signature', TRUE);
  IF request_user IS NULL OR request_signature IS NULL THEN
    RETURN NULL;
  END IF;
  SELECT secret INTO signing_secret FROM private.rls_secret WHERE singleton = TRUE;
  IF signing_secret IS NULL THEN
    RETURN NULL;
  END IF;
  expected_signature := encode(public.hmac(request_user, signing_secret, 'sha256'), 'hex');
  IF expected_signature <> request_signature THEN
    RETURN NULL;
  END IF;
  RETURN request_user;
END;
$$;

DROP TRIGGER IF EXISTS learner_profiles_updated_at ON learner_profiles;
CREATE TRIGGER learner_profiles_updated_at BEFORE UPDATE ON learner_profiles
FOR EACH ROW EXECUTE FUNCTION public.ocp_set_updated_at();
DROP TRIGGER IF EXISTS learning_progress_updated_at ON learning_progress;
CREATE TRIGGER learning_progress_updated_at BEFORE UPDATE ON learning_progress
FOR EACH ROW EXECUTE FUNCTION public.ocp_set_updated_at();
DROP TRIGGER IF EXISTS learner_notes_updated_at ON learner_notes;
CREATE TRIGGER learner_notes_updated_at BEFORE UPDATE ON learner_notes
FOR EACH ROW EXECUTE FUNCTION public.ocp_set_updated_at();
DROP TRIGGER IF EXISTS evidence_records_updated_at ON evidence_records;
CREATE TRIGGER evidence_records_updated_at BEFORE UPDATE ON evidence_records
FOR EACH ROW EXECUTE FUNCTION public.ocp_set_updated_at();

ALTER TABLE learner_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE learner_profiles FORCE ROW LEVEL SECURITY;
ALTER TABLE learning_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_progress FORCE ROW LEVEL SECURITY;
ALTER TABLE learner_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE learner_notes FORCE ROW LEVEL SECURITY;
ALTER TABLE evidence_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence_records FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS learner_profiles_self ON learner_profiles;
CREATE POLICY learner_profiles_self ON learner_profiles
  USING (user_id = public.ocp_current_user_id())
  WITH CHECK (user_id = public.ocp_current_user_id());
DROP POLICY IF EXISTS learning_progress_self ON learning_progress;
CREATE POLICY learning_progress_self ON learning_progress
  USING (user_id = public.ocp_current_user_id())
  WITH CHECK (user_id = public.ocp_current_user_id());
DROP POLICY IF EXISTS learner_notes_self ON learner_notes;
CREATE POLICY learner_notes_self ON learner_notes
  USING (user_id = public.ocp_current_user_id())
  WITH CHECK (user_id = public.ocp_current_user_id());
DROP POLICY IF EXISTS evidence_records_self ON evidence_records;
CREATE POLICY evidence_records_self ON evidence_records
  USING (user_id = public.ocp_current_user_id())
  WITH CHECK (user_id = public.ocp_current_user_id());

REVOKE CREATE ON SCHEMA public FROM PUBLIC;
GRANT USAGE ON SCHEMA public TO opencyberpath_runtime;
GRANT SELECT, INSERT, UPDATE, DELETE ON learner_profiles, learning_progress, learner_notes, evidence_records TO opencyberpath_runtime;
GRANT EXECUTE ON FUNCTION public.ocp_set_updated_at() TO opencyberpath_runtime;
REVOKE ALL ON FUNCTION public.ocp_current_user_id() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.ocp_current_user_id() TO opencyberpath_runtime;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO opencyberpath_runtime;

COMMIT;
