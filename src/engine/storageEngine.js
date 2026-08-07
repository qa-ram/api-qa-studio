import { DEFAULT_COLLECTION } from './defaultCollection';

const STORAGE_KEYS = {
  COLLECTION: 'APEX_QA_COLLECTION_V1',
  ENVIRONMENTS: 'APEX_QA_ENVIRONMENTS_V1',
  ACTIVE_ENV_ID: 'APEX_QA_ACTIVE_ENV_ID_V1',
  ACTIVE_REQ_ID: 'APEX_QA_ACTIVE_REQ_ID_V1'
};

export function loadSavedCollection() {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.COLLECTION);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.item) return parsed;
    }
  } catch (e) {
    console.error('Failed to load saved collection from localStorage:', e);
  }
  return DEFAULT_COLLECTION;
}

export function saveCollection(collection) {
  try {
    localStorage.setItem(STORAGE_KEYS.COLLECTION, JSON.stringify(collection));
  } catch (e) {
    console.error('Failed to save collection to localStorage:', e);
  }
}

export function loadSavedEnvironments() {
  const defaultEnvs = {
    'Local': {
      name: 'Local',
      vars: {
        baseUrl: "http://localhost:5000",
        hmacAppKey: "DEMO_APP_KEY_8812",
        hmacSecret: "c2VjcmV0X2tleV9kZW1vXzEyMzQ1Njc4OTA=",
        bulkJobId: "61a3b75c-b788-4173-aa07-a203ba21bbe7"
      }
    },
    'Staging': {
      name: 'Staging',
      vars: {
        baseUrl: "https://api-qa.emgenex.dev",
        hmacAppKey: "STAGING_APP_KEY_9901",
        hmacSecret: "c3RhZ2luZ19zZWNyZXRfa2V5XzEyMzQ1",
        bulkJobId: "job-staging-001"
      }
    },
    'Production': {
      name: 'Production',
      vars: {
        baseUrl: "https://api.emgenex.com",
        hmacAppKey: "PROD_APP_KEY_7741",
        hmacSecret: "cHJvZF9zZWNyZXRfa2V5Xzk5ODg3Nw==",
        bulkJobId: "job-prod-001"
      }
    }
  };

  try {
    const saved = localStorage.getItem(STORAGE_KEYS.ENVIRONMENTS);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && Object.keys(parsed).length > 0) return parsed;
    }
  } catch (e) {
    console.error('Failed to load saved environments from localStorage:', e);
  }
  return defaultEnvs;
}

export function saveEnvironments(environments) {
  try {
    localStorage.setItem(STORAGE_KEYS.ENVIRONMENTS, JSON.stringify(environments));
  } catch (e) {
    console.error('Failed to save environments to localStorage:', e);
  }
}

export function loadSavedActiveEnvId() {
  try {
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_ENV_ID) || 'Local';
  } catch (e) {
    return 'Local';
  }
}

export function saveActiveEnvId(envId) {
  try {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_ENV_ID, envId);
  } catch (e) {}
}

export function clearAllPersistentData() {
  try {
    localStorage.removeItem(STORAGE_KEYS.COLLECTION);
    localStorage.removeItem(STORAGE_KEYS.ENVIRONMENTS);
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_ENV_ID);
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_REQ_ID);
  } catch (e) {}
}
