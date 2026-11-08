import React, { useState } from 'react';
import { MULTI_STAGE_TEST_CASES } from '../data/testCasesData';
import VisualCaseDiagram from './VisualCaseDiagram';

export default function MultiStageTestingPage() {
  const [selectedCaseId, setSelectedCaseId] = useState(MULTI_STAGE_TEST_CASES[0].id);
  const [activeStep, setActiveStep] = useState(6);
  const [isSimulating, setIsSimulating] = useState(false);

  const currentCase = MULTI_STAGE_TEST_CASES.find(c => c.id === selectedCaseId) || MULTI_STAGE_TEST_CASES[0];

  const runLiveTest = (caseItem) => {
    setSelectedCaseId(caseItem.id);
    setActiveStep(0);
    setIsSimulating(true);

    let step = 0;
    const interval = setInterval(() => {
      step++;
      setActiveStep(step);
      if (step >= caseItem.stages.length) {
        clearInterval(interval);
        setIsSimulating(false);
      }
    }, 350);
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* 1. Clean Top Header Bar */}
      <div style={{
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        padding: '1.25rem 1.5rem',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
      }}>
        <div>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.2rem 0.6rem',
            backgroundColor: '#eff6ff',
            color: '#1d4ed8',
            borderRadius: '9999px',
            fontSize: '0.75rem',
            fontWeight: 800,
            textTransform: 'uppercase',
            marginBottom: '0.4rem'
          }}>
            ⚡ PIPELINE VERIFICATION LAB
          </div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
            PayPal Hackathon: Multi-Stage Risk Verification
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0.25rem 0 0 0' }}>
            Inspect how transactions progress through all 6 defense layers and observe exact short-circuit failure points.
          </p>
        </div>

        <div>
          <button
            onClick={() => runLiveTest(currentCase)}
            disabled={isSimulating}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: '#0284c7',
              color: '#ffffff',
              padding: '0.6rem 1.25rem',
              borderRadius: '8px',
              fontSize: '0.875rem',
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
            }}
          >
            <span>▶</span> {isSimulating ? 'Simulating Pipeline...' : 'Run Simulation'}
          </button>
        </div>
      </div>

      {/* 2. Horizontal Button Selector for the 6 Cases */}
      <div>
        <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
          Select Test Scenario ({MULTI_STAGE_TEST_CASES.length})
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '0.6rem'
        }}>
          {MULTI_STAGE_TEST_CASES.map((tc, idx) => {
            const isSelected = tc.id === selectedCaseId;
            return (
              <button
                key={tc.id}
                onClick={() => {
                  setSelectedCaseId(tc.id);
                  setActiveStep(6);
                }}
                style={{
                  textAlign: 'left',
                  padding: '0.75rem 0.85rem',
                  borderRadius: '10px',
                  border: isSelected ? '2px solid #0284c7' : '1px solid #e2e8f0',
                  backgroundColor: isSelected ? '#f0f9ff' : '#ffffff',
                  boxShadow: isSelected ? '0 2px 4px rgba(2,132,199,0.1)' : '0 1px 2px rgba(0,0,0,0.02)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8' }}>CASE 0{idx + 1}</span>
                  <span style={{
                    fontSize: '0.65rem',
                    fontWeight: 800,
                    padding: '0.1rem 0.4rem',
                    borderRadius: '4px',
                    backgroundColor: tc.tag.includes('ALLOW') ? '#ecfdf5' : tc.tag === 'CHALLENGE' ? '#fffbeb' : '#fef2f2',
                    color: tc.tag.includes('ALLOW') ? '#047857' : tc.tag === 'CHALLENGE' ? '#b45309' : '#b91c1c',
                    border: `1px solid ${tc.tag.includes('ALLOW') ? '#a7f3d0' : tc.tag === 'CHALLENGE' ? '#fde68a' : '#fecaca'}`
                  }}>
                    {tc.tag}
                  </span>
                </div>
                <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {tc.category}
                </div>
                <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.2rem' }}>
                  {tc.failedAt ? `Fails: ${tc.failedAt.split('.')[1] || tc.failedAt}` : 'Clears 6 Stages'}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Main Stage Inspection Card */}
      <div style={{
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        padding: '1.5rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem'
      }}>
        {/* Scenario Header Summary */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingBottom: '1rem',
          borderBottom: '1px solid #f1f5f9',
          gap: '1rem'
        }}>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
              Active Evaluation: {currentCase.category}
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: '0.2rem 0' }}>
              {currentCase.title}
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#475569', margin: 0, maxWidth: '800px' }}>
              {currentCase.description}
            </p>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>Final Verdict</div>
            <div style={{
              fontSize: '0.9rem',
              fontWeight: 800,
              padding: '0.35rem 0.75rem',
              borderRadius: '6px',
              backgroundColor: currentCase.finalDecision.includes('ALLOW') ? '#ecfdf5' : currentCase.finalDecision === 'CHALLENGE' ? '#fffbeb' : '#fef2f2',
              color: currentCase.finalDecision.includes('ALLOW') ? '#047857' : currentCase.finalDecision === 'CHALLENGE' ? '#b45309' : '#b91c1c',
              border: `1px solid ${currentCase.finalDecision.includes('ALLOW') ? '#a7f3d0' : currentCase.finalDecision === 'CHALLENGE' ? '#fde68a' : '#fecaca'}`,
              display: 'inline-block',
              marginTop: '0.25rem'
            }}>
              {currentCase.finalDecision} &bull; Risk: {currentCase.finalRisk}
            </div>
          </div>
        </div>

        {/* Verdict Callout Box */}
        <div style={{
          padding: '0.85rem 1.25rem',
          borderRadius: '8px',
          fontSize: '0.875rem',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          backgroundColor: currentCase.finalDecision.includes('ALLOW') ? '#ecfdf5' : currentCase.finalDecision === 'CHALLENGE' ? '#fffbeb' : '#fef2f2',
          color: currentCase.finalDecision.includes('ALLOW') ? '#065f46' : currentCase.finalDecision === 'CHALLENGE' ? '#92400e' : '#991b1b',
          border: `1px solid ${currentCase.finalDecision.includes('ALLOW') ? '#a7f3d0' : currentCase.finalDecision === 'CHALLENGE' ? '#fde68a' : '#fecaca'}`
        }}>
          <span style={{ fontSize: '1.2rem' }}>{currentCase.finalDecision.includes('ALLOW') ? '✓' : currentCase.finalDecision === 'CHALLENGE' ? '⚠' : '✕'}</span>
          <span>{currentCase.verdictMessage}</span>
        </div>

        {/* 4. Dedicated Visual Diagram for this Scenario */}
        <VisualCaseDiagram caseId={currentCase.id} />

        {/* 5. Clean 6-Stage Progression Cards */}
        <div style={{ marginTop: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
              Sequential Inspection Pipeline (6 Defense Layers)
            </div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>
              SLA Budget: &lt; 30 ms
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {currentCase.stages.map((stg, idx) => {
              const isEvaluated = activeStep > idx;
              let bg = '#ffffff';
              let borderColor = '#e2e8f0';
              let badgeBg = '#f1f5f9';
              let badgeColor = '#94a3b8';
              let badgeBorder = '#e2e8f0';

              if (isEvaluated) {
                if (stg.status === 'PASS') {
                  bg = '#ffffff';
                  borderColor = '#e2e8f0';
                  badgeBg = '#ecfdf5';
                  badgeColor = '#047857';
                  badgeBorder = '#a7f3d0';
                } else if (stg.status === 'WARN') {
                  bg = '#fffdf7';
                  borderColor = '#fde68a';
                  badgeBg = '#fffbeb';
                  badgeColor = '#b45309';
                  badgeBorder = '#fde68a';
                } else if (stg.status === 'FAIL') {
                  bg = '#fffafa';
                  borderColor = '#fca5a5';
                  badgeBg = '#fef2f2';
                  badgeColor = '#b91c1c';
                  badgeBorder = '#fecaca';
                }
              }

              return (
                <div
                  key={idx}
                  style={{
                    backgroundColor: bg,
                    border: `1px solid ${borderColor}`,
                    borderRadius: '8px',
                    padding: '0.85rem 1rem',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{
                        width: '24px',
                        height: '24px',
                        minWidth: '24px',
                        borderRadius: '9999px',
                        backgroundColor: '#f1f5f9',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        color: '#475569',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {idx + 1}
                      </span>
                      <span style={{ fontSize: '0.875rem', fontWeight: 800, color: '#0f172a' }}>
                        {stg.name}
                      </span>
                      <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                        &bull; {stg.badge}
                      </span>
                    </div>

                    <div>
                      {isEvaluated ? (
                        <span style={{
                          fontSize: '0.75rem',
                          fontWeight: 800,
                          padding: '0.2rem 0.55rem',
                          borderRadius: '4px',
                          backgroundColor: badgeBg,
                          color: badgeColor,
                          border: `1px solid ${badgeBorder}`
                        }}>
                          {stg.status} ({stg.latency})
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.55rem', borderRadius: '4px', backgroundColor: '#f1f5f9', color: '#94a3b8' }}>
                          WAITING
                        </span>
                      )}
                    </div>
                  </div>

                  {isEvaluated && (
                    <div style={{ fontSize: '0.8rem', color: '#475569', paddingLeft: '2.25rem', marginTop: '0.35rem' }}>
                      {stg.detail}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 6. Raw JSON Payload Card */}
        <div style={{
          backgroundColor: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          padding: '1rem'
        }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
            Inbound API Request Payload (JSON)
          </div>
          <pre style={{ margin: 0, fontSize: '0.75rem', fontFamily: 'monospace', color: '#1e293b', overflowX: 'auto' }}>
            {JSON.stringify(currentCase.payload, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
