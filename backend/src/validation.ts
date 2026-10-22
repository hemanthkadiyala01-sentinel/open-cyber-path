export type ProgressStatus = 'not_started' | 'in_progress' | 'completed';

export interface ProgressInput {
  status: ProgressStatus;
  percent: number;
  metadata: Record<string, unknown>;
}

export interface NoteInput {
  title: string;
  content: string;
}

const PROGRESS_STATUSES = new Set<ProgressStatus>(['not_started', 'in_progress', 'completed']);
const ITEM_ID = /^[a-zA-Z0-9][a-zA-Z0-9._:-]{0,127}$/;

export function isValidItemId(value: unknown): value is string {
  return typeof value === 'string' && ITEM_ID.test(value);
}

export function validateProgressInput(value: unknown): { ok: true; value: ProgressInput } | { ok: false; error: string } {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return { ok: false, error: 'body_must_be_object' };
  }
  const input = value as Record<string, unknown>;
  if (Object.keys(input).some((key) => !['status', 'percent', 'metadata'].includes(key))) {
    return { ok: false, error: 'unexpected_property' };
  }
  if (typeof input.status !== 'string' || !PROGRESS_STATUSES.has(input.status as ProgressStatus)) {
    return { ok: false, error: 'invalid_status' };
  }
  if (!Number.isInteger(input.percent) || (input.percent as number) < 0 || (input.percent as number) > 100) {
    return { ok: false, error: 'percent_must_be_integer_0_to_100' };
  }
  const metadata = input.metadata === undefined ? {} : input.metadata;
  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) {
    return { ok: false, error: 'metadata_must_be_object' };
  }
  let serialized = '';
  try {
    serialized = JSON.stringify(metadata);
  } catch {
    return { ok: false, error: 'metadata_not_json_serializable' };
  }
  if (Buffer.byteLength(serialized, 'utf8') > 16_384) {
    return { ok: false, error: 'metadata_too_large' };
  }
  const status = input.status as ProgressStatus;
  return {
    ok: true,
    value: {
      status,
      percent: status === 'completed' ? 100 : input.percent as number,
      metadata: metadata as Record<string, unknown>,
    },
  };
}

export function validateNoteInput(value: unknown): { ok: true; value: NoteInput } | { ok: false; error: string } {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return { ok: false, error: 'body_must_be_object' };
  const input = value as Record<string, unknown>;
  if (Object.keys(input).some((key) => !['title', 'content'].includes(key))) return { ok: false, error: 'unexpected_property' };
  if (typeof input.title !== 'string' || input.title.trim().length < 1 || input.title.trim().length > 160) {
    return { ok: false, error: 'invalid_title' };
  }
  if (typeof input.content !== 'string' || input.content.length > 20_000) {
    return { ok: false, error: 'invalid_content' };
  }
  return { ok: true, value: { title: input.title.trim(), content: input.content } };
}
