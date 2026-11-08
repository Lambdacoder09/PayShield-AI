import React, { useState, useEffect } from 'react';
import { SCENARIOS, ARCHITECTURE_STAGES } from '../data/architectureData';
import { IconPlay, IconRefresh, IconCheck, IconAlert, IconBlock, IconArrowRight, IconShield } from './Icons';

export default function InteractiveFlowSimulator({ onActiveStageChange }) {
  const [selectedScenario, setSelectedScenario] = useState(SCENARIOS[0]);
  const [currentStep, setCurrentStep] = useState(0); // 0 = idle, 1..6 = stages, 7 = finished
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    let timer;
    if (isPlaying && currentStep < 6) {
      timer = setTimeout(() => {
        const nextStep = currentStep + 1;
        setCurrentStep(nextStep);
        if (onActiveStageChange && nextStep <= 6) {
          onActiveStageChange(ARCHITECTURE_STAGES[nextStep - 1].id);
        }
      }, 900);
    } else if (isPlaying && currentStep >= 6) {
      setIsPlaying(false);
    }
    return () => clearTimeout(timer);
  }, [isPlaying, currentStep, onActiveStageChange]);

  const handleSelectScenario = (scen) => {
    setSelectedScenario(scen);
    setCurrentStep(0);
    setIsPlaying(false);
    if (onActiveStageChange) onActiveStageChange(null);
  };

  const startAutoPlay = () => {
    setCurrentStep(1);
    setIsPlaying(true);
    if (onActiveStageChange) onActiveStageChange(ARCHITECTURE_STAGES[0].id);
  };

  const stepForward = () => {
    if (currentStep < 6) {
      const next = currentStep + 1;
      setCurrentStep(next);
      if (onActiveStageChange) onActiveStageChange(ARCHITECTURE_STAGES[next - 1].id);
    }
  };

  const resetFlow = () => {
    setCurrentStep(0);
    setIsPlaying(false);
    if (onActiveStageChange) onActiveStageChange(null);
  };

  const getDecisionBadge = (decision) => {
    if (decision === 'ALLOW') {
      return (
        <span className="badge-pill allow">
          <IconCheck className="w-4 h-4" /> ALLOW
        </span>
      );
    } else if (decision === 'CHALLENGE') {
      return (
        <span className="badge-pill challenge">
          <IconAlert className="w-4 h-4" /> CHALLENGE (MFA)
        </span>
      );
    } else {
      return (
        <span className="badge-pill block">
          <IconBlock className="w-4 h-4" /> BLOCK
        </span>
      );
    }
  };

  return (
    <div className="simulator-wrapper">
      <div className="simulator-header">
        <div>
          <h2 className="section-title">End-to-End Execution Simulator</h2>
          <p className="section-subtitle">Simulate real transaction packets traveling through the 6 architecture stages in real time.</p>
        </div>
        <div className="flow-controls">
          <button className="control-btn primary" onClick={startAutoPlay} disabled={isPlaying}>
            <IconPlay className="w-4 h-4" /> Auto-Play Flow
          </button>
          <button className="control-btn" onClick={stepForward} disabled={isPlaying || currentStep >= 6}>
            <IconArrowRight className="w-4 h-4" /> Step Stage ({currentStep}/6)
          </button>
          <button className="control-btn secondary" onClick={resetFlow}>
            <IconRefresh className="w-4 h-4" /> Reset
          </button>
        </div>
      </div>

      {/* Scenario Selection Tabs */}
      <div className="scenario-selector-row">
        {SCENARIOS.map((scen) => (
          <button
            key={scen.id}
            className={`scen-tab ${selectedScenario.id === scen.id ? 'active' : ''}`}
            onClick={() => handleSelectScenario(scen)}
          >
            <span className="scen-tab-title">{scen.title}</span>
            <span className="scen-tab-type">{scen.type}</span>
          </button>
        ))}
      </div>

      {/* Selected Scenario Context Banner */}
      <div className="packet-context-card">
        <div className="context-item">
          <span className="ctx-label">Account Subject:</span>
          <span className="ctx-value font-mono">{selectedScenario.account}</span>
        </div>
        <div className="context-item">
          <span className="ctx-label">Transaction Amount:</span>
          <span className="ctx-value">{selectedScenario.amount}</span>
        </div>
        <div className="context-item">
          <span className="ctx-label">Hardware Device:</span>
          <span className="ctx-value">{selectedScenario.device}</span>
        </div>
        <div className="context-item">
          <span className="ctx-label">IP Geolocation:</span>
          <span className="ctx-value">{selectedScenario.location}</span>
        </div>
        <div className="context-item">
          <span className="ctx-label">Expected Outcome:</span>
          <span className="ctx-value">{getDecisionBadge(selectedScenario.expectedDecision)}</span>
        </div>
      </div>

      {/* Visual Pipeline Progress Stepper */}
      <div className="stepper-track">
        {ARCHITECTURE_STAGES.map((stage, idx) => {
          const stepNum = idx + 1;
          const isDone = currentStep > stepNum;
          const isCurrent = currentStep === stepNum;
          return (
            <div key={stage.id} className="stepper-step">
              <div className={`step-node ${isDone ? 'done' : ''} ${isCurrent ? 'current' : ''}`}>
                {isDone ? '✓' : stepNum}
              </div>
              <span className="step-label">{stage.name.split('. ')[1]}</span>
              {idx < ARCHITECTURE_STAGES.length - 1 && (
                <div className={`step-connector ${currentStep > stepNum ? 'filled' : ''}`}></div>
              )}
            </div>
          );
        })}
      </div>

      {/* Dynamic Stage Telemetry Inspector */}
      {currentStep > 0 && currentStep <= 6 && (
        <div className="live-packet-telemetry">
          <div className="telemetry-header">
            <span className="telemetry-badge">
              Stage {currentStep} Active: {ARCHITECTURE_STAGES[currentStep - 1].name}
            </span>
            <span className="telemetry-latency">Latency: {ARCHITECTURE_STAGES[currentStep - 1].latency}</span>
          </div>
          <p className="telemetry-text">
            {currentStep === 1 && "Verifying payload schema and ensuring zero duplicate submissions via rolling UUID hash cache."}
            {currentStep === 2 && `Calculating time-window velocity metrics: 5m, 1h, and 24h spend totals. Evaluating GPS distance to check travel plausibility.`}
            {currentStep === 3 && `Checking in-memory entity graph for Sybil accounts, device degree centrality, and neighborhood risk propagation.`}
            {currentStep === 4 && `Running calibrated XGBoost gradient boosting and Isolation Forest anomaly inference.`}
            {currentStep === 5 && `Evaluating deterministic security policies and executing False Positive Optimizer (FPO) context filters.`}
            {currentStep === 6 && `Synthesizing transparent feature attribution weights and human-readable natural language justification.`}
          </p>
        </div>
      )}

      {/* Final Outcome Card */}
      {currentStep === 6 && (
        <div className="result-card">
          <div className="result-top">
            <div className="result-decision-group">
              <span className="result-tag">Final Policy Action:</span>
              {getDecisionBadge(selectedScenario.expectedDecision)}
              <span className="risk-score-pill">Risk Score: {selectedScenario.expectedRisk}</span>
            </div>
            <span className="total-elapsed">End-to-End Elapsed: <strong>18.4 ms</strong></span>
          </div>

          <div className="result-explanation-box">
            <strong>Explainable AI (XAI) Attribution Narrative:</strong>
            <p className="mt-1">{selectedScenario.explanation}</p>
          </div>

          <div className="layer-bars-grid">
            <div className="layer-bar-item">
              <div className="layer-bar-label">
                <span>Machine Learning (40% wt)</span>
                <span>{(selectedScenario.layerBreakdown.ml * 100).toFixed(0)}%</span>
              </div>
              <div className="bar-track">
                <div className="bar-fill" style={{ width: `${selectedScenario.layerBreakdown.ml * 100}%`, backgroundColor: '#f59e0b' }}></div>
              </div>
            </div>
            <div className="layer-bar-item">
              <div className="layer-bar-label">
                <span>Graph Intelligence (30% wt)</span>
                <span>{(selectedScenario.layerBreakdown.graph * 100).toFixed(0)}%</span>
              </div>
              <div className="bar-track">
                <div className="bar-fill" style={{ width: `${selectedScenario.layerBreakdown.graph * 100}%`, backgroundColor: '#a855f7' }}></div>
              </div>
            </div>
            <div className="layer-bar-item">
              <div className="layer-bar-label">
                <span>Security Rules (20% wt)</span>
                <span>{(selectedScenario.layerBreakdown.rules * 100).toFixed(0)}%</span>
              </div>
              <div className="bar-track">
                <div className="bar-fill" style={{ width: `${selectedScenario.layerBreakdown.rules * 100}%`, backgroundColor: '#ef4444' }}></div>
              </div>
            </div>
            <div className="layer-bar-item">
              <div className="layer-bar-label">
                <span>Behavioral Anomaly (10% wt)</span>
                <span>{(selectedScenario.layerBreakdown.behavioral * 100).toFixed(0)}%</span>
              </div>
              <div className="bar-track">
                <div className="bar-fill" style={{ width: `${selectedScenario.layerBreakdown.behavioral * 100}%`, backgroundColor: '#3b82f6' }}></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

