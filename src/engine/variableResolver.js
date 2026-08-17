export function resolveVariables(str, variableScopes = {}) {
  if (typeof str !== 'string') return str;

  const { globals = {}, environment = {}, collection = {}, local = {} } = variableScopes;

  // Merge scopes: local > environment > collection > globals
  const merged = {
    ...globals,
    ...collection,
    ...environment,
    ...local
  };

  return str.replace(/\{\{\s*([\$\w_]+)\s*\}\}/g, (match, varName) => {
    // Check dynamic generators
    if (varName === '$guid') {
      return 'f47ac10b-58cc-4372-a567-0e02b2c3d479'.replace(/[09]/g, () => Math.floor(Math.random() * 16).toString(16));
    }
    if (varName === '$timestamp') {
      return Math.floor(Date.now() / 1000).toString();
    }
    if (varName === '$isoTimestamp') {
      return new Date().toISOString();
    }
    if (varName === '$randomInt') {
      return Math.floor(Math.random() * 1000).toString();
    }

    if (merged[varName] !== undefined && merged[varName] !== null) {
      return merged[varName];
    }
    return match;
  });
}

export function parseHeaders(headersList, variableScopes) {
  if (!Array.isArray(headersList)) return {};
  const result = {};
  headersList.forEach(h => {
    if (h.disabled) return;
    const key = resolveVariables(h.key, variableScopes);
    const value = resolveVariables(h.value || '', variableScopes);
    if (key) {
      result[key] = value;
    }
  });
  return result;
}
