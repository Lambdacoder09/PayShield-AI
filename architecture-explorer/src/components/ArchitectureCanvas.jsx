import React, { useState } from 'react';
import { ARCHITECTURE_STAGES } from '../data/architectureData';
import { IconCpu, IconNetwork, IconLayers, IconBrain, IconShield, IconZap, IconArrowRight } from './Icons';

export default function ArchitectureCanvas({ activeStageId, onSelectStage }) {
  const [selectedStage, setSelectedStage] = useState(ARCHITECTURE_STAGES[0]);

  const handleStageClick = (stage) => {
    setSelectedStage(stage);
    if (onSelectStage) onSelectStage(stage.id);
  };

  const getStageIcon = (id) => {
    switch (id) {
      case 'ingestion': return <IconZap className="w-5 h-5" color="#06b6d4" />;
      case 'features': return <IconLayers className="w-5 h-5" color="#3b82f6" />;
      case 'graph': return <IconNetwork className="w-5 h-5" color="#a855f7" />;
      case 'ml': return <IconBrain className="w-5 h-5" color="#f59e0b" />;
      case 'decision': return <IconShield className="w-5 h-5" color="#10b981" />;
      case 'xai': return <IconCpu className="w-5 h-5" color="#ec4899" />;
      default: return <IconCpu className="w-5 h-5" />;
    }
  };

  return (
    <div className="canvas-wrapper">
      <div className="canvas-header">
        <div>
          <h2 className="section-title">Interactive Pipeline Architecture</h2>
          <p className="section-subtitle">Click any pipeline block to inspect technical specifications, data schemas, and latency budgets.</p>
        </div>
        <div className="latency-summary">
          <span className="latency-dot"></span>
          <span className="latency-text">Total Decision Budget: <strong>&lt; 30 ms</strong> (P95)</span>
        </div>
      </div>

      {/* Pipeline Stage Cards Grid */}
      <div className="pipeline-grid">
        {ARCHITECTURE_STAGES.map((stage, idx) => {
          const isSelected = selectedStage.id === stage.id;
          const isActive = activeStageId === stage.id;
          return (
            <div
              key={stage.id}
              className={`stage-card ${isSelected ? 'selected' : ''} ${isActive ? 'active-pulse' : ''}`}
              onClick={() => handleStageClick(stage)}
              style={{ '--accent-color': stage.color }}
            >
              <div className="stage-top">
                <span className="stage-num">0{idx + 1}</span>
                <span className="stage-latency">{stage.latency}</span>
              </div>
              <div className="stage-icon-row">
                <div className="icon-bubble" style={{ backgroundColor: `${stage.color}20`, borderColor: stage.color }}>
                  {getStageIcon(stage.id)}
                </div>
                <span className="stage-badge" style={{ color: stage.color, borderColor: `${stage.color}40`, backgroundColor: `${stage.color}15` }}>
                  {stage.badge}
                </span>
              </div>
              <h3 className="stage-name">{stage.name}</h3>
              <p className="stage-summary">{stage.summary}</p>
              <div className="stage-action">
                <span>View Blueprint</span>
                <IconArrowRight className="w-4 h-4" color={stage.color} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Blueprint Detail Drawer */}
      <div className="blueprint-drawer">
        <div className="drawer-header" style={{ borderLeftColor: selectedStage.color }}>
          <div className="drawer-title-group">
            <span className="stage-badge" style={{ color: selectedStage.color, backgroundColor: `${selectedStage.color}20` }}>
              {selectedStage.badge}
            </span>
            <h3 className="drawer-title">{selectedStage.name} — Technical Specification</h3>
          </div>
          <span className="drawer-latency">Processing Budget: {selectedStage.latency}</span>
        </div>

        <div className="drawer-grid">
          <div className="drawer-col">
            <h4 className="col-heading">Component Responsibilities</h4>
            <ul className="bullet-list">
              {selectedStage.details.responsibilities.map((resp, i) => (
                <li key={i}>{resp}</li>
              ))}
            </ul>

            {selectedStage.details.equations && (
              <div className="formula-box">
                <span className="box-tag">Mathematical Formulation</span>
                <code>{selectedStage.details.equations}</code>
              </div>
            )}
          </div>

          <div className="drawer-col">
            <h4 className="col-heading">System I/O & Technology</h4>
            <div className="meta-card">
              <div className="meta-item">
                <span className="meta-label">Input Payload:</span>
                <span className="meta-value">{selectedStage.details.inputs}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Output Contract:</span>
                <span className="meta-value">{selectedStage.details.outputs}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Core Runtime / Libs:</span>
                <span className="meta-value">{selectedStage.details.techStack}</span>
              </div>
              {selectedStage.details.threatsMitigated && (
                <div className="meta-item">
                  <span className="meta-label">Threats Mitigated:</span>
                  <span className="meta-value" style={{ color: '#f87171' }}>{selectedStage.details.threatsMitigated}</span>
                </div>
              )}
              {selectedStage.details.fpoImpact && (
                <div className="meta-item">
                  <span className="meta-label">FPO Impact:</span>
                  <span className="meta-value" style={{ color: '#10b981' }}>{selectedStage.details.fpoImpact}</span>
                </div>
              )}
              {selectedStage.details.metrics && (
                <div className="meta-item">
                  <span className="meta-label">Benchmark Accuracy:</span>
                  <span className="meta-value" style={{ color: '#38bdf8' }}>{selectedStage.details.metrics}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

