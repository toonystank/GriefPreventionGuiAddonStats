export default function Home() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '2rem' }}>
      <h1>bStats Banner Generator</h1>
      <p>Your banner is available at:</p>
      <a href="/api/banner" style={{ color: '#82AAFF', fontSize: '1.5rem', marginTop: '1rem' }}>
        /api/banner
      </a>
      <p style={{ marginTop: '2rem' }}>
        Preview:
      </p>
      <img src="/api/banner" alt="bStats Banner Preview" style={{ maxWidth: '100%', border: '1px solid #333', borderRadius: '32px' }} />
    </div>
  )
}
