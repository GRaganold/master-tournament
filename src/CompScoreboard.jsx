import React, { useState, useEffect } from 'react'
import Papa from 'papaparse' // Import PapaParse

const CompLeaderboard = ({ players, loading, error, tableStyle }) => {
  const [csvData, setCsvData] = useState([])
  const [playerTotals, setPlayerTotals] = useState([])

  // Add this in your component
  const [searchTerm, setSearchTerm] = useState('')
  const [matchedNames, setMatchedNames] = useState([])
  const [selectedName, setSelectedName] = useState(null)
  const [isSmallScreen, setIsSmallScreen] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth < 750)
    }

    window.addEventListener('resize', handleResize)
    handleResize() // Initialize on load

    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleInputChange = (e) => {
    const value = e.target.value
    setSearchTerm(value)

    if (value.length >= 2) {
      const matches = playerTotals
        .map((p) => p.rowName)
        .filter((name) => name.toLowerCase().includes(value.toLowerCase()))

      setMatchedNames(matches)
      setSelectedName(matches.length === 1 ? matches[0] : null)
    } else {
      setMatchedNames([])
      setSelectedName(null)
    }
  }

  // Helper function to convert score values
  const parseScore = (value) => {
    if (typeof value === 'number') return value
    if (value === 'E') return 0

    const num = parseInt(value, 10)
    return isNaN(num) ? 0 : num
  }

  // Fetch and parse the CSV file when the component mounts
  useEffect(() => {
    fetch('/golf_players.csv')
      .then((response) => response.text())
      .then((csv) => {
        Papa.parse(csv, {
          complete: (result) => {
            setCsvData(result.data) // Set the parsed CSV data
          },
        })
      })
  }, [])

  // Function to get a player by their full name or display_name2
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const findPlayerByName = (playerName) => {
    return players.find((p) => {
      const fullName = `${p.first_name} ${p.last_name}`.toLowerCase()
      return (
        fullName === playerName.toLowerCase() ||
        p.display_name2?.toLowerCase() === playerName.toLowerCase()
      )
    })
  }

  // Recalculate player totals whenever CSV data or players change
  useEffect(() => {
    if (csvData.length > 0 && players.length > 0) {
      const totals = csvData
        .slice(1) // skip headers
        .map((row) => {
          const playerNames = row.slice(1, 11) // Assuming players are in columns 1 to 10

          let toparTotal = 0
          let todayTotal = 0
          let thruTotal = 0
          let finishedCount = 0
          let r1 = 0,
            r1prior = null,
            r2prior = null,
            r2 = 0,
            r3prior = null,
            r3 = 0,
            r4prior = null,
            r4 = 0

          playerNames.forEach((name) => {
            if (name && name.trim() !== '') {
              const player = findPlayerByName(name)
              if (player) {
                toparTotal += parseScore(player.topar)
                todayTotal += parseScore(player.today)
                r1 += parseScore(player.round1?.fantasy)
                r1prior += parseScore(player.round1?.prior)
                r2 += parseScore(player.round2?.fantasy)
                r2prior += parseScore(player.round2?.prior)
                r3 += parseScore(player.round3?.fantasy)
                r3prior += parseScore(player.round3?.prior)
                r4 += parseScore(player.round4?.fantasy)
                r4prior += parseScore(player.round4?.prior)

                if (player.thru === 'F') {
                  finishedCount += 1
                } else {
                  thruTotal += parseScore(player.thru)
                }
              }
            }
          })

          return {
            rowName: row[0],
            toparTotal,
            todayTotal,
            thruTotal,
            finishedCount, // total number of players who are "F"
            r1,
            r2,
            r3,
            r4,
            r1prior,
            r2prior,
            r3prior,
            r4prior,
          }
        })

      setPlayerTotals(totals)
    }
  }, [csvData, findPlayerByName, players])

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  if (csvData.length === 0 || players.length === 0) {
    return <div>Loading data...</div>
  }

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
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
                  <tr style={{ fontSize: 'calc(2vh- 0px)', fontWeight: 'bold' }}>
                    <th style={{ border: '1px solid black', padding: '8px' }}>Pos</th>
                    <th style={{ border: '1px solid black', padding: '8px' }}>Player</th>
                    <th style={{ border: '1px solid black', padding: '8px' }}>Total</th>
                    <th style={{ border: '1px solid black', padding: '8px' }}>Yet to Finish</th>
                    <th style={{ border: '1px solid black', padding: '8px' }}>Today</th>
                    <th style={{ border: '1px solid black', padding: '8px' }}>R1</th>
                    <th style={{ border: '1px solid black', padding: '8px' }}>R2</th>
                    <th style={{ border: '1px solid black', padding: '8px' }}>R3</th>
                    <th style={{ border: '1px solid black', padding: '8px' }}>R4</th>
                  </tr>
                </thead>
                <tbody style={{ fontWeight: 'bold' }}>
                  {[...playerTotals]
                    .filter(({ rowName }) => rowName.trim() !== '') // Remove rows where rowName is blank
                    .sort((a, b) => a.toparTotal - b.toparTotal) // Sort by total
                    .map(
                      (
                        {
                          rowName,
                          toparTotal,
                          todayTotal,
                          r1,
                          r2,
                          r3,
                          r4,
                          finishedCount,
                          r2prior,
                          r3prior,
                          r4prior,
                        },
                        index
                      ) => (
                        <tr
                          key={rowName}
                          style={{
                            backgroundColor:
                              index === 0
                                ? 'gold'
                                : index === 1
                                  ? 'silver'
                                  : index === 2
                                    ? '#cd7f32' // bronze color hex
                                    : 'transparent', // default background
                          }}
                        >
                          <td style={{ ...tableStyle, width: '50px' }} align="center">
                            {index + 1}
                          </td>
                          <td style={{ ...tableStyle }} align="left">
                            {rowName}
                          </td>
                          <td
                            style={{
                              ...tableStyle,
                              color: toparTotal < 0 ? 'rgb(186, 12, 47)' : '#3c3c3b',
                            }}
                          >
                            {toparTotal}
                          </td>
                          <td style={{ ...tableStyle, fontWeight: 'normal' }}>
                            {' '}
                            {finishedCount === 0 ? 10 - finishedCount : 'no'}
                          </td>
                          <td
                            style={{
                              ...tableStyle,
                              color: todayTotal < 0 ? 'rgb(186, 12, 47)' : '#3c3c3b',
                            }}
                          >
                            {todayTotal === 0 ? 'E' : todayTotal}
                          </td>
                          <td
                            style={{
                              ...tableStyle,
                              color: r1 < 0 ? 'rgb(186, 12, 47)' : '#3c3c3b',
                            }}
                          >
                            {r1 === 0 ? 'E' : r1}
                          </td>

                          <td
                            style={{
                              ...tableStyle,
                              color: r2 < 0 ? 'rgb(186, 12, 47)' : '#3c3c3b',
                            }}
                          >
                            {r2prior === null ? (r2 === 0 ? 'E' : r2) : null}
                          </td>
                          <td
                            style={{
                              ...tableStyle,
                              color: r3 < 0 ? 'rgb(186, 12, 47)' : '#3c3c3b',
                            }}
                          >
                            {r3prior === null ? (r3 === 0 ? 'E' : r3) : null}
                          </td>
                          <td
                            style={{
                              ...tableStyle,
                              color: r4 < 0 ? 'rgb(186, 12, 47)' : '#3c3c3b',
                            }}
                          >
                            {r4prior === null ? (r4 === 0 ? 'E' : r4) : null}
                          </td>
                        </tr>
                      )
                    )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div style={{ position: 'relative', paddingTop: '100px' }}>
          <h1> Find yourself</h1>

          <div style={{ textAlign: 'center', marginBottom: '10px' }}>
            <input
              type="text"
              value={searchTerm}
              onChange={handleInputChange}
              placeholder="Type your name..."
              style={{
                padding: '8px',
                width: '300px',
                fontSize: '16px',
                border: '1px solid #ccc',
                borderRadius: '4px',
              }}
            />
            {matchedNames.length > 1 && (
              <ul
                style={{
                  listStyle: 'none',
                  padding: '0',
                  margin: '8px auto',
                  width: '300px',
                  backgroundColor: '#fff',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  textAlign: 'left',
                  maxHeight: '250px',
                  overflowY: 'auto',
                  zIndex: 1000,
                  position: 'absolute',
                  left: '50%',
                  transform: 'translateX(-50%) translateY(-100%)', // Move up by its full height
                  bottom: -120, // Position above the anchor
                  color: '#3c3c3b',
                }}
              >
                {matchedNames.map((name) => (
                  <li
                    key={name}
                    onClick={() => {
                      setSearchTerm(name)
                      setMatchedNames([])
                      setSelectedName(name)
                    }}
                    style={{
                      padding: '8px',
                      cursor: 'pointer',
                      borderBottom: '1px solid #eee',
                    }}
                  >
                    {name}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div style={{ textAlign: 'center', marginBottom: '10px' }}>
          {selectedName && (
            <div
            style={{
              position: 'relative',
              overflowY: 'auto',
              height: 'auto',
              width: '100%',              // ✅ Use full width of the container
              maxWidth: '600px',          // ✅ Cap the width
              margin:"2px auto",
              backgroundColor: '#f6f2ee',
              boxShadow: '0 0 10px rgba(0,0,0,0.2)',
              boxSizing: 'border-box',    // ✅ Ensures padding/margins are included in width
              fontSize: 'calc(2vh - 2px)',
              
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
                    <th style={{ border: '1px solid black', padding: '8px' }}>Yet to Finish</th>
                    <th style={{ border: '1px solid black', padding: '8px' }}>Today</th>
                    <th style={{ border: '1px solid black', padding: '8px' }}>R1</th>
                    <th style={{ border: '1px solid black', padding: '8px' }}>R2</th>
                    <th style={{ border: '1px solid black', padding: '8px' }}>R3</th>
                    <th style={{ border: '1px solid black', padding: '8px' }}>R4</th>
                  </tr>
                </thead>
                <tbody style={{ fontWeight: 'bold' }}>
                  {[...playerTotals]
                    .filter(({ rowName }) => rowName.trim() !== '') // Remove blanks
                    .sort((a, b) => a.toparTotal - b.toparTotal) // Sort by total
                    .map((p, index) => ({ ...p, rank: index + 1 })) // Add rank
                    .filter((p) => p.rowName === selectedName) // Filter for selected
                    .map(
                      ({
                        rowName,
                        toparTotal,
                        todayTotal,
                        r1,
                        r2,
                        r3,
                        r4,
                        finishedCount,
                        r2prior,
                        r3prior,
                        r4prior,
                        rank,
                      }) => (
                        <tr
                          key={rowName}
                          style={{
                            backgroundColor:
                              rank === 1
                                ? 'gold'
                                : rank === 2
                                  ? 'silver'
                                  : rank === 3
                                    ? '#cd7f32' // bronze color hex
                                    : 'transparent', // default background
                          }}
                        >
                          <td style={{ ...tableStyle, width: '50px' }} align="center">
                            {rank}
                          </td>
                          <td style={{ ...tableStyle }} align="left">
                            {rowName}
                          </td>
                          <td
                            style={{
                              ...tableStyle,
                              color: toparTotal < 0 ? 'rgb(186, 12, 47)' : '#3c3c3b',
                            }}
                          >
                            {toparTotal}
                          </td>
                          <td style={{ ...tableStyle, fontWeight: 'normal' }}>
                            {' '}
                            {finishedCount === 0 ? 10 - finishedCount : 'no'}
                          </td>
                          <td
                            style={{
                              ...tableStyle,
                              color: todayTotal < 0 ? 'rgb(186, 12, 47)' : '#3c3c3b',
                            }}
                          >
                            {todayTotal}
                          </td>
                          <td
                            style={{
                              ...tableStyle,
                              color: r1 < 0 ? 'rgb(186, 12, 47)' : '#3c3c3b',
                            }}
                          >
                            {r1 === 0 ? 'E' : r1}
                          </td>

                          <td
                            style={{
                              ...tableStyle,
                              color: r2 < 0 ? 'rgb(186, 12, 47)' : '#3c3c3b',
                            }}
                          >
                            {r2prior === null ? (r2 === 0 ? 'E' : r2) : null}
                          </td>
                          <td
                            style={{
                              ...tableStyle,
                              color: r3 < 0 ? 'rgb(186, 12, 47)' : '#3c3c3b',
                            }}
                          >
                            {r3prior === null ? (r3 === 0 ? 'E' : r3) : null}
                          </td>
                          <td
                            style={{
                              ...tableStyle,
                              color: r4 < 0 ? 'rgb(186, 12, 47)' : '#3c3c3b',
                            }}
                          >
                            {r4prior === null ? (r4 === 0 ? 'E' : r4) : null}
                          </td>
                        </tr>
                      )
                    )}
                </tbody>
              </table>

            </div>
          )}
          </div>
        </div>
      </div>
    </>
  )
}

export default CompLeaderboard
