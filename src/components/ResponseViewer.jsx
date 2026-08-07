import React, { useState } from 'react';
import { 
  CheckCircle2, XCircle, Clock, Database, Copy, Check, Search, 
  Eye, Code2, FileText, Layers, AlertCircle
} from 'lucide-react';
import ResponseVisualizer from './ResponseVisualizer';

export default function ResponseViewer({ responseData }) {
  const [activeTab, setActiveTab] = useState('pretty'); // 'pretty', 'raw', 'headers', 'tests', 'visualizer'
  const [copied, setCopied] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  if (!responseData) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-dark-950 text-slate-500 text-xs p-6 select-none">
        <div className="p-3 bg-dark-900 border border-slate-800 rounded-full mb-3">
          <Database className="w-6 h-6 text-slate-600" />
        </div>
        <p className="font-medium text-slate-400">No Response Received Yet</p>
        <p className="text-[11px] text-slate-600 mt-1">Click "Send" above to execute request & evaluate test assertions</p>
      </div>
    );
  }

  const { status, statusText, time, size, data, headers, testResults, logs } = responseData;

  const isSuccess = status >= 200 && status < 300;
  const isRedirect = status >= 300 && status < 400;
  const isError = status >= 400;

  const getStatusBadge = () => {
    let color = 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    if (isRedirect) color = 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    if (isError) color = 'bg-rose-500/20 text-rose-400 border-rose-500/30';

    return (
      <div className={`px-2.5 py-1 rounded-md text-xs font-mono font-bold border flex items-center space-x-1.5 ${color}`}>
        <span>{status}</span>
        <span>{statusText || (isSuccess ? 'OK' : 'Response')}</span>
      </div>
    );
  };

  const formattedData = typeof data === 'object' ? JSON.stringify(data, null, 2) : String(data || '');

  const handleCopy = () => {
    navigator.clipboard.writeText(formattedData);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const passCount = (testResults || []).filter(t => t.passed).length;
  const failCount = (testResults || []).filter(t => !t.passed).length;

  return (
    <div className="flex-1 flex flex-col h-full bg-dark-950 min-w-0">
      {/* Response Metrics Header */}
      <div className="px-4 py-2.5 bg-dark-900/80 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {getStatusBadge()}
          <div className="flex items-center space-x-1 text-xs text-slate-400 font-mono">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>{time} ms</span>
          </div>
          <div className="flex items-center space-x-1 text-xs text-slate-400 font-mono">
            <Database className="w-3.5 h-3.5 text-slate-500" />
            <span>{size} KB</span>
          </div>
        </div>

        {/* Test Summary Pill */}
        {testResults && testResults.length > 0 && (
          <div className="flex items-center space-x-2 text-xs font-semibold px-3 py-1 rounded-full bg-dark-950 border border-slate-800">
            <span className="text-emerald-400 flex items-center space-x-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{passCount} passed</span>
            </span>
            {failCount > 0 && (
              <span className="text-rose-400 flex items-center space-x-1">
                <XCircle className="w-3.5 h-3.5" />
                <span>{failCount} failed</span>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Response View Sub-tabs */}
      <div className="flex items-center justify-between px-3 border-b border-slate-800/80 bg-dark-900/40 text-xs">
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setActiveTab('pretty')}
            className={`px-3 py-2 font-medium border-b-2 transition-all flex items-center space-x-1.5 ${
              activeTab === 'pretty' ? 'border-brand-cyan text-brand-cyan' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>JSON Pretty</span>
          </button>
          <button
            onClick={() => setActiveTab('raw')}
            className={`px-3 py-2 font-medium border-b-2 transition-all ${
              activeTab === 'raw' ? 'border-brand-cyan text-brand-cyan' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Raw
          </button>
          <button
            onClick={() => setActiveTab('headers')}
            className={`px-3 py-2 font-medium border-b-2 transition-all ${
              activeTab === 'headers' ? 'border-brand-cyan text-brand-cyan' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Headers ({Object.keys(headers || {}).length})
          </button>
          <button
            onClick={() => setActiveTab('tests')}
            className={`px-3 py-2 font-medium border-b-2 transition-all flex items-center space-x-1.5 ${
              activeTab === 'tests' ? 'border-brand-cyan text-brand-cyan' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Test Results ({testResults?.length || 0})</span>
          </button>
          <button
            onClick={() => setActiveTab('visualizer')}
            className={`px-3 py-2 font-medium border-b-2 transition-all flex items-center space-x-1.5 ${
              activeTab === 'visualizer' ? 'border-brand-cyan text-brand-cyan' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Eye className="w-3.5 h-3.5 text-purple-400" />
            <span>Visualizer</span>
          </button>
        </div>

        {/* Copy Button */}
        <button
          onClick={handleCopy}
          className="flex items-center space-x-1 px-2.5 py-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>

      {/* Response Tab Content */}
      <div className="flex-1 overflow-y-auto p-3 font-mono text-xs">
        {/* Formatted JSON */}
        {activeTab === 'pretty' && (
          <div className="relative h-full">
            <pre className="text-brand-cyan/90 leading-relaxed overflow-x-auto whitespace-pre-wrap">
              {formattedData}
            </pre>
          </div>
        )}

        {/* Raw View */}
        {activeTab === 'raw' && (
          <pre className="text-slate-300 whitespace-pre-wrap leading-relaxed">
            {formattedData}
          </pre>
        )}

        {/* Headers View */}
        {activeTab === 'headers' && (
          <div className="border border-slate-800 rounded-lg overflow-hidden bg-dark-900/60 font-sans">
            <table className="w-full text-xs text-left">
              <thead className="bg-dark-900 border-b border-slate-800 text-slate-400">
                <tr>
                  <th className="p-2.5 font-semibold">Header Key</th>
                  <th className="p-2.5 font-semibold">Header Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {Object.entries(headers || {}).map(([k, v], i) => (
                  <tr key={i} className="hover:bg-slate-800/30">
                    <td className="p-2 text-brand-cyan">{k}</td>
                    <td className="p-2 text-slate-300 break-all">{String(v)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Test Results View */}
        {activeTab === 'tests' && (
          <div className="space-y-3 font-sans">
            {(!testResults || testResults.length === 0) ? (
              <div className="p-6 text-center text-slate-500 text-xs italic">
                No test script assertions executed for this request. Add assertions in the "Tests" tab.
              </div>
            ) : (
              <div className="space-y-2">
                {testResults.map((t, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-lg border flex items-start space-x-3 text-xs ${
                      t.passed
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                        : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                    }`}
                  >
                    {t.passed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <div className="font-semibold">{t.name}</div>
                      {!t.passed && t.error && (
                        <div className="mt-1 text-[11px] font-mono text-rose-300/90 bg-dark-950/60 p-2 rounded border border-rose-500/20">
                          {t.error}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {logs && logs.length > 0 && (
              <div className="mt-4 pt-3 border-t border-slate-800">
                <div className="text-xs font-semibold text-slate-400 mb-2">Console Output Logs</div>
                <div className="bg-dark-900 border border-slate-800 rounded-lg p-2 space-y-1 font-mono text-[11px]">
                  {logs.map(([type, msg], i) => (
                    <div key={i} className="text-slate-300">
                      <span className="text-slate-500">[{type}]</span> {msg}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Visualizer View */}
        {activeTab === 'visualizer' && (
          <ResponseVisualizer responseData={responseData} />
        )}
      </div>
    </div>
  );
}
