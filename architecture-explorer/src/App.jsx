import React, { useState } from 'react';
import ArchitectureCanvas from './components/ArchitectureCanvas';
import InteractiveFlowSimulator from './components/InteractiveFlowSimulator';
import GraphTopologyExplorer from './components/GraphTopologyExplorer';
import FPOInteractiveLab from './components/FPOInteractiveLab';
import SchemaAndContractsViewer from './components/SchemaAndContractsViewer';
import { IconShield, IconLayers, IconPlay, IconNetwork, IconSliders, IconDatabase } from './components/Icons';
import './App.css';

export default function App() {
  const [activeTab, setActiveTab] = useState('canvas');
  const [activeStageId, setActiveStageId] = useState(null);

  return (
    <div className="app-container">
      {/* Top Header */}
      <header className="app-header">
        <div className="header-left">
          <div className="brand-logo">
            <IconShield className="w-6 h-6 text-cyan-400" />
            <span className="brand-name">PayShield AI</span>
            <span className="brand-tag">Architecture & Design Explorer</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="header-nav">
          <button
            className={`nav-item ${activeTab === 'canvas' ? 'active' : ''}`}
            onClick={() => setActiveTab('canvas')}
          >
            <IconLayers className="w-4 h-4" />
            <span>Pipeline Architecture</span>
          </button>

          <button
            className={`nav-item ${activeTab === 'simulator' ? 'active' : ''}`}
            onClick={() => setActiveTab('simulator')}
          >
            <IconPlay className="w-4 h-4" />
            <span>Execution Simulator</span>
          </button>

          <button
            className={`nav-item ${activeTab === 'graph' ? 'active' : ''}`}
            onClick={() => setActiveTab('graph')}
          >
            <IconNetwork className="w-4 h-4" />
            <span>Graph Topology</span>
          </button>

          <button
            className={`nav-item ${activeTab === 'fpo' ? 'active' : ''}`}
            onClick={() => setActiveTab('fpo')}
          >
            <IconSliders className="w-4 h-4" />
            <span>FPO Calibration Lab</span>
          </button>

          <button
            className={`nav-item ${activeTab === 'schemas' ? 'active' : ''}`}
            onClick={() => setActiveTab('schemas')}
          >
            <IconDatabase className="w-4 h-4" />
            <span>Schemas & Contracts</span>
          </button>
        </nav>

        {/* Header Right Status */}
        <div className="header-right">
          <div className="status-badge">
            <span className="pulse-indicator"></span>
            <span>Phase 2 Architecture Ready</span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="app-main">
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

      {/* Footer */}
      <footer className="app-footer">
        <span>PayShield AI • Autonomous Risk Engineering & Fraud Prevention Platform</span>
        <span>Target Decision Latency: &lt; 30ms (P95) • Precision: 99.2% • FPR: 0.4%</span>
      </footer>
    </div>
  );
}
