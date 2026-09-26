import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

type Node = { id:string; name:string; provider:string; kind:string; status:string; x:number; y:number };
type Topology = { nodes:Node[]; edges:{from:string;to:string}[] };
type Metrics = {totalEvents:number; successfulEvents:number; failedEvents:number; successRate:number; averageLatencyMs:number};

const API = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

function App() {
  const [topology,setTopology] = useState<Topology|null>(null);
  const [metrics,setMetrics] = useState<Metrics|null>(null);
  const [events,setEvents] = useState<any[]>([]);
  const [running,setRunning] = useState(false);
  const [selected,setSelected] = useState<any>(null);

  const refresh = async () => {
    const [t,m,e] = await Promise.all([
      fetch(`${API}/api/topology`).then(r=>r.json()),
      fetch(`${API}/api/metrics`).then(r=>r.json()),
      fetch(`${API}/api/events`).then(r=>r.json())
    ]);
    setTopology(t); setMetrics(m); setEvents(e);
  };

  useEffect(() => { refresh(); }, []);

  const simulate = async () => {
    setRunning(true);
    await fetch(`${API}/api/events/simulate`, {
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({type:"ORDER_CREATED",source:"checkout-service",payload:{orderId:`ORD-${Math.floor(Math.random()*9000+1000)}`,amount:149.99}})
    });
    await refresh();
    setRunning(false);
  };

  if (!topology || !metrics) return <div className="loading">INITIALIZING CLOUD EVENT LAB<span>_</span></div>;

  return <div className="app">
    <header className="topbar">
      <div className="brand"><span className="pulse-dot"/>CLOUD<span>EVENT</span> LAB</div>
      <div className="top-status"><span className="live"/> SIMULATION ENGINE ONLINE</div>
    </header>

    <aside className="sidebar">
      <div className="side-label">LABORATORY</div>
      {["Topology","Event Stream","Metrics","Providers","Documentation"].map((x,i)=><div className={`nav ${i===0?"active":""}`} key={x}><span>{["⌘","≋","◈","☁","▤"][i]}</span>{x}</div>)}
      <div className="side-bottom">
        <div className="env">ENVIRONMENT <b>LOCAL</b></div>
        <button className="reset" onClick={async()=>{await fetch(`${API}/api/topology/reset`,{method:"POST"});refresh()}}>RESET LAB</button>
      </div>
    </aside>

    <main className="main">
      <section className="hero">
        <div><p className="eyebrow">EVENT-DRIVEN ARCHITECTURE</p><h1>Cloud Event <em>Laboratory</em></h1><p className="subtitle">Design, simulate and inspect event flows across AWS and Azure.</p></div>
        <button className="simulate" disabled={running} onClick={simulate}>{running ? "SIMULATING..." : "▶ SEND EVENT"}</button>
      </section>

      <section className="stats">
        <div className="stat"><span>EVENTS PROCESSED</span><strong>{metrics.totalEvents}</strong></div>
        <div className="stat"><span>SUCCESS RATE</span><strong>{metrics.successRate}%</strong></div>
        <div className="stat"><span>AVG LATENCY</span><strong>{metrics.averageLatencyMs}ms</strong></div>
        <div className="stat"><span>PROVIDERS</span><strong>02</strong></div>
      </section>

      <section className="workspace">
        <div className="panel topology">
          <div className="panel-head"><div><span className="tag">LIVE</span><h2>Event topology</h2></div><span className="hint">AWS → AZURE</span></div>
          <div className="canvas">
            <div className="provider-line aws">AWS</div><div className="provider-line azure">AZURE</div>
            {topology.edges.map(e => {
              const a=topology.nodes.find(n=>n.id===e.from)!; const b=topology.nodes.find(n=>n.id===e.to)!;
              return <div key={e.from+e.to} className="edge" style={{left:a.x+100,top:a.y+34,width:b.x-a.x-5}}/>
            })}
            {topology.nodes.map(n=><button key={n.id} className={`node ${n.status.toLowerCase()}`} style={{left:n.x,top:n.y}} onClick={()=>setSelected(n)}>
              <div className="node-icon">{n.provider==="AWS"?"AWS":"AZ"}</div><b>{n.name}</b><small>{n.status}</small>
            </button>)}
          </div>
        </div>

        <div className="panel inspector">
          <div className="panel-head"><div><span className="tag purple">INSPECTOR</span><h2>Event stream</h2></div></div>
          {selected ? <div className="node-info"><small>COMPONENT</small><h3>{selected.name}</h3><p>{selected.provider} / {selected.kind}</p><div className={`status ${selected.status.toLowerCase()}`}>{selected.status}</div></div> : <div className="empty">Select a component<br/>to inspect its state.</div>}
          <div className="stream">
            {events.slice(0,5).map(e=><button key={e.id} className="event-row" onClick={()=>setSelected(e)}><span className="event-id">{e.id}</span><b>{e.type}</b><small>{e.durationMs}ms</small></button>)}
            {!events.length && <div className="empty">No events yet.<br/>Send an event to start the simulation.</div>}
          </div>
        </div>
      </section>
    </main>
  </div>;
}
createRoot(document.getElementById("root")!).render(<App />);
