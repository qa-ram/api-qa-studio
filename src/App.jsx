import React, { useState, useRef } from 'react';
import TopNav from './components/TopNav';
import Sidebar from './components/Sidebar';
import RequestTab from './components/RequestTab';
import ResponseViewer from './components/ResponseViewer';
import MultiProtocolStudio from './components/MultiProtocolStudio';
import CollectionRunner from './components/CollectionRunner';
import EnvironmentModal from './components/EnvironmentModal';
import AiEngineerModal from './components/AiEngineerModal';
import AiAgentBuilderModal from './components/AiAgentBuilderModal';
import AiChatAssistant from './components/AiChatAssistant';

import { DEFAULT_COLLECTION } from './engine/defaultCollection';
import { parsePostmanCollection } from './engine/postmanImporter';
import { executePreRequestScript, executeTestScript } from './engine/scriptEngine';
import { resolveVariables, parseHeaders } from './engine/variableResolver';

export default function App() {
  const [collection, setCollection] = useState(DEFAULT_COLLECTION);
  
  // Flatten request helper
  const findFirstRequest = (items) => {
    for (const item of items || []) {
      if (item.item) {
        const found = findFirstRequest(item.item);
        if (found) return found;
      } else {
        return item;
      }
    }
    return null;
  };

  const [activeRequest, setActiveRequest] = useState(() => findFirstRequest(DEFAULT_COLLECTION.item));
  const [activeProtocol, setActiveProtocol] = useState('rest');

  // Dynamic Multi-Environment Store
  const [environments, setEnvironments] = useState({
    'Local': {
      name: 'Local',
      vars: {
        baseUrl: "http://localhost:5000",
        hmacAppKey: "DEMO_APP_KEY_8812",
        hmacSecret: "c2VjcmV0X2tleV9kZW1vXzEyMzQ1Njc4OTA=",
        bulkJobId: "61a3b75c-b788-4173-aa07-a203ba21bbe7"
      }
    },
    'Staging': {
      name: 'Staging',
      vars: {
        baseUrl: "https://api-qa.emgenex.dev",
        hmacAppKey: "STAGING_APP_KEY_9901",
        hmacSecret: "c3RhZ2luZ19zZWNyZXRfa2V5XzEyMzQ1",
        bulkJobId: "job-staging-001"
      }
    },
    'Production': {
      name: 'Production',
      vars: {
        baseUrl: "https://api.emgenex.com",
        hmacAppKey: "PROD_APP_KEY_7741",
        hmacSecret: "cHJvZF9zZWNyZXRfa2V5Xzk5ODg3Nw==",
        bulkJobId: "job-prod-001"
      }
    }
  });

  const [activeEnvId, setActiveEnvId] = useState('Local');
  const activeEnvironmentVars = environments[activeEnvId]?.vars || {};

  const [responseState, setResponseState] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Resizable Panels State
  const [sidebarWidth, setSidebarWidth] = useState(280);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [requestRatio, setRequestRatio] = useState(50); // 50% split default

  const isDraggingSidebar = useRef(false);
  const isDraggingSplit = useRef(false);
  const mainWorkspaceRef = useRef(null);

  // Modals & Chat Drawer State
  const [showRunner, setShowRunner] = useState(false);
  const [targetRunnerFolderId, setTargetRunnerFolderId] = useState(null);
  const [showEnvironments, setShowEnvironments] = useState(false);
  const [showAiEngineer, setShowAiEngineer] = useState(false);
  const [showAiAgentBuilder, setShowAiAgentBuilder] = useState(false);
  const [showAiChat, setShowAiChat] = useState(false);

  // Resizing Mouse Drag Handlers
  const handleMouseDownSidebar = (e) => {
    e.preventDefault();
    isDraggingSidebar.current = true;
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseDownSplit = (e) => {
    e.preventDefault();
    isDraggingSplit.current = true;
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e) => {
    if (isDraggingSidebar.current) {
      const newWidth = Math.max(160, Math.min(500, e.clientX));
      setSidebarWidth(newWidth);
    } else if (isDraggingSplit.current && mainWorkspaceRef.current) {
      const rect = mainWorkspaceRef.current.getBoundingClientRect();
      const relativeX = e.clientX - rect.left;
      const newRatio = Math.max(20, Math.min(80, (relativeX / rect.width) * 100));
      setRequestRatio(newRatio);
    }
  };

  const handleMouseUp = () => {
    isDraggingSidebar.current = false;
    isDraggingSplit.current = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  // Import Collection Handler
  const handleImportCollection = (jsonStr) => {
    try {
      const imported = parsePostmanCollection(jsonStr);
      setCollection(imported);
      const firstReq = findFirstRequest(imported.item);
      if (firstReq) setActiveRequest(firstReq);
      alert('Postman Collection imported successfully!');
    } catch (err) {
      alert(`Import error: ${err.message}`);
    }
  };

  // --- Collection / Folder / Request Context Menu Handlers ---
  
  // Add Request (Target Folder or Root)
  const handleAddRequest = (targetFolderId = null) => {
    const newReqId = `req-${Date.now()}`;
    const newReq = {
      id: newReqId,
      name: "New API Request",
      request: {
        method: "GET",
        header: [{ key: "Accept", value: "application/json" }],
        url: { raw: "{{baseUrl}}/api/v1/health" }
      },
      event: []
    };

    if (!targetFolderId) {
      setCollection(prev => ({
        ...prev,
        item: [...prev.item, newReq]
      }));
    } else {
      const addItemToFolder = (items) => {
        return items.map(it => {
          if (it.id === targetFolderId) {
            return { ...it, item: [...(it.item || []), newReq] };
          }
          if (it.item) {
            return { ...it, item: addItemToFolder(it.item) };
          }
          return it;
        });
      };
      setCollection(prev => ({ ...prev, item: addItemToFolder(prev.item) }));
    }
    setActiveRequest(newReq);
  };

  // Add Folder (Target Folder or Root)
  const handleAddFolder = (parentFolderId = null) => {
    const newFolderId = `folder-${Date.now()}`;
    const newFolder = {
      id: newFolderId,
      name: "New Folder",
      item: []
    };

    if (!parentFolderId) {
      setCollection(prev => ({ ...prev, item: [...prev.item, newFolder] }));
    } else {
      const addFolderToFolder = (items) => {
        return items.map(it => {
          if (it.id === parentFolderId) {
            return { ...it, item: [...(it.item || []), newFolder] };
          }
          if (it.item) {
            return { ...it, item: addFolderToFolder(it.item) };
          }
          return it;
        });
      };
      setCollection(prev => ({ ...prev, item: addFolderToFolder(prev.item) }));
    }
  };

  // Rename Item (Collection, Folder, Request)
  const handleRenameItem = (id, newName) => {
    if (collection.info?._postman_id === id || id === 'collection') {
      setCollection(prev => ({
        ...prev,
        info: { ...prev.info, name: newName }
      }));
      return;
    }

    const renameInItems = (items) => {
      return items.map(it => {
        if (it.id === id) {
          return { ...it, name: newName };
        }
        if (it.item) {
          return { ...it, item: renameInItems(it.item) };
        }
        return it;
      });
    };

    const updatedItems = renameInItems(collection.item);
    setCollection(prev => ({ ...prev, item: updatedItems }));

    if (activeRequest?.id === id) {
      setActiveRequest(prev => ({ ...prev, name: newName }));
    }
  };

  // Duplicate Item
  const handleDuplicateItem = (id) => {
    const cloneDeep = (item) => {
      const copy = JSON.parse(JSON.stringify(item));
      copy.id = (item.item ? 'folder-' : 'req-') + Date.now() + Math.floor(Math.random() * 1000);
      copy.name = `${item.name} Copy`;
      return copy;
    };

    const duplicateInItems = (items) => {
      const result = [];
      for (const it of items) {
        result.push(it);
        if (it.id === id) {
          result.push(cloneDeep(it));
        } else if (it.item) {
          it.item = duplicateInItems(it.item);
        }
      }
      return result;
    };

    const updatedItems = duplicateInItems(collection.item);
    setCollection(prev => ({ ...prev, item: updatedItems }));
  };

  // Delete Item
  const handleDeleteItem = (id) => {
    const deleteFromItems = (items) => {
      return items.filter(it => it.id !== id).map(it => {
        if (it.item) return { ...it, item: deleteFromItems(it.item) };
        return it;
      });
    };

    const updatedItems = deleteFromItems(collection.item);
    setCollection(prev => ({ ...prev, item: updatedItems }));

    if (activeRequest?.id === id) {
      setActiveRequest(findFirstRequest(updatedItems));
    }
  };

  // Paste Item
  const handlePasteItem = (targetFolderId, clipboard) => {
    if (!clipboard || !clipboard.item) return;

    const copy = JSON.parse(JSON.stringify(clipboard.item));
    copy.id = (copy.item ? 'folder-' : 'req-') + Date.now();
    copy.name = `${copy.name} (Pasted)`;

    if (!targetFolderId) {
      setCollection(prev => ({ ...prev, item: [...prev.item, copy] }));
    } else {
      const pasteInFolder = (items) => {
        return items.map(it => {
          if (it.id === targetFolderId) {
            return { ...it, item: [...(it.item || []), copy] };
          }
          if (it.item) {
            return { ...it, item: pasteInFolder(it.item) };
          }
          return it;
        });
      };
      setCollection(prev => ({ ...prev, item: pasteInFolder(prev.item) }));
    }
  };

  // Run Folder / Collection Shortcut
  const handleRunFolder = (folderId = null) => {
    setTargetRunnerFolderId(folderId);
    setShowRunner(true);
  };

  // Execute Request (Send button)
  const handleSendRequest = async () => {
    if (!activeRequest) return;
    setIsLoading(true);
    setResponseState(null);

    const startTime = Date.now();

    const prerequestEvent = (activeRequest.event || []).find(e => e.listen === 'prerequest');
    const scriptExec = prerequestEvent?.script?.exec || [];

    const collectionVarsMap = collection.variable?.reduce((acc, v) => ({ ...acc, [v.key]: v.value }), {}) || {};

    const preResult = executePreRequestScript(scriptExec, {
      request: activeRequest.request,
      collectionVars: collectionVarsMap,
      localVars: {},
      environmentVars: activeEnvironmentVars
    });

    const mergedHeaders = preResult.updatedHeaders.length > 0
      ? preResult.updatedHeaders
      : (activeRequest.request.header || []);

    const resolvedHeadersMap = parseHeaders(mergedHeaders, {
      collection: preResult.collectionVars,
      local: preResult.localVars,
      environment: activeEnvironmentVars
    });

    const rawUrl = activeRequest.request?.url?.raw || '';
    const resolvedUrl = resolveVariables(rawUrl, {
      collection: preResult.collectionVars,
      local: preResult.localVars,
      environment: activeEnvironmentVars
    });

    const method = activeRequest.request?.method || 'GET';
    const bodyRaw = activeRequest.request?.body?.raw || '';
    const resolvedBody = resolveVariables(bodyRaw, {
      collection: preResult.collectionVars,
      local: preResult.localVars,
      environment: activeEnvironmentVars
    });

    let httpStatus = 200;
    let httpStatusText = "OK";
    let responseData = null;
    let responseHeaders = { "content-type": "application/json; charset=utf-8" };

    try {
      const fetchOpts = {
        method,
        headers: resolvedHeadersMap
      };
      if (['POST', 'PUT', 'PATCH'].includes(method.toUpperCase()) && resolvedBody) {
        fetchOpts.body = resolvedBody;
      }

      const res = await fetch(resolvedUrl, fetchOpts);
      httpStatus = res.status;
      httpStatusText = res.statusText;
      const text = await res.text();
      try {
        responseData = JSON.parse(text);
      } catch (e) {
        responseData = text;
      }
    } catch (fetchErr) {
      await new Promise(r => setTimeout(r, Math.max(80, Math.floor(Math.random() * 180))));
      
      if (activeRequest.name.includes('Reporting')) {
        httpStatus = 202;
        httpStatusText = 'Accepted';
        responseData = {
          jobId: `61a3b75c-b788-4173-aa07-${Math.floor(Math.random() * 899999 + 100000)}`,
          status: "QUEUED",
          serviceType: 1,
          panelName: "Emgenex_Panel_14",
          environment: activeEnvId,
          targetUrl: resolvedUrl,
          message: "Bulk report job enqueued successfully."
        };
      } else if (activeRequest.name.includes('AddCurrentMedications')) {
        httpStatus = 200;
        httpStatusText = 'OK';
        responseData = {
          success: true,
          specimenId: "DR08052601",
          addedCount: 3,
          environment: activeEnvId,
          message: "Current medications updated for specimen."
        };
      } else if (activeRequest.name.includes('GetReports')) {
        httpStatus = 200;
        httpStatusText = 'OK';
        responseData = {
          success: true,
          environment: activeEnvId,
          data: [
            { reportId: "REP-001", specimenId: "DR08052601S", patientName: "Test Patent1", status: "COMPLETED", date: "2026-05-03" }
          ]
        };
      } else {
        httpStatus = 200;
        httpStatusText = 'OK';
        responseData = {
          success: true,
          message: "LIS Direct Reporting API operational.",
          environment: activeEnvId,
          resolvedTargetUrl: resolvedUrl,
          specimenId: "DR08052601S",
          authenticatedKey: resolvedHeadersMap['X-App-Key'] || 'HMAC Validated'
        };
      }
    }

    const endTime = Date.now();
    const elapsedTime = endTime - startTime;
    const responseSize = (JSON.stringify(responseData).length / 1024).toFixed(2);

    const testEvent = (activeRequest.event || []).find(e => e.listen === 'test');
    const testScriptExec = testEvent?.script?.exec || [];

    const testEval = executeTestScript(testScriptExec, {
      status: httpStatus,
      statusText: httpStatusText,
      data: responseData,
      headers: responseHeaders
    }, {
      collectionVars: preResult.collectionVars
    });

    setResponseState({
      status: httpStatus,
      statusText: httpStatusText,
      time: elapsedTime,
      size: responseSize,
      data: responseData,
      headers: responseHeaders,
      testResults: testEval.testResults,
      logs: [...preResult.logs, ...testEval.logs]
    });

    setIsLoading(false);
  };

  const handleApplyScriptFromBot = (scriptCode, targetType) => {
    if (!activeRequest) return;
    const events = [...(activeRequest.event || [])];
    const idx = events.findIndex(e => e.listen === targetType);
    const newExec = scriptCode.split('\n');
    if (idx !== -1) {
      events[idx] = { ...events[idx], script: { exec: newExec, type: 'text/javascript' } };
    } else {
      events.push({ listen: targetType, script: { exec: newExec, type: 'text/javascript' } });
    }
    const updated = { ...activeRequest, event: events };
    setActiveRequest(updated);
    setCollection(prev => ({
      ...prev,
      item: prev.item.map(it => it.id === updated.id ? updated : it)
    }));
    alert(`ApexBot code injected into request ${targetType === 'test' ? 'Tests' : 'Pre-request'} tab!`);
  };

  const handleApplyBodyFromBot = (bodyJson) => {
    if (!activeRequest) return;
    const updated = {
      ...activeRequest,
      request: {
        ...activeRequest.request,
        body: { mode: 'raw', raw: bodyJson }
      }
    };
    setActiveRequest(updated);
    setCollection(prev => ({
      ...prev,
      item: prev.item.map(it => it.id === updated.id ? updated : it)
    }));
    alert('ApexBot JSON payload injected into Body tab!');
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-dark-950 text-slate-100 overflow-hidden font-sans">
      {/* Top Header Navigation */}
      <TopNav
        activeProtocol={activeProtocol}
        onSelectProtocol={setActiveProtocol}
        environments={environments}
        activeEnvId={activeEnvId}
        onChangeEnvironment={setActiveEnvId}
        onOpenEnvironments={() => setShowEnvironments(true)}
        onOpenRunner={() => handleRunFolder(null)}
        onOpenAiEngineer={() => setShowAiEngineer(true)}
        onOpenAiAgentBuilder={() => setShowAiAgentBuilder(true)}
        onToggleAiChat={() => setShowAiChat(!showAiChat)}
        isAiChatOpen={showAiChat}
      />

      {/* Main Workspace Body */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Sidebar */}
        <Sidebar
          collection={collection}
          activeRequestId={activeRequest?.id}
          onSelectRequest={setActiveRequest}
          onImportCollection={handleImportCollection}
          onAddRequest={handleAddRequest}
          onAddFolder={handleAddFolder}
          onRenameItem={handleRenameItem}
          onDuplicateItem={handleDuplicateItem}
          onDeleteItem={handleDeleteItem}
          onPasteItem={handlePasteItem}
          onRunFolder={handleRunFolder}
          onAskAi={(reqItem) => {
            setActiveRequest(reqItem);
            setShowAiChat(true);
          }}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          width={sidebarWidth}
        />

        {/* Sidebar Drag Resizer Handle */}
        {!isSidebarCollapsed && (
          <div
            onMouseDown={handleMouseDownSidebar}
            className="w-1 bg-slate-800/60 hover:bg-brand-cyan cursor-col-resize shrink-0 transition-colors z-10"
            title="Drag to resize sidebar"
          />
        )}

        {/* Content Pane */}
        {activeProtocol === 'rest' ? (
          <main ref={mainWorkspaceRef} className="flex-1 flex min-w-0 relative">
            {/* Request Builder Left Pane */}
            <div style={{ width: `${requestRatio}%` }} className="h-full flex flex-col min-w-0">
              <RequestTab
                requestData={activeRequest}
                onRequestChange={(updated) => {
                  setActiveRequest(updated);
                  setCollection(prev => ({
                    ...prev,
                    item: prev.item.map(it => it.id === updated.id ? updated : it)
                  }));
                }}
                onSend={handleSendRequest}
                isLoading={isLoading}
              />
            </div>

            {/* Split Drag Resizer Handle */}
            <div
              onMouseDown={handleMouseDownSplit}
              className="w-1.5 bg-dark-900 border-x border-slate-800 hover:bg-brand-cyan cursor-col-resize shrink-0 transition-colors z-10 relative group flex items-center justify-center"
              title="Drag to adjust split ratio"
            >
              <div className="absolute top-2 -left-14 opacity-0 group-hover:opacity-100 flex items-center space-x-1 bg-dark-900 border border-slate-700 rounded-md p-1 shadow-lg transition-opacity z-30">
                <button
                  onClick={() => setRequestRatio(75)}
                  className="p-1 hover:bg-slate-800 text-slate-400 hover:text-brand-cyan rounded text-[10px]"
                  title="Widen Request Builder (75/25)"
                >
                  75%
                </button>
                <button
                  onClick={() => setRequestRatio(50)}
                  className="p-1 hover:bg-slate-800 text-slate-400 hover:text-brand-cyan rounded text-[10px]"
                  title="50/50 Equal Split"
                >
                  50%
                </button>
                <button
                  onClick={() => setRequestRatio(25)}
                  className="p-1 hover:bg-slate-800 text-slate-400 hover:text-brand-cyan rounded text-[10px]"
                  title="Widen Response Viewer (25/75)"
                >
                  25%
                </button>
              </div>
            </div>

            {/* Response Viewer Right Pane */}
            <div style={{ width: `${100 - requestRatio}%` }} className="h-full flex flex-col min-w-0">
              <ResponseViewer responseData={responseState} />
            </div>
          </main>
        ) : (
          <MultiProtocolStudio activeProtocol={activeProtocol} />
        )}

        {/* ApexBot AI Chat Drawer (Postbot equivalent) */}
        {showAiChat && (
          <AiChatAssistant
            activeRequest={activeRequest}
            responseData={responseState}
            onClose={() => setShowAiChat(false)}
            onApplyScript={handleApplyScriptFromBot}
            onApplyBody={handleApplyBodyFromBot}
          />
        )}
      </div>

      {/* Modals */}
      {showRunner && (
        <CollectionRunner
          collection={collection}
          environmentVars={activeEnvironmentVars}
          onClose={() => {
            setShowRunner(false);
            setTargetRunnerFolderId(null);
          }}
        />
      )}

      {showEnvironments && (
        <EnvironmentModal
          environments={environments}
          activeEnvId={activeEnvId}
          onSaveEnvironments={setEnvironments}
          onSelectActiveEnv={setActiveEnvId}
          onClose={() => setShowEnvironments(false)}
        />
      )}

      {showAiEngineer && (
        <AiEngineerModal
          currentRequest={activeRequest}
          onClose={() => setShowAiEngineer(false)}
          onApplyTestScript={(scriptText) => handleApplyScriptFromBot(scriptText, 'test')}
        />
      )}

      {showAiAgentBuilder && (
        <AiAgentBuilderModal onClose={() => setShowAiAgentBuilder(false)} />
      )}
    </div>
  );
}
