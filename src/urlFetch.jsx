import React, { useState, useEffect } from 'react'

const MastersLeaderboard = ({ players, loading, error, tableStyle }) => {
  const [isSmallScreen, setIsSmallScreen] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth < 750)
    }

    window.addEventListener('resize', handleResize)
    handleResize() // Initialize on load

    return () => window.removeEventListener('resize', handleResize)
  }, [])

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <>
      <div style={{ position: 'relative' }}>
        {/* Background */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundImage: isSmallScreen
              ? 'none'
              : "url('https://www.masters.com/assets/images/leaderboard/bgs/leaderboard-only-bg.svg')",
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            zIndex: 0,
            minHeight: '400px',
            backgroundPositionY: 'top',
          }}
        />

        {/* Content */}
        <div
          style={{
            position: 'relative',
            zIndex: 1,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-start', // align to top of scroll box
            color: 'black',
          }}
        >
          <div
            style={{
              position: 'relative',
              overflowY: 'auto',
              scrollbarGutter: 'stable',
              scrollbarColor: '#ababab #fff',
              scrollbarWidth: 'thin',
              height: 'calc(30vh + 10px)',
              width: '74vh',
              marginLeft: '15px',
              maxWidth: '1200px',
              backgroundColor: '#f6f2ee',
              boxShadow: '0 0 10px rgba(0,0,0,0.2)',
              top: 45,
              fontSize: 'calc(2vh - 2px)',
              margin:"2px"
            }}
          >
            <table style={{ width: '100%', color: 'rgb(60, 60, 59)' }}>
              <thead
                style={{
                  position: 'sticky',
                  top: 0,
                  backgroundColor: '#f6f2ee',
                  zIndex: 1,
                }}
              >
                <tr style={{ fontSize: 'calc(2vh- 2px)', fontWeight: 'bold' }}>
                  <th style={{ border: '1px solid black', padding: '8px' }}>Pos</th>
                  <th style={{ border: '1px solid black', padding: '8px' }}>Player</th>
                  <th style={{ border: '1px solid black', padding: '8px' }}>Total</th>
                  <th style={{ border: '1px solid black', padding: '8px' }}>Thru</th>
                  <th style={{ border: '1px solid black', padding: '8px' }}>Today</th>
                  <th style={{ border: '1px solid black', padding: '8px' }}>R1</th>
                  <th style={{ border: '1px solid black', padding: '8px' }}>R2</th>
                  <th style={{ border: '1px solid black', padding: '8px' }}>R3</th>
                  <th style={{ border: '1px solid black', padding: '8px' }}>R4</th>
                  <th style={{ border: '1px solid black', padding: '8px' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {players.map((player) => {
                  // Calculate the total once and reuse it
                  const scoreTotal =
                    (player.round1.fantasy ?? 0) +
                    (player.round2.fantasy ?? 0) +
                    (player.round3.fantasy ?? 0) +
                    (player.round4.fantasy ?? 0)

                  return (
                    <tr key={player.id}>
                      <td
                        style={{ ...tableStyle, width: '50px', fontWeight: 'bold' }}
                        align="center"
                      >
                        {player.pos}
                      </td>
                      <td style={{ ...tableStyle, fontWeight: 'bold' }} align="left">
                        {player.full_name}
                      </td>
                      <td
                        style={{
                          ...tableStyle,
                          fontWeight: 'bold',
                          color: scoreTotal > -1 ? '#3c3c3b' : 'rgb(186, 12, 47)',
                        }}
                      >
                        {scoreTotal === 0 ? 'E' : scoreTotal}
                      </td>
                      <td style={{ ...tableStyle }}>{player.thru === '' ? "-"  : player.thru}</td>
                      <td
                        style={{
                          ...tableStyle,
                          fontWeight: 'bold',
                          color: player.today < 0 ? 'rgb(186, 12, 47)' : 'inherit',
                          fontSize: player.today === '' ? '10px' : 'inherit',
                        }}
                      >
                        {player.today === '' ? player.teetime : player.today}
                      </td>
                      <td
                        style={{
                          ...tableStyle,
                          fontWeight: 'bold',
                          color: 'rgb(186, 12, 47)',
                        }}
                      >
                        {player.round1.total === 0 ? 'E' : player.round1.total}
                      </td>
                      <td
                        style={{
                          ...tableStyle,
                          fontWeight: 'bold',
                          color: 'rgb(186, 12, 47)',
                        }}
                      >
                        {player.round2.total === 0 ? 'E' : player.round2.total}
                      </td>
                      <td
                        style={{
                          ...tableStyle,
                          fontWeight: 'bold',
                          color: 'rgb(186, 12, 47)',
                        }}
                      >
                        {player.round3.total === 0 ? 'E' : player.round3.total}
                      </td>
                      <td
                        style={{
                          ...tableStyle,
                          fontWeight: 'bold',
                          color: 'rgb(186, 12, 47)',
                        }}
                      >
                        {player.round4.total === 0 ? 'E' : player.round4.total}
                      </td>
                      <td
                        style={{
                          ...tableStyle,
                          fontWeight: 'bold',
                          color: 'rgb(186, 12, 47)',
                        }}
                      >
                        {player.total}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  )
}

export default MastersLeaderboard
