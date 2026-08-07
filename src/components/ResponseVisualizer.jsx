import React from 'react';
import { BarChart3, Table, Layers, PieChart } from 'lucide-react';

export default function ResponseVisualizer({ responseData }) {
  if (!responseData) return null;

  let parsed = null;
  try {
    parsed = typeof responseData.data === 'string' ? JSON.parse(responseData.data) : responseData.data;
  } catch (e) {
    parsed = null;
  }

  if (!parsed) {
    return (
      <div className="p-6 text-center text-slate-500 text-xs italic">
        Visualizer is available for JSON responses. Select a request that returns structured JSON.
      </div>
    );
  }

  // Detect specimen array if present (from user's collection response structure)
  const specimenList = parsed.specimenData || (Array.isArray(parsed) ? parsed : null);

  return (
    <div className="p-4 space-y-4 font-sans">
      {/* Header Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="glass-card p-3 rounded-lg border border-slate-800 flex items-center space-x-3">
          <div className="p-2 bg-brand-cyan/20 rounded-lg text-brand-cyan">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Service Type</div>
            <div className="text-sm font-bold text-slate-100">{parsed.serviceType || parsed.serviceId || 'PGX Direct'}</div>
          </div>
        </div>

        <div className="glass-card p-3 rounded-lg border border-slate-800 flex items-center space-x-3">
          <div className="p-2 bg-purple-500/20 rounded-lg text-purple-400">
            <Table className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Panel Name</div>
            <div className="text-sm font-bold text-slate-100">{parsed.panelName || 'Comprehensive PGx'}</div>
          </div>
        </div>

        <div className="glass-card p-3 rounded-lg border border-slate-800 flex items-center space-x-3">
          <div className="p-2 bg-brand-emerald/20 rounded-lg text-brand-emerald">
            <PieChart className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Job ID / Status</div>
            <div className="text-xs font-mono font-bold text-brand-emerald truncate max-w-[120px]">
              {parsed.jobId || (parsed.success ? 'Success' : '200 OK')}
            </div>
          </div>
        </div>
      </div>

      {/* Lab Profile Visual Card */}
      {parsed.labProfile && (
        <div className="glass-card p-3.5 rounded-lg border border-slate-800/80 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-3">
            {parsed.labProfile.logo && (
              <img src={parsed.labProfile.logo} alt="Lab Logo" className="w-8 h-8 rounded object-contain bg-white/10 p-1" />
            )}
            <div>
              <div className="font-bold text-slate-200">{parsed.labProfile.name}</div>
              <div className="text-[10px] text-slate-400">Director: {parsed.labProfile.labDirector} • CLIA: {parsed.labProfile.clia?.cliaNumber}</div>
            </div>
          </div>
          <div className="text-right text-[11px] text-slate-400">
            <div>{parsed.labProfile.phone}</div>
            <div>{parsed.labProfile.email}</div>
          </div>
        </div>
      )}

      {/* Specimen Data Table if present */}
      {specimenList && Array.isArray(specimenList) && (
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-slate-300 flex items-center space-x-2">
            <BarChart3 className="w-3.5 h-3.5 text-brand-cyan" />
            <span>Specimens Visual Data Grid ({specimenList.length})</span>
          </h4>
          <div className="border border-slate-800 rounded-lg overflow-hidden bg-dark-900/80">
            <table className="w-full text-xs text-left">
              <thead className="bg-dark-900 border-b border-slate-800 text-slate-400">
                <tr>
                  <th className="p-2.5">Specimen ID</th>
                  <th className="p-2.5">Patient Name</th>
                  <th className="p-2.5">Gender / DOB</th>
                  <th className="p-2.5">Provider</th>
                  <th className="p-2.5">Collected Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {specimenList.map((spec, i) => (
                  <tr key={i} className="hover:bg-slate-800/40">
                    <td className="p-2.5 font-bold text-brand-cyan">{spec.specimenProfile?.specimenId}</td>
                    <td className="p-2.5 text-slate-200">
                      {spec.patientProfile?.firstName} {spec.patientProfile?.lastName}
                    </td>
                    <td className="p-2.5 text-slate-400">
                      {spec.patientProfile?.gender} • {spec.patientProfile?.dob}
                    </td>
                    <td className="p-2.5 text-slate-300">
                      {spec.providerProfile?.fullName}
                    </td>
                    <td className="p-2.5 text-slate-500">
                      {spec.specimenProfile?.collectedDate}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Default JSON visual fallback tree */}
      {!specimenList && (
        <div className="p-4 bg-dark-900/90 border border-slate-800 rounded-lg">
          <div className="text-xs font-semibold text-slate-300 mb-2">Raw Visualizer Object Summary</div>
          <pre className="font-mono text-xs text-brand-cyan/90 overflow-x-auto whitespace-pre-wrap leading-relaxed">
            {JSON.stringify(parsed, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
