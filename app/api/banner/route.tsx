import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const revalidate = 3600; // Cache for 1 hour

const PLUGIN_ID = 21552;

function generateSmoothPath(data: any[], width: number, height: number, isFill = false) {
  if (!data || data.length === 0) return '';

  const minX = Math.min(...data.map((d) => d[0]));
  const maxX = Math.max(...data.map((d) => d[0]));
  const minY = 0;
  const maxY = Math.max(...data.map((d) => d[1])) * 1.2;

  const rangeX = maxX - minX || 1;
  const rangeY = maxY - minY || 1;

  const points = data.map((point) => ({
    x: ((point[0] - minX) / rangeX) * width,
    y: height - ((point[1] - minY) / rangeY) * height,
  }));

  let d = `M ${points[0].x} ${points[0].y} `;

  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const cpX = (prev.x + curr.x) / 2;
    d += `Q ${cpX} ${prev.y}, ${curr.x} ${curr.y} `;
  }

  if (isFill) {
    d += `L ${width} ${height} L 0 ${height} Z`;
  }

  return d;
}

function formatNumber(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
  return n.toLocaleString();
}

export async function GET(request: Request) {
  try {
    const [metaRes, serversRes, playersRes] = await Promise.all([
      fetch(`https://bstats.org/api/v1/plugins/${PLUGIN_ID}`),
      fetch(`https://bstats.org/api/v1/plugins/${PLUGIN_ID}/charts/servers/data?maxElements=100`),
      fetch(`https://bstats.org/api/v1/plugins/${PLUGIN_ID}/charts/players/data?maxElements=100`),
    ]);

    const meta = await metaRes.json();
    const serversData = await serversRes.json();
    const playersData = await playersRes.json();

    const pluginName = meta.name || 'Grief Prevention GUI Addon';
    const currentServers = serversData.length > 0 ? serversData[serversData.length - 1][1] : 0;
    const currentPlayers = playersData.length > 0 ? playersData[playersData.length - 1][1] : 0;

    const WIDTH = 800;
    const HEIGHT = 400;
    const CHART_HEIGHT = 200;
    const CHART_WIDTH = WIDTH;

    const serversLine = generateSmoothPath(serversData, CHART_WIDTH, CHART_HEIGHT);
    const serversFill = generateSmoothPath(serversData, CHART_WIDTH, CHART_HEIGHT, true);
    const playersLine = generateSmoothPath(playersData, CHART_WIDTH, CHART_HEIGHT);
    const playersFill = generateSmoothPath(playersData, CHART_WIDTH, CHART_HEIGHT, true);

    const url = new URL(request.url);
    const bgUrl = `${url.protocol}//${url.host}/bg.png`;
    const patternUrl = `${url.protocol}//${url.host}/pattern.png`;

    /* ── Colour tokens (matching 2026 banner theme) ── */
    const CREAM = '#F5F0E1';       // Warm cream text
    const CREAM_DIM = '#C8C0A8';   // Dimmed cream for labels
    const OLIVE_DARK = 'rgba(50, 58, 42, 0.3)';  // Light olive tint (brighter to match 2026 banner)
    const EMERALD = '#6DBF7B';     // Chart line — servers (green fits MC theme)
    const GOLD = '#F0C850';        // Chart line — players (gold/yellow like stars)

    return new ImageResponse(
      (
        <div
          style={{
            display: 'flex',
            width: '100%',
            height: '100%',
            backgroundColor: '#5A6B50',
            flexDirection: 'column',
            position: 'relative',
            overflow: 'hidden',
            fontFamily: 'sans-serif',
            borderRadius: '32px',
          }}
        >
          {/* ── Background Image (Minecraft landscape, high visibility) ── */}
          <img
            src={bgUrl}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: 0.9,
            }}
          />

          {/* ── Olive tint overlay ─────────────────── */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundColor: OLIVE_DARK,
            }}
          />

          {/* ── Pattern overlay (matching 2026 banner — zoomed in) ── */}
          <img
            src={patternUrl}
            style={{
              position: 'absolute',
              top: '-50%',
              left: '-50%',
              width: '250%',
              height: '250%',
              objectFit: 'cover',
              opacity: 0.12,
            }}
          />

          {/* ── Bottom gradient fade for chart readability ── */}
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              width: '100%',
              height: '50%',
              background: 'linear-gradient(180deg, rgba(55,65,45,0) 0%, rgba(55,65,45,0.5) 50%, rgba(55,65,45,0.8) 100%)',
            }}
          />

          {/* ── Header section ─────────────────────── */}
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              padding: '32px 36px 0 36px',
              zIndex: 10,
              width: '100%',
            }}
          >
            {/* Left: title */}
            <div style={{ display: 'flex', flexDirection: 'column', flexShrink: 1 }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '6px',
                }}
              >
                {/* Pulse dot */}
                <div
                  style={{
                    width: '9px',
                    height: '9px',
                    borderRadius: '50%',
                    backgroundColor: '#6DBF7B',
                    boxShadow: '0 0 10px rgba(109,191,123,0.9)',
                  }}
                />
                <span
                  style={{
                    color: CREAM_DIM,
                    fontSize: 13,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: 3,
                    textShadow: '0 1px 4px rgba(0,0,0,0.7)',
                  }}
                >
                  Live Statistics
                </span>
              </div>
              <span
                style={{
                  color: CREAM,
                  fontSize: 34,
                  fontWeight: 800,
                  lineHeight: 1.1,
                  textShadow: '0 2px 8px rgba(0,0,0,0.8), 0 1px 2px rgba(0,0,0,0.9)',
                }}
              >
                {pluginName}
              </span>
            </div>

            {/* Right: stat pills */}
            <div style={{ display: 'flex', gap: '14px', flexShrink: 0 }}>
              {/* Servers pill */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '14px 24px',
                  borderRadius: '16px',
                  backgroundColor: 'rgba(109, 191, 123, 0.15)',
                  border: '1.5px solid rgba(109, 191, 123, 0.35)',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
                }}
              >
                <span style={{ color: EMERALD, fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, textShadow: '0 1px 3px rgba(0,0,0,0.6)' }}>
                  Servers
                </span>
                <span style={{ color: CREAM, fontSize: 38, fontWeight: 800, marginTop: 2, textShadow: '0 2px 6px rgba(0,0,0,0.7)' }}>
                  {formatNumber(currentServers)}
                </span>
              </div>
              {/* Players pill */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '14px 24px',
                  borderRadius: '16px',
                  backgroundColor: 'rgba(240, 200, 80, 0.15)',
                  border: '1.5px solid rgba(240, 200, 80, 0.35)',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
                }}
              >
                <span style={{ color: GOLD, fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, textShadow: '0 1px 3px rgba(0,0,0,0.6)' }}>
                  Players
                </span>
                <span style={{ color: CREAM, fontSize: 38, fontWeight: 800, marginTop: 2, textShadow: '0 2px 6px rgba(0,0,0,0.7)' }}>
                  {formatNumber(currentPlayers)}
                </span>
              </div>
            </div>
          </div>

          {/* ── Chart legend ───────────────────────── */}
          <div
            style={{
              display: 'flex',
              gap: '18px',
              padding: '14px 36px 0 36px',
              zIndex: 10,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '18px', height: '3px', borderRadius: '2px', backgroundColor: EMERALD }} />
              <span style={{ color: CREAM_DIM, fontSize: 11, fontWeight: 600, textShadow: '0 1px 3px rgba(0,0,0,0.7)' }}>Servers</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '18px', height: '3px', borderRadius: '2px', backgroundColor: GOLD }} />
              <span style={{ color: CREAM_DIM, fontSize: 11, fontWeight: 600, textShadow: '0 1px 3px rgba(0,0,0,0.7)' }}>Players</span>
            </div>
          </div>

          {/* ── Chart area ─────────────────────────── */}
          <div
            style={{
              display: 'flex',
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: `${CHART_HEIGHT}px`,
              width: '100%',
              zIndex: 5,
            }}
          >
            {/* Faint horizontal grid lines */}
            <svg
              width="100%"
              height="100%"
              viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
              preserveAspectRatio="none"
              style={{ position: 'absolute', top: 0, left: 0 }}
            >
              {[0.25, 0.5, 0.75].map((pct) => (
                <line
                  key={pct}
                  x1="0"
                  y1={`${CHART_HEIGHT * pct}`}
                  x2={`${CHART_WIDTH}`}
                  y2={`${CHART_HEIGHT * pct}`}
                  stroke="rgba(200,192,168,0.06)"
                  strokeWidth="1"
                />
              ))}
            </svg>

            {/* Data lines & fills */}
            <svg
              width="100%"
              height="100%"
              viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
              preserveAspectRatio="none"
            >
              {/* Players fill + line (behind) */}
              <path d={playersFill} fill="rgba(240, 200, 80, 0.12)" />
              <path d={playersLine} fill="none" stroke={GOLD} strokeWidth="2.5" opacity="0.85" />

              {/* Servers fill + line (front) */}
              <path d={serversFill} fill="rgba(109, 191, 123, 0.15)" />
              <path d={serversLine} fill="none" stroke={EMERALD} strokeWidth="2.5" />
            </svg>
          </div>

          {/* ── Bottom-right branding ──────────────── */}
          <div
            style={{
              position: 'absolute',
              bottom: '10px',
              right: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              zIndex: 20,
            }}
          >
            <span style={{ color: 'rgba(200,192,168,0.35)', fontSize: 10, fontWeight: 600, letterSpacing: 1, textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
              POWERED BY BSTATS
            </span>
          </div>
        </div>
      ),
      {
        width: WIDTH,
        height: HEIGHT,
        headers: {
          'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
        },
      }
    );
  } catch (error) {
    console.error(error);
    return new Response('Error generating image', { status: 500 });
  }
}
