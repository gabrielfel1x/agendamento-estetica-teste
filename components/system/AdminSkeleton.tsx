export default function AdminSkeleton() {
  return (
    <div className="admin-layout">
      {/* Sidebar skeleton (desktop) */}
      <aside className="admin-sidebar sk-sidebar">
        {/* Logo */}
        <div style={{ display:'flex', alignItems:'center', gap:10, padding:'0 32px 8px' }}>
          <div className="sk-block" style={{ width:28, height:28, borderRadius:6, flexShrink:0 }} />
          <div className="sk-block" style={{ width:100, height:16, borderRadius:4 }} />
        </div>
        {/* Label */}
        <div className="sk-block" style={{ width:72, height:10, borderRadius:4, margin:'8px 32px 28px' }} />
        {/* Nav items */}
        <nav style={{ padding:'0 16px', display:'flex', flexDirection:'column', gap:4 }}>
          {[1,2,3,4,5].map(i => (
            <div key={i} className="sk-nav-item">
              <div className="sk-block" style={{ width:16, height:16, borderRadius:4, flexShrink:0 }} />
              <div className="sk-block" style={{ width: i % 2 === 0 ? 70 : 52, height:13, borderRadius:4 }} />
            </div>
          ))}
        </nav>
        {/* Footer */}
        <div style={{ marginTop:'auto', padding:'24px 32px 0' }}>
          <div style={{ display:'flex', alignItems:'center', gap:12, padding:'14px 16px', background:'rgba(255,255,255,.06)', borderRadius:6 }}>
            <div className="sk-block" style={{ width:36, height:36, borderRadius:'50%', flexShrink:0 }} />
            <div style={{ display:'flex', flexDirection:'column', gap:6, flex:1, minWidth:0 }}>
              <div className="sk-block" style={{ width:'60%', height:12, borderRadius:4 }} />
              <div className="sk-block" style={{ width:'40%', height:10, borderRadius:4 }} />
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile topbar skeleton */}
      <header className="admin-topbar sk-topbar">
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div className="sk-block-light" style={{ width:28, height:28, borderRadius:6 }} />
          <div className="sk-block-light" style={{ width:90, height:15, borderRadius:4 }} />
        </div>
        <div className="sk-block-light" style={{ width:32, height:22, borderRadius:5 }} />
      </header>

      {/* Main content skeleton */}
      <main className="admin-main">
        <div className="sk-page">
          {/* Page header */}
          <div className="sk-page-header">
            <div>
              <div className="sk-block-ivory" style={{ width:160, height:24, borderRadius:6, marginBottom:10 }} />
              <div className="sk-block-ivory" style={{ width:240, height:13, borderRadius:4 }} />
            </div>
            <div className="sk-block-ivory" style={{ width:160, height:38, borderRadius:50 }} />
          </div>

          {/* Content blocks */}
          <div className="sk-content-grid">
            {/* Left: calendar-like block */}
            <div className="sk-card">
              <div className="sk-block-ivory" style={{ width:'50%', height:14, borderRadius:4, marginBottom:18 }} />
              <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:6 }}>
                {Array.from({length:35}).map((_,i)=>(
                  <div key={i} className="sk-block-ivory" style={{ height:32, borderRadius:6 }} />
                ))}
              </div>
            </div>
            {/* Right: slots-like block */}
            <div className="sk-card" style={{ flex:1 }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:18 }}>
                <div className="sk-block-ivory" style={{ width:'40%', height:14, borderRadius:4 }} />
                <div className="sk-block-ivory" style={{ width:24, height:24, borderRadius:6 }} />
              </div>
              {Array.from({length:8}).map((_,i)=>(
                <div key={i} style={{ display:'flex', alignItems:'center', gap:14, padding:'12px 0', borderBottom:'1px solid #f0ede6' }}>
                  <div className="sk-block-ivory" style={{ width:38, height:13, borderRadius:4, flexShrink:0 }} />
                  <div className="sk-block-ivory" style={{ width:`${50 + (i%3)*20}%`, height:32, borderRadius:8, flex:1 }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
