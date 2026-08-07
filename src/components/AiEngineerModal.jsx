import React, { useState } from 'react';
import { 
  Sparkles, Code2, Check, Copy, Wand2, ShieldAlert, FileCode2, Terminal, X 
} from 'lucide-react';

export default function AiEngineerModal({ currentRequest, onClose, onApplyTestScript }) {
  const [activeTab, setActiveTab] = useState('tests'); // 'tests', 'export', 'fixer', 'payload'
  const [exportLang, setExportLang] = useState('curl');
  const [generatedCode, setGeneratedCode] = useState('');
  const [copied, setCopied] = useState(false);

  const reqName = currentRequest?.name || 'Selected Request';
  const rawUrl = currentRequest?.request?.url?.raw || 'http://localhost:5000/api/v1/reporting';
  const method = currentRequest?.request?.method || 'POST';
  const bodyRaw = currentRequest?.request?.body?.raw || '';

  const generateTestScript = () => {
    const code = `// AI Postman Engineer Generated Tests for ${reqName}
pm.test("Status code is 200 or 202", function () {
    pm.expect([200, 202]).to.include(pm.response.code);
});

pm.test("Response contains required fields", function () {
    const json = pm.response.json();
    pm.expect(json).to.be.an('object');
    if (json.jobId) {
        pm.expect(json.jobId).to.be.a('string');
        pm.collectionVariables.set('bulkJobId', json.jobId);
    }
});

pm.test("Response time is under 500ms", function () {
    pm.expect(pm.response.responseTime).to.be.below(500);
});`;
    setGeneratedCode(code);
  };

  const generateCodeExport = (lang) => {
    setExportLang(lang);
    if (lang === 'curl') {
      setGeneratedCode(`curl -X ${method} "${rawUrl}" \\
  -H "Content-Type: application/json" \\
  -H "X-App-Key: {{hmacAppKey}}" \\
  -H "X-Signature: {{hmac_signature}}" \\
  -d '${bodyRaw.replace(/'/g, "\\'") || "{}"}'`);
    } else if (lang === 'python') {
      setGeneratedCode(`import requests

url = "${rawUrl}"
headers = {
    "Content-Type": "application/json",
    "X-App-Key": "{{hmacAppKey}}",
    "X-Signature": "{{hmac_signature}}"
}
payload = ${bodyRaw || "{}"}

response = requests.request("${method}", url, headers=headers, json=payload)
print(response.status_code, response.json())`);
    } else if (lang === 'fetch') {
      setGeneratedCode(`fetch("${rawUrl}", {
  method: "${method}",
  headers: {
    "Content-Type": "application/json",
    "X-App-Key": "{{hmacAppKey}}",
    "X-Signature": "{{hmac_signature}}"
  },
  body: JSON.stringify(${bodyRaw || "{}"})
})
.then(res => res.json())
.then(data => console.log(data));`);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-dark-950/80 backdrop-blur-md flex items-center justify-center p-6 z-50 animate-in fade-in duration-200">
      <div className="bg-dark-900 border border-slate-800 rounded-xl w-full max-w-3xl flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800/80 flex items-center justify-between bg-dark-950/50">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-gradient-to-tr from-brand-cyan/20 to-brand-500/20 text-brand-cyan rounded-lg border border-brand-cyan/30">
              <Sparkles className="w-4 h-4 text-brand-cyan animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100">AI Postman Engineer</h3>
              <p className="text-xs text-slate-400">Contextual Code & Test Automation Helper for "{reqName}"</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-800 text-slate-400 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action Tabs */}
        <div className="flex items-center px-4 border-b border-slate-800/80 bg-dark-900/40 text-xs">
          <button
            onClick={() => { setActiveTab('tests'); generateTestScript(); }}
            className={`px-3 py-2.5 font-medium border-b-2 transition-all ${
              activeTab === 'tests' ? 'border-brand-cyan text-brand-cyan' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Auto-Generate Tests
          </button>
          <button
            onClick={() => { setActiveTab('export'); generateCodeExport('curl'); }}
            className={`px-3 py-2.5 font-medium border-b-2 transition-all ${
              activeTab === 'export' ? 'border-brand-cyan text-brand-cyan' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Export to Code
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-5 flex-1 space-y-4">
          {activeTab === 'export' && (
            <div className="flex items-center space-x-2 text-xs">
              <span className="text-slate-400 font-medium">Target Language:</span>
              <button
                onClick={() => generateCodeExport('curl')}
                className={`px-2.5 py-1 rounded ${exportLang === 'curl' ? 'bg-brand-cyan text-dark-950 font-bold' : 'bg-slate-800 text-slate-300'}`}
              >
                cURL
              </button>
              <button
                onClick={() => generateCodeExport('python')}
                className={`px-2.5 py-1 rounded ${exportLang === 'python' ? 'bg-brand-cyan text-dark-950 font-bold' : 'bg-slate-800 text-slate-300'}`}
              >
                Python Requests
              </button>
              <button
                onClick={() => generateCodeExport('fetch')}
                className={`px-2.5 py-1 rounded ${exportLang === 'fetch' ? 'bg-brand-cyan text-dark-950 font-bold' : 'bg-slate-800 text-slate-300'}`}
              >
                JavaScript Fetch
              </button>
            </div>
          )}

          <div className="relative">
            <textarea
              value={generatedCode}
              onChange={(e) => setGeneratedCode(e.target.value)}
              className="w-full h-72 font-mono text-xs bg-dark-950 border border-slate-800 rounded-lg p-3 text-slate-200 focus:outline-none leading-relaxed resize-none"
            />
            <button
              onClick={handleCopy}
              className="absolute right-3 top-3 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs flex items-center space-x-1"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Code'}</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800/80 bg-dark-950/50 flex justify-end space-x-2 text-xs">
          <button onClick={onClose} className="px-4 py-1.5 bg-slate-800 text-slate-300 rounded-lg font-semibold">
            Close
          </button>
          {activeTab === 'tests' && (
            <button
              onClick={() => { onApplyTestScript(generatedCode); onClose(); }}
              className="px-4 py-1.5 bg-brand-cyan text-dark-950 font-bold rounded-lg flex items-center space-x-1"
            >
              <Wand2 className="w-3.5 h-3.5" />
              <span>Inject Assertions into Request</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
