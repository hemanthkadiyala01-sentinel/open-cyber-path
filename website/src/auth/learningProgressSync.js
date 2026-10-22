const CHECKPOINT_FIELDS = ['understood', 'practised', 'evidence'];
const CLOUD_RECORD_KIND = 'opencyberpath-module-checkpoint';

function moduleKey(pathId, moduleTitle) {
  return `${pathId}::${moduleTitle}`;
}

function slug(value) {
  return String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'module';
}

function shortHash(value) {
  let hash = 2166136261;
  for (const char of String(value)) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36);
}

function itemIdFor(pathId, moduleTitle) {
  const combined = `${pathId}::${moduleTitle}`;
  // Use a stable suffix so similarly named modules do not collide after slugging.
  return `ocp.module.${slug(pathId).slice(0, 24)}.${slug(moduleTitle).slice(0, 72)}.${shortHash(combined)}`.slice(0, 128);
}

function stableValue(value) {
  if (Array.isArray(value)) return value.map(stableValue);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, stableValue(value[key])]));
  }
  return value;
}

export function cloudProgressSignature(value) {
  return JSON.stringify(stableValue(value));
}

function checkpointsFrom(value) {
  return Object.fromEntries(CHECKPOINT_FIELDS.map((field) => [field, value?.[field] === true]));
}

function statusFrom(checkpoints) {
  const completed = CHECKPOINT_FIELDS.filter((field) => checkpoints[field] === true).length;
  return {
    status: completed === CHECKPOINT_FIELDS.length ? 'completed' : completed > 0 ? 'in_progress' : 'not_started',
    percent: completed === CHECKPOINT_FIELDS.length ? 100 : Math.round((completed / CHECKPOINT_FIELDS.length) * 100),
  };
}

export function moduleProgressToCloudRecords(progress = {}) {
  return Object.entries(progress).flatMap(([key, value]) => {
    if (!value || typeof value !== 'object') return [];
    const separator = key.indexOf('::');
    if (separator < 1) return [];
    const pathId = key.slice(0, separator);
    const moduleTitle = key.slice(separator + 2);
    if (!pathId || !moduleTitle) return [];
    const checkpoints = checkpointsFrom(value);
    const updatedAt = typeof value.updatedAt === 'string' && Number.isFinite(Date.parse(value.updatedAt))
      ? new Date(value.updatedAt).toISOString()
      : null;
    const progressStatus = statusFrom(checkpoints);
    return [{
      localKey: key,
      itemId: itemIdFor(pathId, moduleTitle),
      payload: {
        ...progressStatus,
        metadata: {
          kind: CLOUD_RECORD_KIND,
          schemaVersion: 1,
          pathId,
          moduleTitle,
          checkpoints,
          clientUpdatedAt: updatedAt,
        },
      },
    }];
  });
}

export function moduleProgressFromCloudItems(items = [], paths = []) {
  const known = new Set(paths.flatMap((path) => (path.modules || []).map((module) => moduleKey(path.id, module.title))));
  const result = {};
  for (const item of items) {
    const metadata = item?.metadata;
    if (!metadata || metadata.kind !== CLOUD_RECORD_KIND || metadata.schemaVersion !== 1) continue;
    if (typeof metadata.pathId !== 'string' || typeof metadata.moduleTitle !== 'string') continue;
    const key = moduleKey(metadata.pathId, metadata.moduleTitle);
    if (!known.has(key)) continue;
    const updatedAt = typeof metadata.clientUpdatedAt === 'string' && Number.isFinite(Date.parse(metadata.clientUpdatedAt))
      ? new Date(metadata.clientUpdatedAt).toISOString()
      : (typeof item.updated_at === 'string' ? item.updated_at : null);
    result[key] = { ...checkpointsFrom(metadata.checkpoints), ...(updatedAt ? { updatedAt } : {}) };
  }
  return result;
}

export function moduleProgressCloudBaseline(items = [], paths = []) {
  const known = new Set(paths.flatMap((path) => (path.modules || []).map((module) => moduleKey(path.id, module.title))));
  const result = new Map();
  for (const item of items) {
    const metadata = item?.metadata;
    if (!metadata || metadata.kind !== CLOUD_RECORD_KIND || metadata.schemaVersion !== 1) continue;
    if (typeof metadata.pathId !== 'string' || typeof metadata.moduleTitle !== 'string') continue;
    const key = moduleKey(metadata.pathId, metadata.moduleTitle);
    if (!known.has(key)) continue;
    result.set(key, cloudProgressSignature({ status: item.status, percent: Number(item.percent), metadata }));
  }
  return result;
}

export function mergeModuleProgress(local = {}, remote = {}) {
  const merged = { ...local };
  for (const [key, remoteValue] of Object.entries(remote)) {
    const localValue = merged[key];
    if (!localValue) {
      merged[key] = remoteValue;
      continue;
    }
    const localTime = typeof localValue.updatedAt === 'string' ? Date.parse(localValue.updatedAt) || 0 : 0;
    const remoteTime = typeof remoteValue.updatedAt === 'string' ? Date.parse(remoteValue.updatedAt) || 0 : 0;
    if (remoteTime > localTime) {
      merged[key] = remoteValue;
    } else if (localTime > remoteTime) {
      // The newer device-local value wins, including intentional unchecking.
      continue;
    } else {
      // Older records have no reliable timestamp. Preserve checked work until a newer edit resolves it.
      merged[key] = {
        ...localValue,
        ...Object.fromEntries(CHECKPOINT_FIELDS.map((field) => [field, localValue[field] === true || remoteValue[field] === true])),
        ...(localValue.updatedAt || remoteValue.updatedAt ? { updatedAt: localValue.updatedAt || remoteValue.updatedAt } : {}),
      };
    }
  }
  return merged;
}
