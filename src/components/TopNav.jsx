import React from 'react';
import { 
  Zap, Play, Bot, Sparkles, Sliders, Globe, Terminal, 
  Activity, Cpu, Code, Plus
} from 'lucide-react';

export default function TopNav({
  activeProtocol,
  onSelectProtocol,
  environments,
  activeEnvId,
  onChangeEnvironment,
  onOpenEnvironments,
  onOpenRunner,
  onOpenAiEngineer,
  onOpenAiAgentBuilder,
  onToggleAiChat,
  isAiChatOpen
}) {
  const protocols = [
    { id: 'rest', label: 'REST API', icon: Globe },
    { id: 'graphql', label: 'GraphQL', icon: Code },
    { id: 'websocket', label: 'WebSocket', icon: Activity },
    { id: 'socketio', label: 'Socket.IO', icon: Terminal },
    { id: 'grpc', label: 'gRPC', icon: Cpu }
  ];

  const envKeys = Object.keys(environments || {});

  return (
    <header className="h-14 bg-dark-900 border-b border-slate-800/80 flex items-center justify-between px-4 shrink-0 select-none">
      {/* Brand & Logo */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-cyan via-brand-500 to-indigo-600 p-0.5 shadow-lg shadow-brand-cyan/20">
            <div className="w-full h-full bg-dark-950 rounded-[7px] flex items-center justify-center">
              <Zap className="w-4 h-4 text-brand-cyan fill-brand-cyan/20" />
            </div>
          </div>
          <div>
            <h1 className="text-sm font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-brand-cyan uppercase">
              Apex QA Studio
            </h1>
            <div className="flex items-center space-x-1.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-brand-emerald animate-pulse"></span>
              <span className="text-[10px] text-slate-400 font-medium tracking-tight">QA Core v2.4</span>
            </div>
          </div>
        </div>

        {/* Protocol Switcher Tabs */}
        <div className="h-6 w-[1px] bg-slate-800 mx-2" />
        
        <nav className="flex items-center p-1 bg-dark-950/80 border border-slate-800/80 rounded-lg">
          {protocols.map((p) => {
            const Icon = p.icon;
            const isActive = activeProtocol === p.id;
            return (
              <button
                key={p.id}
                onClick={() => onSelectProtocol(p.id)}
                className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{p.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Right Controls */}
      <div className="flex items-center space-x-2">
        {/* Dynamic Environment Selector & Manager */}
        <div className="flex items-center space-x-1 bg-dark-950/80 border border-slate-800/80 rounded-lg p-1">
          <Globe className="w-3.5 h-3.5 text-brand-cyan ml-1.5 shrink-0" />
          <select
            value={activeEnvId}
            onChange={(e) => {
              if (e.target.value === '__NEW_ENV__') {
                onOpenEnvironments();
              } else {
                onChangeEnvironment(e.target.value);
              }
            }}
            className="bg-transparent text-xs text-slate-200 focus:outline-none cursor-pointer pr-2 font-medium max-w-[200px] truncate"
          >
            {envKeys.map(envKey => (
              <option key={envKey} value={envKey} className="bg-dark-900 text-slate-200">
                {envKey} ({environments[envKey]?.vars?.baseUrl || 'no baseUrl'})
              </option>
            ))}
            <option value="__NEW_ENV__" className="bg-dark-900 text-brand-cyan font-bold">
              + Manage / Add New Environment...
            </option>
          </select>

          <button
            onClick={onOpenEnvironments}
            className="p-1 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded transition-colors"
            title="Manage Environments & Variables"
          >
            <Sliders className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Collection Runner Button */}
        <button
          onClick={onOpenRunner}
          className="flex items-center space-x-1.5 px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-emerald-950/40 border border-emerald-400/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Play className="w-3.5 h-3.5 fill-white" />
          <span>Runner</span>
        </button>

        {/* ApexBot Postbot Chat Toggle */}
        <button
          onClick={onToggleAiChat}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
            isAiChatOpen
              ? 'bg-brand-cyan text-dark-950 border-brand-cyan font-bold shadow-md shadow-brand-cyan/20'
              : 'bg-dark-950 hover:bg-slate-800 text-brand-cyan border-brand-cyan/40'
          }`}
        >
          <Bot className="w-3.5 h-3.5" />
          <span>ApexBot Chat</span>
        </button>

        {/* AI Postman Engineer */}
        <button
          onClick={onOpenAiEngineer}
          className="flex items-center space-x-1.5 px-2.5 py-1.5 bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/80 rounded-lg text-xs font-semibold transition-all"
        >
          <Sparkles className="w-3.5 h-3.5 text-brand-cyan" />
          <span>AI Tools</span>
        </button>

        {/* AI Agent Builder */}
        <button
          onClick={onOpenAiAgentBuilder}
          className="flex items-center space-x-1.5 px-2.5 py-1.5 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/40 rounded-lg text-xs font-semibold transition-all"
        >
          <Cpu className="w-3.5 h-3.5 text-purple-400" />
          <span>LLM Agent</span>
        </button>
      </div>
    </header>
  );
}
