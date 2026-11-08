import React, { useState } from 'react';
import { GRAPH_PRESETS } from '../data/architectureData';
import { IconNetwork, IconShield, IconBlock, IconCheck } from './Icons';

export default function GraphTopologyExplorer() {
  const [activePresetKey, setActivePresetKey] = useState('syndicate');
  const [selectedNode, setSelectedNode] = useState(null);

  const preset = GRAPH_PRESETS[activePresetKey];

  return (
    <div className="graph-explorer-wrapper">
      <div className="explorer-header">
        <div>
          <h2 className="section-title">Heterogeneous Graph Topology Explorer</h2>
          <p className="section-subtitle">Discover how graph community detection exposes coordinated fraud rings while protecting multi-user households.</p>
        </div>
        <div className="preset-toggle-group">
          <button
            className={`preset-btn ${activePresetKey === 'syndicate' ? 'active alert' : ''}`}
            onClick={() => { setActivePresetKey('syndicate'); setSelectedNode(null); }}
          >
            <IconBlock className="w-4 h-4" /> Coordinated Fraud Ring
          </button>
          <button
            className={`preset-btn ${activePresetKey === 'household' ? 'active success' : ''}`}
            onClick={() => { setActivePresetKey('household'); setSelectedNode(null); }}
          >
            <IconCheck className="w-4 h-4" /> Family Household (FPO)
          </button>
        </div>
      </div>

      <div className="preset-description-bar">
        <div>
          <strong className="text-white text-sm">{preset.title}</strong>
          <p className="text-xs text-muted mt-1">{preset.description}</p>
        </div>
        <span className={`status-pill ${activePresetKey === 'syndicate' ? 'block' : 'allow'}`}>
          {activePresetKey === 'syndicate' ? 'DETECTED FRAUD RING' : 'BENIGN HOUSEHOLD'}
        </span>
      </div>

      <div className="graph-split-view">
        {/* SVG Interactive Graph Canvas */}
        <div className="svg-canvas-container">
          <svg className="graph-svg" viewBox="0 0 700 400">
            <defs>
              <marker id="arrow" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#475569" />
              </marker>
              <filter id="glow-red" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Render Graph Edges */}
            {activePresetKey === 'syndicate' ? (
              <g className="edges">
                {/* 4 accounts to 1 center device */}
                <line x1="120" y1="80" x2="350" y2="150" stroke="#ef4444" strokeWidth="2" strokeDasharray="4" markerEnd="url(#arrow)" />
                <line x1="120" y1="160" x2="350" y2="150" stroke="#ef4444" strokeWidth="2" strokeDasharray="4" markerEnd="url(#arrow)" />
                <line x1="120" y1="240" x2="350" y2="150" stroke="#ef4444" strokeWidth="2" strokeDasharray="4" markerEnd="url(#arrow)" />
                <line x1="120" y1="320" x2="350" y2="150" stroke="#ef4444" strokeWidth="2" strokeDasharray="4" markerEnd="url(#arrow)" />

                {/* 4 accounts to 1 shared card */}
                <line x1="120" y1="80" x2="350" y2="280" stroke="#f59e0b" strokeWidth="2" />
                <line x1="120" y1="160" x2="350" y2="280" stroke="#f59e0b" strokeWidth="2" />
                <line x1="120" y1="240" x2="350" y2="280" stroke="#f59e0b" strokeWidth="2" />
                <line x1="120" y1="320" x2="350" y2="280" stroke="#f59e0b" strokeWidth="2" />

                {/* Shared device to mule */}
                <line x1="350" y1="150" x2="580" y2="210" stroke="#dc2626" strokeWidth="2.5" />
              </g>
            ) : (
              <g className="edges">
                {/* Parent edges */}
                <line x1="160" y1="120" x2="350" y2="80" stroke="#3b82f6" strokeWidth="2" />
                <line x1="160" y1="120" x2="350" y2="200" stroke="#a855f7" strokeWidth="2" />
                <line x1="160" y1="120" x2="350" y2="320" stroke="#10b981" strokeWidth="2" />

                {/* Child edges */}
                <line x1="540" y1="120" x2="350" y2="80" stroke="#3b82f6" strokeWidth="2" strokeDasharray="3" />
                <line x1="540" y1="120" x2="350" y2="200" stroke="#a855f7" strokeWidth="2" />
                <line x1="540" y1="120" x2="540" y2="320" stroke="#10b981" strokeWidth="2" />
              </g>
            )}

            {/* Render Nodes */}
            {activePresetKey === 'syndicate' ? (
              <g className="nodes">
                {/* 4 Sybil Accounts */}
                {[
                  { id: "RING_01", y: 80 },
                  { id: "RING_02", y: 160 },
                  { id: "RING_03", y: 240 },
                  { id: "RING_04", y: 320 }
                ].map((n, i) => (
                  <g key={n.id} className="cursor-pointer" onClick={() => setSelectedNode({ label: `Sybil Account #0${i+1}`, type: "ACCOUNT", risk: "0.95", degree: 2, desc: "Connected to suspicious device hash DEV_NOX." })}>
                    <circle cx="120" cy={n.y} r="20" fill="#1e293b" stroke="#ef4444" strokeWidth="2" filter="url(#glow-red)" />
                    <text x="120" y={n.y + 4} textAnchor="middle" fill="#fff" fontSize="10" fontWeight="bold">ACC 0{i+1}</text>
                  </g>
                ))}

                {/* Center Nox Device */}
                <g className="cursor-pointer" onClick={() => setSelectedNode({ label: "Nox Android Emulator #88", type: "DEVICE", risk: "0.98", degree: 4, desc: "Degree Centrality = 4 accounts. Virtualized hardware fingerprint detected." })}>
                  <rect x="315" y="120" width="70" height="60" rx="8" fill="#1e293b" stroke="#ef4444" strokeWidth="2.5" />
                  <text x="350" y="145" textAnchor="middle" fill="#ef4444" fontSize="11" fontWeight="bold">DEV_NOX</text>
                  <text x="350" y="165" textAnchor="middle" fill="#94a3b8" fontSize="9">deg = 4 acc</text>
                </g>

                {/* Shared Stolen Card */}
                <g className="cursor-pointer" onClick={() => setSelectedNode({ label: "Stolen Card Instrument (BIN 4111)", type: "CARD", risk: "0.92", degree: 4, desc: "Payment token shared across multiple disparate customer profiles." })}>
                  <polygon points="350,250 385,310 315,310" fill="#1e293b" stroke="#f59e0b" strokeWidth="2" />
                  <text x="350" y="295" textAnchor="middle" fill="#f59e0b" fontSize="10" fontWeight="bold">CARD_4111</text>
                </g>

                {/* Destination Mule */}
                <g className="cursor-pointer" onClick={() => setSelectedNode({ label: "Offshore Crypto Mule Wallet", type: "BENEFICIARY", risk: "0.99", degree: 1, desc: "High-risk intermediary beneficiary." })}>
                  <circle cx="580" cy="210" r="24" fill="#7f1d1d" stroke="#ef4444" strokeWidth="2" />
                  <text x="580" y="214" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="bold">MULE_01</text>
                </g>
              </g>
            ) : (
              <g className="nodes">
                {/* Parent Account */}
                <g className="cursor-pointer" onClick={() => setSelectedNode({ label: "Parent Account (Alice)", type: "ACCOUNT", risk: "0.04", degree: 3, desc: "Verified biographical identity with 3-year history." })}>
                  <circle cx="160" cy="120" r="22" fill="#1e293b" stroke="#3b82f6" strokeWidth="2" />
                  <text x="160" y="124" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="bold">ACC_PARENT</text>
                </g>

                {/* Child Account */}
                <g className="cursor-pointer" onClick={() => setSelectedNode({ label: "Child Account (Bob)", type: "ACCOUNT", risk: "0.05", degree: 3, desc: "Family sub-account on independent mobile phone." })}>
                  <circle cx="540" cy="120" r="22" fill="#1e293b" stroke="#3b82f6" strokeWidth="2" />
                  <text x="540" y="124" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="bold">ACC_CHILD</text>
                </g>

                {/* Parent Device */}
                <g className="cursor-pointer" onClick={() => setSelectedNode({ label: "Parent iPad", type: "DEVICE", risk: "0.02", degree: 1, desc: "Hardware dedicated to single user." })}>
                  <rect x="320" y="55" width="60" height="50" rx="6" fill="#1e293b" stroke="#f59e0b" strokeWidth="2" />
                  <text x="350" y="85" textAnchor="middle" fill="#f59e0b" fontSize="10" fontWeight="bold">IPAD_01</text>
                </g>

                {/* Shared Home IP */}
                <g className="cursor-pointer" onClick={() => setSelectedNode({ label: "Home Residential IP", type: "IP", risk: "0.08", degree: 2, desc: "Residential subnet shared by household members. FPO recognizes distinct hardware." })}>
                  <polygon points="350,170 385,230 315,230" fill="#1e293b" stroke="#a855f7" strokeWidth="2" />
                  <text x="350" y="210" textAnchor="middle" fill="#a855f7" fontSize="10" fontWeight="bold">HOME_IP</text>
                </g>

                {/* Independent Cards */}
                <g className="cursor-pointer" onClick={() => setSelectedNode({ label: "Parent Visa Card", type: "CARD", risk: "0.02", degree: 1, desc: "Unique funding instrument." })}>
                  <rect x="320" y="295" width="60" height="50" rx="6" fill="#1e293b" stroke="#10b981" strokeWidth="2" />
                  <text x="350" y="325" textAnchor="middle" fill="#10b981" fontSize="10" fontWeight="bold">VISA_P</text>
                </g>
                <g className="cursor-pointer" onClick={() => setSelectedNode({ label: "Child Prepaid Card", type: "CARD", risk: "0.03", degree: 1, desc: "Unique prepaid instrument." })}>
                  <rect x="510" y="295" width="60" height="50" rx="6" fill="#1e293b" stroke="#10b981" strokeWidth="2" />
                  <text x="540" y="325" textAnchor="middle" fill="#10b981" fontSize="10" fontWeight="bold">PREPAID_C</text>
                </g>
              </g>
            )}
          </svg>
        </div>

        {/* Node Inspector Drawer */}
        <div className="node-inspector">
          <h4 className="inspector-heading">Graph Node Inspector</h4>
          {selectedNode ? (
            <div className="inspector-details">
              <div className="detail-row">
                <span className="detail-label">Entity Label:</span>
                <span className="detail-val font-semibold">{selectedNode.label}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Entity Type:</span>
                <span className="detail-pill">{selectedNode.type}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Propagated Risk:</span>
                <span className="detail-val text-red-400 font-bold">{(parseFloat(selectedNode.risk) * 100).toFixed(0)}%</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Degree Centrality:</span>
                <span className="detail-val font-mono">{selectedNode.degree} connections</span>
              </div>
              <p className="detail-desc">{selectedNode.desc}</p>
            </div>
          ) : (
            <p className="empty-text">Click on any node in the graph canvas to inspect its degree centrality, entity classification, and propagated risk score.</p>
          )}

          <div className="graph-algo-summary">
            <h5 className="algo-title">Bipartite Community Detection Rule</h5>
            <p className="algo-body">
              If an entity of type <code>DEVICE</code> or <code>CARD</code> connects to <strong>&ge; 3 distinct accounts</strong>, the graph engine automatically clusters the subgraph into a <code>COORDINATED_FRAUD_RING</code>, isolating all affiliated entities with <strong>BLOCK</strong> action.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

