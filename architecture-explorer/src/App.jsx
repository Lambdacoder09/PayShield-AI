import React, { useState } from 'react';
import ArchitectureCanvas from './components/ArchitectureCanvas';
import InteractiveFlowSimulator from './components/InteractiveFlowSimulator';
import GraphTopologyExplorer from './components/GraphTopologyExplorer';
import FPOInteractiveLab from './components/FPOInteractiveLab';
import SchemaAndContractsViewer from './components/SchemaAndContractsViewer';
import MultiStageTestingPage from './components/MultiStageTestingPage';
import { IconShield, IconLayers, IconPlay, IconNetwork, IconSliders, IconDatabase, Activity } from './components/Icons';
import './App.css';

export default function App() {
  const [activeTab, setActiveTab] = useState('testing'); // Default directly to the new judge testing lab
  const [activeStageId, setActiveStageId] = useState(null);

  return (
    <div className="app-container light-theme">
      {/* Clean White Top Header */}
      <header className="app-header">
        <div className="header-left">
          <div className="brand-logo">
            <div className="logo-icon-bg">
              <IconShield className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="brand-name">PayShield AI</span>
                <span className="version-pill">v1.0 Production API</span>
              </div>
              <div className="brand-subtitle">Real-Time Risk Decision & FPO Engine</div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="header-nav">
          <button
            className={`nav-item highlight-tab ${activeTab === 'testing' ? 'active' : ''}`}
            onClick={() => setActiveTab('testing')}
          >
            <Activity className="w-4 h-4" />
            <span>Judge Test Lab</span>
          </button>

          <button
            className={`nav-item ${activeTab === 'canvas' ? 'active' : ''}`}
            onClick={() => setActiveTab('canvas')}
          >
            <IconLayers className="w-4 h-4" />
            <span>Architecture</span>
          </button>

          <button
            className={`nav-item ${activeTab === 'simulator' ? 'active' : ''}`}
            onClick={() => setActiveTab('simulator')}
          >
            <IconPlay className="w-4 h-4" />
            <span>Flow Simulator</span>
          </button>

          <button
            className={`nav-item ${activeTab === 'graph' ? 'active' : ''}`}
            onClick={() => setActiveTab('graph')}
          >
            <IconNetwork className="w-4 h-4" />
            <span>Graph Ring View</span>
          </button>

          <button
            className={`nav-item ${activeTab === 'fpo' ? 'active' : ''}`}
            onClick={() => setActiveTab('fpo')}
          >
            <IconSliders className="w-4 h-4" />
            <span>FPO Calibration</span>
          </button>

          <button
            className={`nav-item ${activeTab === 'schemas' ? 'active' : ''}`}
            onClick={() => setActiveTab('schemas')}
          >
            <IconDatabase className="w-4 h-4" />
            <span>OpenAPI Schema</span>
          </button>
        </nav>

        {/* Header Right Status */}
        <div className="header-right">
          <div className="live-status-pill">
            <span className="status-dot"></span>
            <span>API Online &bull; P95 &lt; 18ms</span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="app-main">
        {activeTab === 'testing' && <MultiStageTestingPage />}

        {activeTab === 'canvas' && (
          <ArchitectureCanvas
            activeStageId={activeStageId}
            onSelectStage={(id) => setActiveStageId(id)}
          />
        )}

        {activeTab === 'simulator' && (
          <InteractiveFlowSimulator
            onActiveStageChange={(id) => setActiveStageId(id)}
          />
        )}

        {activeTab === 'graph' && <GraphTopologyExplorer />}

        {activeTab === 'fpo' && <FPOInteractiveLab />}

        {activeTab === 'schemas' && <SchemaAndContractsViewer />}
      </main>

      {/* Clean Footer */}
      <footer className="app-footer">
        <div>PayShield AI &bull; Built for PayPal Risk Engineering Hackathon Submission</div>
        <div className="flex items-center gap-4">
          <span>Latency SLA: P95 &lt; 30ms</span>
          <span>&bull;</span>
          <span>100% Commercial MIT License</span>
        </div>
      </footer>
    </div>
  );
}
