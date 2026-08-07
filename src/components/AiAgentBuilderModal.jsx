import React, { useState } from 'react';
import { Bot, Send, Cpu, DollarSign, Clock, CheckCircle2, RefreshCw, X } from 'lucide-react';

export default function AiAgentBuilderModal({ onClose }) {
  const [modelProvider, setModelProvider] = useState('OpenAI');
  const [modelName, setModelName] = useState('gpt-4o');
  const [systemPrompt, setSystemPrompt] = useState('You are a clinical geneticist AI validating pharmacogenomic (PGx) report JSON schemas.');
  const [userPrompt, setUserPrompt] = useState('Analyze the patient specimen DR08052601S and return drug interaction warnings in JSON format.');
  const [isLoading, setIsLoading] = useState(false);
  const [llmOutput, setLlmOutput] = useState(null);

  const handleTestLlm = async () => {
    setIsLoading(true);
    setLlmOutput(null);

    await new Promise(r => setTimeout(r, 600));

    setLlmOutput({
      model: modelName,
      status: 200,
      latencyMs: 342,
      inputTokens: 148,
      outputTokens: 96,
      estimatedCostUsd: 0.0014,
      responseJson: {
        specimenId: "DR08052601S",
        riskCategory: "MODERATE",
        warnings: [
          { drug: "Aripiprazole", gene: "CYP2D6", recommendation: "Consider 50% dose reduction due to poor metabolizer phenotype." }
        ],
        validated: true
      }
    });

    setIsLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-dark-950/80 backdrop-blur-md flex items-center justify-center p-6 z-50 animate-in fade-in duration-200">
      <div className="bg-dark-900 border border-slate-800 rounded-xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800/80 flex items-center justify-between bg-dark-950/50">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-purple-500/20 text-purple-400 rounded-lg border border-purple-500/30">
              <Bot className="w-4 h-4 text-purple-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100">AI Agent Builder & LLM API Tester</h3>
              <p className="text-xs text-slate-400">Test LLM Endpoints, Systematic Prompt Tuning & Latency / Cost Benchmarking</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-800 text-slate-400 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* Model Config Grid */}
          <div className="grid grid-cols-2 gap-4 bg-dark-950/80 p-3.5 border border-slate-800 rounded-lg">
            <div>
              <label className="font-semibold text-slate-300 block mb-1">Model Provider</label>
              <select
                value={modelProvider}
                onChange={(e) => setModelProvider(e.target.value)}
                className="w-full bg-dark-900 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-200"
              >
                <option value="OpenAI">OpenAI (API)</option>
                <option value="Anthropic">Anthropic Claude</option>
                <option value="Gemini">Google Gemini 1.5</option>
                <option value="Custom">Custom Self-Hosted LLM</option>
              </select>
            </div>
            <div>
              <label className="font-semibold text-slate-300 block mb-1">Model Identifier</label>
              <input
                type="text"
                value={modelName}
                onChange={(e) => setModelName(e.target.value)}
                className="w-full bg-dark-900 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-200 font-mono"
              />
            </div>
          </div>

          {/* Prompt Tuning */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-slate-400 block mb-1">System Prompt</label>
              <textarea
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                className="w-full h-36 font-mono bg-dark-900 border border-slate-800 rounded-lg p-3 text-slate-200 focus:outline-none resize-none leading-relaxed"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-400 block mb-1">User Prompt Input</label>
              <textarea
                value={userPrompt}
                onChange={(e) => setUserPrompt(e.target.value)}
                className="w-full h-36 font-mono bg-dark-900 border border-slate-800 rounded-lg p-3 text-purple-300 focus:outline-none resize-none leading-relaxed"
              />
            </div>
          </div>

          {/* Test Button & Metrics */}
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={handleTestLlm}
              disabled={isLoading}
              className="flex items-center space-x-2 px-5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-lg font-bold shadow-md disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Evaluating Model Response...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Execute LLM API Test</span>
                </>
              )}
            </button>

            {llmOutput && (
              <div className="flex items-center space-x-4 font-mono text-[11px] bg-dark-950 px-3 py-1.5 border border-slate-800 rounded-lg">
                <span className="text-emerald-400 flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>{llmOutput.latencyMs} ms</span>
                </span>
                <span className="text-purple-300">Tokens: {llmOutput.inputTokens} in / {llmOutput.outputTokens} out</span>
                <span className="text-amber-400 flex items-center space-x-0.5">
                  <DollarSign className="w-3 h-3" />
                  <span>Cost: ${llmOutput.estimatedCostUsd}</span>
                </span>
              </div>
            )}
          </div>

          {/* LLM JSON Output Response */}
          {llmOutput && (
            <div className="space-y-1 pt-2">
              <label className="font-semibold text-slate-400">LLM Response JSON Payload</label>
              <pre className="p-3 bg-dark-950 border border-slate-800 rounded-lg font-mono text-xs text-purple-300 overflow-x-auto">
                {JSON.stringify(llmOutput.responseJson, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
