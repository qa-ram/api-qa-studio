# Environment Persistence Solution - APEX QA Studio

## Problem Solved ✅
**Issue**: Environment variables and settings were lost when users closed and reopened the application.

**Impact**: 
- Users lost custom environment configurations (baseUrl, API keys, secrets)
- Frustrating UX - having to reconfigure every session
- Data loss on browser refresh

## Solution Implemented

### 1. **Automatic Persistence with localStorage**
- All environments and variables are automatically saved to browser storage
- Settings persist across browser sessions, page reloads, and app closures
- No manual save required - happens automatically

### 2. **Encrypted Sensitive Data**
Sensitive fields are automatically encrypted before storing:
- `hmacSecret` - HMAC signing keys
- `apiKey` - API authentication keys
- `token` - Bearer tokens
- `password` - Any password fields
- Custom fields containing sensitive keywords

**Encryption Method**: XOR + Base64 encoding (basic obfuscation)
- ⚠️ **Note**: This is NOT cryptographically secure
- **Suitable for**: Development environments, local browser storage
- **For Production**: Use proper encryption or manage secrets server-side

### 3. **Import/Export for Backups**
Users can now:
- **Export**: Download all environments as JSON backup
- **Import**: Restore from JSON or import Postman environment files

## Architecture

### New File: `src/engine/storageManager.js`
Centralized storage management with functions:

```javascript
// Load environments on app startup
StorageManager.loadEnvironments(defaultEnvironments)

// Save whenever they change
StorageManager.saveEnvironments(environments)

// Manage active environment
StorageManager.loadActiveEnvironmentId()
StorageManager.saveActiveEnvironmentId(envId)

// Import/Export
StorageManager.exportEnvironments(environments)
StorageManager.importEnvironments(jsonStr, mergeWithExisting)

// Clear all (for testing/reset)
StorageManager.clearAll()

// Check storage usage
StorageManager.getStorageStats()
```

### Modified: `src/App.jsx`
Added persistence initialization:

```javascript
// Load from storage on app startup
const [environments, setEnvironments] = useState(() => 
  StorageManager.loadEnvironments(DEFAULT_ENVIRONMENTS)
);

// Auto-save whenever environments change
useEffect(() => {
  StorageManager.saveEnvironments(environments);
}, [environments]);

// Save active environment ID
const setActiveEnvId = (envId) => {
  setActiveEnvIdState(envId);
  StorageManager.saveActiveEnvironmentId(envId);
};
```

### Enhanced: `src/components/EnvironmentModal.jsx`
- Added Export button (📥) to download environments as JSON
- Added Import button (📤) for Postman environments or backups
- New persistence info banner explaining auto-save feature
- Export creates timestamped backup files: `apex-environments-backup-2026-08-17.json`

## Storage Details

### localStorage Keys Used
- `apex_environments` - All environment configurations (encrypted)
- `apex_active_env_id` - Currently selected environment
- `apex_ui_state` - Panel widths, collapse states (future use)

### Browser Storage Limits
- Most browsers: 5-10MB per domain
- Current usage: Minimal (~50KB for typical configs)
- ✅ Plenty of room for thousands of environments

### Data Location
- Stored in: Browser's localStorage
- Accessible via: DevTools → Application → Local Storage
- Scoped to: Application domain only

## User Guide

### Automatic Persistence (Default)
1. Create/modify an environment with variables
2. Click "Save & Set Active"
3. ✅ Data is automatically saved to browser storage
4. Close browser/tab/refresh page
5. ✅ Reopen app - your environments are still there!

### Export Backup (Recommended)
1. Open Environments modal
2. Click **📥 Download** button (top right)
3. Saves as: `apex-environments-backup-2026-08-17.json`
4. Keep as backup or share with team

### Import Backup/Postman Environment
1. Open Environments modal
2. Click **📤 Upload** button (next to Environments title)
3. Select JSON file (backup or Postman environment)
4. Environment is imported and available immediately

### Clear All Data
```javascript
// In browser console:
StorageManager.clearAll()
```
⚠️ Warning: This cannot be undone!

## Security Considerations

### ✅ What's Protected
- Sensitive fields are encrypted before storage
- Data stays in browser (not sent to servers)
- Each browser has separate storage

### ⚠️ What's NOT Protected
- This encryption is basic obfuscation, not cryptographically secure
- If browser storage is compromised, secrets can be retrieved
- Don't store production credentials in browser

### 🔐 Best Practices
1. **Development Only**: Use app for local/staging API testing
2. **Environment Variables**: Store production secrets as OS environment variables
3. **Backend Secrets**: Never store in frontend apps
4. **Multiple Users**: Use separate browser profiles per user
5. **Public Computers**: Clear storage with `StorageManager.clearAll()` after use

## Technical Implementation

### Sensitive Field Detection
Fields marked as sensitive (case-insensitive check):
- Contains "secret"
- Contains "apikey"
- Contains "token"
- Contains "password"

Example sensitive fields:
- ✓ `hmacSecret` → encrypted
- ✓ `apiKey` → encrypted
- ✓ `apiToken` → encrypted
- ✓ `JWT_Secret` → encrypted
- ✗ `baseUrl` → not encrypted (safe)
- ✗ `appId` → not encrypted (safe)

### Encryption/Decryption Flow

**When Saving:**
```
User Data → Encrypt Sensitive Fields → Base64 + XOR → localStorage
```

**When Loading:**
```
localStorage → XOR + Base64 Decode → Decrypt Sensitive Fields → User Data
```

## Browser Compatibility
- ✅ Chrome/Edge: Full support
- ✅ Firefox: Full support
- ✅ Safari: Full support
- ✅ Mobile browsers: Full support
- ⚠️ Private/Incognito mode: Data lost on session end

## Troubleshooting

### Storage Not Persisting
1. Check if browser allows localStorage (not disabled in settings)
2. Try different browser
3. Clear browser cache and reload

### Import Not Working
1. Ensure JSON file is valid format
2. File should be standard Postman environment JSON or app backup
3. Check browser console for error details

### Check Storage Usage
```javascript
// In browser console:
const stats = StorageManager.getStorageStats();
console.log(stats);
```

## Testing Persistence

### Test 1: Basic Persistence
1. Create new environment: "Test Env"
2. Add variable: `testKey: testValue`
3. Save & activate
4. Reload browser page (F5)
5. ✓ Should still see "Test Env" in list

### Test 2: Sensitive Field Encryption
1. Open browser DevTools → Application → Local Storage
2. Find `apex_environments`
3. Look for `hmacSecret` value
4. ✓ Should see encrypted gibberish, not plain text

### Test 3: Export/Import
1. Export as JSON
2. Create new environment or clear existing
3. Import from saved JSON
4. ✓ Environments restored correctly

## Console Logging
When app loads, check browser console (F12):
```
🔄 APEX QA Studio - Data Persistence Enabled
✓ Environments loaded from browser storage
✓ Sensitive data encrypted (hmacSecret, apiKey, password, etc.)
📊 Storage stats: {apex_environments: {size: 2048, bytes: 2048}, ...}
```

## Future Enhancements
- [ ] Cloud sync (save to account)
- [ ] Team sharing of environments
- [ ] Environment encryption password
- [ ] Audit log of changes
- [ ] Versioning and rollback
- [ ] Scheduled backups to cloud
