import React from 'react';

export const IconShield = ({ className = "w-5 h-5", color = "currentColor" }) => (
  <svg className={className} fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);
export const Shield = IconShield;

export const IconCpu = ({ className = "w-5 h-5", color = "currentColor" }) => (
  <svg className={className} fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24">
    <rect x="4" y="4" width="16" height="16" rx="2" />
    <rect x="9" y="9" width="6" height="6" />
    <path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 14h3M1 9h3M1 14h3" />
  </svg>
);
export const Cpu = IconCpu;

export const IconNetwork = ({ className = "w-5 h-5", color = "currentColor" }) => (
  <svg className={className} fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24">
    <rect x="16" y="16" width="6" height="6" rx="1" />
    <rect x="2" y="16" width="6" height="6" rx="1" />
    <rect x="9" y="2" width="6" height="6" rx="1" />
    <path d="M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3M12 12V8" />
  </svg>
);

export const IconLayers = ({ className = "w-5 h-5", color = "currentColor" }) => (
  <svg className={className} fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24">
    <polygon points="12 2 2 7 12 12 22 7 12 2" />
    <polyline points="2 17 12 22 22 17" />
    <polyline points="2 12 12 17 22 12" />
  </svg>
);

export const IconBrain = ({ className = "w-5 h-5", color = "currentColor" }) => (
  <svg className={className} fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24">
    <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-2.04z" />
    <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-2.04z" />
  </svg>
);

export const IconSliders = ({ className = "w-5 h-5", color = "currentColor" }) => (
  <svg className={className} fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24">
    <line x1="4" y1="21" x2="4" y2="14" />
    <line x1="4" y1="10" x2="4" y2="3" />
    <line x1="12" y1="21" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12" y2="3" />
    <line x1="20" y1="21" x2="20" y2="16" />
    <line x1="20" y1="12" x2="20" y2="3" />
    <line x1="1" y1="14" x2="7" y2="14" />
    <line x1="9" y1="8" x2="15" y2="8" />
    <line x1="17" y1="16" x2="23" y2="16" />
  </svg>
);

export const IconPlay = ({ className = "w-5 h-5", color = "currentColor" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <polygon points="5 3 19 12 5 21 5 3" />
  </svg>
);
export const Play = IconPlay;

export const IconRefresh = ({ className = "w-5 h-5", color = "currentColor" }) => (
  <svg className={className} fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24">
    <polyline points="23 4 23 10 17 10" />
    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
  </svg>
);
export const RefreshCw = IconRefresh;

export const IconCheck = ({ className = "w-5 h-5", color = "#10b981" }) => (
  <svg className={className} fill="none" stroke={color} strokeWidth="2.5" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);
export const CheckCircle = IconCheck;

export const IconAlert = ({ className = "w-5 h-5", color = "#f59e0b" }) => (
  <svg className={className} fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);
export const AlertTriangle = IconAlert;

export const IconBlock = ({ className = "w-5 h-5", color = "#ef4444" }) => (
  <svg className={className} fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24" style={{ maxWidth: '100%', maxHeight: '100%', display: 'inline-block' }}>
    <circle cx="12" cy="12" r="10" />
    <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
  </svg>
);
export const XCircle = IconBlock;

export const IconArrowRight = ({ className = "w-5 h-5", color = "currentColor" }) => (
  <svg className={className} fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);
export const ArrowRight = IconArrowRight;

export const IconMapPin = ({ className = "w-5 h-5", color = "currentColor" }) => (
  <svg className={className} fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

export const IconDatabase = ({ className = "w-5 h-5", color = "currentColor" }) => (
  <svg className={className} fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24">
    <ellipse cx="12" cy="5" rx="9" ry="3" />
    <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
    <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
  </svg>
);

export const IconZap = ({ className = "w-5 h-5", color = "currentColor" }) => (
  <svg className={className} fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

export const Activity = ({ className = "w-5 h-5", color = "currentColor" }) => (
  <svg className={className} fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </svg>
);
