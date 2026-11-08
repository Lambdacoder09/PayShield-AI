import React from 'react';
import ImpossibleTravelMap from './ImpossibleTravelMap';

export default function VisualCaseDiagram({ caseId }) {
  // Case 3 (Impossible Travel) & Case 6 (Legitimate Traveler) already use ImpossibleTravelMap
  if (caseId === 'case_fail_stage2') {
    return (
      <ImpossibleTravelMap
        originCity="San Francisco, USA"
        destCity="London, UK"
        timeDiffMinutes={20}
        distanceKm={8620}
        calculatedSpeed={25860}
        maxAllowedSpeed={850}
      />
    );
  }

  if (caseId === 'case_traveler_saved') {
    return (
      <div style={{ marginTop: '1rem' }}>
        <div style={{
          backgroundColor: '#f0fdf4',
          border: '1px solid #bbf7d0',
          borderRadius: '8px',
          padding: '0.6rem 1rem',
          marginBottom: '0.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#166534' }}>
            ✓ FPO POLICY ACTIVATED: Legitimate Cross-Border Travel Approved
          </div>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#15803d' }}>
            Flight Speed: 767 km/h (Physically Plausible)
          </div>
        </div>
        <ImpossibleTravelMap
          originCity="San Francisco, USA"
          destCity="Paris, France"
          timeDiffMinutes={672} // 11.2 hours
          distanceKm={8600}
          calculatedSpeed={767}
          maxAllowedSpeed={850}
        />
      </div>
    );
  }

  // Case 1: Clean Pass (Local Trusted Pipeline)
  if (caseId === 'case_clean_pass') {
    return (
      <div style={{
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        padding: '1.25rem',
        marginTop: '1rem',
        boxShadow: '0 2px 4px rgba(0,0,0,0.03)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <div>
            <span style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: '#059669', backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
              CLEAN PIPELINE TOPOLOGY
            </span>
            <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: '0.35rem 0 0 0' }}>
              Direct Trusted Path: Single User ➔ Trusted Device ➔ 1-Click Settlement
            </h4>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#059669', backgroundColor: '#ecfdf5', padding: '0.25rem 0.6rem', borderRadius: '6px', border: '1px solid #a7f3d0' }}>
              RISK: 0.02 (PRISTINE)
            </span>
          </div>
        </div>

        <svg viewBox="0 0 760 160" style={{ width: '100%', height: 'auto', display: 'block', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <defs>
            <linearGradient id="cleanPassGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#0284c7" />
            </linearGradient>
          </defs>

          {/* Connection line */}
          <line x1="120" y1="80" x2="640" y2="80" stroke="url(#cleanPassGrad)" strokeWidth="3" strokeDasharray="5 4" />

          {/* Node 1: Alice Home */}
          <g transform="translate(120, 80)">
            <circle cx="0" cy="0" r="24" fill="#ecfdf5" stroke="#10b981" strokeWidth="2.5" />
            <text x="0" y="5" textAnchor="middle" fontSize="16">👤</text>
            <rect x="-60" y="32" width="120" height="34" rx="4" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
            <text x="0" y="47" textAnchor="middle" fontSize="10" fontWeight="700" fill="#0f172a">Alice (ACC_101)</text>
            <text x="0" y="59" textAnchor="middle" fontSize="8" fill="#64748b">Verified Identity</text>
          </g>

          {/* Node 2: Trusted PC */}
          <g transform="translate(380, 80)">
            <circle cx="0" cy="0" r="24" fill="#eff6ff" stroke="#3b82f6" strokeWidth="2.5" />
            <text x="0" y="5" textAnchor="middle" fontSize="16">💻</text>
            <rect x="-65" y="32" width="130" height="34" rx="4" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
            <text x="0" y="47" textAnchor="middle" fontSize="10" fontWeight="700" fill="#0f172a">Home Windows PC</text>
            <text x="0" y="59" textAnchor="middle" fontSize="8" fill="#3b82f6">Known Device (3 yrs)</text>
          </g>

          {/* Node 3: PayPal Settlement */}
          <g transform="translate(640, 80)">
            <circle cx="0" cy="0" r="24" fill="#ecfdf5" stroke="#10b981" strokeWidth="2.5" />
            <text x="0" y="5" textAnchor="middle" fontSize="16">✓</text>
            <rect x="-60" y="32" width="120" height="34" rx="4" fill="#ffffff" stroke="#10b981" strokeWidth="1" />
            <text x="0" y="47" textAnchor="middle" fontSize="10" fontWeight="700" fill="#059669">Instant Settlement</text>
            <text x="0" y="59" textAnchor="middle" fontSize="8" fill="#64748b">&lt; 14ms (Zero Friction)</text>
          </g>
        </svg>
      </div>
    );
  }

  // Case 2: Replay Attack (Short-Circuit at Stage 1)
  if (caseId === 'case_fail_stage1') {
    return (
      <div style={{
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        padding: '1.25rem',
        marginTop: '1rem',
        boxShadow: '0 2px 4px rgba(0,0,0,0.03)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <div>
            <span style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: '#b91c1c', backgroundColor: '#fef2f2', border: '1px solid #fecaca', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
              CRYPTOGRAPHIC DEDUPLICATION GATEWAY
            </span>
            <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: '0.35rem 0 0 0' }}>
              Replay Attack Intercepted at Stage 1 (Ingestion Gateway)
            </h4>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#b91c1c', backgroundColor: '#fef2f2', padding: '0.25rem 0.6rem', borderRadius: '6px', border: '1px solid #fecaca' }}>
              DROPPED IN 0.8ms
            </span>
          </div>
        </div>

        <svg viewBox="0 0 760 180" style={{ width: '100%', height: 'auto', display: 'block', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          {/* Legitimate Original Stream */}
          <g opacity="0.6">
            <path d="M 120,50 L 380,50 L 640,50" stroke="#10b981" strokeWidth="2" strokeDasharray="4 4" fill="none" />
            <text x="250" y="40" fontSize="10" fill="#059669" fontWeight="700">Original Event #9981a (10:00:00 AM) ➔ Accepted</text>
          </g>

          {/* Replayed Malicious Stream */}
          <path d="M 120,120 L 380,120" stroke="#ef4444" strokeWidth="3" fill="none" />

          {/* Attacker Node */}
          <g transform="translate(120, 120)">
            <circle cx="0" cy="0" r="22" fill="#fef2f2" stroke="#ef4444" strokeWidth="2" />
            <text x="0" y="5" textAnchor="middle" fontSize="14">🥷</text>
            <rect x="-65" y="28" width="130" height="30" rx="4" fill="#ffffff" stroke="#fca5a5" />
            <text x="0" y="42" textAnchor="middle" fontSize="9" fontWeight="700" fill="#991b1b">Attacker Clone Frame</text>
            <text x="0" y="52" textAnchor="middle" fontSize="8" fill="#64748b">Same UUID (10:00:45 AM)</text>
          </g>

          {/* Ingestion Shield Gate */}
          <g transform="translate(380, 120)">
            <rect x="-35" y="-35" width="70" height="70" rx="10" fill="#fee2e2" stroke="#dc2626" strokeWidth="2.5" />
            <text x="0" y="-8" textAnchor="middle" fontSize="18">🛡️</text>
            <text x="0" y="14" textAnchor="middle" fontSize="10" fontWeight="900" fill="#991b1b">BLOCKED</text>
            <rect x="-85" y="42" width="170" height="30" rx="4" fill="#ffffff" stroke="#dc2626" />
            <text x="0" y="55" textAnchor="middle" fontSize="9" fontWeight="800" fill="#dc2626">UUID Cache Match (0.8ms)</text>
            <text x="0" y="66" textAnchor="middle" fontSize="8" fill="#64748b">Stages 2–6 Short-Circuited</text>
          </g>

          {/* Bypassed Backend (Greyed out) */}
          <g transform="translate(640, 120)" opacity="0.4">
            <rect x="-40" y="-25" width="80" height="50" rx="6" fill="#f1f5f9" stroke="#94a3b8" strokeDasharray="3 3" />
            <text x="0" y="5" textAnchor="middle" fontSize="10" fill="#64748b" fontWeight="700">Compute</text>
            <text x="0" y="38" textAnchor="middle" fontSize="9" fill="#94a3b8">Bypassed (0% CPU)</text>
          </g>
        </svg>
      </div>
    );
  }

  // Case 4: Sybil Mule Ring (Visual Graph Topology)
  if (caseId === 'case_fail_stage3') {
    return (
      <div style={{
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        padding: '1.25rem',
        marginTop: '1rem',
        boxShadow: '0 2px 4px rgba(0,0,0,0.03)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <div>
            <span style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: '#b91c1c', backgroundColor: '#fef2f2', border: '1px solid #fecaca', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
              STAGE 3 GRAPH TOPOLOGY BREACH
            </span>
            <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: '0.35rem 0 0 0' }}>
              Coordinated Sybil Mule Ring: 5 Accounts Sharing 1 Emulator Fingerprint
            </h4>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#b91c1c', backgroundColor: '#fef2f2', padding: '0.25rem 0.6rem', borderRadius: '6px', border: '1px solid #fecaca' }}>
              SYNDICATE DEGREE = 5
            </span>
          </div>
        </div>

        <svg viewBox="0 0 760 220" style={{ width: '100%', height: 'auto', display: 'block', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          {/* Edges from central emulator to accounts */}
          <line x1="380" y1="110" x2="160" y2="50" stroke="#ef4444" strokeWidth="2.5" />
          <line x1="380" y1="110" x2="200" y2="170" stroke="#ef4444" strokeWidth="2.5" />
          <line x1="380" y1="110" x2="380" y2="30" stroke="#ef4444" strokeWidth="2.5" />
          <line x1="380" y1="110" x2="560" y2="170" stroke="#ef4444" strokeWidth="2.5" />
          <line x1="380" y1="110" x2="600" y2="50" stroke="#ef4444" strokeWidth="2.5" />

          {/* Central Spoofed Emulator Node */}
          <g transform="translate(380, 110)">
            <circle cx="0" cy="0" r="32" fill="#fee2e2" stroke="#dc2626" strokeWidth="3" />
            <text x="0" y="6" textAnchor="middle" fontSize="20">🤖</text>
            <rect x="-80" y="38" width="160" height="34" rx="4" fill="#ffffff" stroke="#dc2626" strokeWidth="1.5" />
            <text x="0" y="52" textAnchor="middle" fontSize="10" fontWeight="900" fill="#991b1b">EMULATOR_RING_X9</text>
            <text x="0" y="64" textAnchor="middle" fontSize="8" fill="#64748b">Virtual Android Emulator Farm</text>
          </g>

          {/* Account 1 */}
          <g transform="translate(160, 50)">
            <circle cx="0" cy="0" r="18" fill="#ffffff" stroke="#ef4444" strokeWidth="2" />
            <text x="0" y="4" textAnchor="middle" fontSize="11" fontWeight="800" fill="#991b1b">#1</text>
            <text x="0" y="-22" textAnchor="middle" fontSize="8" fontWeight="700" fill="#64748b">ACC_MULE_01</text>
          </g>

          {/* Account 2 */}
          <g transform="translate(200, 170)">
            <circle cx="0" cy="0" r="18" fill="#ffffff" stroke="#ef4444" strokeWidth="2" />
            <text x="0" y="4" textAnchor="middle" fontSize="11" fontWeight="800" fill="#991b1b">#2</text>
            <text x="0" y="28" textAnchor="middle" fontSize="8" fontWeight="700" fill="#64748b">ACC_MULE_02</text>
          </g>

          {/* Account 3 */}
          <g transform="translate(380, 30)">
            <circle cx="0" cy="0" r="18" fill="#ffffff" stroke="#ef4444" strokeWidth="2" />
            <text x="0" y="4" textAnchor="middle" fontSize="11" fontWeight="800" fill="#991b1b">#3</text>
            <text x="0" y="-22" textAnchor="middle" fontSize="8" fontWeight="700" fill="#64748b">ACC_MULE_03</text>
          </g>

          {/* Account 4 */}
          <g transform="translate(560, 170)">
            <circle cx="0" cy="0" r="18" fill="#ffffff" stroke="#ef4444" strokeWidth="2" />
            <text x="0" y="4" textAnchor="middle" fontSize="11" fontWeight="800" fill="#991b1b">#4</text>
            <text x="0" y="28" textAnchor="middle" fontSize="8" fontWeight="700" fill="#64748b">ACC_MULE_04</text>
          </g>

          {/* Account 5 (Active Target) */}
          <g transform="translate(600, 50)">
            <circle cx="0" cy="0" r="22" fill="#ef4444" stroke="#991b1b" strokeWidth="2" />
            <text x="0" y="4" textAnchor="middle" fontSize="11" fontWeight="900" fill="#ffffff">#5</text>
            <text x="0" y="-26" textAnchor="middle" fontSize="9" fontWeight="900" fill="#991b1b">ACC_MULE_05 (Current)</text>
          </g>
        </svg>
      </div>
    );
  }

  // Case 5: ATO Step-Up (Temporal Sequence Timeline)
  if (caseId === 'case_fpo_challenge') {
    return (
      <div style={{
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        padding: '1.25rem',
        marginTop: '1rem',
        boxShadow: '0 2px 4px rgba(0,0,0,0.03)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <div>
            <span style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: '#b45309', backgroundColor: '#fffbeb', border: '1px solid #fde68a', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
              STAGE 5 CONTEXTUAL ESCALATION
            </span>
            <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: '0.35rem 0 0 0' }}>
              Account Takeover Timeline: Saved from Hard Block ➔ Biometric Passkey Step-Up
            </h4>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#b45309', backgroundColor: '#fffbeb', padding: '0.25rem 0.6rem', borderRadius: '6px', border: '1px solid #fde68a' }}>
              CHALLENGE (PASSKEY)
            </span>
          </div>
        </div>

        <svg viewBox="0 0 760 170" style={{ width: '100%', height: 'auto', display: 'block', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          {/* Timeline axis */}
          <line x1="80" y1="85" x2="680" y2="85" stroke="#cbd5e1" strokeWidth="3" />

          {/* Event 1: Password Reset */}
          <g transform="translate(180, 85)">
            <circle cx="0" cy="0" r="18" fill="#fef3c7" stroke="#f59e0b" strokeWidth="2.5" />
            <text x="0" y="5" textAnchor="middle" fontSize="14">🔑</text>
            <rect x="-70" y="26" width="140" height="34" rx="4" fill="#ffffff" stroke="#cbd5e1" />
            <text x="0" y="40" textAnchor="middle" fontSize="9" fontWeight="700" fill="#0f172a">Password Changed</text>
            <text x="0" y="52" textAnchor="middle" fontSize="8" fill="#b45309">10 mins ago (High Velocity)</text>
          </g>

          {/* Event 2: New Device Login */}
          <g transform="translate(380, 85)">
            <circle cx="0" cy="0" r="18" fill="#fef3c7" stroke="#f59e0b" strokeWidth="2.5" />
            <text x="0" y="5" textAnchor="middle" fontSize="14">📱</text>
            <rect x="-70" y="26" width="140" height="34" rx="4" fill="#ffffff" stroke="#cbd5e1" />
            <text x="0" y="40" textAnchor="middle" fontSize="9" fontWeight="700" fill="#0f172a">Unrecognized iPad</text>
            <text x="0" y="52" textAnchor="middle" fontSize="8" fill="#64748b">Zero Historical Trust</text>
          </g>

          {/* Event 3: Step-Up Passkey Triggered */}
          <g transform="translate(580, 85)">
            <circle cx="0" cy="0" r="22" fill="#eff6ff" stroke="#0284c7" strokeWidth="3" />
            <text x="0" y="6" textAnchor="middle" fontSize="15">🛡️</text>
            <rect x="-85" y="30" width="170" height="34" rx="4" fill="#ffffff" stroke="#0284c7" strokeWidth="1.5" />
            <text x="0" y="44" textAnchor="middle" fontSize="10" fontWeight="800" fill="#0369a1">Biometric Passkey Challenge</text>
            <text x="0" y="56" textAnchor="middle" fontSize="8" fill="#64748b">Saves customer from false decline</text>
          </g>
        </svg>
      </div>
    );
  }

  return null;
}

