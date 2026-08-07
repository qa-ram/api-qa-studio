import React, { useState } from 'react';
import { 
  Globe, Code, Activity, Terminal, Cpu, Send, Play, Power, Plus, Trash2, 
  CheckCircle2, RefreshCw, Layers
} from 'lucide-react';

export default function MultiProtocolStudio({ activeProtocol }) {
  // Protocol specific states
  const [graphqlEndpoint, setGraphqlEndpoint] = useState('http://localhost:5000/graphql');
  const [graphqlQuery, setGraphqlQuery] = useState(`query GetSpecimenReport($specimenId: String!) {
  report(specimenId: $specimenId) {
    id
    status
    patient {
      firstName
      lastName
    }
  }
}`);
  const [graphqlVariables, setGraphqlVariables] = useState(`{\n  "specimenId": "DR08052601S"\n}`);
  const [graphqlResponse, setGraphqlResponse] = useState(null);

  // WebSocket state
  const [wsUrl, setWsUrl] = useState('ws://localhost:5000/ws/reports');
  const [wsConnected, setWsConnected] = useState(false);
  const [wsMessage, setWsMessage] = useState('{"event": "subscribe", "jobId": "61a3b75c-b788-4173-aa07-a203ba21bbe7"}');
  const [wsLogs, setWsLogs] = useState([]);

  // Socket.IO state
  const [socketNamespace, setSocketNamespace] = useState('/reporting-hub');
  const [socketEvent, setSocketEvent] = useState('reportStatus');
  const [socketPayload, setSocketPayload] = useState('{"specimenId": "DR08052601S", "action": "track"}');

  // gRPC state
  const [grpcMethod, setGrpcMethod] = useState('lis.DirectReporting/GenerateReport');
  const [grpcPayload, setGrpcPayload] = useState(`{\n  "service_type": 1,\n  "specimen_id": "DR08052601S"\n}`);
  const [grpcResponse, setGrpcResponse] = useState(null);

  // WebSocket Mock Connect
  const toggleWs = () => {
    if (wsConnected) {
      setWsConnected(false);
      setWsLogs(prev => [...prev, { type: 'system', text: 'Disconnected from ' + wsUrl, time: new Date().toLocaleTimeString() }]);
    } else {
      setWsConnected(true);
      setWsLogs(prev => [
        ...prev, 
        { type: 'system', text: 'Connected to ' + wsUrl, time: new Date().toLocaleTimeString() },
        { type: 'received', text: '{"status": "READY", "channel": "reporting_events"}', time: new Date().toLocaleTimeString() }
      ]);
    }
  };

  const sendWsMessage = () => {
    if (!wsMessage.trim()) return;
    setWsLogs(prev => [
      ...prev,
      { type: 'sent', text: wsMessage, time: new Date().toLocaleTimeString() },
      { type: 'received', text: `{"event": "ACK", "payload": "Subscribed to jobId 61a3b75c"}`, time: new Date().toLocaleTimeString() }
    ]);
  };

  const handleGraphqlSend = () => {
    setGraphqlResponse({
      data: {
        report: {
          id: "REP-99021",
          status: "COMPLETED",
          patient: { firstName: "Test", lastName: "Patent1" }
        }
      }
    });
  };

  const handleGrpcSend = () => {
    setGrpcResponse({
      job_id: "grpc-job-881920",
      status: "QUEUED",
      created_at: new Date().toISOString()
    });
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-dark-950 p-4 overflow-y-auto">
      {/* GraphQL Studio */}
      {activeProtocol === 'graphql' && (
        <div className="space-y-4 max-w-5xl mx-auto w-full">
          <div className="flex items-center space-x-2">
            <Code className="w-5 h-5 text-brand-cyan" />
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wide">GraphQL Multi-Protocol Testing</h3>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={graphqlEndpoint}
              onChange={(e) => setGraphqlEndpoint(e.target.value)}
              className="flex-1 font-mono text-xs bg-dark-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-brand-cyan"
            />
            <button
              onClick={handleGraphqlSend}
              className="px-4 py-2 bg-brand-cyan hover:bg-cyan-500 text-dark-950 font-bold rounded-lg text-xs flex items-center space-x-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Query</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400">Query / Mutation</label>
              <textarea
                value={graphqlQuery}
                onChange={(e) => setGraphqlQuery(e.target.value)}
                className="w-full h-64 font-mono text-xs bg-dark-900 border border-slate-800 rounded-lg p-3 text-brand-cyan focus:outline-none resize-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400">Variables (JSON)</label>
              <textarea
                value={graphqlVariables}
                onChange={(e) => setGraphqlVariables(e.target.value)}
                className="w-full h-64 font-mono text-xs bg-dark-900 border border-slate-800 rounded-lg p-3 text-slate-200 focus:outline-none resize-none"
              />
            </div>
          </div>

          {graphqlResponse && (
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400">GraphQL Response</label>
              <pre className="p-3 bg-dark-900 border border-slate-800 rounded-lg text-xs font-mono text-emerald-400 overflow-x-auto">
                {JSON.stringify(graphqlResponse, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* WebSocket Studio */}
      {activeProtocol === 'websocket' && (
        <div className="space-y-4 max-w-5xl mx-auto w-full">
          <div className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-brand-emerald" />
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wide">WebSocket Interactive Client</h3>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={wsUrl}
              onChange={(e) => setWsUrl(e.target.value)}
              className="flex-1 font-mono text-xs bg-dark-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-brand-emerald"
            />
            <button
              onClick={toggleWs}
              className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-all ${
                wsConnected ? 'bg-rose-500 hover:bg-rose-600 text-white' : 'bg-brand-emerald hover:bg-emerald-500 text-dark-950'
              }`}
            >
              <Power className="w-3.5 h-3.5" />
              <span>{wsConnected ? 'Disconnect' : 'Connect'}</span>
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={wsMessage}
              onChange={(e) => setWsMessage(e.target.value)}
              placeholder="WebSocket frame payload..."
              disabled={!wsConnected}
              className="flex-1 font-mono text-xs bg-dark-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-brand-emerald disabled:opacity-50"
            />
            <button
              onClick={sendWsMessage}
              disabled={!wsConnected}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-lg text-xs flex items-center space-x-1.5 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send Frame</span>
            </button>
          </div>

          {/* Realtime Stream Log */}
          <div className="border border-slate-800 rounded-lg bg-dark-900/80 p-3 h-80 overflow-y-auto space-y-2 font-mono text-xs">
            {wsLogs.map((log, i) => (
              <div key={i} className="flex items-start space-x-2">
                <span className="text-[10px] text-slate-500 shrink-0">{log.time}</span>
                {log.type === 'system' && <span className="text-amber-400">[SYSTEM] {log.text}</span>}
                {log.type === 'sent' && <span className="text-brand-cyan">⬆ [SENT] {log.text}</span>}
                {log.type === 'received' && <span className="text-emerald-400">⬇ [RECEIVED] {log.text}</span>}
              </div>
            ))}
            {wsLogs.length === 0 && (
              <div className="text-slate-500 text-center py-10 italic">
                No WebSocket frames exchanged. Click "Connect" above.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Socket.IO Studio */}
      {activeProtocol === 'socketio' && (
        <div className="space-y-4 max-w-5xl mx-auto w-full">
          <div className="flex items-center space-x-2">
            <Terminal className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wide">Socket.IO Real-Time Simulator</h3>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-400">Namespace</label>
              <input
                type="text"
                value={socketNamespace}
                onChange={(e) => setSocketNamespace(e.target.value)}
                className="w-full font-mono text-xs bg-dark-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 mt-1"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400">Event Name</label>
              <input
                type="text"
                value={socketEvent}
                onChange={(e) => setSocketEvent(e.target.value)}
                className="w-full font-mono text-xs bg-dark-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 mt-1"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400">Payload</label>
            <textarea
              value={socketPayload}
              onChange={(e) => setSocketPayload(e.target.value)}
              className="w-full h-40 font-mono text-xs bg-dark-900 border border-slate-800 rounded-lg p-3 text-amber-300 focus:outline-none mt-1 resize-none"
            />
          </div>
        </div>
      )}

      {/* gRPC Studio */}
      {activeProtocol === 'grpc' && (
        <div className="space-y-4 max-w-5xl mx-auto w-full">
          <div className="flex items-center space-x-2">
            <Cpu className="w-5 h-5 text-purple-400" />
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wide">gRPC Unary / Streaming Simulator</h3>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={grpcMethod}
              onChange={(e) => setGrpcMethod(e.target.value)}
              className="flex-1 font-mono text-xs bg-dark-900 border border-slate-800 rounded-lg px-3 py-2 text-purple-300 focus:outline-none"
            />
            <button
              onClick={handleGrpcSend}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg text-xs flex items-center space-x-1.5"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Invoke gRPC</span>
            </button>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400">Protobuf JSON Payload</label>
            <textarea
              value={grpcPayload}
              onChange={(e) => setGrpcPayload(e.target.value)}
              className="w-full h-44 font-mono text-xs bg-dark-900 border border-slate-800 rounded-lg p-3 text-slate-200 focus:outline-none mt-1 resize-none"
            />
          </div>

          {grpcResponse && (
            <div>
              <label className="text-xs font-semibold text-slate-400">gRPC Response Message</label>
              <pre className="p-3 bg-dark-900 border border-slate-800 rounded-lg text-xs font-mono text-purple-300 overflow-x-auto mt-1">
                {JSON.stringify(grpcResponse, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
