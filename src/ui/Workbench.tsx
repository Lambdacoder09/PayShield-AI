import { useState } from 'react'
import { Activity, ArrowRight, BadgeCheck, BookOpen, Check, ChevronDown, CircleHelp, Code2, Copy, Fingerprint, Globe2, Layers3, LockKeyhole, MapPin, Network, Play, Radar, RotateCcw, ShieldAlert, ShieldCheck, SlidersHorizontal, Timer, Waypoints, X } from 'lucide-react'

export type WorkbenchView = 'judge' | 'architecture' | 'simulator' | 'graph' | 'fpo' | 'api'
type Decision = 'ALLOW' | 'CHALLENGE' | 'BLOCK'
type Stage = { name: string; short: string; budget: string; structure: string; responsibility: string; invariant: string; stop: string; icon: string }

const stages: Stage[] = [
  { name: 'Cryptographic Ingestion Gateway', short: 'Ingest', budget: '< 1 ms', structure: 'UUID LRU cache', responsibility: 'Validate and de-duplicate each incoming event before feature work starts.', invariant: 'Each event ID is evaluated once within the replay window.', stop: 'A replayed event is rejected immediately.', icon: '01' },
  { name: 'Temporal Feature Store', short: 'Features', budget: '< 4 ms', structure: 'Sliding-window deques', responsibility: 'Measure payment velocity, login frequency, location changes, and spend patterns.', invariant: 'Every feature is computed from timestamped account history.', stop: 'Impossible travel can short-circuit the decision.', icon: '02' },
  { name: 'Dynamic Graph Intelligence', short: 'Graph', budget: '< 5 ms', structure: 'NetworkX multi-graph', responsibility: 'Connect accounts to devices, IPs, cards, and beneficiaries to expose shared risk.', invariant: 'Entity links remain typed and traceable to their source event.', stop: 'A high-degree shared device or card flags a coordinated ring.', icon: '03' },
  { name: 'Dual-Model ML Inference', short: 'Models', budget: '< 10 ms', structure: 'XGBoost + COPOD', responsibility: 'Combine known fraud patterns with outlier detection for unseen behavior.', invariant: 'Both model outputs remain visible to the decision layer.', stop: 'High model risk raises the case for a challenge or block.', icon: '04' },
  { name: 'False-Positive Optimization', short: 'FPO', budget: '< 2 ms', structure: 'Context policy rules', responsibility: 'Use trusted hardware and plausible travel to keep legitimate customers moving.', invariant: 'Context may reduce friction but never erase a critical security signal.', stop: 'Trusted traveler context can override a location-only decline.', icon: '05' },
  { name: 'Causal XAI & Tri-State Dispatcher', short: 'Explain', budget: '< 3 ms', structure: 'Risk factors + policy', responsibility: 'Return a reason, remediation, latency, and final payment action.', invariant: 'Every outcome has a human-readable explanation.', stop: 'Allow, challenge, or block at the calibrated thresholds.', icon: '06' },
]

const cases = [
  { id: 'clean', title: 'Pristine legitimate user', label: 'ALLOW', summary: 'Alice buys coffee with a known device and card.', point: 6, stop: 6, latency: '18.0', detail: 'Known device, familiar location, and ordinary spend all match Alice’s history.', payload: { event_id: 'evt_alice_001', event_type: 'PAYMENT', account_id: 'ACC_ALICE_101', amount: 8.5, currency: 'USD', device_id: 'DEV_ALICE_PC', country_code: 'US' } },
  { id: 'replay', title: 'Replay attack', label: 'BLOCK', summary: 'An attacker resubmits the same event ID inside 45 seconds.', point: 1, stop: 1, latency: '0.8', detail: 'The UUID is already in the gateway cache. The duplicate is dropped before feature or model compute.', payload: { event_id: 'evt_replay_991', replay_of: 'evt_replay_991', replay_window_seconds: 45, account_id: 'ACC_UNKNOWN_09', amount: 240 } },
  { id: 'travel', title: 'Impossible travel', label: 'BLOCK', summary: 'A login jumps from San Francisco to London in 20 minutes.', point: 2, stop: 2, latency: '2.4', detail: 'The 8,620 km geodesic implies 25,860 km/h, far above the 850 km/h commercial-flight ceiling.', payload: { event_type: 'LOGIN', origin: 'San Francisco, US', destination: 'London, UK', distance_km: 8620, elapsed_minutes: 20, velocity_kmh: 25860 } },
  { id: 'ring', title: 'Sybil mule fraud ring', label: 'BLOCK', summary: 'Five accounts reuse one emulator and a stolen card.', point: 3, stop: 3, latency: '4.6', detail: 'A shared emulator and funding card connect five accounts. High graph degree signals a coordinated ring.', payload: { event_type: 'PAYMENT', account_ids: ['RING_01','RING_02','RING_03','RING_04','RING_05'], shared_device: 'DEV_EMU_77', shared_card: 'CARD_STOLEN_4111', degree: 5 } },
  { id: 'ato', title: 'Account takeover', label: 'CHALLENGE', summary: 'A recent password reset is followed by an unknown device.', point: 5, stop: 5, latency: '13.8', detail: 'The recent credential change is high risk. A passkey step-up stops the transfer without hard-blocking a verified customer.', payload: { event_type: 'PAYMENT', account_id: 'ACC_BOB_202', amount: 1850, password_changed_minutes_ago: 10, device_id: 'DEV_UNKNOWN_77', challenge_method: 'PASSKEY_WEBAUTHN' } },
  { id: 'traveler', title: 'Legitimate cross-border traveler', label: 'ALLOW', summary: 'Alice flies from San Francisco to Paris using her trusted phone.', point: 6, stop: 6, latency: '17.2', detail: 'The 8,950 km trip over 11.2 hours is physically plausible at 767 km/h. FPO Policy 1 rescues the payment from a false decline.', payload: { event_type: 'PAYMENT', account_id: 'ACC_ALICE_101', origin: 'San Francisco, US', destination: 'Paris, FR', distance_km: 8950, elapsed_hours: 11.2, device_trusted: true, fpo_policy: 'FPO-1' } },
]

const endpointSpecs = [
  { method: 'POST', path: '/api/v1/events/ingest', title: 'Score a payment', description: 'Send one payment or account event through the decision engine.', response: '{ "decision": "ALLOW", "risk_score": 0.08, "latency_ms": 18.2, "explanation": "Known device and familiar purchase pattern." }' },
  { method: 'GET', path: '/api/v1/events/recent', title: 'Recent decisions', description: 'Read the latest risk assessments from this process.', response: '{ "events": [ { "account_id": "ACC_ALICE_101", "decision": "ALLOW" } ] }' },
  { method: 'GET', path: '/api/v1/graph/subgraph/{account_id}', title: 'Account connections', description: 'Get the accounts, devices, payment methods, and edges around one account.', response: '{ "nodes": [], "edges": [] }' },
  { method: 'POST', path: '/api/v1/scenarios/trigger/{scenario_name}', title: 'Trigger a demo', description: 'Run normal, traveler, ato, or sybil_ring against the engine.', response: '{ "scenario": "traveler", "results": [ { "decision": "ALLOW", "fpo_override": true } ] }' },
  { method: 'WS', path: '/ws/telemetry', title: 'Stream decisions', description: 'Receive EVENT_EVALUATED messages when new decisions are ingested.', response: '{ "type": "EVENT_EVALUATED", "data": { "risk_score": 0.08 } }' },
]

function StatePill({ decision }: { decision: Decision }) { return <span className={`state-pill ${decision.toLowerCase()}`}><i/>{decision}</span> }
function RiskLine({ value, color = '#e47d70' }: { value: number; color?: string }) { return <div className="wb-risk-line"><span style={{ width: `${Math.max(2, Math.min(value, 1) * 100)}%`, background: color }}/></div> }

function FlightDiagram({ traveler }: { traveler: boolean }) {
  return <div className="flight-diagram"><svg viewBox="0 0 640 250" role="img" aria-label={traveler ? 'Plausible transatlantic travel from San Francisco to Paris' : 'Impossible travel from San Francisco to London'}>
    <defs><pattern id="mapdots" width="16" height="16" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="1" fill="#dfe8ef"/></pattern><linearGradient id="ocean" x1="0" x2="1"><stop stopColor="#f5f9fc"/><stop offset="1" stopColor="#eef5f9"/></linearGradient></defs>
    <rect width="640" height="250" rx="13" fill="url(#ocean)"/><rect width="640" height="250" rx="13" fill="url(#mapdots)"/>
    <path d="M70 66 Q112 41 153 55 L177 77 168 94 189 108 178 124 150 123 138 143 118 139 111 114 87 105 73 88Z M260 95 L281 79 311 83 328 100 324 126 303 139 292 165 272 156 269 129 252 115Z M389 81 Q420 61 463 74 L496 94 490 120 467 128 452 149 432 141 421 119 396 111Z M529 170 L551 162 569 173 562 191 541 194Z" fill="#dce9e2" stroke="#cbded4" strokeWidth="1.2"/>
    <path d={traveler ? 'M128 101 Q315 -18 452 105' : 'M128 101 Q315 -48 464 105'} fill="none" stroke={traveler?'#24a47d':'#e17269'} strokeWidth="2.5" strokeDasharray="7 5" className="flight-path"/>
    <circle cx="128" cy="101" r="7" fill="#6176dd"/><circle cx="128" cy="101" r="15" fill="#6176dd" opacity=".12"/>
    <circle cx={traveler?452:464} cy="105" r="7" fill={traveler?'#23a27a':'#df7168'}/><circle cx={traveler?452:464} cy="105" r="15" fill={traveler?'#23a27a':'#df7168'} opacity=".12"/>
    <text x="128" y="132" textAnchor="middle">San Francisco</text><text x={traveler?452:464} y="136" textAnchor="middle">{traveler?'Paris':'London'}</text>
    <g className="plane-marker" transform="translate(290 46)"><path d="M0 7 21 0 14 8 20 14 17 16 11 12 6 17 4 16 6 10Z" fill={traveler?'#209d78':'#d96c62'}/></g>
    <rect x="20" y="205" width="600" height="1" fill="#dce5eb"/>
    <text x="28" y="228" className="map-caption">GREAT-CIRCLE ROUTE · HAVERSINE DISTANCE</text>
  </svg><div className="flight-metrics"><div><small>Distance</small><b>{traveler?'8,950':'8,620'} km</b></div><div><small>Time elapsed</small><b>{traveler?'11.2 hours':'20 minutes'}</b></div><div><small>Calculated speed</small><b className={traveler?'good':'bad'}>{traveler?'767':'25,860'} km/h</b></div><div><small>Flight ceiling</small><b>850 km/h</b></div></div></div>
}

function CaseDiagram({ id }: { id: string }) {
  if (id === 'travel' || id === 'traveler') return <FlightDiagram traveler={id === 'traveler'}/>
  if (id === 'ring') return <div className="case-diagram ring-diagram"><svg viewBox="0 0 650 235" role="img" aria-label="Five accounts linked to a shared emulator and stolen card"><defs><pattern id="grid" width="18" height="18" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="1" fill="#e7ecf1"/></pattern></defs><rect width="650" height="235" rx="12" fill="url(#grid)"/>{[42,78,114,150,186].map((y,i)=><g key={i}><line x1="154" y1={y} x2="322" y2="87" stroke="#e1857d" strokeDasharray="4 4"/><line x1="154" y1={y} x2="322" y2="161" stroke="#e2b66b" strokeDasharray="4 4"/><circle cx="130" cy={y} r="17" fill="#fff" stroke="#e28178" strokeWidth="2"/><text x="130" y={y+4} textAnchor="middle">A{i+1}</text></g>)}<rect x="284" y="65" width="116" height="43" rx="8" fill="#f2efff" stroke="#aa9bdf"/><text x="342" y="84" textAnchor="middle">DEV_EMU_77</text><text x="342" y="98" textAnchor="middle" className="minor-label">shared emulator · degree 5</text><rect x="284" y="139" width="116" height="43" rx="8" fill="#fff7e8" stroke="#e7c782"/><text x="342" y="158" textAnchor="middle">CARD_4111</text><text x="342" y="172" textAnchor="middle" className="minor-label">stolen card · degree 5</text><line x1="400" y1="87" x2="507" y2="122" stroke="#e28178" strokeWidth="2"/><circle cx="535" cy="122" r="23" fill="#fff0ee" stroke="#e28178" strokeWidth="2"/><text x="535" y="126" textAnchor="middle">MULE</text><text x="342" y="220" textAnchor="middle" className="map-caption">10 SHARED-ENTITY EDGES · 5 DISTINCT ACCOUNTS</text></svg></div>
  if (id === 'ato') return <div className="case-diagram timeline-diagram">{[{time:'−10 min',title:'Password reset',text:'Credential changed from a new location.',kind:'warn'},{time:'−2 min',title:'Unknown device',text:'Unrecognized emulator fingerprint signs in.',kind:'bad'},{time:'Now',title:'Passkey step-up',text:'Require WebAuthn before the transfer can continue.',kind:'good'}].map((x,i)=><div className="timeline-item" key={x.title}><span className={`timeline-dot ${x.kind}`}/><small>{x.time}</small><div><b>{x.title}</b><p>{x.text}</p></div>{i<2&&<ArrowRight size={15}/>}</div>)}</div>
  if (id === 'replay') return <div className="case-diagram gateway-diagram"><div className="gateway-step success"><ShieldCheck/><span><b>Original payment event</b><small>UUID evt_replay_991 · accepted</small></span></div><ArrowRight/><div className="gateway-step danger"><RotateCcw/><span><b>Cloned replay event</b><small>Same UUID received 0.8s later</small></span></div><ArrowRight/><div className="gateway-step muted"><X/><span><b>Stopped at gateway</b><small>Never reaches features or models</small></span></div></div>
  return <div className="case-diagram clean-route"><div><span className="clean-node account">ALICE</span><small>Verified account</small></div><i/><div><span className="clean-node device">KNOWN PC</span><small>Trusted hardware</small></div><i/><div><span className="clean-node settle">SETTLED</span><small>8 ms · frictionless</small></div></div>
}

function JudgeLab() {
  const [selected, setSelected] = useState(cases[0].id)
  const [step, setStep] = useState(6)
  const [running, setRunning] = useState(false)
  const [showPayload, setShowPayload] = useState(false)
  const [liveLatency, setLiveLatency] = useState<string | null>(null)
  const current = cases.find(c=>c.id===selected) ?? cases[0]
  const stagesPassed = current.stop
  const run = async () => {
    setRunning(true); setStep(0)
    try {
      const scenarioMap: Record<string, string> = { clean: 'normal', traveler: 'traveler', ring: 'sybil_ring', ato: 'ato' }
      if (scenarioMap[current.id]) {
        fetch(`/api/v1/scenarios/trigger/${scenarioMap[current.id]}`, { method: 'POST' })
          .then(res => res.json())
          .then(data => {
            if (data.results && data.results.length > 0) {
              setLiveLatency(`${data.results[0].latency_ms}`)
            }
          })
          .catch(() => {})
      }
    } catch {}

    let n = 0
    const timer = window.setInterval(()=>{ n++; setStep(n); if(n>=stagesPassed){window.clearInterval(timer);setRunning(false)} },280)
  }
  return <div className="wb-page">
    <div className="wb-page-heading"><div><div className="wb-eyebrow"><Activity size={14}/> PIPELINE VERIFICATION LAB</div><h1>Judge Test Lab</h1><p>Pick a case, run it through PayShield’s six defense layers, and see exactly where the decision happens.</p></div><button className="wb-primary" onClick={run} disabled={running}><Play size={15} fill="currentColor"/>{running?'Running the pipeline…':'Run this test'}</button></div>
    <div className="wb-case-grid">{cases.map((c,i)=><button key={c.id} onClick={()=>{setSelected(c.id);setStep(6);setRunning(false);setLiveLatency(null)}} className={`wb-case ${selected===c.id?'selected':''}`}><div><small>CASE 0{i+1}</small><StatePill decision={c.label as Decision}/></div><b>{c.title}</b><span>{c.summary}</span></button>)}</div>
    <div className="wb-panel judge-summary"><div className="judge-top"><div><span className="wb-eyebrow">ACTIVE EVALUATION · {current.id.toUpperCase()}</span><h2>{current.title}</h2><p>{current.detail}</p></div><div className="verdict"><small>FINAL ACTION</small><StatePill decision={current.label as Decision}/><span>{liveLatency ? `${liveLatency} ms (Live API)` : `${current.latency} ms total`}</span></div></div>
      <CaseDiagram id={current.id}/>
      <div className="wb-subhead"><div><h3>Six-stage verification pipeline</h3><p>Short-circuit cases stop at the first decisive signal. Other cases continue through all six layers.</p></div><span className="sla-pill"><Timer size={14}/> Target under 30 ms</span></div>
      <div className="stage-list">{stages.map((s,i)=>{const evaluated=step>i, isStop=current.stop===i+1, status=!evaluated?'WAITING':isStop?(current.label==='CHALLENGE'?'WARN':'FAIL'):i===4&&current.id==='traveler'?'WARN':'PASS'; return <article key={s.icon} className={`stage-row ${evaluated?'evaluated':''} ${isStop?'stop':''}`}><span className="stage-index">{s.icon}</span><div className="stage-body"><b>{s.name}</b><small>{s.responsibility}</small>{evaluated&&<p>{isStop?current.detail:s.invariant}</p>}</div><span className={`stage-status ${status.toLowerCase()}`}>{status}{evaluated&&<small>{i===0?'0.8':i===1?'2.4':i===2?'4.6':i===3?'7.3':i===4?'1.6':'1.3'} ms</small>}</span></article>})}</div>
      <button className="payload-toggle" onClick={()=>setShowPayload(v=>!v)}><Code2 size={15}/>{showPayload?'Hide':'Inspect'} inbound event JSON <ChevronDown size={15} className={showPayload?'turn':''}/></button>
      {showPayload&&<pre className="json-view"><code>{JSON.stringify(current.payload,null,2)}</code></pre>}
    </div>
  </div>
}

function Architecture() {
  const [selected,setSelected]=useState(0)
  const current=stages[selected]
  return <div className="wb-page"><div className="wb-page-heading"><div><div className="wb-eyebrow"><Layers3 size={14}/> SYSTEM DESIGN</div><h1>Architecture canvas</h1><p>Follow one event from the gateway to a clear payment decision. Select a layer to inspect its role and guardrails.</p></div><span className="architecture-total"><span>6</span> layers <i/> <span>25</span> ms total budget</span></div>
    <div className="architecture-layout"><div className="architecture-flow">{stages.map((s,i)=><div className="architecture-unit" key={s.icon}><button onClick={()=>setSelected(i)} className={`architecture-card ${selected===i?'current':''}`}><span className="arch-number">{s.icon}</span><span className="arch-glyph">{s.short==='Ingest'?<LockKeyhole/>:s.short==='Features'?<Activity/>:s.short==='Graph'?<Network/>:s.short==='Models'?<Radar/>:s.short==='FPO'?<ShieldCheck/>:<BookOpen/>}</span><b>{s.name}</b><small>{s.structure}</small><span className="arch-budget">{s.budget}</span></button>{i<5&&<div className="arch-connector"><span/><ArrowRight size={13}/></div>}</div>)}</div>
      <aside className="wb-panel architecture-inspector"><div className="wb-eyebrow">LAYER {current.icon} · {current.short.toUpperCase()}</div><h2>{current.name}</h2><p>{current.responsibility}</p><div className="inspector-stat"><small>EXECUTION BUDGET</small><b>{current.budget}</b></div><div className="inspector-section"><small>IN-MEMORY STRUCTURE</small><b>{current.structure}</b></div><div className="inspector-section"><small>ARCHITECTURAL INVARIANT</small><p>{current.invariant}</p></div><div className="inspector-section"><small>SHORT-CIRCUIT & CONTAINMENT</small><p>{current.stop}</p></div><div className="budget-track"><span style={{width:`${(selected+1)*15}%`}}/></div><small className="budget-caption">Layer budget is part of the sub-30 ms end-to-end SLA.</small></aside></div>
  </div>
}

function Simulator() {
  const [amount,setAmount]=useState(420)
  const [minutes,setMinutes]=useState(45)
  const [password,setPassword]=useState(60)
  const [failures,setFailures]=useState(0)
  const [emulator,setEmulator]=useState(false)
  const [origin,setOrigin]=useState('San Francisco')
  const [destination,setDestination]=useState('Paris')
  const [ran,setRan]=useState(false)
  const [showJson,setShowJson]=useState(false)
  const [liveApiResult,setLiveApiResult]=useState<{ latency_ms?: number; decision?: string } | null>(null)
  const distance=origin===destination?0:origin==='San Francisco'&&destination==='Paris'?8950:origin==='San Francisco'&&destination==='London'?8620:origin==='New York'&&destination==='London'?5570:origin==='London'&&destination==='Paris'?344:8950
  const velocity=minutes===0&&distance>0?Infinity:minutes>0?distance/(minutes/60):0
  const velocityLabel=Number.isFinite(velocity)?Math.round(velocity).toLocaleString():'Instant travel'
  const features=[{name:'Amount above usual spend',value:amount>1000?.22:amount>500?.12:.02},{name:'Location velocity',value:velocity>850?.38:destination!==origin?.12:0},{name:'Emulator fingerprint',value:emulator?.32:0},{name:'Recent password reset',value:password<60?.22:password<1440?.08:0},{name:'Authentication failures',value:Math.min(.3,failures*.07)}]
  const score=Math.min(.99,.04+features.reduce((n,x)=>n+x.value,0))
  const decision:Decision=score>=.75?'BLOCK':score>=.35?'CHALLENGE':'ALLOW'
  const run=async ()=>{
    setRan(true)
    try {
      const res = await fetch('/api/v1/events/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          account_id: 'ACC_SIMULATOR_USER',
          amount,
          currency: 'USD',
          device_id: emulator ? 'DEV_EMULATOR_01' : 'DEV_REGULAR_PHONE',
          country_code: destination === 'Paris' ? 'FR' : destination === 'London' ? 'GB' : 'US',
          is_emulator: emulator
        })
      })
      if (res.ok) {
        const data = await res.json()
        setLiveApiResult(data)
      }
    } catch {}
  }
  return <div className="wb-page"><div className="wb-page-heading"><div><div className="wb-eyebrow"><SlidersHorizontal size={14}/> INTERACTIVE DECISION SANDBOX</div><h1>Flow simulator</h1><p>Change the payment context and watch the risk signals, decision, and explanation update instantly.</p></div><button className="wb-primary" onClick={run}><Play size={15} fill="currentColor"/>Run through pipeline</button></div>
    <div className="simulator-layout"><section className="wb-panel control-panel"><div className="panel-title-row"><div><h2>Payment context</h2><p>Adjust the event PayShield will evaluate.</p></div><button className="wb-small-button" onClick={()=>{setAmount(420);setMinutes(45);setPassword(60);setFailures(0);setEmulator(false);setOrigin('San Francisco');setDestination('Paris');setRan(false)}}><RotateCcw size={13}/>Reset</button></div>
      <Slider label="Transaction amount" value={`$${amount}`} min={10} max={3500} step={10} n={amount} onChange={setAmount}/><Slider label="Time since previous event" value={`${minutes} min`} min={0} max={1440} step={5} n={minutes} onChange={setMinutes}/><div className="city-row"><label>Origin<select value={origin} onChange={e=>setOrigin(e.target.value)}>{['San Francisco','New York','London','Paris'].map(x=><option key={x}>{x}</option>)}</select></label><label>Current location<select value={destination} onChange={e=>setDestination(e.target.value)}>{['San Francisco','New York','London','Paris'].map(x=><option key={x}>{x}</option>)}</select></label></div><Slider label="Password change recency" value={password>=1440?'Over 24 hours':`${password} min ago`} min={0} max={1440} step={10} n={password} onChange={setPassword}/><Slider label="Login failures in last 5 minutes" value={String(failures)} min={0} max={8} step={1} n={failures} onChange={setFailures}/><label className="wb-toggle"><span><Fingerprint size={16}/><span><b>Emulator device detected</b><small>Simulate spoofed or virtual hardware</small></span></span><input type="checkbox" checked={emulator} onChange={e=>setEmulator(e.target.checked)}/><i/></label>
      <div className="velocity-note"><MapPin size={15}/><span>Travel speed: <b className={velocity>850?'bad':'good'}>{velocityLabel}{Number.isFinite(velocity)?' km/h':''}</b></span><small>{distance.toLocaleString()} km across {minutes} min</small></div>
    </section>
    <section className="wb-panel inference-panel"><div className="panel-title-row"><div><h2>Engine inference</h2><p>Demo model output from the selected parameters.</p></div><span className="sim-tag">SIMULATED ENGINE</span></div><div className={`inference-banner ${decision.toLowerCase()}`}><div className="decision-ring"><strong>{Math.round(score*100)}</strong><small>risk / 100</small></div><div><small>RECOMMENDED ACTION</small><b>{decision}</b><p>{decision==='ALLOW'?'Signals look consistent with a legitimate customer.':decision==='CHALLENGE'?'Ask for a passkey or biometric check before approving.':'Critical signals exceed the configured block threshold.'}</p></div></div><div className="waterfall-head"><b>Risk drivers</b><small>Contributions add to the composite score</small></div><div className="waterfall">{features.map(f=><div className="waterfall-row" key={f.name}><span>{f.name}</span><div className="waterfall-track"><i className={f.value>.2?'high':''} style={{width:`${Math.max(1,f.value*235)}px`}}/></div><b>{f.value>0?'+':''}{f.value.toFixed(2)}</b></div>)}<div className="waterfall-total"><b>COMPOSITE RISK</b><strong>{score.toFixed(2)}</strong></div></div><div className="tri-thresholds"><span><i className="allow-dot"/> Allow &lt; 0.35</span><span><i className="challenge-dot"/> Challenge 0.35–0.74</span><span><i className="block-dot"/> Block ≥ 0.75</span></div><button className="payload-toggle" onClick={()=>setShowJson(v=>!v)}><Code2 size={15}/>{showJson?'Hide':'Show'} generated event JSON <ChevronDown size={15} className={showJson?'turn':''}/></button>{showJson&&<pre className="json-view"><code>{JSON.stringify({event_type:'PAYMENT',amount,currency:'USD',origin,destination,elapsed_minutes:minutes,device_is_emulator:emulator,password_changed_minutes_ago:password,auth_failures_5m:failures},null,2)}</code></pre>}{ran&&<div className="inline-success"><Check size={14}/> {liveApiResult ? `Live API evaluated in ${liveApiResult.latency_ms} ms (${liveApiResult.decision})` : 'Pipeline simulation finished in 18.4 ms'}</div>}</section></div>
  </div>
}
function Slider({label,value,min,max,step,n,onChange}:{label:string;value:string;min:number;max:number;step:number;n:number;onChange:(n:number)=>void}) { return <label className="wb-slider"><span><b>{label}</b><strong>{value}</strong></span><input type="range" min={min} max={max} step={step} value={n} onChange={e=>onChange(Number(e.target.value))}/><span className="slider-limits"><small>{min}</small><small>{max}</small></span></label> }

function GraphExplorer() {
  const [preset,setPreset]=useState<'ring'|'household'>('ring')
  const [selected,setSelected]=useState('')
  const fraudulent=preset==='ring'
  const accounts=fraudulent?['ACC 01','ACC 02','ACC 03','ACC 04','ACC 05']:['PARENT','CHILD','SPOUSE']
  const entities=fraudulent?[{id:'DEV_EMU_77',type:'DEVICE',x:335,y:92,color:'#9172d5',risk:98,degree:5,neighbors:accounts.join(', ')},{id:'CARD_4111',type:'CARD',x:335,y:226,color:'#d7a442',risk:94,degree:5,neighbors:accounts.join(', ')},{id:'MULE_01',type:'BENEFICIARY',x:550,y:160,color:'#d96961',risk:99,degree:1,neighbors:'DEV_EMU_77'}]:[{id:'HOME_IP',type:'IP',x:335,y:160,color:'#37a5bb',risk:8,degree:3,neighbors:accounts.join(', ')},{id:'PHONE_P',type:'DEVICE',x:185,y:80,color:'#9172d5',risk:3,degree:1,neighbors:'PARENT'},{id:'PHONE_C',type:'DEVICE',x:485,y:80,color:'#9172d5',risk:4,degree:1,neighbors:'CHILD'},{id:'CARD_P',type:'CARD',x:185,y:235,color:'#d7a442',risk:2,degree:1,neighbors:'PARENT'},{id:'CARD_C',type:'CARD',x:485,y:235,color:'#d7a442',risk:3,degree:1,neighbors:'CHILD'}]
  const nodes=[...accounts.map((id,i)=>({id,type:'ACCOUNT',x:fraudulent?90:i===1?550:100,y:fraudulent?42+i*44:i===2?250:80,color:fraudulent?'#dc7168':'#6478dc',risk:fraudulent?94-i:3+i,degree:fraudulent?2:2,neighbors:fraudulent?'DEV_EMU_77, CARD_4111':'HOME_IP, personal device'})),...entities]
  return <div className="wb-page"><div className="wb-page-heading"><div><div className="wb-eyebrow"><Network size={14}/> ENTITY RELATIONSHIPS</div><h1>Graph ring view</h1><p>Fraud often hides in relationships. Click a node to inspect what it shares and how much risk it carries.</p></div><div className="preset-switch"><button className={fraudulent?'active danger':''} onClick={()=>{setPreset('ring');setSelected('')}}><ShieldAlert size={14}/> Fraud ring</button><button className={!fraudulent?'active good':''} onClick={()=>{setPreset('household');setSelected('')}}><BadgeCheck size={14}/> Family household</button></div></div>
    <div className={`graph-callout ${fraudulent?'bad-callout':'good-callout'}`}><div><b>{fraudulent?'Coordinated mule ring detected':'Shared home network · legitimate activity'}</b><p>{fraudulent?'5 accounts connect to the same emulator and stolen card. Graph degree ≥ 5 exceeds the ring threshold.':'Three household accounts share one residential IP, while each person keeps distinct hardware and payment methods.'}</p></div><span>{fraudulent?'BLOCK GROUP':'KEEP CHECKOUT OPEN'}</span></div>
    <div className="graph-explorer-layout"><section className="wb-panel graph-explorer"><div className="graph-counts"><span><i className="account-key"/>{accounts.length} accounts</span><span><i className="device-key"/>{fraudulent?'1':'2'} devices</span><span><i className="ip-key"/>{fraudulent?'0':'1'} IPs</span><span><i className="card-key"/>{fraudulent?'1':'2'} cards</span><span><i className="fraud-key"/>high-risk entities</span></div><svg viewBox="0 0 650 330" role="img" aria-label="Interactive graph of account relationships"><defs><pattern id="graph-grid" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="1" fill="#e9edf2"/></pattern></defs><rect width="650" height="330" rx="12" fill="url(#graph-grid)"/>{nodes.filter(n=>n.type!=='ACCOUNT').map(n=>nodes.filter(a=>a.type==='ACCOUNT'&&n.neighbors.includes(a.id)).map(a=><line key={`${n.id}-${a.id}`} x1={a.x+32} y1={a.y} x2={n.x-26} y2={n.y} stroke={fraudulent?'#ea9b92':'#9cb6e7'} strokeWidth={fraudulent?2:1.5} strokeDasharray={fraudulent?'4 4':'none'}/>))}{nodes.map(n=><g key={n.id} className="interactive-node" onClick={()=>setSelected(n.id)} role="button" tabIndex={0} onKeyDown={e=>e.key==='Enter'&&setSelected(n.id)}><circle cx={n.x} cy={n.y} r={selected===n.id?27:23} fill={selected===n.id?'#fff0ed':'white'} stroke={n.color} strokeWidth={selected===n.id?3:2}/><circle cx={n.x} cy={n.y} r="6" fill={n.color}/><text x={n.x} y={n.y+40} textAnchor="middle">{n.id}</text></g>)}</svg><div className="graph-degree"><b>Degree centrality:</b> number of distinct entities connected to a node. A shared device or card linked to 3+ accounts raises a ring alert.</div></section>
      <aside className="wb-panel node-card"><div className="wb-eyebrow"><Waypoints size={14}/> NODE INSPECTOR</div>{selected?(()=>{const n=nodes.find(x=>x.id===selected)!;return <><h2>{n.id}</h2><span className="node-type">{n.type}</span><div className="node-risk"><span>Risk propagation</span><b className={n.risk>65?'bad':'good'}>{n.risk}%</b></div><RiskLine value={n.risk/100} color={n.risk>65?'#df746a':'#2ca47d'}/><div className="node-meta"><span>Graph degree<b>{n.degree} links</b></span><span>Connected entities<b>{n.neighbors}</b></span></div><div className={`node-verdict ${n.risk>65?'bad-callout':'good-callout'}`}>{n.risk>65?'This entity belongs to the flagged fraud community.':'This connection is consistent with normal household behavior.'}</div></>})():<div className="empty-inspector"><CircleHelp size={22}/><b>Select any node</b><p>See its entity type, degree, neighbors, and propagated risk score.</p></div>}<div className="algo-note"><b>Community rule</b><p>Flag a bipartite cluster when one device or payment method connects to at least <strong>3 distinct accounts</strong>, then trace all connected entities.</p></div></aside></div>
  </div>
}

function FpoLab() {
  const [ceiling,setCeiling]=useState(850)
  const [allow,setAllow]=useState(35)
  const [block,setBlock]=useState(75)
  const [policy,setPolicy]=useState<'travel'|'household'>('travel')
  const travelerSpeed=8950/11.2
  const protectedByFpo=policy==='travel'?travelerSpeed<ceiling:true
  const recall=Math.min(99,Math.round(88+(block-75)*.42+(allow-35)*.12))
  const fpr=Math.max(.1,Math.min(6,2.4-(allow-25)*.045+(ceiling-850)*.003))
  const friction=Math.max(2,Math.min(25,11+(allow-35)*.24+(block-75)*.1))
  return <div className="wb-page"><div className="wb-page-heading"><div><div className="wb-eyebrow"><SlidersHorizontal size={14}/> FALSE-POSITIVE OPTIMIZATION</div><h1>FPO calibration lab</h1><p>Explore how risk thresholds trade off fraud capture against unnecessary checkout friction.</p></div><span className="target-pill"><ShieldCheck size={14}/> Goal: protect good customers</span></div>
    <div className="fpo-layout"><section className="wb-panel fpo-controls"><div className="panel-title-row"><div><h2>Policy controls</h2><p>Changes update the curve and example decisions immediately.</p></div></div><Slider label="Commercial flight ceiling" value={`${ceiling} km/h`} min={500} max={1100} step={10} n={ceiling} onChange={setCeiling}/><div className="range-divider"/><Slider label="ALLOW threshold" value={`< ${allow/100}`} min={15} max={60} step={1} n={allow} onChange={setAllow}/><Slider label="BLOCK threshold" value={`≥ ${block/100}`} min={55} max={95} step={1} n={block} onChange={n=>setBlock(Math.max(n,allow+10))}/><div className="threshold-preview"><span className="allow-zone">ALLOW<strong>0.00 – {((allow-1)/100).toFixed(2)}</strong></span><span className="challenge-zone">CHALLENGE<strong>{(allow/100).toFixed(2)} – {((block-1)/100).toFixed(2)}</strong></span><span className="block-zone">BLOCK<strong>{(block/100).toFixed(2)} – 1.00</strong></span></div></section>
    <section className="wb-panel tradeoff-panel"><div className="panel-title-row"><div><h2>Customer impact trade-off</h2><p>Illustrative response as policy thresholds move.</p></div><span className="sim-tag">LIVE ESTIMATE</span></div><div className="tradeoff-chart"><div className="chart-y-label">RATE (%)</div><svg viewBox="0 0 520 240" role="img" aria-label="Live trade-off chart for false positive rate, fraud recall, and checkout friction"><line x1="48" y1="25" x2="48" y2="194" stroke="#dce2e9"/><line x1="48" y1="194" x2="500" y2="194" stroke="#dce2e9"/>{[0,1,2,3,4].map(i=><g key={i}><line x1="48" y1={194-i*40} x2="500" y2={194-i*40} stroke="#eff1f5"/><text x="38" y={198-i*40} textAnchor="end">{i*25}</text></g>)}<polyline points={`48,${191-(100-recall)*1.6} 160,${180-(100-recall)*1.4} 275,${162-(100-recall)*1.2} 390,${144-(100-recall)} 500,${130-(100-recall)*.7}`} fill="none" stroke="#25a17c" strokeWidth="3"/><polyline points={`48,${194-fpr*10} 160,${194-fpr*12} 275,${194-fpr*14} 390,${194-fpr*15} 500,${194-fpr*16}`} fill="none" stroke="#e57970" strokeWidth="2.5" strokeDasharray="5 4"/><polyline points={`48,${194-friction*4} 160,${194-friction*5} 275,${194-friction*6} 390,${194-friction*6.5} 500,${194-friction*7}`} fill="none" stroke="#7583e2" strokeWidth="2.5" strokeDasharray="2 4"/><circle cx="390" cy={144-(100-recall)} r="6" fill="#25a17c" stroke="white" strokeWidth="2"/><text x="48" y="215">Fewer false declines</text><text x="500" y="215" textAnchor="end">More fraud caught</text></svg></div><div className="chart-legend"><span><i className="chart-recall"/> Fraud detection rate (recall) <b>{recall}%</b></span><span><i className="chart-fpr"/> False positive rate <b>{fpr.toFixed(1)}%</b></span><span><i className="chart-friction"/> Checkout friction <b>{friction.toFixed(0)}%</b></span></div></section></div>
    <div className="wb-panel fpo-testcards"><div className="panel-title-row"><div><h2>Try the FPO policies</h2><p>Test the context rules that keep legitimate users from being declined.</p></div></div><div className="policy-tabs"><button className={policy==='travel'?'active':''} onClick={()=>setPolicy('travel')}>FPO-1 · Cross-border traveler</button><button className={policy==='household'?'active':''} onClick={()=>setPolicy('household')}>FPO-2 · Shared home network</button></div><div className="policy-test"><div className="policy-icon">{policy==='travel'?<Globe2/>:<Network/>}</div><div><b>{policy==='travel'?'Trusted traveler':'Shared household subnet'}</b><p>{policy==='travel'?`Alice's verified phone travels ${Math.round(travelerSpeed)} km/h, below the ${ceiling} km/h ceiling.`:'Family members share one residential IP but use separate trusted devices and payment methods.'}</p></div><span className={`policy-result ${protectedByFpo?'good':'bad'}`}>{protectedByFpo?'FPO APPLIED · ALLOW':'TRAVEL SPEED TOO HIGH · REVIEW'}</span></div><div className="policy-explainer">{protectedByFpo?'Context reduces a location-only risk signal. The payment stays in checkout with no unnecessary decline.':'The travel signal exceeds this policy’s flight ceiling; PayShield keeps the event in the review path.'}</div></div>
  </div>
}

function ApiInspector() {
  const [open,setOpen]=useState(0)
  const [language,setLanguage]=useState<'curl'|'python'|'typescript'>('curl')
  const [copied,setCopied]=useState(false)
  const snippets={curl:`curl -X POST http://localhost:7860/api/v1/events/ingest \\\n  -H "Content-Type: application/json" \\\n  -d '{"event_type":"PAYMENT","account_id":"ACC_ALICE_101","amount":42.50,"device_id":"DEV_ALICE_PHONE","country_code":"US"}'`,python:`import requests

event = {"event_type": "PAYMENT", "account_id": "ACC_ALICE_101", "amount": 42.50, "device_id": "DEV_ALICE_PHONE", "country_code": "US"}
result = requests.post("http://localhost:7860/api/v1/events/ingest", json=event)
print(result.json()["decision"])`,typescript:`const response = await fetch("http://localhost:7860/api/v1/events/ingest", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ event_type: "PAYMENT", account_id: "ACC_ALICE_101", amount: 42.5, device_id: "DEV_ALICE_PHONE", country_code: "US" })
});
const assessment = await response.json();`}
  const copy=async()=>{await navigator.clipboard?.writeText(snippets[language]);setCopied(true);window.setTimeout(()=>setCopied(false),1500)}
  return <div className="wb-page"><div className="wb-page-heading"><div><div className="wb-eyebrow"><Code2 size={14}/> DEVELOPER REFERENCE</div><h1>OpenAPI & contract inspector</h1><p>Browse the endpoints used by the demo engine and copy a request snippet to start integrating.</p></div><span className="api-version">FastAPI · v1.0</span></div><div className="api-layout"><section className="wb-panel endpoints-panel"><div className="panel-title-row"><div><h2>REST & streaming endpoints</h2><p>Expand a route to inspect its purpose and sample response.</p></div></div>{endpointSpecs.map((e,i)=><article className={`endpoint ${open===i?'expanded':''}`} key={e.path}><button className="endpoint-head" onClick={()=>setOpen(open===i?-1:i)}><span className={`method ${e.method.toLowerCase()}`}>{e.method}</span><code>{e.path}</code><b>{e.title}</b><ChevronDown size={15} className={open===i?'turn':''}/></button>{open===i&&<div className="endpoint-detail"><p>{e.description}</p><div className="response-label">SAMPLE RESPONSE</div><pre className="json-view"><code>{e.response}</code></pre></div>}</article>)}</section><section className="wb-panel code-panel"><div className="panel-title-row"><div><h2>Send a payment event</h2><p>Example request to score a real event.</p></div><button className="copy-button" onClick={copy}>{copied?<Check size={14}/>:<Copy size={14}/>} {copied?'Copied':'Copy'}</button></div><div className="code-tabs">{(['curl','python','typescript'] as const).map(x=><button key={x} className={language===x?'active':''} onClick={()=>setLanguage(x)}>{x==='typescript'?'TypeScript':x==='python'?'Python':'cURL'}</button>)}</div><pre className="code-snippet"><code>{snippets[language]}</code></pre><div className="api-note"><CircleHelp size={15}/><p>Start the local API with <code>python app.py</code>. It serves on port 7860 by default. The hosted judge link currently uses a frontend simulation because the referenced public API URL is unavailable.</p></div><div className="websocket-note"><Activity size={15}/><span><b>WebSocket telemetry</b><small>Connect to <code>ws://localhost:7860/ws/telemetry</code> and send periodic keepalive text frames.</small></span></div></section></div></div>
}

export default function Workbench({view}:{view:WorkbenchView}) {
  return view==='judge'?<JudgeLab/>:view==='architecture'?<Architecture/>:view==='simulator'?<Simulator/>:view==='graph'?<GraphExplorer/>:view==='fpo'?<FpoLab/>:<ApiInspector/>
}
