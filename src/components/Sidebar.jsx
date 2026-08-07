import React, { useState, useEffect, useRef } from 'react';
import { 
  Folder, FolderOpen, FileCode, Plus, Search, Upload, Download, 
  ChevronRight, ChevronDown, Layers, Trash2, MoreVertical, Edit2, 
  Copy, Clipboard, Play, Bot, PanelLeftClose, PanelLeftOpen, Check, CornerDownRight
} from 'lucide-react';
import { exportPostmanCollection } from '../engine/postmanImporter';

export default function Sidebar({ 
  collection, 
  activeRequestId, 
  onSelectRequest, 
  onImportCollection, 
  onAddRequest,
  onAddFolder,
  onRenameItem,
  onDuplicateItem,
  onDeleteItem,
  onPasteItem,
  onRunFolder,
  onAskAi,
  isCollapsed,
  onToggleCollapse,
  width
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedFolders, setExpandedFolders] = useState({ 'folder-external-apis': true });
  
  // Context Menu State
  const [menuState, setMenuState] = useState(null); // { type: 'collection'|'folder'|'request', item, x, y }
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [clipboard, setClipboard] = useState(null); // { type: 'folder'|'request', item }

  const menuRef = useRef(null);

  // Close context menu on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuState(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleFolder = (folderId) => {
    setExpandedFolders(prev => ({
      ...prev,
      [folderId]: !prev[folderId]
    }));
  };

  const getMethodBadgeClass = (method) => {
    switch (method?.toUpperCase()) {
      case 'GET': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'POST': return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
      case 'PUT': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'DELETE': return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
      case 'PATCH': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  const handleOpenMenu = (e, type, item) => {
    e.stopPropagation();
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    setMenuState({
      type,
      item,
      x: rect.right - 10,
      y: rect.bottom + 4
    });
  };

  const startRename = (item) => {
    setEditingId(item.id);
    setEditName(item.name);
    setMenuState(null);
  };

  const submitRename = (id) => {
    if (editName.trim()) {
      onRenameItem(id, editName.trim());
    }
    setEditingId(null);
  };

  const handleCopyCurl = (item) => {
    const req = item.request || {};
    const method = req.method || 'GET';
    const url = req.url?.raw || '';
    const body = req.body?.raw || '';
    const curl = `curl -X ${method} "${url}" -H "Content-Type: application/json" -d '${body}'`;
    navigator.clipboard.writeText(curl);
    alert(`cURL command for "${item.name}" copied to clipboard!`);
    setMenuState(null);
  };

  const handleExport = () => {
    const jsonStr = exportPostmanCollection(collection);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${collection.info?.name || 'collection'}.postman_collection.json`;
    a.click();
    URL.revokeObjectURL(url);
    setMenuState(null);
  };

  if (isCollapsed) {
    return (
      <aside className="w-12 bg-dark-900 border-r border-slate-800/80 flex flex-col items-center py-3 space-y-4 shrink-0 select-none">
        <button
          onClick={onToggleCollapse}
          className="p-2 hover:bg-slate-800 text-brand-cyan hover:text-white rounded-lg transition-colors"
          title="Expand Collections Sidebar"
        >
          <PanelLeftOpen className="w-4 h-4" />
        </button>

        <div className="w-6 h-[1px] bg-slate-800" />

        <button
          onClick={() => onAddRequest(null)}
          className="p-2 hover:bg-slate-800 text-slate-400 hover:text-brand-cyan rounded-lg transition-colors"
          title="New Request"
        >
          <Plus className="w-4 h-4" />
        </button>

        <label className="p-2 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded-lg cursor-pointer transition-colors" title="Import Collection">
          <Upload className="w-4 h-4" />
          <input 
            type="file" 
            accept=".json" 
            className="hidden" 
            onChange={(e) => {
              const file = e.target.files[0];
              if (file) {
                const reader = new FileReader();
                reader.onload = (evt) => onImportCollection(evt.target.result);
                reader.readAsText(file);
              }
            }}
          />
        </label>
      </aside>
    );
  }

  const renderItems = (items) => {
    if (!items) return null;
    return items.map(item => {
      if (searchTerm && item.name && !item.name.toLowerCase().includes(searchTerm.toLowerCase())) {
        if (!item.item || !item.item.some(sub => sub.name.toLowerCase().includes(searchTerm.toLowerCase()))) {
          return null;
        }
      }

      if (item.item) {
        // Folder item
        const isExpanded = expandedFolders[item.id] || searchTerm.length > 0;
        const isEditing = editingId === item.id;

        return (
          <div key={item.id} className="mb-1">
            <div 
              onClick={() => toggleFolder(item.id)}
              className="flex items-center justify-between px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/60 cursor-pointer group transition-all text-xs font-medium relative"
            >
              <div className="flex items-center space-x-2 truncate min-w-0 flex-1">
                {isExpanded ? (
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                )}
                {isExpanded ? (
                  <FolderOpen className="w-4 h-4 text-brand-cyan shrink-0" />
                ) : (
                  <Folder className="w-4 h-4 text-brand-cyan/80 shrink-0" />
                )}

                {isEditing ? (
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') submitRename(item.id);
                      if (e.key === 'Escape') setEditingId(null);
                    }}
                    onBlur={() => submitRename(item.id)}
                    className="bg-dark-950 border border-brand-cyan rounded px-1 text-xs text-slate-100 focus:outline-none w-full"
                    autoFocus
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <span className="truncate">{item.name}</span>
                )}
              </div>

              <div className="flex items-center space-x-1 shrink-0">
                <span className="text-[10px] text-slate-500 bg-slate-800/80 px-1.5 py-0.5 rounded border border-slate-700/50">
                  {item.item.length}
                </span>
                
                {/* 3-Dot Context Menu Trigger */}
                <button
                  onClick={(e) => handleOpenMenu(e, 'folder', item)}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-700 text-slate-400 hover:text-slate-100 rounded transition-opacity"
                  title="Folder Options"
                >
                  <MoreVertical className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {isExpanded && (
              <div className="ml-3.5 pl-2 border-l border-slate-800/80 space-y-0.5 mt-1">
                {renderItems(item.item)}
              </div>
            )}
          </div>
        );
      }

      // Request Item
      const isSelected = activeRequestId === item.id;
      const isEditing = editingId === item.id;
      const method = item.request?.method || 'GET';

      return (
        <div 
          key={item.id}
          onClick={() => onSelectRequest(item)}
          className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg cursor-pointer group transition-all text-xs ${
            isSelected 
              ? 'bg-brand-cyan/15 border border-brand-cyan/40 text-white font-medium shadow-sm' 
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent'
          }`}
        >
          <div className="flex items-center space-x-2 truncate min-w-0 flex-1">
            <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded border uppercase shrink-0 ${getMethodBadgeClass(method)}`}>
              {method}
            </span>

            {isEditing ? (
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') submitRename(item.id);
                  if (e.key === 'Escape') setEditingId(null);
                }}
                onBlur={() => submitRename(item.id)}
                className="bg-dark-950 border border-brand-cyan rounded px-1 text-xs text-slate-100 focus:outline-none w-full"
                autoFocus
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <span className="truncate">{item.name}</span>
            )}
          </div>

          {/* 3-Dot Context Menu Trigger */}
          <button
            onClick={(e) => handleOpenMenu(e, 'request', item)}
            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-700 text-slate-400 hover:text-slate-100 rounded transition-opacity shrink-0 ml-1"
            title="Request Options"
          >
            <MoreVertical className="w-3.5 h-3.5" />
          </button>
        </div>
      );
    });
  };

  return (
    <aside 
      style={{ width: `${width}px` }}
      className="bg-dark-900 border-r border-slate-800/80 flex flex-col h-full shrink-0 select-none transition-all duration-75 relative"
    >
      {/* Root Collection Header */}
      <div className="p-3 border-b border-slate-800/80 flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 truncate">
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-brand-cyan/20 to-brand-500/20 border border-brand-cyan/30 text-brand-cyan shrink-0">
              <Layers className="w-4 h-4" />
            </div>
            <div className="truncate">
              <h2 className="text-xs font-bold text-slate-100 tracking-wide uppercase">Collections</h2>
              <p className="text-[10px] text-slate-400 truncate">{collection.info?.name}</p>
            </div>
          </div>

          <div className="flex items-center space-x-1 shrink-0">
            {/* Collection 3-Dot Options */}
            <button 
              onClick={(e) => handleOpenMenu(e, 'collection', collection)} 
              className="p-1 hover:bg-slate-800 text-slate-400 hover:text-brand-cyan rounded transition-colors" 
              title="Collection Actions (...)"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            <button 
              onClick={onToggleCollapse} 
              className="p-1 hover:bg-slate-800 text-slate-400 hover:text-brand-cyan rounded" 
              title="Collapse Sidebar"
            >
              <PanelLeftClose className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-slate-500" />
          <input 
            type="text"
            placeholder="Filter requests..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1 bg-dark-950/80 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-cyan/50"
          />
        </div>
      </div>

      {/* Collection Tree */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {renderItems(collection.item)}
      </div>

      {/* Bottom Action Bar */}
      <div className="p-2 border-t border-slate-800/80 bg-dark-950/50 flex items-center justify-between text-xs space-x-2">
        <button 
          onClick={() => onAddRequest(null)}
          className="flex-1 flex items-center justify-center space-x-1.5 py-1.5 px-2 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-slate-600 rounded-lg text-slate-300 transition-all font-medium"
        >
          <Plus className="w-3.5 h-3.5 text-brand-cyan" />
          <span>New Request</span>
        </button>
        <button 
          onClick={() => onAddFolder(null)}
          className="flex items-center justify-center space-x-1 py-1.5 px-2.5 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 rounded-lg text-slate-400 hover:text-slate-200"
          title="New Folder"
        >
          <Folder className="w-3.5 h-3.5 text-amber-400" />
          <span>+ Folder</span>
        </button>
      </div>

      {/* Floating 3-Dot Context Menu Dropdown */}
      {menuState && (
        <div 
          ref={menuRef}
          style={{ 
            top: `${Math.min(menuState.y, window.innerHeight - 280)}px`, 
            left: `${Math.min(menuState.x, window.innerWidth - 200)}px` 
          }}
          className="fixed w-48 bg-dark-900 border border-slate-800 rounded-xl shadow-2xl z-50 p-1.5 space-y-0.5 text-xs font-sans animate-in fade-in zoom-in-95 duration-100"
        >
          {/* Collection Level Options */}
          {menuState.type === 'collection' && (
            <>
              <button 
                onClick={() => { onAddRequest(null); setMenuState(null); }}
                className="w-full text-left px-2.5 py-1.5 hover:bg-slate-800 text-slate-200 rounded flex items-center space-x-2"
              >
                <Plus className="w-3.5 h-3.5 text-brand-cyan" />
                <span>Add Request</span>
              </button>
              <button 
                onClick={() => { onAddFolder(null); setMenuState(null); }}
                className="w-full text-left px-2.5 py-1.5 hover:bg-slate-800 text-slate-200 rounded flex items-center space-x-2"
              >
                <Folder className="w-3.5 h-3.5 text-amber-400" />
                <span>Add Folder</span>
              </button>
              <button 
                onClick={() => { onRunFolder(null); setMenuState(null); }}
                className="w-full text-left px-2.5 py-1.5 hover:bg-slate-800 text-emerald-400 rounded flex items-center space-x-2"
              >
                <Play className="w-3.5 h-3.5 fill-emerald-400" />
                <span>Run Collection</span>
              </button>

              <div className="h-[1px] bg-slate-800 my-1" />

              {clipboard && (
                <button 
                  onClick={() => { onPasteItem(null, clipboard); setMenuState(null); }}
                  className="w-full text-left px-2.5 py-1.5 hover:bg-slate-800 text-slate-200 rounded flex items-center space-x-2"
                >
                  <Clipboard className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Paste ({clipboard.type})</span>
                </button>
              )}

              <button 
                onClick={handleExport}
                className="w-full text-left px-2.5 py-1.5 hover:bg-slate-800 text-slate-200 rounded flex items-center space-x-2"
              >
                <Download className="w-3.5 h-3.5 text-brand-cyan" />
                <span>Export Collection</span>
              </button>
            </>
          )}

          {/* Folder Level Options */}
          {menuState.type === 'folder' && (
            <>
              <button 
                onClick={() => { onAddRequest(menuState.item.id); setMenuState(null); }}
                className="w-full text-left px-2.5 py-1.5 hover:bg-slate-800 text-slate-200 rounded flex items-center space-x-2"
              >
                <Plus className="w-3.5 h-3.5 text-brand-cyan" />
                <span>Add Request</span>
              </button>
              <button 
                onClick={() => { onAddFolder(menuState.item.id); setMenuState(null); }}
                className="w-full text-left px-2.5 py-1.5 hover:bg-slate-800 text-slate-200 rounded flex items-center space-x-2"
              >
                <Folder className="w-3.5 h-3.5 text-amber-400" />
                <span>Add Subfolder</span>
              </button>
              <button 
                onClick={() => { onRunFolder(menuState.item.id); setMenuState(null); }}
                className="w-full text-left px-2.5 py-1.5 hover:bg-slate-800 text-emerald-400 rounded flex items-center space-x-2"
              >
                <Play className="w-3.5 h-3.5 fill-emerald-400" />
                <span>Run Folder</span>
              </button>

              <div className="h-[1px] bg-slate-800 my-1" />

              <button 
                onClick={() => startRename(menuState.item)}
                className="w-full text-left px-2.5 py-1.5 hover:bg-slate-800 text-slate-200 rounded flex items-center space-x-2"
              >
                <Edit2 className="w-3.5 h-3.5 text-slate-400" />
                <span>Rename</span>
              </button>
              <button 
                onClick={() => { onDuplicateItem(menuState.item.id); setMenuState(null); }}
                className="w-full text-left px-2.5 py-1.5 hover:bg-slate-800 text-slate-200 rounded flex items-center space-x-2"
              >
                <Copy className="w-3.5 h-3.5 text-purple-400" />
                <span>Duplicate</span>
              </button>
              <button 
                onClick={() => { setClipboard({ type: 'folder', item: menuState.item }); setMenuState(null); }}
                className="w-full text-left px-2.5 py-1.5 hover:bg-slate-800 text-slate-200 rounded flex items-center space-x-2"
              >
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span>Copy</span>
              </button>

              {clipboard && (
                <button 
                  onClick={() => { onPasteItem(menuState.item.id, clipboard); setMenuState(null); }}
                  className="w-full text-left px-2.5 py-1.5 hover:bg-slate-800 text-slate-200 rounded flex items-center space-x-2"
                >
                  <Clipboard className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Paste Inside</span>
                </button>
              )}

              <div className="h-[1px] bg-slate-800 my-1" />

              <button 
                onClick={() => { onDeleteItem(menuState.item.id); setMenuState(null); }}
                className="w-full text-left px-2.5 py-1.5 hover:bg-rose-500/20 text-rose-400 rounded flex items-center space-x-2"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Folder</span>
              </button>
            </>
          )}

          {/* Request Level Options */}
          {menuState.type === 'request' && (
            <>
              <button 
                onClick={() => startRename(menuState.item)}
                className="w-full text-left px-2.5 py-1.5 hover:bg-slate-800 text-slate-200 rounded flex items-center space-x-2"
              >
                <Edit2 className="w-3.5 h-3.5 text-slate-400" />
                <span>Rename</span>
              </button>
              <button 
                onClick={() => { onDuplicateItem(menuState.item.id); setMenuState(null); }}
                className="w-full text-left px-2.5 py-1.5 hover:bg-slate-800 text-slate-200 rounded flex items-center space-x-2"
              >
                <Copy className="w-3.5 h-3.5 text-purple-400" />
                <span>Duplicate</span>
              </button>
              <button 
                onClick={() => { setClipboard({ type: 'request', item: menuState.item }); setMenuState(null); }}
                className="w-full text-left px-2.5 py-1.5 hover:bg-slate-800 text-slate-200 rounded flex items-center space-x-2"
              >
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span>Copy Request</span>
              </button>
              <button 
                onClick={() => handleCopyCurl(menuState.item)}
                className="w-full text-left px-2.5 py-1.5 hover:bg-slate-800 text-brand-cyan rounded flex items-center space-x-2"
              >
                <FileCode className="w-3.5 h-3.5" />
                <span>Copy as cURL</span>
              </button>
              <button 
                onClick={() => { onAskAi(menuState.item); setMenuState(null); }}
                className="w-full text-left px-2.5 py-1.5 hover:bg-slate-800 text-purple-300 rounded flex items-center space-x-2"
              >
                <Bot className="w-3.5 h-3.5 text-purple-400" />
                <span>Ask ApexBot AI</span>
              </button>

              <div className="h-[1px] bg-slate-800 my-1" />

              <button 
                onClick={() => { onDeleteItem(menuState.item.id); setMenuState(null); }}
                className="w-full text-left px-2.5 py-1.5 hover:bg-rose-500/20 text-rose-400 rounded flex items-center space-x-2"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Request</span>
              </button>
            </>
          )}
        </div>
      )}
    </aside>
  );
}
