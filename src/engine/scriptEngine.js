import CryptoJS from 'crypto-js';
import { resolveVariables } from './variableResolver.js';

export function executePreRequestScript(scriptArrayOrStr, context) {
  let scriptText = '';
  if (Array.isArray(scriptArrayOrStr)) {
    scriptText = scriptArrayOrStr.join('\n');
  } else if (typeof scriptArrayOrStr === 'string') {
    scriptText = scriptArrayOrStr;
  }

  if (!scriptText.trim()) {
    return { context, logs: [] };
  }

  const logs = [];
  const localVars = { ...context.localVars };
  const collectionVars = { ...context.collectionVars };

  // Copy headers array into dynamic header map
  const headersMap = new Map();
  (context.request.header || []).forEach(h => {
    headersMap.set(h.key.toLowerCase(), { key: h.key, value: h.value });
  });

  const getPathWithQuery = () => {
    const rawUrl = context.request.url?.raw || '';
    const resolvedUrl = resolveVariables(rawUrl, {
      collection: collectionVars,
      local: localVars,
      environment: context.environmentVars
    });
    try {
      if (resolvedUrl.startsWith('http://') || resolvedUrl.startsWith('https://')) {
        const u = new URL(resolvedUrl);
        return u.pathname + u.search;
      } else {
        const idx = resolvedUrl.indexOf('/');
        return idx !== -1 ? resolvedUrl.substring(idx) : resolvedUrl;
      }
    } catch (e) {
      return resolvedUrl;
    }
  };

  const pm = {
    collectionVariables: {
      get: (key) => collectionVars[key],
      set: (key, val) => { collectionVars[key] = val; }
    },
    variables: {
      get: (key) => localVars[key] || collectionVars[key],
      set: (key, val) => { localVars[key] = val; },
      replaceIn: (str) => resolveVariables(str, { collection: collectionVars, local: localVars })
    },
    request: {
      method: context.request.method || 'GET',
      url: {
        getPathWithQuery
      },
      body: context.request.body || { mode: 'raw', raw: '' },
      headers: {
        get: (key) => {
          const item = headersMap.get(key.toLowerCase());
          return item ? item.value : null;
        },
        upsert: ({ key, value }) => {
          headersMap.set(key.toLowerCase(), { key, value });
        }
      }
    }
  };

  const consoleMock = {
    log: (...args) => logs.push(['log', args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ')]),
    error: (...args) => logs.push(['error', args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ')]),
    warn: (...args) => logs.push(['warn', args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ')])
  };

  try {
    const sandbox = new Function('pm', 'CryptoJS', 'console', scriptText);
    sandbox(pm, CryptoJS, consoleMock);
  } catch (err) {
    logs.push(['error', `Pre-request script error: ${err.message}`]);
  }

  // Convert headers back to array
  const updatedHeaders = Array.from(headersMap.values());

  return {
    localVars,
    collectionVars,
    updatedHeaders,
    logs
  };
}

export function executeTestScript(scriptArrayOrStr, responseObj, context) {
  let scriptText = '';
  if (Array.isArray(scriptArrayOrStr)) {
    scriptText = scriptArrayOrStr.join('\n');
  } else if (typeof scriptArrayOrStr === 'string') {
    scriptText = scriptArrayOrStr;
  }

  const testResults = [];
  const logs = [];
  const collectionVars = { ...context.collectionVars };

  if (!scriptText.trim()) {
    return { testResults, logs, collectionVars };
  }

  const pm = {
    collectionVariables: {
      get: (key) => collectionVars[key],
      set: (key, val) => { collectionVars[key] = val; }
    },
    response: {
      code: responseObj.status,
      status: responseObj.statusText || 'OK',
      to: {
        have: {
          status: (expectedCode) => {
            if (responseObj.status !== expectedCode) {
              throw new Error(`Expected status ${expectedCode} but got ${responseObj.status}`);
            }
          }
        }
      },
      json: () => {
        try {
          return typeof responseObj.data === 'string' ? JSON.parse(responseObj.data) : responseObj.data;
        } catch (e) {
          throw new Error('Failed to parse response body as JSON');
        }
      },
      headers: {
        get: (key) => {
          const hKey = Object.keys(responseObj.headers || {}).find(k => k.toLowerCase() === key.toLowerCase());
          return hKey ? responseObj.headers[hKey] : null;
        }
      }
    },
    test: (name, testFn) => {
      try {
        testFn();
        testResults.push({ name, passed: true, error: null });
      } catch (err) {
        testResults.push({ name, passed: false, error: err.message });
      }
    },
    expect: (actual) => {
      return {
        to: {
          be: {
            true: actual === true,
            false: actual === false,
            a: (type) => {
              if (typeof actual !== type) throw new Error(`Expected type ${type} but got ${typeof actual}`);
            }
          },
          have: {
            status: (code) => {
              if (responseObj.status !== code) throw new Error(`Expected status ${code} but got ${responseObj.status}`);
            }
          },
          include: (val) => {
            if (Array.isArray(actual)) {
              if (!actual.includes(val)) throw new Error(`Expected array to include ${val}`);
            } else if (typeof actual === 'string') {
              if (!actual.includes(val)) throw new Error(`Expected string to include ${val}`);
            }
          },
          satisfy: (fn) => {
            if (!fn(actual)) throw new Error(`Expected condition to be satisfied`);
          }
        }
      };
    }
  };

  const consoleMock = {
    log: (...args) => logs.push(['log', args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ')]),
    error: (...args) => logs.push(['error', args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ')])
  };

  try {
    const sandbox = new Function('pm', 'CryptoJS', 'console', scriptText);
    sandbox(pm, CryptoJS, consoleMock);
  } catch (err) {
    logs.push(['error', `Test script execution error: ${err.message}`]);
  }

  return {
    testResults,
    logs,
    collectionVars
  };
}
