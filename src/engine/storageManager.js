/**
 * Storage Manager - Handles persistent storage of environments and collections
 * Uses localStorage with optional encryption for sensitive data
 */

const STORAGE_KEYS = {
  ENVIRONMENTS: 'apex_environments',
  ACTIVE_ENV: 'apex_active_env_id',
  COLLECTION: 'apex_collection',
  UI_STATE: 'apex_ui_state',
  LAST_REQUEST_ID: 'apex_last_request_id'
};

/**
 * Simple encryption for sensitive data in localStorage
 * Note: This is NOT cryptographically secure - just basic obfuscation
 * For production, use proper encryption or server-side secrets management
 */
const SimpleCrypto = {
  encode: (str) => {
    // Base64 encoding with simple XOR - basic obfuscation only
    return btoa(str).split('').map(c => String.fromCharCode(c.charCodeAt(0) ^ 42)).join('');
  },
  
  decode: (encoded) => {
    try {
      return atob(encoded.split('').map(c => String.fromCharCode(c.charCodeAt(0) ^ 42)).join(''));
    } catch (e) {
      console.warn('Failed to decode encrypted value:', e);
      return '';
    }
  }
};

/**
 * Sensitive fields that should be encrypted in storage
 */
const SENSITIVE_FIELDS = ['hmacSecret', 'apiKey', 'token', 'password', 'secret'];

/**
 * Check if a field name is sensitive
 */
const isSensitiveField = (fieldName) => {
  return SENSITIVE_FIELDS.some(sensitive => 
    fieldName.toLowerCase().includes(sensitive.toLowerCase())
  );
};

/**
 * Encrypt sensitive values in an object
 */
const encryptSensitiveData = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  
  const encrypted = { ...obj };
  Object.keys(encrypted).forEach(key => {
    if (isSensitiveField(key) && encrypted[key]) {
      encrypted[key] = SimpleCrypto.encode(String(encrypted[key]));
    } else if (typeof encrypted[key] === 'object') {
      encrypted[key] = encryptSensitiveData(encrypted[key]);
    }
  });
  return encrypted;
};

/**
 * Decrypt sensitive values in an object
 */
const decryptSensitiveData = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  
  const decrypted = { ...obj };
  Object.keys(decrypted).forEach(key => {
    if (isSensitiveField(key) && decrypted[key]) {
      try {
        decrypted[key] = SimpleCrypto.decode(String(decrypted[key]));
      } catch (e) {
        console.warn(`Failed to decrypt field ${key}:`, e);
      }
    } else if (typeof decrypted[key] === 'object') {
      decrypted[key] = decryptSensitiveData(decrypted[key]);
    }
  });
  return decrypted;
};

export const StorageManager = {
  /**
   * Save environments to localStorage
   */
  saveEnvironments: (environments) => {
    try {
      // Encrypt sensitive data before storing
      const envToStore = {};
      Object.keys(environments).forEach(envKey => {
        const env = environments[envKey];
        envToStore[envKey] = {
          ...env,
          vars: encryptSensitiveData(env.vars)
        };
      });
      
      localStorage.setItem(STORAGE_KEYS.ENVIRONMENTS, JSON.stringify(envToStore));
      console.log('✓ Environments saved to localStorage');
      return true;
    } catch (e) {
      console.error('Failed to save environments:', e);
      return false;
    }
  },

  /**
   * Load environments from localStorage
   */
  loadEnvironments: (defaultEnvironments = null) => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.ENVIRONMENTS);
      if (stored) {
        const envs = JSON.parse(stored);
        // Decrypt sensitive data after loading
        const decryptedEnvs = {};
        Object.keys(envs).forEach(envKey => {
          const env = envs[envKey];
          decryptedEnvs[envKey] = {
            ...env,
            vars: decryptSensitiveData(env.vars)
          };
        });
        console.log('✓ Environments loaded from localStorage');
        return decryptedEnvs;
      }
    } catch (e) {
      console.error('Failed to load environments:', e);
    }
    
    // Return defaults if nothing was stored or error occurred
    return defaultEnvironments || {};
  },

  /**
   * Save active environment ID
   */
  saveActiveEnvironmentId: (envId) => {
    try {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_ENV, envId);
      return true;
    } catch (e) {
      console.error('Failed to save active environment ID:', e);
      return false;
    }
  },

  /**
   * Load active environment ID
   */
  loadActiveEnvironmentId: (defaultId = 'Local') => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.ACTIVE_ENV);
      return stored || defaultId;
    } catch (e) {
      console.error('Failed to load active environment ID:', e);
      return defaultId;
    }
  },

  /**
   * Save UI state (panel widths, collapsed states, etc.)
   */
  saveUIState: (uiState) => {
    try {
      localStorage.setItem(STORAGE_KEYS.UI_STATE, JSON.stringify(uiState));
      return true;
    } catch (e) {
      console.error('Failed to save UI state:', e);
      return false;
    }
  },

  /**
   * Load UI state
   */
  loadUIState: (defaultState = {}) => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.UI_STATE);
      return stored ? JSON.parse(stored) : defaultState;
    } catch (e) {
      console.error('Failed to load UI state:', e);
      return defaultState;
    }
  },

  /**
   * Clear all stored data (use with caution - consider adding password/confirmation)
   */
  clearAll: () => {
    try {
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
      console.log('✓ All stored data cleared');
      return true;
    } catch (e) {
      console.error('Failed to clear storage:', e);
      return false;
    }
  },

  /**
   * Export environments as JSON for backup
   */
  exportEnvironments: (environments) => {
    try {
      return JSON.stringify(environments, null, 2);
    } catch (e) {
      console.error('Failed to export environments:', e);
      return null;
    }
  },

  /**
   * Import environments from JSON
   */
  importEnvironments: (jsonStr, mergeWithExisting = false) => {
    try {
      const imported = JSON.parse(jsonStr);
      
      if (!mergeWithExisting) {
        this.saveEnvironments(imported);
        return imported;
      }
      
      // Merge with existing
      const existing = this.loadEnvironments();
      const merged = { ...existing, ...imported };
      this.saveEnvironments(merged);
      return merged;
    } catch (e) {
      console.error('Failed to import environments:', e);
      return null;
    }
  },

  /**
   * Get storage stats
   */
  getStorageStats: () => {
    try {
      const stats = {};
      Object.keys(STORAGE_KEYS).forEach(key => {
        const stored = localStorage.getItem(STORAGE_KEYS[key]);
        if (stored) {
          stats[key] = {
            size: new Blob([stored]).size,
            bytes: stored.length
          };
        }
      });
      return stats;
    } catch (e) {
      console.error('Failed to get storage stats:', e);
      return {};
    }
  }
};

export default StorageManager;
