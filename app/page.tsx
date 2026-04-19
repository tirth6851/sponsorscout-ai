export default function HomePage() {
  return (
    <main style={{ minHeight: '100vh', fontFamily: 'Arial, sans-serif', background: '#0b1020', color: '#f8fafc' }}>
      <section style={{ maxWidth: 960, margin: '0 auto', padding: '72px 24px' }}>
        <div style={{ display: 'inline-block', padding: '6px 12px', borderRadius: 999, background: '#172554', marginBottom: 20 }}>
          Built for the Built with Opus 4.7 hackathon
        </div>
        <h1 style={{ fontSize: '3rem', lineHeight: 1.1, marginBottom: 16 }}>
          SponsorScout AI
        </h1>
        <p style={{ fontSize: '1.15rem', maxWidth: 760, color: '#cbd5e1', lineHeight: 1.7 }}>
          A visa-aware opportunity navigator for international students. SponsorScout helps users discover realistic roles,
          understand timing constraints, and turn career uncertainty into a clearer action plan.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginTop: 36 }}>
          {[
            'Visa-aware matching',
            'Opportunity prioritization',
            'CPT/OPT timing guidance',
            'Action-oriented career strategy'
          ].map((item) => (
            <div key={item} style={{ background: '#111827', padding: 20, borderRadius: 16, border: '1px solid #1f2937' }}>
              <h3 style={{ margin: 0, fontSize: '1.05rem' }}>{item}</h3>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 40, padding: 24, background: '#111827', borderRadius: 18, border: '1px solid #1f2937' }}>
          <h2 style={{ marginTop: 0 }}>Why this matters</h2>
          <p style={{ color: '#cbd5e1', lineHeight: 1.7 }}>
            International students often navigate jobs, sponsorship uncertainty, and CPT/OPT timelines across fragmented systems.
            SponsorScout is designed to reduce wasted effort and provide more targeted, strategic guidance.
          </p>
        </div>
      </section>
    </main>
  );
}
