import React, { useState } from 'react';
import { IconSliders, IconShield, IconCheck, IconAlert, IconBlock, IconMapPin } from './Icons';

export default function FPOInteractiveLab() {
  const [amount, setAmount] = useState(150);
  const [distanceKm, setDistanceKm] = useState(8950); // SF to Paris default
  const [deltaHours, setDeltaHours] = useState(14.0); // 14 hours flight
  const [isTrustedDevice, setIsTrustedDevice] = useState(true);
  const [isCrossBorder, setIsCrossBorder] = useState(true);
  const [passwordReset24h, setPasswordReset24h] = useState(false);
  const [isHouseholdIp, setIsHouseholdIp] = useState(false);

  // Real-time calculations
  const speedKmh = deltaHours > 0 ? distanceKm / deltaHours : 0;
  const impossibleTravel = speedKmh > 850 && distanceKm > 200;

  // Raw risk computation
  let rawRisk = 0.05;
  if (amount > 1000) rawRisk += 0.25;
  if (isCrossBorder) rawRisk += 0.35;
  if (!isTrustedDevice) rawRisk += 0.30;
  if (impossibleTravel) rawRisk += 0.60;
  if (passwordReset24h) rawRisk += 0.70;

  rawRisk = Math.min(0.99, rawRisk);

  // False-Positive Optimizer (FPO) evaluation
  let fpoApplied = false;
  let fpoReason = "";
  let finalRisk = rawRisk;
  let decision = "ALLOW";

  // Check ATO Critical Override
  if (passwordReset24h && (!isTrustedDevice || amount > 400)) {
    finalRisk = Math.max(0.85, rawRisk);
    decision = "BLOCK";
    fpoReason = "CRITICAL ATO DETECTED: Password reset in last 24h combined with unrecognized device / large drain.";
  }
  // Check Impossible Travel
  else if (impossibleTravel) {
    finalRisk = Math.max(0.80, rawRisk);
    decision = "BLOCK";
    fpoReason = "CRITICAL IMPOSSIBLE TRAVEL: Travel speed exceeds 850 km/h cruising ceiling.";
  }
  // Check FPO-1: Legitimate Cross-Border Traveler
  else if (isCrossBorder && !impossibleTravel && isTrustedDevice && !passwordReset24h) {
    fpoApplied = true;
    finalRisk = Math.min(0.32, rawRisk * 0.40);
    decision = amount > 300 ? "CHALLENGE" : "ALLOW";
    fpoReason = "FPO POLICY TRIGGERED: Traveler accessed from abroad using established trusted hardware with plausible flight velocity. Hard block suppressed.";
  }
  // Check FPO-2: Shared Household Residential IP
  else if (isHouseholdIp && isTrustedDevice && !passwordReset24h) {
    fpoApplied = true;
    finalRisk = Math.min(0.28, rawRisk * 0.50);
    decision = "ALLOW";
    fpoReason = "FPO POLICY TRIGGERED: Recognized shared residential IP subnet across separate physical personal devices.";
  }
  // Default Threshold Policy
  else {
    if (finalRisk >= 0.75) decision = "BLOCK";
    else if (finalRisk >= 0.35) decision = "CHALLENGE";
    else decision = "ALLOW";
  }

  return (
    <div className="fpo-lab-wrapper">
      <div className="lab-header">
        <div>
          <h2 className="section-title">Contextual False-Positive Optimization (FPO) Lab</h2>
          <p className="section-subtitle">Adjust parameters to see how contextual risk calibration protects legitimate travelers and family subnets.</p>
        </div>
        <div className="fpo-stats-badge">
          <span>Target False Positive Rate: <strong>&lt; 0.5%</strong></span>
        </div>
      </div>

      <div className="fpo-grid">
        {/* Interactive Controls Column */}
        <div className="fpo-controls-card">
          <h3 className="card-subtitle">Transaction Context Controls</h3>

          <div className="control-group">
            <div className="control-label-row">
              <span>Transaction Amount ($)</span>
              <strong className="text-cyan-400 font-mono">${amount}</strong>
            </div>
            <input
              type="range"
              min="10"
              max="3500"
              step="10"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="range-slider"
            />
          </div>

          <div className="control-group">
            <div className="control-label-row">
              <span>Geodesic Distance Traveled (km)</span>
              <strong className="text-cyan-400 font-mono">{distanceKm} km</strong>
            </div>
            <input
              type="range"
              min="0"
              max="12000"
              step="100"
              value={distanceKm}
              onChange={(e) => setDistanceKm(Number(e.target.value))}
              className="range-slider"
            />
          </div>

          <div className="control-group">
            <div className="control-label-row">
              <span>Time Elapsed Since Previous Event</span>
              <strong className="text-cyan-400 font-mono">{deltaHours} hours</strong>
            </div>
            <input
              type="range"
              min="0.2"
              max="24"
              step="0.2"
              value={deltaHours}
              onChange={(e) => setDeltaHours(Number(e.target.value))}
              className="range-slider"
            />
          </div>

          {/* Toggle Switches */}
          <div className="toggle-list">
            <label className="toggle-item">
              <span>Known Trusted Hardware Device</span>
              <input
                type="checkbox"
                checked={isTrustedDevice}
                onChange={(e) => setIsTrustedDevice(e.target.checked)}
              />
            </label>

            <label className="toggle-item">
              <span>Cross-Border / International Location</span>
              <input
                type="checkbox"
                checked={isCrossBorder}
                onChange={(e) => setIsCrossBorder(e.target.checked)}
              />
            </label>

            <label className="toggle-item">
              <span>Password Reset in Last 24 Hours</span>
              <input
                type="checkbox"
                checked={passwordReset24h}
                onChange={(e) => setPasswordReset24h(e.target.checked)}
              />
            </label>

            <label className="toggle-item">
              <span>Shared Household Wi-Fi Subnet</span>
              <input
                type="checkbox"
                checked={isHouseholdIp}
                onChange={(e) => setIsHouseholdIp(e.target.checked)}
              />
            </label>
          </div>
        </div>

        {/* Live Calculation & Gauge Column */}
        <div className="fpo-outcome-card">
          <h3 className="card-subtitle">Real-Time Risk Decision & FPO Calibration</h3>

          {/* Travel Speed Calculation Meter */}
          <div className="calc-stat-box">
            <div className="stat-row">
              <span className="stat-label">Calculated Travel Velocity:</span>
              <span className={`stat-val font-mono ${impossibleTravel ? 'text-red-400' : 'text-emerald-400'}`}>
                {speedKmh.toFixed(0)} km/h
              </span>
            </div>
            <div className="stat-sub">
              {impossibleTravel ? (
                <span className="text-red-400">🚨 Physical Impossibility (&gt; 850 km/h commercial jet speed ceiling)</span>
              ) : (
                <span className="text-muted">✓ Physically plausible travel velocity</span>
              )}
            </div>
          </div>

          {/* Risk Score Comparison: Raw vs Mitigated */}
          <div className="score-compare-grid">
            <div className="score-box">
              <span className="score-label">Raw Rule Risk:</span>
              <span className="score-num font-mono text-amber-400">{(rawRisk * 100).toFixed(0)}%</span>
            </div>
            <div className="score-box">
              <span className="score-label">FPO-Calibrated Score:</span>
              <span className="score-num font-mono text-emerald-400">{(finalRisk * 100).toFixed(0)}%</span>
            </div>
          </div>

          {/* Live Action Banner */}
          <div className={`action-banner ${decision.toLowerCase()}`}>
            <div className="banner-left">
              {decision === 'ALLOW' && <IconCheck className="w-6 h-6 text-emerald-400" />}
              {decision === 'CHALLENGE' && <IconAlert className="w-6 h-6 text-amber-400" />}
              {decision === 'BLOCK' && <IconBlock className="w-6 h-6 text-red-400" />}
              <div>
                <span className="banner-title">Final Policy Action: {decision}</span>
                <span className="banner-sub">
                  {decision === 'ALLOW' && 'Frictionless checkout (<30ms)'}
                  {decision === 'CHALLENGE' && 'Step-Up Auth required (Biometric Passkey)'}
                  {decision === 'BLOCK' && 'Immediate transaction termination & quarantine'}
                </span>
              </div>
            </div>
            {fpoApplied && <span className="fpo-badge-live">FPO PROTECTED</span>}
          </div>

          {/* Contextual Narrative */}
          <div className="fpo-reason-box">
            <strong>Contextual Analysis Justification:</strong>
            <p className="mt-1 text-xs text-muted leading-relaxed">
              {fpoReason || "All signals nominal. Risk score within standard automated approval threshold."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

