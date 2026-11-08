import React, { useState } from 'react';
import { IconDatabase, IconZap, IconShield } from './Icons';

export default function SchemaAndContractsViewer() {
  const [activeTab, setActiveTab] = useState('events');

  const paymentEventJson = `{
  "event_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
  "event_type": "PAYMENT",
  "timestamp": 1714856000.42,
  "account_id": "ACC_ALICE_101",
  "customer_id": "CUST_ALICE",
  "device": {
    "device_id": "DEV_ALICE_IPHONE_15",
    "os": "iOS 17.4",
    "browser": "Mobile Safari",
    "is_emulator": false,
    "is_vpn_or_proxy": false
  },
  "location": {
    "ip_address": "195.154.122.80",
    "country": "FR",
    "city": "Paris",
    "latitude": 48.8566,
    "longitude": 2.3522
  },
  "amount": 145.00,
  "currency": "EUR",
  "merchant_id": "LE_BISTROT_PARIS",
  "merchant_category": "dining",
  "payment_instrument_id": "CARD_ALICE_VISA_9812",
  "channel": "MOBILE_APP"
}`;

  const decisionResponseJson = `{
  "event_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
  "account_id": "ACC_ALICE_101",
  "decision": "ALLOW",
  "risk_score": 0.02,
  "ml_risk_score": 0.04,
  "graph_risk_score": 0.00,
  "behavioral_risk_score": 0.12,
  "rule_risk_score": 0.00,
  "primary_category": "BENIGN",
  "factors": [],
  "narrative_explanation": "Transaction allowed under False Positive Optimization policy. Contextual travel recognized: Trusted device and physically plausible travel velocity.",
  "false_positive_mitigation_applied": true,
  "false_positive_reason": "Contextual travel recognized: Trusted device and physically plausible travel velocity.",
  "processing_latency_ms": 18.4,
  "timestamp": 1714856000.42
}`;

  return (
    <div className="schemas-wrapper">
      <div className="schemas-header">
        <div>
          <h2 className="section-title">Data Schemas & API Contracts</h2>
          <p className="section-subtitle">Strict technical contracts powering the ingestion pipeline, graph serialization, and XAI responses.</p>
        </div>
        <div className="schema-tabs">
          <button className={`schema-tab ${activeTab === 'events' ? 'active' : ''}`} onClick={() => setActiveTab('events')}>
            Multi-Modal Event Ingestion
          </button>
          <button className={`schema-tab ${activeTab === 'response' ? 'active' : ''}`} onClick={() => setActiveTab('response')}>
            Real-Time Decision Contract
          </button>
        </div>
      </div>

      <div className="schema-card">
        <div className="schema-top">
          <span className="schema-title">
            {activeTab === 'events' ? 'POST /api/v1/events/ingest (PaymentEvent Payload)' : 'HTTP 200 OK — Synchronous RiskAssessment Response'}
          </span>
          <span className="schema-format">JSON Schema / OpenAPI 3.1</span>
        </div>
        <pre className="code-block">
          <code>{activeTab === 'events' ? paymentEventJson : decisionResponseJson}</code>
        </pre>
      </div>
    </div>
  );
}

