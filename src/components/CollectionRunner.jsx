import React, { useState } from 'react';
import { 
  Play, CheckCircle2, XCircle, Clock, FileText, Upload, RefreshCw, 
  Layers, Download, BarChart2, AlertCircle, X
} from 'lucide-react';
import { executePreRequestScript, executeTestScript } from '../engine/scriptEngine';
import { resolveVariables } from '../engine/variableResolver';

export default function CollectionRunner({ collection, environmentVars, onClose }) {
  const [isRunning, setIsRunning] = useState(false);
  const [iterations, setIterations] = useState(1);
  const [delayMs, setDelayMs] = useState(200);
  const [runLogs, setRunLogs] = useState([]);
  const [dataFile, setDataFile] = useState(null);
  const [dataRecords, setDataRecords] = useState([]);
  const [summary, setSummary] = useState(null);

  // Extract flat list of requests
  const flattenRequests = (items) => {
    let list = [];
    (items || []).forEach(it => {
      if (it.item) {
        list = list.concat(flattenRequests(it.item));
      } else {
        list.push(it);
      }
    });
    return list;
  };

  const allRequests = flattenRequests(collection.item);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setDataFile(file.name);
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const parsed = JSON.parse(evt.target.result);
          if (Array.isArray(parsed)) {
            setDataRecords(parsed);
          }
        } catch (err) {
          // Simple CSV line parser
          const lines = evt.target.result.split('\n').map(l => l.trim()).filter(Boolean);
          if (lines.length > 1) {
            const headers = lines[0].split(',');
            const rows = lines.slice(1).map(line => {
              const vals = line.split(',');
              const obj = {};
              headers.forEach((h, idx) => { obj[h.trim()] = vals[idx]?.trim(); });
              return obj;
            });
            setDataRecords(rows);
          }
        }
      };
      reader.readAsText(file);
    }
  };

  const startRun = async () => {
    setIsRunning(true);
    setRunLogs([]);
    setSummary(null);

    let totalTests = 0;
    let passedTests = 0;
    let failedTests = 0;
    const logsAcc = [];
    const collectionVarsAcc = {
      ...collection.variable?.reduce((acc, v) => ({ ...acc, [v.key]: v.value }), {})
    };

    const runCount = dataRecords.length > 0 ? dataRecords.length : iterations;

    for (let iter = 1; iter <= runCount; iter++) {
      const dataRow = dataRecords[iter - 1] || {};

      for (let reqIndex = 0; reqIndex < allRequests.length; reqIndex++) {
        const reqItem = allRequests[reqIndex];
        const reqObj = reqItem.request;

        // 1. Pre-request script execution
        const prerequestEvent = (reqItem.event || []).find(e => e.listen === 'prerequest');
        const scriptExec = prerequestEvent?.script?.exec || [];

        const preResult = executePreRequestScript(scriptExec, {
          request: reqObj,
          collectionVars: collectionVarsAcc,
          localVars: dataRow,
          environmentVars
        });

        Object.assign(collectionVarsAcc, preResult.collectionVars);

        // 2. Simulated Request Dispatch with realistic response metrics
        const startTime = Date.now();
        await new Promise(r => setTimeout(r, Math.max(50, Math.floor(Math.random() * 150))));
        const responseTime = Date.now() - startTime;

        // Simulated HTTP Response based on endpoint
        let mockStatus = 200;
        let mockStatusText = 'OK';
        let mockResponseBody = { success: true, message: "Request processed successfully", timestamp: new Date().toISOString() };

        if (reqItem.name.includes('Reporting')) {
          mockStatus = 202;
          mockStatusText = 'Accepted';
          mockResponseBody = { jobId: `job-${Math.random().toString(36).substring(2, 9)}`, status: "QUEUED" };
        } else if (reqItem.name.includes('AddCurrentMedications')) {
          mockStatus = 200;
          mockResponseBody = { success: true, count: 3, specimenId: "DR08052601" };
        }

        // 3. Test script execution
        const testEvent = (reqItem.event || []).find(e => e.listen === 'test');
        const testScriptExec = testEvent?.script?.exec || [];

        const testResult = executeTestScript(testScriptExec, {
          status: mockStatus,
          statusText: mockStatusText,
          data: mockResponseBody,
          headers: { 'content-type': 'application/json' }
        }, {
          collectionVars: collectionVarsAcc
        });

        Object.assign(collectionVarsAcc, testResult.collectionVars);

        const reqPasses = testResult.testResults.filter(t => t.passed).length;
        const reqFails = testResult.testResults.filter(t => !t.passed).length;

        totalTests += testResult.testResults.length;
        passedTests += reqPasses;
        failedTests += reqFails;

        const logEntry = {
          iteration: iter,
          reqName: reqItem.name,
          method: reqObj.method || 'GET',
          url: reqObj.url?.raw || '',
          status: mockStatus,
          time: responseTime,
          testResults: testResult.testResults
        };

        logsAcc.push(logEntry);
        setRunLogs([...logsAcc]);

        if (delayMs > 0) {
          await new Promise(r => setTimeout(r, delayMs));
        }
      }
    }

    setSummary({
      totalRequests: allRequests.length * runCount,
      totalTests,
      passedTests,
      failedTests,
      passRate: totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 100
    });

    setIsRunning(false);
  };

  return (
    <div className="fixed inset-0 bg-dark-950/80 backdrop-blur-md flex items-center justify-center p-6 z-50 animate-in fade-in duration-200">
      <div className="bg-dark-900 border border-slate-800 rounded-xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800/80 flex items-center justify-between bg-dark-950/50">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg border border-emerald-500/30">
              <Play className="w-4 h-4 fill-emerald-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100">Automated Collection Runner</h3>
              <p className="text-xs text-slate-400">{collection.info?.name} ({allRequests.length} Requests)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Runner Options */}
        <div className="p-5 border-b border-slate-800/80 bg-dark-900/40 grid grid-cols-3 gap-4 text-xs">
          <div>
            <label className="font-semibold text-slate-300 block mb-1">Iterations</label>
            <input
              type="number"
              min="1"
              max="50"
              value={iterations}
              onChange={(e) => setIterations(parseInt(e.target.value) || 1)}
              className="w-full bg-dark-950 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-200 focus:outline-none focus:border-brand-cyan"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-300 block mb-1">Delay (ms)</label>
            <input
              type="number"
              min="0"
              step="50"
              value={delayMs}
              onChange={(e) => setDelayMs(parseInt(e.target.value) || 0)}
              className="w-full bg-dark-950 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-200 focus:outline-none focus:border-brand-cyan"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-300 block mb-1">Data File (CSV/JSON)</label>
            <label className="flex items-center justify-center space-x-2 w-full bg-dark-950 hover:bg-slate-800 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-400 cursor-pointer transition-colors">
              <Upload className="w-3.5 h-3.5" />
              <span className="truncate">{dataFile || 'Choose Data File'}</span>
              <input type="file" accept=".csv,.json" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>
        </div>

        {/* Action Controls & Summary Metrics */}
        <div className="px-5 py-3 border-b border-slate-800/80 bg-dark-950/60 flex items-center justify-between">
          <button
            onClick={startRun}
            disabled={isRunning}
            className="flex items-center space-x-2 px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-lg text-xs font-bold shadow-md disabled:opacity-50"
          >
            {isRunning ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Executing Collection...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>Run Collection</span>
              </>
            )}
          </button>

          {summary && (
            <div className="flex items-center space-x-4 text-xs font-semibold">
              <span className="text-slate-300">Total: {summary.totalRequests}</span>
              <span className="text-emerald-400">Passed: {summary.passedTests}</span>
              <span className="text-rose-400">Failed: {summary.failedTests}</span>
              <span className="px-2 py-0.5 rounded bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/40">
                Pass Rate: {summary.passRate}%
              </span>
            </div>
          )}
        </div>

        {/* Execution Log List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 font-mono text-xs">
          {runLogs.map((log, idx) => (
            <div key={idx} className="p-3 bg-dark-950/80 border border-slate-800/80 rounded-lg space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-slate-500 text-[10px]">#{log.iteration}</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                    {log.method}
                  </span>
                  <span className="font-semibold text-slate-200">{log.reqName}</span>
                </div>
                <div className="flex items-center space-x-3 text-[11px]">
                  <span className="text-emerald-400 font-bold">{log.status} OK</span>
                  <span className="text-slate-500">{log.time} ms</span>
                </div>
              </div>

              {log.testResults && log.testResults.length > 0 && (
                <div className="pl-4 border-l border-slate-800 space-y-1 mt-1">
                  {log.testResults.map((t, ti) => (
                    <div key={ti} className="flex items-center space-x-2 text-[11px]">
                      {t.passed ? (
                        <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                      ) : (
                        <XCircle className="w-3 h-3 text-rose-400 shrink-0" />
                      )}
                      <span className={t.passed ? 'text-slate-300' : 'text-rose-300 font-semibold'}>{t.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {runLogs.length === 0 && !isRunning && (
            <div className="text-slate-500 text-center py-16 italic font-sans text-xs">
              Click "Run Collection" to execute all requests with dynamic HMAC signing & assertions.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
