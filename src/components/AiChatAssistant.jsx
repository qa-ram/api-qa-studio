import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, Send, Sparkles, X, Code2, Check, Copy, Wand2, RefreshCw, 
  HelpCircle, MessageSquare, ShieldCheck, Terminal, Lightbulb, BookOpen
} from 'lucide-react';

export default function AiChatAssistant({ 
  activeRequest, 
  responseData, 
  onClose, 
  onApplyScript, 
  onApplyBody 
}) {
  const [messages, setMessages] = useState([
    {
      id: 'msg-1',
      sender: 'bot',
      text: `Hello! I'm **ApexBot**, your expert AI QA Assistant for **Apex QA Studio** & **LIS Direct Reporting API** (similar to Postbot).

I am fully equipped to answer **any queries** about:
• **Product Capabilities**: Environment variables, Collection Runner, CSV/JSON data testing, Multi-protocol (REST/GraphQL/WS/gRPC), Postman Visualizer, Code exporters.
• **LIS Direct Reporting API**: HMAC security signing, Bulk report queuing (\`jobId\`), Result file uploads, Specimen medication tracking.
• **Test Script Automation**: Chai/Postman assertions (\`pm.test\`), status code checks, schema validation.

Ask me any question or pick a topic below!`,
      code: null,
      codeType: null,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [inputPrompt, setInputPrompt] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isThinking]);

  // Comprehensive Knowledge Base Engine
  const queryKnowledgeBase = (prompt) => {
    const p = prompt.toLowerCase();

    // 1. Product Features & General Knowledge
    if (p.includes('hmac') || p.includes('signature') || p.includes('app-key') || p.includes('x-signature') || p.includes('auth')) {
      return {
        text: `### 🔐 HMAC Authentication Engine
The **LIS Direct Reporting API** requires HMAC-SHA256 authentication for all external endpoints.

**Required HTTP Headers**:
- \`X-App-Key\`: Client App Key (\`{{hmacAppKey}}\`)
- \`X-Timestamp\`: Unix timestamp in seconds
- \`X-Nonce\`: One-time UUID string (\`{{$guid}}\`)
- \`X-Signature\`: Base64-encoded HMAC-SHA256 signature

**Signature Algorithm**:
1. Compute MD5 hash of raw request body: \`CryptoJS.MD5(rawBody).toString().toLowerCase()\`. (For \`multipart/form-data\`, empty string is hashed).
2. Construct canonical string: \`[METHOD, URL_PATH_QUERY, TIMESTAMP, NONCE, BODY_MD5].join('\\n')\`.
3. Sign canonical string using HMAC-SHA256 with \`hmacSecret\` and Base64 encode.`,
        code: `const appKey    = pm.collectionVariables.get('hmacAppKey');
const secret    = pm.collectionVariables.get('hmacSecret');
const timestamp = Math.floor(Date.now() / 1000).toString();
const nonce     = pm.variables.replaceIn('{{$guid}}');
const method    = pm.request.method.toUpperCase();
const url       = pm.request.url.getPathWithQuery();

let rawBody = pm.request.body && pm.request.body.mode === 'raw' ? pm.request.body.raw : '';
const bodyMd5   = CryptoJS.MD5(rawBody).toString().toLowerCase();
const canonical = [method, url, timestamp, nonce, bodyMd5].join('\\n');
const signature = CryptoJS.HmacSHA256(canonical, secret).toString(CryptoJS.enc.Base64);

pm.request.headers.upsert({ key: 'X-App-Key',   value: appKey });
pm.request.headers.upsert({ key: 'X-Timestamp', value: timestamp });
pm.request.headers.upsert({ key: 'X-Nonce',     value: nonce });
pm.request.headers.upsert({ key: 'X-Signature', value: signature });`,
        codeType: 'prerequest'
      };
    }

    if (p.includes('runner') || p.includes('csv') || p.includes('iteration') || p.includes('batch') || p.includes('data-driven')) {
      return {
        text: `### 🚀 Automated Collection Runner & Data-Driven Testing
Apex QA Studio includes a full automated test runner:

1. **How to Launch**: Click **"Runner"** in the top navigation bar.
2. **Data-Driven Runs**: Click **"Choose Data File"** to upload a CSV or JSON dataset containing specimen parameters.
3. **Variable Mapping**: Variables in your request (e.g. \`{{specimenId}}\`) will automatically interpolate values from your uploaded CSV/JSON row for each iteration!
4. **Execution Control**: Set iteration count and delay between requests (ms) to stress-test your system workflow.`,
        code: null,
        codeType: null
      };
    }

    if (p.includes('env') || p.includes('variable') || p.includes('scope') || p.includes('staging') || p.includes('baseUrl')) {
      return {
        text: `### 🌐 Environment & Variable Management
Apex QA Studio supports 3-tier variable scoping:
- **Global / Environment Variables**: High priority variables (\`baseUrl\`, \`hmacAppKey\`, \`hmacSecret\`). Switch between **Local** (\`http://localhost:5000\`), **Staging**, and **Production** using the top dropdown.
- **Collection Variables**: Built-in collection variables saved across sessions (\`bulkJobId\`, \`reportId\`).
- **Dynamic Variables**: Built-in Postman syntax generators:
  - \`{{$guid}}\`: Auto-generates random UUID
  - \`{{$timestamp}}\`: Current Unix timestamp
  - \`{{$randomInt}}\`: Random integer between 0-1000

Click the **Sliders (Sliders)** icon next to the Environment dropdown to edit variables.`,
        code: null,
        codeType: null
      };
    }

    if (p.includes('graphql') || p.includes('websocket') || p.includes('grpc') || p.includes('socket.io') || p.includes('protocol')) {
      return {
        text: `### 🔌 Multi-Protocol Testing Capabilities
Apart from standard REST HTTP endpoints, Apex QA Studio supports:
- **GraphQL**: Query/Mutation editor, variables tab, schema introspection.
- **WebSocket**: Real-time interactive socket client with connect/disconnect & live frame streaming log.
- **Socket.IO**: Namespace & event payload emitter.
- **gRPC**: Protobuf JSON request payload simulator.

Switch protocol modes anytime using the **Top Protocol Bar** (REST, GraphQL, WebSocket, Socket.IO, gRPC).`,
        code: null,
        codeType: null
      };
    }

    if (p.includes('visualizer') || p.includes('graph') || p.includes('table') || p.includes('chart')) {
      return {
        text: `### 👁️ Postman Visualizer Component
The **Visualizer** tab in the Response Viewer transforms complex raw JSON into interactive tables and visual summary dashboards.

When a request returns specimen data (e.g. \`ReportingBulk\` or \`GetReports\`), click the **"Visualizer"** tab in the response pane to view:
- Lab profile logo, director name, CLIA number
- Specimen IDs, patient name, DOB, gender
- Ordering provider facility & collected date grid`,
        code: null,
        codeType: null
      };
    }

    // 2. API Specific Queries
    if (p.includes('upload') || p.includes('cnv') || p.includes('snp') || p.includes('resultfileupload')) {
      return {
        text: `### 🔌 ResultFileUpload Endpoint Specification
- **Method**: \`POST {{baseUrl}}/api/v1/resultfileupload\`
- **Content-Type**: \`multipart/form-data\`
- **Form Data Fields**:
  - \`serviceType\`: "PGX"
  - \`CNVFile\`: XLSX Result File (Required)
  - \`SNPResultFile\`: XLSX Result File (Required)
  - \`SLC6A4File\`: XLSX Result File (Optional)
- **Note**: The HMAC pre-request script hashes an empty string for \`multipart/form-data\` body as per server security spec.`,
        code: null,
        codeType: null
      };
    }

    if (p.includes('bulk') || p.includes('job') || p.includes('jobid') || p.includes('poll')) {
      return {
        text: `### 📊 Bulk Report Generation & Polling
1. **Submit Job**: Send \`POST {{baseUrl}}/api/v1/reporting\` with specimen data payload.
2. **Returns**: \`202 Accepted\` containing a unique \`jobId\` (e.g. \`61a3b75c-b788-4173-aa07-a203ba21bbe7\`).
3. **Auto-Save**: The test script automatically saves \`jobId\` to \`{{bulkJobId}}\` collection variable.
4. **Poll Status**: Send \`GetJobStatus\` request (\`POST {{baseUrl}}/api/v1/reporting/bulk/status\`) to track report generation progress!`,
        code: `pm.test('Status 202', () => pm.response.to.have.status(202));
pm.test('JobId present', function() {
  const json = pm.response.json();
  pm.expect(json.jobId).to.be.a('string');
  pm.collectionVariables.set('bulkJobId', json.jobId);
});`,
        codeType: 'test'
      };
    }

    if (p.includes('medication') || p.includes('addcurrentmedications') || p.includes('drug')) {
      return {
        text: `### 💊 AddCurrentMedications Endpoint
- **Method**: \`POST {{baseUrl}}/api/v1/medication/addcurrentmedications\`
- **Purpose**: Appends or updates patient current medications by \`specimenId\`.
- **Payload Structure**: Passes drug name, dosage form, strength unit/number, model name, and change reason.`,
        code: JSON.stringify({
          SpecimenId: "DR08052601",
          ShowMatchingDrugs: false,
          CurrentMedications: [
            { DrugName: "Cevimeline", DosageForm: "Tablet", Strength: { Unit: "mg", Number: 500 } },
            { DrugName: "Aripiprazole", DosageForm: "Tablet", Strength: { Unit: "mg/l", Number: 10 } }
          ],
          ModelName: "NewDrugAdded",
          Reason: "Changed because of high risk factors"
        }, null, 2),
        codeType: 'body'
      };
    }

    // 3. Tests & Code Generation
    if (p.includes('test') || p.includes('assertion') || p.includes('assert')) {
      return {
        text: `Here are comprehensive Chai test assertions generated for **${activeRequest?.name || 'Current Request'}**:`,
        code: `// ApexBot Generated Test Assertions
pm.test("Status code is 200 or 202", function () {
    pm.expect([200, 202]).to.include(pm.response.code);
});

pm.test("Response is valid JSON object", function () {
    const json = pm.response.json();
    pm.expect(json).to.be.an('object');
});

pm.test("Response time is under 500ms", function () {
    pm.expect(pm.response.responseTime).to.be.below(500);
});`,
        codeType: 'test'
      };
    }

    if (p.includes('explain') || p.includes('response')) {
      if (responseData) {
        return {
          text: `### Response Analysis for ${activeRequest?.name}:
- **Status Code**: \`${responseData.status} ${responseData.statusText}\`
- **Latency**: \`${responseData.time} ms\`
- **Payload Size**: \`${responseData.size} KB\`
- **Test Summary**: ${responseData.testResults?.length ? `Passed ${responseData.testResults.filter(t=>t.passed).length} of ${responseData.testResults.length} test assertions.` : 'No test script assertions evaluated.'}`,
          code: null,
          codeType: null
        };
      } else {
        return {
          text: `No response payload has been recorded yet for **${activeRequest?.name}**. Click **"Send"** in the request bar to execute the API call, and I will analyze the status code, body, and headers for you!`,
          code: null,
          codeType: null
        };
      }
    }

    // Fallback general response
    return {
      text: `### ApexBot Product & API Guide
I can answer any query regarding:
1. **HMAC Authentication**: How headers (\`X-Signature\`, \`X-App-Key\`) are computed in pre-request script.
2. **Collection Runner**: Running data-driven tests with CSV or JSON files.
3. **Environment & Variables**: Setting up \`baseUrl\`, \`hmacAppKey\`, and \`{{$guid}}\`.
4. **Endpoints**: \`ResultFileUpload\`, \`Reporting\`, \`ReportingBulk\`, \`AddCurrentMedications\`, \`GetJobStatus\`, etc.
5. **Multi-Protocol Studio**: REST, GraphQL, WebSocket, Socket.IO, and gRPC.

Feel free to ask a specific question!`,
      code: null,
      codeType: null
    };
  };

  const handleSend = (textToSend) => {
    const prompt = textToSend || inputPrompt;
    if (!prompt.trim()) return;

    const userMsg = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: prompt,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputPrompt('');
    setIsThinking(true);

    setTimeout(() => {
      const kbAnswer = queryKnowledgeBase(prompt);

      const botMsg = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: kbAnswer.text,
        code: kbAnswer.code,
        codeType: kbAnswer.codeType,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, botMsg]);
      setIsThinking(false);
    }, 400);
  };

  const handleCopyCode = (id, codeText) => {
    navigator.clipboard.writeText(codeText);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <aside className="w-96 bg-dark-900 border-l border-slate-800/80 flex flex-col h-full shrink-0 select-none shadow-2xl z-20">
      {/* Drawer Header */}
      <div className="px-4 py-3 border-b border-slate-800/80 flex items-center justify-between bg-dark-950/60">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-gradient-to-tr from-brand-cyan via-brand-500 to-purple-600 text-white shadow-md shadow-brand-cyan/20">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <h3 className="text-xs font-bold text-slate-100 tracking-wide">ApexBot AI Assistant</h3>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-brand-cyan/20 text-brand-cyan font-semibold border border-brand-cyan/30">
                Postbot Expert
              </span>
            </div>
            <p className="text-[10px] text-slate-400 truncate max-w-[190px]">Context: {activeRequest?.name || 'API'}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Quick Action Prompt Chips */}
      <div className="p-2 border-b border-slate-800/80 bg-dark-950/30 flex items-center space-x-1.5 overflow-x-auto text-[11px]">
        <button
          onClick={() => handleSend("Explain HMAC signing script")}
          className="px-2.5 py-1 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/60 shrink-0 flex items-center space-x-1 transition-colors"
        >
          <ShieldCheck className="w-3 h-3 text-amber-400" />
          <span>HMAC Security</span>
        </button>
        <button
          onClick={() => handleSend("How to run CSV data testing in Collection Runner")}
          className="px-2.5 py-1 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/60 shrink-0 flex items-center space-x-1 transition-colors"
        >
          <Terminal className="w-3 h-3 text-emerald-400" />
          <span>CSV Runner</span>
        </button>
        <button
          onClick={() => handleSend("How does bulk job status polling work")}
          className="px-2.5 py-1 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/60 shrink-0 flex items-center space-x-1 transition-colors"
        >
          <BookOpen className="w-3 h-3 text-brand-cyan" />
          <span>Bulk Reporting</span>
        </button>
        <button
          onClick={() => handleSend("Write test assertions")}
          className="px-2.5 py-1 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/60 shrink-0 flex items-center space-x-1 transition-colors"
        >
          <Code2 className="w-3 h-3 text-purple-400" />
          <span>Write Tests</span>
        </button>
      </div>

      {/* Message Chat Feed */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex flex-col space-y-1 ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div className="flex items-center space-x-1 text-[10px] text-slate-500 px-1">
              <span>{m.sender === 'user' ? 'You' : 'ApexBot'}</span>
              <span>•</span>
              <span>{m.timestamp}</span>
            </div>

            <div
              className={`p-3 rounded-xl text-xs max-w-[92%] leading-relaxed ${
                m.sender === 'user'
                  ? 'bg-brand-cyan/20 text-slate-100 border border-brand-cyan/30 rounded-tr-none'
                  : 'bg-dark-950 border border-slate-800 text-slate-200 rounded-tl-none shadow-md'
              }`}
            >
              <div className="whitespace-pre-wrap">{m.text}</div>

              {m.code && (
                <div className="mt-2.5 pt-2 border-t border-slate-800/80 space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span className="font-mono text-brand-cyan">Code Block ({m.codeType || 'script'})</span>
                    <button
                      onClick={() => handleCopyCode(m.id, m.code)}
                      className="hover:text-slate-200 flex items-center space-x-1"
                    >
                      {copiedId === m.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedId === m.id ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <pre className="p-2.5 bg-dark-900 border border-slate-800/80 rounded font-mono text-[11px] text-emerald-300 overflow-x-auto whitespace-pre-wrap">
                    {m.code}
                  </pre>
                  {m.codeType && (
                    <button
                      onClick={() => {
                        if (m.codeType === 'test' && onApplyScript) onApplyScript(m.code, 'test');
                        if (m.codeType === 'prerequest' && onApplyScript) onApplyScript(m.code, 'prerequest');
                        if (m.codeType === 'body' && onApplyBody) onApplyBody(m.code);
                      }}
                      className="w-full py-1 px-2 mt-1 bg-brand-cyan/20 hover:bg-brand-cyan/30 text-brand-cyan border border-brand-cyan/40 rounded text-[11px] font-semibold flex items-center justify-center space-x-1 transition-colors"
                    >
                      <Wand2 className="w-3 h-3" />
                      <span>Apply to Request ({m.codeType})</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}

        {isThinking && (
          <div className="flex items-center space-x-2 text-xs text-slate-400 p-2 italic">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-brand-cyan" />
            <span>ApexBot is searching product knowledge base...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <div className="p-3 border-t border-slate-800/80 bg-dark-950/60">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center space-x-2"
        >
          <input
            type="text"
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            placeholder="Ask ApexBot any product or API question..."
            className="flex-1 bg-dark-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-cyan font-sans"
          />
          <button
            type="submit"
            disabled={!inputPrompt.trim() || isThinking}
            className="p-2 bg-brand-cyan hover:bg-cyan-500 text-dark-950 rounded-lg font-bold transition-all disabled:opacity-40 shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </aside>
  );
}
