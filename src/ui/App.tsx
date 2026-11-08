import { useEffect, useMemo, useState } from 'react'
import { Activity, ArrowDownRight, ArrowUpRight, BadgeCheck, Bell, ChevronDown, CircleHelp, Clock3, CreditCard, Fingerprint, Globe2, LayoutDashboard, LockKeyhole, Network, Play, Radar, RefreshCw, Shield, ShieldAlert, ShieldCheck, Sparkles, Zap } from 'lucide-react'
import Workbench, { type WorkbenchView } from './Workbench'

type Decision = 'Approved' | 'Blocked' | 'Review' | 'Protected'
type Tx = { id: string; name: string; initials: string; detail: string; amount: number; time: string; score: number; decision: Decision; color: string }
type Scenario = 'normal' | 'traveler' | 'ato' | 'sybil_ring'
type View = 'overview' | WorkbenchView
const viewNames: Record<View, string> = { overview: 'Overview', judge: 'Judge Test Lab', architecture: 'Architecture', simulator: 'Flow Simulator', graph: 'Graph Ring View', fpo: 'FPO Calibration', api: 'OpenAPI & Contracts' }

const names = ['Jordan Lee', 'Maya Patel', 'Noah Williams', 'Sofia Chen', 'Ethan Brooks', 'Amara Okafor', 'Lucas Martin', 'Nina Shah']
const locations = ['Brooklyn, US', 'London, UK', 'Toronto, CA', 'Austin, US', 'Singapore, SG', 'Mumbai, IN']
const colors = ['#5c6fea', '#15a984', '#e99540', '#a66cde', '#e16b79', '#398fb4']
const initialRows: Tx[] = [
  { id: 'TX-90142', name: 'Jordan Lee', initials: 'JL', detail: 'Brooklyn, US · Visa •• 4821', amount: 84.5, time: 'Just now', score: 4, decision: 'Approved', color: colors[0] },
  { id: 'TX-90141', name: 'Maya Patel', initials: 'MP', detail: 'London, UK · Mastercard •• 2019', amount: 1260, time: '12 sec ago', score: 82, decision: 'Blocked', color: colors[1] },
  { id: 'TX-90140', name: 'Noah Williams', initials: 'NW', detail: 'Toronto, CA · Visa •• 7720', amount: 46, time: '25 sec ago', score: 12, decision: 'Approved', color: colors[2] },
  { id: 'TX-90139', name: 'Sofia Chen', initials: 'SC', detail: 'Singapore, SG · Amex •• 1904', amount: 432, time: '38 sec ago', score: 31, decision: 'Review', color: colors[3] },
  { id: 'TX-90138', name: 'Ethan Brooks', initials: 'EB', detail: 'Austin, US · Visa •• 8882', amount: 219.99, time: '52 sec ago', score: 6, decision: 'Approved', color: colors[4] },
]

const scenarioCopy: Record<Scenario, { title: string; description: string; icon: typeof CreditCard }> = {
  normal: { title: 'Everyday payment', description: 'A familiar device and shopping pattern.', icon: CreditCard },
  traveler: { title: 'Trusted traveler', description: 'A new location, but a verified device.', icon: Globe2 },
  ato: { title: 'Account takeover', description: 'A new device and an unusual location.', icon: Fingerprint },
  sybil_ring: { title: 'Fraud ring', description: 'Several accounts share a hidden connection.', icon: Network },
}

function money(value: number) { return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: value % 1 ? 2 : 0 }).format(value) }
function scoreLabel(score: number) { return score < 25 ? 'Low risk' : score < 65 ? 'Watch' : 'High risk' }

function Sparkline({ values, color = '#26a77f', fill = true }: { values: number[]; color?: string; fill?: boolean }) {
  const points = values.map((v, i) => `${(i / (values.length - 1)) * 300},${70 - v * 0.59}`).join(' ')
  return <svg className="sparkline" viewBox="0 0 300 76" preserveAspectRatio="none" aria-label="Live activity trend">
    {fill && <polygon points={`0,76 ${points} 300,76`} fill={color} opacity=".08" />}
    <polyline points={points} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="300" cy={70 - values.at(-1)! * .59} r="4" fill={color} />
  </svg>
}

function FlowGraph({ mode }: { mode: Scenario | 'live' }) {
  const ring = mode === 'sybil_ring'
  const ato = mode === 'ato'
  const nodes = ring
    ? [{ x: 55, y: 95, label: 'Account A', type: 'person' }, { x: 150, y: 42, label: 'Shared device', type: 'device' }, { x: 245, y: 95, label: 'Account B', type: 'person' }, { x: 202, y: 190, label: 'Same card', type: 'card' }, { x: 85, y: 190, label: 'Account C', type: 'person' }]
    : ato
      ? [{ x: 56, y: 95, label: 'Account', type: 'person' }, { x: 150, y: 44, label: 'New device', type: 'alert' }, { x: 245, y: 95, label: 'New location', type: 'alert' }, { x: 202, y: 190, label: 'Payment', type: 'card' }, { x: 85, y: 190, label: 'Usual device', type: 'device' }]
      : [{ x: 56, y: 95, label: 'Account', type: 'person' }, { x: 150, y: 44, label: 'Known device', type: 'device' }, { x: 245, y: 95, label: 'Brooklyn', type: 'place' }, { x: 202, y: 190, label: 'Payment', type: 'card' }, { x: 85, y: 190, label: 'Visa ••4821', type: 'card' }]
  const edges = ring ? [[0,1],[1,2],[2,3],[3,4],[4,1],[0,4]] : [[0,1],[0,2],[0,3],[1,4],[4,3]]
  return <svg className="graph-svg" viewBox="0 0 300 240" role="img" aria-label={ring ? 'Connected account ring graph' : 'Account relationship graph'}>
    <defs><pattern id="dots" width="18" height="18" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="1" fill="#e9edf3" /></pattern></defs>
    <rect width="300" height="240" fill="url(#dots)" />
    {edges.map(([a,b]) => <line key={`${a}-${b}`} x1={nodes[a].x} y1={nodes[a].y} x2={nodes[b].x} y2={nodes[b].y} stroke={ring || ato ? '#ee8c86' : '#9db7ed'} strokeWidth={ring ? 2.5 : 2} strokeDasharray={ring ? '0' : '5 5'} opacity={.9} />)}
    {nodes.map(n => <g key={n.label} className="graph-node">
      <circle cx={n.x} cy={n.y} r="19" fill={n.type === 'alert' || ring ? '#fff0ee' : n.type === 'person' ? '#eef1ff' : '#e8f7f2'} stroke={n.type === 'alert' || ring ? '#eaa49d' : n.type === 'person' ? '#b8c3fa' : '#b2e2d1'} strokeWidth="1.5" />
      {n.type === 'person' ? <circle cx={n.x} cy={n.y} r="6" fill="#6376e8" /> : n.type === 'alert' ? <path d={`M${n.x} ${n.y-8} L${n.x+7} ${n.y+6} L${n.x-7} ${n.y+6} Z`} fill="#e06b65" /> : n.type === 'place' ? <circle cx={n.x} cy={n.y} r="5" fill="#31a886" /> : <rect x={n.x-5} y={n.y-5} width="10" height="10" rx="3" fill={ring ? '#e37a70' : '#38a883'} />}
      <text x={n.x} y={n.y+34} textAnchor="middle" className="graph-label">{n.label}</text>
    </g>)}
    <circle className="pulse" cx={nodes[ring ? 1 : ato ? 2 : 1].x} cy={nodes[ring ? 1 : ato ? 2 : 1].y} r="25" fill="none" stroke={ring || ato ? '#ea8078' : '#51c5a2'} strokeWidth="1.4" />
  </svg>
}

function App() {
  const [rows, setRows] = useState(initialRows)
  const [selectedScenario, setSelectedScenario] = useState<Scenario | 'live'>('live')
  const [activeScenario, setActiveScenario] = useState<Scenario | null>(null)
  const [loading, setLoading] = useState(false)
  const [chart, setChart] = useState([24,31,27,40,36,49,43,56,50,63,55,68,58,72,64,74,66,78,70,75])
  const [tick, setTick] = useState(0)
  const [toast, setToast] = useState('')
  const [view, setView] = useState<View>('overview')
  const [isApiLive, setIsApiLive] = useState(false)
  const total = 12842 + tick * 3
  const approved = rows.filter(r => r.decision === 'Approved' || r.decision === 'Protected').length
  const blocked = rows.filter(r => r.decision === 'Blocked').length

  useEffect(() => {
    fetch('/api/v1/events/recent')
      .then(res => { if (res.ok) setIsApiLive(true) })
      .catch(() => setIsApiLive(false))
  }, [])

  useEffect(() => {
    const id = window.setInterval(() => {
      setTick(v => v + 1)
      setChart(v => [...v.slice(1), Math.max(20, Math.min(94, v.at(-1)! + Math.round(Math.random() * 22 - 10)))])
      setRows(existing => {
        const i = Math.floor(Math.random() * names.length), score = Math.floor(Math.random() * 52)
        const name = names[i]
        const next: Tx = { id: `TX-${90143 + tick}`, name, initials: name.split(' ').map(x => x[0]).join(''), detail: `${locations[Math.floor(Math.random()*locations.length)]} · Visa •• ${Math.floor(1000+Math.random()*8999)}`, amount: Math.round((24 + Math.random()*960)*100)/100, time: 'Just now', score, decision: score > 78 ? 'Blocked' : score > 52 ? 'Review' : 'Approved', color: colors[i % colors.length] }
        return [next, ...existing.slice(0, 4).map((r, n) => ({ ...r, time: n === 0 ? '8 sec ago' : r.time }))]
      })
    }, 4500)
    return () => window.clearInterval(id)
  }, [tick])

  useEffect(() => { if (!toast) return; const id = window.setTimeout(() => setToast(''), 3000); return () => window.clearTimeout(id) }, [toast])

  async function runScenario(scenario: Scenario) {
    setLoading(true); setSelectedScenario(scenario); setActiveScenario(scenario)
    try {
      const res = await fetch(`/api/v1/scenarios/trigger/${scenario}`, { method: 'POST' })
      if (res.ok) {
        setIsApiLive(true)
        const data = await res.json()
        if (data.results && data.results.length > 0) {
          const apiRows: Tx[] = data.results.map((r: any, i: number) => ({
            id: r.event_id ? `TX-${r.event_id.slice(0, 6)}` : `DEMO-${i}`,
            name: scenario === 'normal' ? 'Alice Smith' : scenario === 'traveler' ? 'Alice Smith (Traveler)' : scenario === 'ato' ? 'Ethan Brooks (Compromised)' : `Mule Account #${i+1}`,
            initials: scenario === 'sybil_ring' ? `M${i+1}` : 'AS',
            detail: scenario === 'traveler' ? 'Paris, FR · Verified Device (FPO-1 Allowed)' : scenario === 'ato' ? 'Bucharest, RO · New Device & Pwd Changed' : scenario === 'sybil_ring' ? 'Shared Emulator DEV_EMU_77 · Ring Blocked' : 'San Francisco, US · Trusted PC',
            amount: scenario === 'ato' ? 1850 : scenario === 'sybil_ring' ? 650 : scenario === 'traveler' ? 84.5 : 42.5,
            time: `${r.latency_ms} ms ago`,
            score: Math.round(r.risk_score * 100),
            decision: (r.decision === 'ALLOW' ? (r.fpo_override ? 'Protected' : 'Approved') : r.decision === 'CHALLENGE' ? 'Review' : 'Blocked') as Decision,
            color: colors[i % colors.length]
          }))
          setRows(v => [...apiRows, ...v].slice(0, 5))
          setToast(`Live API evaluated ${scenario} in ${data.results[0].latency_ms}ms`)
          setLoading(false)
          return
        }
      }
    } catch {
      // Offline fallback
    }

    const namesByScenario: Record<Scenario, string[]> = { normal: ['Jordan Lee'], traveler: ['Amara Okafor','Amara Okafor'], ato: ['Ethan Brooks'], sybil_ring: ['Maya Patel','Noah Williams','Sofia Chen'] }
    const riskByScenario: Record<Scenario, number[]> = { normal: [6], traveler: [18, 16], ato: [94], sybil_ring: [91, 87, 89] }
    const made: Tx[] = namesByScenario[scenario].map((name, i) => {
      const score = riskByScenario[scenario][i], decision: Decision = scenario === 'traveler' ? 'Protected' : score > 80 ? 'Blocked' : 'Approved'
      return { id: `DEMO-${Date.now().toString().slice(-5)}${i}`, name, initials: name.split(' ').map(x => x[0]).join(''), detail: scenario === 'traveler' ? 'London, UK · Verified device' : scenario === 'ato' ? 'New device · Bucharest, RO' : scenario === 'sybil_ring' ? 'Shared device · Linked accounts' : 'Brooklyn, US · Known device', amount: scenario === 'ato' ? 1299 : scenario === 'sybil_ring' ? 690 : scenario === 'traveler' ? 82 : 42, time: 'Just now', score, decision, color: colors[i] }
    })
    setRows(v => [...made, ...v].slice(0, 5));
    setTimeout(() => setLoading(false), 750)
  }

  const current = activeScenario ?? 'normal'
  const explain = useMemo(() => {
    if (current === 'traveler') return { decision: 'Approved with context', tone: 'safe', score: 18, title: 'A new city, same trusted person.', text: 'The location is unusual, but the device is verified and travel is plausible. PayShield avoids blocking a legitimate customer.', factors: [{label:'Verified device',value:'+42'}, {label:'Travel pattern fits',value:'+28'}, {label:'Recent account history',value:'+12'}] }
    if (current === 'ato') return { decision: 'Payment blocked', tone: 'danger', score: 94, title: 'This payment looks like an account takeover.', text: 'A brand-new device, a sudden location change, and a high-value purchase appeared together. The combined signals cross the block threshold.', factors: [{label:'New device',value:'−34'}, {label:'Impossible travel',value:'−31'}, {label:'Unusual amount',value:'−22'}] }
    if (current === 'sybil_ring') return { decision: 'Fraud ring stopped', tone: 'danger', score: 91, title: 'Three accounts share the same hidden signals.', text: 'The network view links accounts through a reused device and payment method. Looking at the connections catches the ring that single-payment checks miss.', factors: [{label:'Shared device',value:'−38'}, {label:'Shared payment method',value:'−32'}, {label:'Coordinated timing',value:'−21'}] }
    return { decision: 'Payment approved', tone: 'safe', score: 6, title: 'A routine purchase, approved in 18 ms.', text: 'This customer is using a familiar device, location, and payment pattern. PayShield approves the payment without adding friction.', factors: [{label:'Known device',value:'+38'}, {label:'Usual location',value:'+31'}, {label:'Typical purchase',value:'+25'}] }
  }, [current])

  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand"><div className="brand-mark"><Shield size={19} strokeWidth={2.5}/><span /></div><div><strong>PayShield<span> AI</span></strong><small>PAYMENT INTELLIGENCE</small></div></div>
      <div className="workspace"><div className="workspace-icon">N</div><div><b>Northstar Pay</b><small>Demo workspace</small></div><ChevronDown size={15}/></div>
      <p className="nav-label">WORKSPACE</p>
      <nav><a className={`nav-item ${view==='overview'?'active':''}`} href="#overview" onClick={e=>{e.preventDefault();setView('overview')}}><LayoutDashboard size={17}/> Overview {view==='overview'&&<span className="nav-dot"/>}</a><a className="nav-item" href="#transactions" onClick={e=>{e.preventDefault();setView('overview');window.setTimeout(()=>document.getElementById('transactions')?.scrollIntoView({behavior:'smooth'}),0)}}><CreditCard size={17}/> Transactions</a><a className="nav-item" href="#network" onClick={e=>{e.preventDefault();setView('graph')}}><Network size={17}/> Network signals</a></nav>
      <p className="nav-label demo-label">DEMO SCENARIOS</p>
      <nav className="scenario-nav">{(Object.keys(scenarioCopy) as Scenario[]).map(s => { const Icon = scenarioCopy[s].icon; return <button key={s} className={`nav-item scenario-link ${selectedScenario === s ? 'picked' : ''}`} onClick={() => runScenario(s)}><Icon size={16}/>{scenarioCopy[s].title}</button> })}</nav>
      <div className="sidebar-bottom"><div className="secure-note"><div><LockKeyhole size={14}/> Simulation mode</div><p>Live sample traffic. No real payments are processed.</p></div><div className="user"><div className="user-avatar">Z</div><div><b>Zayed</b><small>Hackathon workspace</small></div><CircleHelp size={16}/></div></div>
    </aside>

    <main className="main-content" id="overview">
      <header className="topbar"><div className="crumb"><span>Workspace</span><span className="slash">/</span><b>{viewNames[view]}</b></div><div className="top-actions"><span className={`live-status ${isApiLive ? 'live-online' : 'demo-status'}`}><i/> {isApiLive ? 'Live API Online (P95 < 18ms)' : 'Local simulation'}</span><button className="icon-button" aria-label="Notifications" onClick={() => setToast('You’re all caught up.')}><Bell size={17}/><i/></button><span className="top-divider"/><div className="avatar-small">Z</div></div></header>
      <div className="page-wrap">
        <nav className="view-tabs" aria-label="PayShield views">{(Object.keys(viewNames) as View[]).map(key=><button key={key} className={view===key?'active':''} onClick={()=>setView(key)}>{viewNames[key]}</button>)}</nav>
        {view==='overview' ? <>
        <section className="welcome-row"><div><div className="eyebrow"><span className="eyebrow-icon"><Sparkles size={13}/></span> YOUR LIVE FRAUD CONTROL ROOM</div><h1>Good afternoon, Zayed <span>✳</span></h1><p>Here’s what PayShield is catching across your payments right now.</p></div><div className="updated"><span className="live-dot"/> Live demo <span className="v-divider"/> <Clock3 size={14}/> Updated just now</div></section>

        <section className="stats-grid">
          <article className="stat-card"><div className="stat-top"><span>Payments checked</span><span className="stat-icon blue"><Activity size={17}/></span></div><div className="stat-number">{total.toLocaleString()}<span className="stat-change positive"><ArrowUpRight size={14}/> 12.8%</span></div><div className="stat-foot">vs. previous hour</div><Sparkline values={chart} color="#6879e8"/></article>
          <article className="stat-card"><div className="stat-top"><span>Fraud stopped</span><span className="stat-icon coral"><ShieldAlert size={17}/></span></div><div className="stat-number">{(243+blocked).toLocaleString()}<span className="stat-change positive"><ArrowUpRight size={14}/> 8.2%</span></div><div className="stat-foot">${(18420+blocked*1260).toLocaleString()} protected today</div><Sparkline values={chart.map((n,i)=>n+(i%4===0?12:0))} color="#ed8075"/></article>
          <article className="stat-card"><div className="stat-top"><span>Good customers kept</span><span className="stat-icon mint"><BadgeCheck size={17}/></span></div><div className="stat-number">98.7<span className="unit">%</span><span className="stat-change positive"><ArrowUpRight size={14}/> 2.1%</span></div><div className="stat-foot">fewer false alarms for customers</div><div className="success-meter"><span/></div></article>
          <article className="stat-card"><div className="stat-top"><span>Decision speed</span><span className="stat-icon amber"><Zap size={17}/></span></div><div className="stat-number">18<span className="unit">ms</span><span className="stat-change positive"><ArrowDownRight size={14}/> 6 ms</span></div><div className="stat-foot">average time to protect a payment</div><div className="speed-visual"><span/><span/><span/><span/><span/><span/><span/><span/><span/><span/><span/><span/><span/><span/><span/><span/><span/><span/><span/><span/></div></article>
        </section>

        <section className="demo-banner"><div className="demo-copy"><span className="demo-icon"><Play size={17} fill="currentColor"/></span><div><b>Show PayShield in action</b><p>Choose a scenario to see how one decision is made.</p></div></div><div className="demo-buttons">{(Object.keys(scenarioCopy) as Scenario[]).map(s => { const Icon = scenarioCopy[s].icon; return <button key={s} className={`demo-button ${selectedScenario === s ? 'demo-selected' : ''}`} onClick={() => runScenario(s)} disabled={loading}><Icon size={15}/><span>{scenarioCopy[s].title}</span></button> })}</div></section>

        <section className="content-grid">
          <article className="panel decision-panel"><div className="panel-heading"><div><div className="section-kicker"><Radar size={14}/> DECISION EXPLAINED</div><h2>{activeScenario ? 'See how PayShield handled it' : 'A clear reason for every decision'}</h2></div><button className="subtle-button" onClick={() => runScenario(current)}><RefreshCw size={14} className={loading ? 'spin' : ''}/> Try again</button></div>
            <div className={`decision-result ${explain.tone}`}><div className="result-icon">{explain.tone === 'safe' ? <ShieldCheck size={20}/> : <ShieldAlert size={20}/>}</div><div><b>{explain.decision}</b><span>{activeScenario ? scenarioCopy[activeScenario].title : 'Everyday payment'}</span></div><div className="risk-score"><strong>{explain.score}</strong><small>/ 100 risk</small></div></div>
            <div className="risk-scale"><div className="scale-head"><span>LOW RISK</span><span>REVIEW</span><span>HIGH RISK</span></div><div className="scale-track"><i className={explain.tone} style={{left:`${explain.score}%`}}/></div></div>
            <h3 className="explain-title">{explain.title}</h3><p className="explain-copy">{explain.text}</p>
            <div className="factor-list">{explain.factors.map((f,i) => <div className="factor" key={f.label}><span className={`factor-check ${explain.tone}`}><span>{explain.tone === 'safe' ? '✓' : '!'}</span></span><span>{f.label}</span><b className={explain.tone}>{f.value}</b><div className="factor-bar"><i style={{width:`${[83,65,49][i]}%`}}/></div></div>)}</div>
            <div className="decision-foot"><span><Sparkles size={14}/> Explained by 3 signals</span><span>Model checked in <b>18 ms</b></span></div>
          </article>

          <article className="panel graph-panel" id="network"><div className="panel-heading"><div><div className="section-kicker"><Network size={14}/> CONNECTION MAP</div><h2>See the links behind a payment</h2></div><span className="live-pill"><i/> LIVE</span></div><p className="panel-intro">PayShield checks accounts, devices, locations, and cards together.</p>
            <div className="graph-wrap"><FlowGraph mode={activeScenario ?? 'live'}/></div>
            <div className="graph-legend"><span><i className="legend-person"/> Account</span><span><i className="legend-device"/> Device or card</span><span><i className="legend-connection"/> Connection</span></div>
            {activeScenario === 'sybil_ring' ? <div className="insight-box danger-insight"><span><Network size={15}/></span><p><b>3 accounts connected</b><br/>They shared a device and payment method. PayShield blocked the group.</p></div> : activeScenario === 'ato' ? <div className="insight-box danger-insight"><span><ShieldAlert size={15}/></span><p><b>2 unusual signals found</b><br/>New device and distant location do not match this account.</p></div> : activeScenario === 'traveler' ? <div className="insight-box"><span><BadgeCheck size={15}/></span><p><b>Trusted device recognized</b><br/>The customer’s device history supports a legitimate trip.</p></div> : <div className="insight-box"><span><BadgeCheck size={15}/></span><p><b>Familiar customer signals</b><br/>This payment matches a known device and shopping pattern.</p></div>}
          </article>
        </section>

        <section className="panel transactions-panel" id="transactions"><div className="panel-heading tx-heading"><div><div className="section-kicker"><Activity size={14}/> LIVE ACTIVITY</div><h2>Payments as they happen <span className="count-pill">{approved + blocked} recent</span></h2><p className="panel-intro">Every payment gets a risk check before it is approved.</p></div><button className="filter-button" onClick={() => setToast('Showing the latest payment decisions.')}>All decisions <ChevronDown size={14}/></button></div>
          <div className="table-scroll"><table><thead><tr><th>PAYMENT</th><th>AMOUNT</th><th>RISK</th><th>PAYSHIELD DECISION</th><th>TIME</th></tr></thead><tbody>{rows.map((row,i) => <tr key={`${row.id}-${i}`} className={i===0?'new-row':''}><td><div className="payment-person"><span className="person-avatar" style={{background:row.color}}>{row.initials}</span><span><b>{row.name}</b><small>{row.detail}</small></span></div></td><td className="amount">{money(row.amount)}</td><td><div className="risk-cell"><span className={`risk-dot ${row.score>65?'high':row.score>25?'medium':'low'}`}/><span>{scoreLabel(row.score)} <small>({row.score})</small></span></div></td><td><span className={`decision-pill ${row.decision.toLowerCase()}`}><i/>{row.decision}</span></td><td className="time-cell">{row.time}</td></tr>)}</tbody></table></div>
          <div className="table-footer"><span><i className="live-dot"/> Updating automatically every few seconds</span><button onClick={() => { setRows(initialRows); setToast('Payment feed refreshed.') }}><RefreshCw size={13}/> Refresh feed</button></div>
        </section>
        <footer><span>PayShield AI <b>·</b> Real-time payment protection</span><span>Built for people, designed to stop fraud. <ShieldCheck size={13}/></span></footer>
        </> : <Workbench view={view}/>}
      </div>
    </main>
    {toast && <div className="toast"><BadgeCheck size={16}/>{toast}</div>}
  </div>
}

export default App
