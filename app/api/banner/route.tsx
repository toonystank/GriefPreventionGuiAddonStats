import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const revalidate = 3600; // Cache for 1 hour

const PLUGIN_ID = 21552;

function generatePath(data: any[], width: number, height: number, isFill = false) {
  if (!data || data.length === 0) return '';
  
  const minX = Math.min(...data.map((d) => d[0]));
  const maxX = Math.max(...data.map((d) => d[0]));
  const minY = 0; 
  const maxY = Math.max(...data.map((d) => d[1])) * 1.3; // 30% top padding
  
  // Prevent division by zero
  const rangeX = maxX - minX || 1;
  const rangeY = maxY - minY || 1;

  let d = '';
  data.forEach((point, i) => {
    const x = ((point[0] - minX) / rangeX) * width;
    const y = height - ((point[1] - minY) / rangeY) * height;
    if (i === 0) {
      d += `M ${x} ${y} `;
    } else {
      d += `L ${x} ${y} `;
    }
  });

  if (isFill) {
    d += `L ${width} ${height} L 0 ${height} Z`;
  }

  return d;
}

export async function GET(request: Request) {
  try {
    const [metaRes, serversRes, playersRes] = await Promise.all([
      fetch(`https://bstats.org/api/v1/plugins/${PLUGIN_ID}`),
      fetch(`https://bstats.org/api/v1/plugins/${PLUGIN_ID}/charts/servers/data?maxElements=100`),
      fetch(`https://bstats.org/api/v1/plugins/${PLUGIN_ID}/charts/players/data?maxElements=100`)
    ]);

    const meta = await metaRes.json();
    const serversData = await serversRes.json();
    const playersData = await playersRes.json();

    const pluginName = meta.name || "Grief Prevention GUI Addon";
    const currentServers = serversData.length > 0 ? serversData[serversData.length - 1][1] : 0;
    const currentPlayers = playersData.length > 0 ? playersData[playersData.length - 1][1] : 0;

    const width = 800;
    const height = 400;

    const chartWidth = 800;
    const chartHeight = 250;

    const serversPath = generatePath(serversData, chartWidth, chartHeight);
    const serversFill = generatePath(serversData, chartWidth, chartHeight, true);
    
    const playersPath = generatePath(playersData, chartWidth, chartHeight);
    const playersFill = generatePath(playersData, chartWidth, chartHeight, true);

    return new ImageResponse(
      (
        <div
          style={{
            display: 'flex',
            width: '100%',
            height: '100%',
            backgroundColor: 'transparent',
            padding: '20px', // padding around the rounded card
            flexDirection: 'column',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              width: '100%',
              height: '100%',
              backgroundColor: '#1E1E2E', // Dark rounded background to work on both light/dark forums
              borderRadius: '32px',
              border: '2px solid rgba(255,255,255,0.1)',
              boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
              overflow: 'hidden',
              position: 'relative',
              fontFamily: 'sans-serif',
            }}
          >
            {/* Header section */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '40px',
                zIndex: 10,
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ color: '#A6ACCD', fontSize: 24, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 2 }}>
                  Live Statistics
                </span>
                <span style={{ color: '#FFFFFF', fontSize: 42, fontWeight: 800, marginTop: 4 }}>
                  {pluginName}
                </span>
              </div>
              
              <div style={{ display: 'flex', gap: '30px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                  <span style={{ color: '#82AAFF', fontSize: 20, fontWeight: 600, textTransform: 'uppercase' }}>Servers</span>
                  <span style={{ color: '#FFFFFF', fontSize: 36, fontWeight: 800 }}>{currentServers.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                  <span style={{ color: '#F07178', fontSize: 20, fontWeight: 600, textTransform: 'uppercase' }}>Players</span>
                  <span style={{ color: '#FFFFFF', fontSize: 36, fontWeight: 800 }}>{currentPlayers.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Chart Area */}
            <div
              style={{
                display: 'flex',
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: `${chartHeight}px`,
                width: '100%',
                opacity: 0.8,
              }}
            >
              <svg width="100%" height="100%" viewBox={`0 0 ${chartWidth} ${chartHeight}`} preserveAspectRatio="none">
                {/* Players Chart (Red) */}
                <path d={playersFill} fill="rgba(240, 113, 120, 0.2)" />
                <path d={playersPath} fill="none" stroke="#F07178" strokeWidth="4" />

                {/* Servers Chart (Blue) */}
                <path d={serversFill} fill="rgba(130, 170, 255, 0.3)" />
                <path d={serversPath} fill="none" stroke="#82AAFF" strokeWidth="4" />
              </svg>
            </div>
            
            {/* Glossy overlay effect to make it look premium */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '40%',
                background: 'linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0) 100%)',
                pointerEvents: 'none',
              }}
            />
          </div>
        </div>
      ),
      {
        width: 800,
        height: 400,
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
