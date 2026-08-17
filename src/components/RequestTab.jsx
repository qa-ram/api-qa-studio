import React, { useState, useEffect } from 'react';
import { Send, Plus, Trash2, Code, Shield, Save, Check, Settings, AlertCircle } from 'lucide-react';

export default function RequestTab({
  requestData,
  onRequestChange,
  onSend,
  onSave,
  isDirty,
  isLoading
}) {
  const [activeTab, setActiveTab] = useState('body'); // 'params', 'headers', 'body', 'prerequest', 'test', 'settings'
  const [justSaved, setJustSaved] = useState(false);

  // Keyboard shortcut listener Ctrl+S
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSaveTrigger();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [requestData, isDirty]);

  const handleSaveTrigger = () => {
    onSave();
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2000);
  };

  if (!requestData) {
    return (
      <div className="flex-1 flex items-center justify-center bg-dark-950 text-slate-500 text-xs">
        Select a request from the sidebar or create a new one to start testing.
      </div>
    );
  }

  const method = requestData.request?.method || 'GET';
  const rawUrl = requestData.request?.url?.raw || '';
  const headers = requestData.request?.header || [];
  const bodyMode = requestData.request?.body?.mode || 'raw';
  const bodyRaw = requestData.request?.body?.raw || '';
  const formdata = requestData.request?.body?.formdata || [];

  const prerequestEvent = (requestData.event || []).find(e => e.listen === 'prerequest');
  const testEvent = (requestData.event || []).find(e => e.listen === 'test');

  const prerequestScript = Array.isArray(prerequestEvent?.script?.exec)
    ? prerequestEvent.script.exec.join('\n')
    : (prerequestEvent?.script?.exec || '');

  const testScript = Array.isArray(testEvent?.script?.exec)
    ? testEvent.script.exec.join('\n')
    : (testEvent?.script?.exec || '');

  // Helper updates
  const updateMethod = (newMethod) => {
    onRequestChange({
      ...requestData,
      request: { ...requestData.request, method: newMethod }
    });
  };

  const updateUrl = (newUrl) => {
    onRequestChange({
      ...requestData,
      request: {
        ...requestData.request,
        url: { ...requestData.request?.url, raw: newUrl }
      }
    });
  };

  const updateHeader = (index, field, value) => {
    const updated = [...headers];
    updated[index] = { ...updated[index], [field]: value };
    onRequestChange({
      ...requestData,
      request: { ...requestData.request, header: updated }
    });
  };

  const addHeader = () => {
    const updated = [...headers, { key: '', value: '', description: '' }];
    onRequestChange({
      ...requestData,
      request: { ...requestData.request, header: updated }
    });
  };

  const removeHeader = (index) => {
    const updated = headers.filter((_, i) => i !== index);
    onRequestChange({
      ...requestData,
      request: { ...requestData.request, header: updated }
    });
  };

  const updateBodyRaw = (val) => {
    onRequestChange({
      ...requestData,
      request: {
        ...requestData.request,
        body: { ...requestData.request?.body, mode: 'raw', raw: val }
      }
    });
  };

  const updatePrerequestScript = (val) => {
    const events = [...(requestData.event || [])];
    const idx = events.findIndex(e => e.listen === 'prerequest');
    const newExec = val.split('\n');
    if (idx !== -1) {
      events[idx] = { ...events[idx], script: { exec: newExec, type: 'text/javascript' } };
    } else {
      events.push({ listen: 'prerequest', script: { exec: newExec, type: 'text/javascript' } });
    }
    onRequestChange({ ...requestData, event: events });
  };

  const updateTestScript = (val) => {
    const events = [...(requestData.event || [])];
    const idx = events.findIndex(e => e.listen === 'test');
    const newExec = val.split('\n');
    if (idx !== -1) {
      events[idx] = { ...events[idx], script: { exec: newExec, type: 'text/javascript' } };
    } else {
      events.push({ listen: 'test', script: { exec: newExec, type: 'text/javascript' } });
    }
    onRequestChange({ ...requestData, event: events });
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-dark-950 min-w-0 border-r border-slate-800/80">
      {/* Title Bar with Save & Unsaved Indicator */}
      <div className="px-4 py-2 bg-dark-900/60 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center space-x-2 truncate">
          <span className="text-xs font-semibold text-slate-300 truncate">{requestData.name}</span>
          {isDirty && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 font-mono font-bold flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
              <span>Unsaved Changes</span>
            </span>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {/* Postman-style Save Button */}
          <button
            onClick={handleSaveTrigger}
            disabled={!isDirty && !justSaved}
            className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all shadow-sm ${
              justSaved
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                : isDirty
                ? 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/50 shadow-amber-950/40'
                : 'bg-slate-800/60 text-slate-500 border border-slate-700/40 cursor-default opacity-60'
            }`}
            title="Save Request Changes (Ctrl + S)"
          >
            {justSaved ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Saved!</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Save</span>
                <span className="text-[9px] opacity-70 font-mono hidden sm:inline">(Ctrl+S)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Endpoint Bar */}
      <div className="p-3 border-b border-slate-800/80 flex items-center space-x-2 bg-dark-900/40">
        <select
          value={method}
          title="Choose the HTTP method used for this request."
          onChange={(e) => updateMethod(e.target.value)}
          className="bg-dark-900 border border-slate-700/80 rounded-lg px-3 py-2 text-xs font-bold text-brand-cyan focus:outline-none focus:border-brand-cyan cursor-pointer uppercase shadow-sm"
        >
          <option value="GET" className="text-emerald-400">GET</option>
          <option value="POST" className="text-cyan-400">POST</option>
          <option value="PUT" className="text-amber-400">PUT</option>
          <option value="DELETE" className="text-rose-400">DELETE</option>
          <option value="PATCH" className="text-purple-400">PATCH</option>
          <option value="OPTIONS" className="text-slate-400">OPTIONS</option>
        </select>

        <div className="flex-1 relative">
          <input
            type="text"
            value={rawUrl}
            title="Request URL. Use variables like {{baseUrl}} and add query parameters as needed."
            onChange={(e) => updateUrl(e.target.value)}
            placeholder="Enter request URL (e.g. {{baseUrl}}/api/v1/reporting)"
            className="w-full font-mono text-xs bg-dark-900 border border-slate-700/80 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-cyan focus:ring-1 focus:ring-brand-cyan/50 transition-all shadow-inner"
          />
        </div>

        <button
          onClick={onSend}
          disabled={isLoading}
          className="flex items-center space-x-2 px-5 py-2 bg-gradient-to-r from-brand-cyan to-brand-600 hover:from-brand-cyan/90 hover:to-brand-600/90 text-white rounded-lg text-xs font-bold shadow-md shadow-brand-cyan/20 border border-cyan-400/30 transition-all disabled:opacity-50 shrink-0"
        >
          {isLoading ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Sending...</span>
            </>
          ) : (
            <>
              <Send className="w-3.5 h-3.5" />
              <span>Send</span>
            </>
          )}
        </button>
      </div>

      {/* Sub Tabs */}
      <div className="flex items-center px-3 border-b border-slate-800/80 bg-dark-900/40 text-xs">
        <button
          onClick={() => setActiveTab('params')}
          title="View query string parameters that will be appended to the request URL."
          className={`px-3 py-2.5 font-medium border-b-2 transition-all ${
            activeTab === 'params'
              ? 'border-brand-cyan text-brand-cyan'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Params
        </button>
        <button
          onClick={() => setActiveTab('headers')}
          title="Manage custom HTTP headers such as Authorization, Content-Type, or Trace IDs."
          className={`px-3 py-2.5 font-medium border-b-2 transition-all flex items-center space-x-1.5 ${
            activeTab === 'headers'
              ? 'border-brand-cyan text-brand-cyan'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>Headers</span>
          <span className="text-[10px] bg-slate-800 px-1.5 py-0.2 rounded text-slate-400">{headers.length}</span>
        </button>
        <button
          onClick={() => setActiveTab('body')}
          title="Compose the request payload for JSON, form-data, or raw body requests."
          className={`px-3 py-2.5 font-medium border-b-2 transition-all flex items-center space-x-1.5 ${
            activeTab === 'body'
              ? 'border-brand-cyan text-brand-cyan'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>Body</span>
          <span className="w-1.5 h-1.5 rounded-full bg-brand-cyan"></span>
        </button>
        <button
          onClick={() => setActiveTab('prerequest')}
          title="Add script logic that runs before the request is sent, such as signing HMAC headers."
          className={`px-3 py-2.5 font-medium border-b-2 transition-all flex items-center space-x-1.5 ${
            activeTab === 'prerequest'
              ? 'border-brand-cyan text-brand-cyan'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Shield className="w-3 h-3 text-amber-400" />
          <span>Pre-request Script</span>
          {prerequestScript && <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>}
        </button>
        <button
          onClick={() => setActiveTab('test')}
          title="Write assertion scripts to validate HTTP status, payload fields, and business rules."
          className={`px-3 py-2.5 font-medium border-b-2 transition-all flex items-center space-x-1.5 ${
            activeTab === 'test'
              ? 'border-brand-cyan text-brand-cyan'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Code className="w-3 h-3 text-emerald-400" />
          <span>Tests</span>
          {testScript && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>}
        </button>
      </div>

      {/* Tab Content Area */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Headers Tab */}
        {activeTab === 'headers' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-300">HTTP Request Headers</span>
              <button
                onClick={addHeader}
                className="flex items-center space-x-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs transition-colors"
              >
                <Plus className="w-3 h-3" />
                <span>Add Header</span>
              </button>
            </div>
            <div className="border border-slate-800 rounded-lg overflow-hidden bg-dark-900/60">
              <table className="w-full text-xs text-left">
                <thead className="bg-dark-900 border-b border-slate-800 text-slate-400 font-semibold">
                  <tr>
                    <th className="p-2.5 w-1/3">Key</th>
                    <th className="p-2.5 w-1/2">Value</th>
                    <th className="p-2.5">Description</th>
                    <th className="p-2.5 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {headers.map((h, i) => (
                    <tr key={i} className="hover:bg-slate-800/30">
                      <td className="p-2">
                        <input
                          type="text"
                          value={h.key}
                          onChange={(e) => updateHeader(i, 'key', e.target.value)}
                          placeholder="Header Name"
                          className="w-full bg-transparent font-mono text-slate-200 focus:outline-none focus:text-brand-cyan"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="text"
                          value={h.value}
                          onChange={(e) => updateHeader(i, 'value', e.target.value)}
                          placeholder="Header Value"
                          className="w-full bg-transparent font-mono text-slate-300 focus:outline-none"
                        />
                      </td>
                      <td className="p-2 text-slate-400">
                        <input
                          type="text"
                          value={h.description || ''}
                          onChange={(e) => updateHeader(i, 'description', e.target.value)}
                          placeholder="Description"
                          className="w-full bg-transparent text-slate-500 focus:outline-none"
                        />
                      </td>
                      <td className="p-2 text-center">
                        <button
                          onClick={() => removeHeader(i)}
                          className="text-slate-500 hover:text-rose-400 p-1 rounded"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {headers.length === 0 && (
                    <tr>
                      <td colSpan={4} className="p-4 text-center text-slate-500 italic">
                        No custom headers configured. Click 'Add Header' above.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Body Tab */}
        {activeTab === 'body' && (
          <div className="h-full flex flex-col space-y-3">
            <div className="flex items-center space-x-4 text-xs">
              <span className="text-slate-400 font-medium">Mode:</span>
              <label className="flex items-center space-x-1.5 cursor-pointer">
                <input
                  type="radio"
                  checked={bodyMode === 'raw'}
                  onChange={() => onRequestChange({ ...requestData, request: { ...requestData.request, body: { ...requestData.request?.body, mode: 'raw' } } })}
                  className="accent-brand-cyan"
                />
                <span className="text-slate-200">raw (JSON)</span>
              </label>
              <label className="flex items-center space-x-1.5 cursor-pointer">
                <input
                  type="radio"
                  checked={bodyMode === 'formdata'}
                  onChange={() => onRequestChange({ ...requestData, request: { ...requestData.request, body: { ...requestData.request?.body, mode: 'formdata' } } })}
                  className="accent-brand-cyan"
                />
                <span className="text-slate-200">form-data</span>
              </label>
            </div>

            {bodyMode === 'raw' && (
              <div className="flex-1 flex flex-col min-h-[300px]">
                <textarea
                  value={bodyRaw}
                  onChange={(e) => updateBodyRaw(e.target.value)}
                  placeholder="Paste JSON request body..."
                  className="w-full flex-1 font-mono text-xs bg-dark-900/90 border border-slate-800 rounded-lg p-3 text-slate-200 focus:outline-none focus:border-brand-cyan/50 leading-relaxed resize-none shadow-inner"
                />
              </div>
            )}

            {bodyMode === 'formdata' && (
              <div className="border border-slate-800 rounded-lg overflow-hidden bg-dark-900/60">
                <table className="w-full text-xs text-left">
                  <thead className="bg-dark-900 border-b border-slate-800 text-slate-400 font-semibold">
                    <tr>
                      <th className="p-2.5">Key</th>
                      <th className="p-2.5">Type</th>
                      <th className="p-2.5">Value / Path</th>
                      <th className="p-2.5">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {formdata.map((item, i) => (
                      <tr key={i} className="hover:bg-slate-800/30">
                        <td className="p-2 text-brand-cyan">{item.key}</td>
                        <td className="p-2 text-slate-400">{item.type}</td>
                        <td className="p-2 text-slate-300 truncate max-w-xs">{item.value || item.src || '-'}</td>
                        <td className="p-2 text-slate-500">{item.description || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Pre-request Script Tab */}
        {activeTab === 'prerequest' && (
          <div className="space-y-3 h-full flex flex-col">
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-xs text-amber-300 flex items-start space-x-2">
              <Shield className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="font-semibold">HMAC & Variable Sandbox:</strong> Pre-request script executes before request dispatch. Accessible globals: <code className="bg-dark-950 px-1 rounded text-amber-200">pm</code>, <code className="bg-dark-950 px-1 rounded text-amber-200">CryptoJS</code> (MD5, HmacSHA256, Base64).
              </div>
            </div>

            <textarea
              value={prerequestScript}
              onChange={(e) => updatePrerequestScript(e.target.value)}
              placeholder="// Pre-request JavaScript code..."
              className="w-full flex-1 font-mono text-xs bg-dark-900/90 border border-slate-800 rounded-lg p-3 text-amber-200/90 focus:outline-none focus:border-amber-400/50 leading-relaxed resize-none min-h-[300px]"
            />
          </div>
        )}

        {/* Test Script Tab */}
        {activeTab === 'test' && (
          <div className="space-y-3 h-full flex flex-col">
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-xs text-emerald-300 flex items-start space-x-2">
              <Code className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="font-semibold">Automated Test Script Sandbox:</strong> Write assertions using Chai & PM syntax (<code className="bg-dark-950 px-1 rounded text-emerald-200">pm.test()</code>, <code className="bg-dark-950 px-1 rounded text-emerald-200">pm.expect()</code>, <code className="bg-dark-950 px-1 rounded text-emerald-200">pm.response.to.have.status(200)</code>).
              </div>
            </div>

            <textarea
              value={testScript}
              onChange={(e) => updateTestScript(e.target.value)}
              placeholder="// Test JavaScript code assertions..."
              className="w-full flex-1 font-mono text-xs bg-dark-900/90 border border-slate-800 rounded-lg p-3 text-emerald-200/90 focus:outline-none focus:border-emerald-400/50 leading-relaxed resize-none min-h-[300px]"
            />
          </div>
        )}

        {/* Params Tab */}
        {activeTab === 'params' && (
          <div className="text-xs text-slate-400 italic p-4 text-center border border-slate-800/80 rounded-lg bg-dark-900/40">
            Query parameters are automatically extracted from the URL query string above.
          </div>
        )}
      </div>
    </div>
  );
}
