BEGIN;

-- Each CaseLab attempt is append-only at the API layer. The runtime role can
-- read and insert its own attempts, but cannot update or delete prior attempts.
CREATE TABLE IF NOT EXISTS case_submissions (
  submission_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES learner_profiles(user_id),
  case_id TEXT NOT NULL CHECK (length(case_id) BETWEEN 1 AND 120),
  case_revision TEXT NOT NULL CHECK (length(case_revision) BETWEEN 1 AND 40),
  attempt_no INTEGER NOT NULL CHECK (attempt_no >= 1),
  evidence_refs JSONB NOT NULL DEFAULT '[]'::jsonb CHECK (jsonb_typeof(evidence_refs) = 'array'),
  hypothesis_id TEXT NOT NULL CHECK (length(hypothesis_id) BETWEEN 1 AND 100),
  response_actions JSONB NOT NULL DEFAULT '[]'::jsonb CHECK (jsonb_typeof(response_actions) = 'array'),
  findings TEXT NOT NULL DEFAULT '' CHECK (length(findings) <= 4000),
  validation_plan TEXT NOT NULL CHECK (length(validation_plan) BETWEEN 10 AND 2000),
  score SMALLINT NOT NULL CHECK (score BETWEEN 0 AND 100),
  rubric_feedback JSONB NOT NULL CHECK (jsonb_typeof(rubric_feedback) = 'array'),
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, case_id, case_revision, attempt_no)
);

CREATE INDEX IF NOT EXISTS case_submissions_owner_recent_idx
  ON case_submissions(user_id, submitted_at DESC);
CREATE INDEX IF NOT EXISTS case_submissions_case_revision_idx
  ON case_submissions(case_id, case_revision, submitted_at DESC);

ALTER TABLE case_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_submissions FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS case_submissions_self ON case_submissions;
CREATE POLICY case_submissions_self ON case_submissions
  USING (user_id = public.ocp_current_user_id())
  WITH CHECK (user_id = public.ocp_current_user_id());

REVOKE ALL ON TABLE case_submissions FROM PUBLIC;
GRANT SELECT, INSERT ON TABLE case_submissions TO opencyberpath_runtime;
REVOKE UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER ON TABLE case_submissions FROM opencyberpath_runtime;

COMMIT;
