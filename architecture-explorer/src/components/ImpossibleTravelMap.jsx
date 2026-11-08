import React from 'react';

export default function ImpossibleTravelMap({ 
  originCity = "San Francisco, USA",
  destCity = "London, UK",
  timeDiffMinutes = 20,
  distanceKm = 8620,
  calculatedSpeed = 25860,
  maxAllowedSpeed = 850
}) {
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
          <span style={{
            fontSize: '0.7rem',
            fontWeight: 800,
            textTransform: 'uppercase',
            color: '#e11d48',
            backgroundColor: '#ffe4e6',
            border: '1px solid #fecdd3',
            padding: '0.2rem 0.5rem',
            borderRadius: '4px'
          }}>
            GEODESIC ANOMALY DETECTED
          </span>
          <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: '0.35rem 0 0 0' }}>
            Impossible Travel Geodesic Map (USA ➔ UK)
          </h4>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>Calculated Speed</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#e11d48' }}>
            {calculatedSpeed.toLocaleString()} km/h
          </div>
          <div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>Max Aviation Limit: {maxAllowedSpeed} km/h</div>
        </div>
      </div>

      {/* SVG Map Canvas */}
      <div style={{
        position: 'relative',
        backgroundColor: '#f8fafc',
        border: '1px solid #cbd5e1',
        borderRadius: '10px',
        overflow: 'hidden',
        padding: '10px 0'
      }}>
        <svg viewBox="0 0 800 320" style={{ width: '100%', height: 'auto', display: 'block' }}>
          <defs>
            {/* Gradients */}
            <linearGradient id="oceanGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#f1f5f9" />
              <stop offset="100%" stopColor="#e2e8f0" />
            </linearGradient>
            <linearGradient id="flightLineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0284c7" />
              <stop offset="50%" stopColor="#f43f5e" />
              <stop offset="100%" stopColor="#e11d48" />
            </linearGradient>
            <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000000" floodOpacity="0.15" />
            </filter>
          </defs>

          {/* Ocean Background */}
          <rect width="800" height="320" fill="url(#oceanGrad)" />

          {/* Simplified Continental Outlines */}
          {/* North America */}
          <path d="M 80,60 Q 140,40 220,50 Q 280,70 290,120 Q 270,180 230,220 Q 170,240 120,200 Q 70,140 80,60 Z" 
                fill="#cbd5e1" stroke="#94a3b8" strokeWidth="1.5" opacity="0.6" />
          {/* Europe & UK */}
          <path d="M 500,70 Q 560,50 640,60 Q 690,100 670,160 Q 610,200 550,190 Q 480,160 500,70 Z" 
                fill="#cbd5e1" stroke="#94a3b8" strokeWidth="1.5" opacity="0.6" />
          {/* British Isles */}
          <path d="M 520,90 Q 535,80 545,95 Q 540,120 525,125 Q 515,110 520,90 Z" 
                fill="#94a3b8" stroke="#64748b" strokeWidth="1.5" />

          {/* Flight Path (Great Circle Arc) */}
          {/* SF: (140, 150) -> London: (535, 105) */}
          <path d="M 140,150 Q 320,30 535,105" 
                fill="none" 
                stroke="url(#flightLineGrad)" 
                strokeWidth="3.5" 
                strokeDasharray="6 4" />

          {/* Animated Travel Marker */}
          <circle cx="337" cy="67" r="6" fill="#e11d48" filter="url(#shadow)">
            <animate attributeName="opacity" values="1;0.4;1" dur="1.2s" repeatCount="indefinite" />
          </circle>

          {/* SF Device Node (USA) */}
          <g transform="translate(140, 150)" filter="url(#shadow)">
            <circle cx="0" cy="0" r="18" fill="#0284c7" />
            <circle cx="0" cy="0" r="7" fill="#ffffff" />
            <rect x="-80" y="24" width="160" height="48" rx="6" fill="#ffffff" stroke="#0284c7" strokeWidth="1.5" />
            <text x="0" y="42" textAnchor="middle" fill="#0f172a" fontSize="11" fontWeight="800">Device 1 (USA)</text>
            <text x="0" y="58" textAnchor="middle" fill="#64748b" fontSize="9" fontWeight="600">San Francisco &bull; 10:00 AM</text>
          </g>

          {/* London Device Node (UK) */}
          <g transform="translate(535, 105)" filter="url(#shadow)">
            <circle cx="0" cy="0" r="18" fill="#e11d48">
              <animate attributeName="r" values="18;23;18" dur="1.5s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="1;0.8;1" dur="1.5s" repeatCount="indefinite" />
            </circle>
            <circle cx="0" cy="0" r="7" fill="#ffffff" />
            <rect x="-85" y="24" width="170" height="48" rx="6" fill="#ffffff" stroke="#e11d48" strokeWidth="1.5" />
            <text x="0" y="42" textAnchor="middle" fill="#991b1b" fontSize="11" fontWeight="800">Device 2 (UK)</text>
            <text x="0" y="58" textAnchor="middle" fill="#dc2626" fontSize="9" fontWeight="700">London &bull; 10:20 AM (+20m)</text>
          </g>

          {/* Central Diagnostic Callout */}
          <g transform="translate(400, 260)" filter="url(#shadow)">
            <rect x="-170" y="-30" width="340" height="60" rx="8" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.5" />
            <text x="0" y="-10" textAnchor="middle" fill="#0f172a" fontSize="11" fontWeight="800">
              PHYSICAL TRAVEL BREACH: 8,620 km in 20 Minutes
            </text>
            <text x="0" y="10" textAnchor="middle" fill="#e11d48" fontSize="10" fontWeight="700">
              Required Speed: 25,860 km/h (Commercial Jets fly at ~850 km/h)
            </text>
            <text x="0" y="22" textAnchor="middle" fill="#64748b" fontSize="9" fontWeight="500">
              Verdict: Immediate Pipeline Short-Circuit ➔ HARD BLOCK
            </text>
          </g>
        </svg>
      </div>

      {/* Metric Pills Under Map */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', marginTop: '0.85rem' }}>
        <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.5rem 0.75rem' }}>
          <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Origin Location</div>
          <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a' }}>{originCity}</div>
          <div style={{ fontSize: '0.7rem', color: '#0284c7', fontWeight: 600 }}>Known Hardware (Home IP)</div>
        </div>

        <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.5rem 0.75rem' }}>
          <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Destination Location</div>
          <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a' }}>{destCity}</div>
          <div style={{ fontSize: '0.7rem', color: '#e11d48', fontWeight: 600 }}>Unfamiliar Device (Foreign IP)</div>
        </div>

        <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.5rem 0.75rem' }}>
          <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Elapsed Time Interval</div>
          <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a' }}>{timeDiffMinutes} Minutes</div>
          <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>Minimum flight time: ~10.5 hrs</div>
        </div>

        <div style={{ backgroundColor: '#fff1f2', border: '1px solid #fecdd3', borderRadius: '8px', padding: '0.5rem 0.75rem' }}>
          <div style={{ fontSize: '0.65rem', color: '#9f1239', fontWeight: 700, textTransform: 'uppercase' }}>Engine Reaction</div>
          <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#e11d48' }}>Stage 2 Block</div>
          <div style={{ fontSize: '0.7rem', color: '#be123c', fontWeight: 600 }}>FPO Mitigation Denied</div>
        </div>
      </div>
    </div>
  );
}

