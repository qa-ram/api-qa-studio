import React, { useState } from 'react';
import { 
  Sliders, Plus, Trash2, X, Check, Copy, Upload, Download, Globe, Edit2
} from 'lucide-react';

export default function EnvironmentModal({ 
  environments, 
  activeEnvId, 
  onSaveEnvironments, 
  onSelectActiveEnv,
  onClose 
}) {
  const [envStore, setEnvStore] = useState(() => JSON.parse(JSON.stringify(environments)));
  const [selectedEnvKey, setSelectedEnvKey] = useState(activeEnvId || Object.keys(environments)[0] || 'Local');
  const [newEnvName, setNewEnvName] = useState('');
  const [isAddingEnv, setIsAddingEnv] = useState(false);

  const activeEnv = envStore[selectedEnvKey] || { name: selectedEnvKey, vars: {} };

  // Convert dictionary to key-value array for editing
  const getVarArray = (envObj) => {
    if (!envObj) return [];
    const vars = envObj.vars || envObj;
    return Object.entries(vars)
      .filter(([k]) => k !== 'name')
      .map(([key, value]) => ({ key, value }));
  };

  const [currentVars, setCurrentVars] = useState(() => getVarArray(envStore[selectedEnvKey]));

  const handleSelectEnv = (envKey) => {
    // Save previous
    saveCurrentVarsToStore();
    setSelectedEnvKey(envKey);
    setCurrentVars(getVarArray(envStore[envKey]));
  };

  const saveCurrentVarsToStore = () => {
    const varObj = {};
    currentVars.forEach(v => {
      if (v.key.trim()) {
        varObj[v.key.trim()] = v.value;
      }
    });
    setEnvStore(prev => ({
      ...prev,
      [selectedEnvKey]: {
        name: prev[selectedEnvKey]?.name || selectedEnvKey,
        vars: varObj
      }
    }));
  };

  const handleCreateNewEnv = () => {
    const name = newEnvName.trim();
    if (!name) return;
    if (envStore[name]) {
      alert('An environment with this name already exists.');
      return;
    }

    saveCurrentVarsToStore();

    const newStore = {
      ...envStore,
      [name]: {
        name,
        vars: {
          baseUrl: "http://localhost:5000",
          hmacAppKey: "APP_KEY_" + Math.floor(Math.random() * 8999 + 1000),
          hmacSecret: "c2VjcmV0X2tleV9kZW1v"
        }
      }
    };

    setEnvStore(newStore);
    setSelectedEnvKey(name);
    setCurrentVars(getVarArray(newStore[name]));
    setNewEnvName('');
    setIsAddingEnv(false);
  };

  const handleDeleteEnv = (envKey, e) => {
    e.stopPropagation();
    if (Object.keys(envStore).length <= 1) {
      alert('At least one environment must be maintained.');
      return;
    }

    const updated = { ...envStore };
    delete updated[envKey];
    setEnvStore(updated);

    const remainingKeys = Object.keys(updated);
    if (selectedEnvKey === envKey) {
      const nextKey = remainingKeys[0];
      setSelectedEnvKey(nextKey);
      setCurrentVars(getVarArray(updated[nextKey]));
    }
  };

  const handleDuplicateEnv = (envKey, e) => {
    e.stopPropagation();
    const dupName = `${envKey} Copy`;
    const target = envStore[envKey];

    const updated = {
      ...envStore,
      [dupName]: JSON.parse(JSON.stringify(target))
    };
    updated[dupName].name = dupName;

    setEnvStore(updated);
    setSelectedEnvKey(dupName);
    setCurrentVars(getVarArray(updated[dupName]));
  };

  const addVarRow = () => {
    setCurrentVars(prev => [...prev, { key: '', value: '' }]);
  };

  const updateVarRow = (idx, field, val) => {
    const updated = [...currentVars];
    updated[idx][field] = val;
    setCurrentVars(updated);
  };

  const deleteVarRow = (idx) => {
    setCurrentVars(currentVars.filter((_, i) => i !== idx));
  };

  const handleImportEnvJson = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const parsed = JSON.parse(evt.target.result);
          const envName = parsed.name || file.name.replace('.json', '');
          const varsObj = {};

          if (Array.isArray(parsed.values)) {
            parsed.values.forEach(v => {
              if (v.enabled !== false) varsObj[v.key] = v.value;
            });
          }

          const updated = {
            ...envStore,
            [envName]: { name: envName, vars: varsObj }
          };

          setEnvStore(updated);
          setSelectedEnvKey(envName);
          setCurrentVars(getVarArray(updated[envName]));
          alert(`Environment "${envName}" imported successfully!`);
        } catch (err) {
          alert('Failed to parse Postman Environment JSON.');
        }
      };
      reader.readAsText(file);
    }
  };

  const handleSaveAll = () => {
    // Commit active changes
    const varObj = {};
    currentVars.forEach(v => {
      if (v.key.trim()) {
        varObj[v.key.trim()] = v.value;
      }
    });

    const finalStore = {
      ...envStore,
      [selectedEnvKey]: {
        name: envStore[selectedEnvKey]?.name || selectedEnvKey,
        vars: varObj
      }
    };

    onSaveEnvironments(finalStore);
    onSelectActiveEnv(selectedEnvKey);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-dark-950/85 backdrop-blur-md flex items-center justify-center p-6 z-50 animate-in fade-in duration-200">
      <div className="bg-dark-900 border border-slate-800 rounded-xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800/80 flex items-center justify-between bg-dark-950/60">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-brand-cyan/20 text-brand-cyan rounded-lg border border-brand-cyan/30">
              <Globe className="w-4 h-4 text-brand-cyan" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100">Environment & Variable Manager</h3>
              <p className="text-xs text-slate-400">Create, switch, and manage custom environments & key-value variables</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-800 text-slate-400 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body Split View */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Environments Sidebar */}
          <div className="w-64 border-r border-slate-800/80 bg-dark-950/50 flex flex-col p-3 space-y-3 shrink-0">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wide">Environments</span>
              <label className="p-1 text-slate-400 hover:text-slate-200 cursor-pointer" title="Import Postman Environment JSON">
                <Upload className="w-3.5 h-3.5" />
                <input type="file" accept=".json" onChange={handleImportEnvJson} className="hidden" />
              </label>
            </div>

            <div className="flex-1 overflow-y-auto space-y-1">
              {Object.keys(envStore).map(envKey => {
                const isActive = envKey === selectedEnvKey;
                const isCurrentActive = envKey === activeEnvId;

                return (
                  <div
                    key={envKey}
                    onClick={() => handleSelectEnv(envKey)}
                    className={`flex items-center justify-between p-2.5 rounded-lg cursor-pointer transition-all text-xs group ${
                      isActive
                        ? 'bg-brand-cyan/20 text-slate-100 border border-brand-cyan/40 font-semibold'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center space-x-2 truncate min-w-0">
                      <Globe className={`w-3.5 h-3.5 shrink-0 ${isCurrentActive ? 'text-brand-emerald animate-pulse' : 'text-slate-500'}`} />
                      <span className="truncate">{envKey}</span>
                      {isCurrentActive && (
                        <span className="text-[9px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1.5 rounded">
                          Active
                        </span>
                      )}
                    </div>

                    <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => handleDuplicateEnv(envKey, e)}
                        className="p-1 hover:text-slate-200 text-slate-500"
                        title="Duplicate environment"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                      {Object.keys(envStore).length > 1 && (
                        <button
                          onClick={(e) => handleDeleteEnv(envKey, e)}
                          className="p-1 hover:text-rose-400 text-slate-500"
                          title="Delete environment"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Create New Environment Input */}
            {isAddingEnv ? (
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <input
                  type="text"
                  placeholder="Env name (e.g. UAT Server)"
                  value={newEnvName}
                  onChange={(e) => setNewEnvName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreateNewEnv()}
                  className="w-full bg-dark-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-brand-cyan"
                  autoFocus
                />
                <div className="flex items-center space-x-1.5">
                  <button
                    onClick={handleCreateNewEnv}
                    className="flex-1 py-1 bg-brand-cyan text-dark-950 font-bold rounded text-xs"
                  >
                    Add
                  </button>
                  <button
                    onClick={() => setIsAddingEnv(false)}
                    className="py-1 px-2.5 bg-slate-800 text-slate-400 rounded text-xs"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setIsAddingEnv(true)}
                className="w-full flex items-center justify-center space-x-1.5 py-2 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 rounded-lg text-xs text-slate-200 transition-colors font-medium"
              >
                <Plus className="w-3.5 h-3.5 text-brand-cyan" />
                <span>New Environment</span>
              </button>
            )}
          </div>

          {/* Right Variables Editor Table */}
          <div className="flex-1 flex flex-col p-5 overflow-y-auto space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-200">
                  Variables for <span className="text-brand-cyan font-mono">{selectedEnvKey}</span>
                </h4>
                <p className="text-[11px] text-slate-400">Values in this scope take precedence during request execution</p>
              </div>

              <button
                onClick={addVarRow}
                className="flex items-center space-x-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Variable</span>
              </button>
            </div>

            <div className="border border-slate-800 rounded-lg overflow-hidden bg-dark-950/80 text-xs">
              <table className="w-full text-left">
                <thead className="bg-dark-900 border-b border-slate-800 text-slate-400 font-semibold">
                  <tr>
                    <th className="p-2.5 w-1/3">Variable Key</th>
                    <th className="p-2.5 w-2/3">Value</th>
                    <th className="p-2.5 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {currentVars.map((v, i) => (
                    <tr key={i} className="hover:bg-slate-800/30">
                      <td className="p-2">
                        <input
                          type="text"
                          value={v.key}
                          onChange={(e) => updateVarRow(i, 'key', e.target.value)}
                          placeholder="Variable Name (e.g. baseUrl)"
                          className="w-full bg-transparent text-brand-cyan focus:outline-none"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="text"
                          value={v.value}
                          onChange={(e) => updateVarRow(i, 'value', e.target.value)}
                          placeholder="Value (e.g. http://localhost:5000)"
                          className="w-full bg-transparent text-slate-200 focus:outline-none"
                        />
                      </td>
                      <td className="p-2 text-center">
                        <button onClick={() => deleteVarRow(i)} className="text-slate-500 hover:text-rose-400">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {currentVars.length === 0 && (
                    <tr>
                      <td colSpan={3} className="p-6 text-center text-slate-500 italic">
                        No variables defined for this environment. Click "Add Variable" above.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800/80 bg-dark-950/60 flex items-center justify-between">
          <div className="text-xs text-slate-400">
            Current Active Environment: <strong className="text-emerald-400 font-mono">{activeEnvId}</strong>
          </div>

          <div className="flex justify-end space-x-2">
            <button onClick={onClose} className="px-4 py-1.5 bg-slate-800 text-slate-300 rounded-lg text-xs font-semibold">
              Cancel
            </button>
            <button onClick={handleSaveAll} className="px-4 py-1.5 bg-brand-cyan text-dark-950 rounded-lg text-xs font-bold flex items-center space-x-1">
              <Check className="w-3.5 h-3.5" />
              <span>Save & Set Active</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
