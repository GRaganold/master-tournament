import './App.css'
import MastersLeaderboard from './urlFetch'
import CompLeaderboard from './CompScoreboard'
import { useState, useEffect } from 'react'

function App() {
  const [players, setPlayers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [timeLeft, setTimeLeft] = useState(0)
  const [lastUpdated, setLastUpdated] = useState(null)

  const tableStyle = {
    border: '1px solid black',
    background: 'transparent',
    width: '100%',
    height: '26px',
    lineHeight: '26px',
  }

  const REFRESH_INTERVAL_MINUTES = 5

  // Function to fetch data from the API
  const fetchLeaderboardData = async () => {
	try {
	  const response = await fetch(
		`https://www.masters.com/en_US/scores/feeds/2025/scores.json?t=${Date.now()}`, // cache-busting timestamp
		{
		  headers: {
			'User-Agent': 'Mozilla/5.0',
		  },
		}
	  )
	  if (response.ok) {
		const data = await response.json()
  
		// Only update state if data has actually changed
		if (JSON.stringify(players) !== JSON.stringify(data.data.player)) {
		  setPlayers(data.data.player)
		  setLastUpdated(new Date())
		  console.log('Data updated at', new Date().toLocaleTimeString())
		} else {
		  console.log('No change in data at', new Date().toLocaleTimeString())
		}
	  } else {
		throw new Error('Failed to fetch data')
	  }
	} catch (error) {
	  setError(error.message)
	} finally {
	  setLoading(false)
	}
  }
  

  const formatLastUpdated = (date) => {
    if (!date) return 'N/A'
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  // Function to calculate the time left until the next refresh
  const calculateTimeLeft = () => {
    const now = new Date()
    const nextFetchTime = new Date(now)
    nextFetchTime.setMinutes(
      Math.floor(now.getMinutes() / REFRESH_INTERVAL_MINUTES) * REFRESH_INTERVAL_MINUTES +
        REFRESH_INTERVAL_MINUTES
    ) // Set to next refresh interval
    nextFetchTime.setSeconds(0)
    nextFetchTime.setMilliseconds(0)

    const timeDifference = nextFetchTime - now
    setTimeLeft(timeDifference) // Set the time left until the next refresh
  }

  useEffect(() => {
    fetchLeaderboardData()
    const intervalId = setInterval(
      () => {
        fetchLeaderboardData()
        calculateTimeLeft()
      },
      REFRESH_INTERVAL_MINUTES * 60 * 1000
    ) // Convert minutes to milliseconds

    const countdownId = setInterval(() => {
      calculateTimeLeft()
    }, 1000) // Update every second

    calculateTimeLeft()

    return () => {
      clearInterval(intervalId)
      clearInterval(countdownId)
    }
  }, [])

  const formatTimeLeft = (ms) => {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const remainingSeconds = seconds % 60
    const remainingMinutes = minutes % 60

    return `${hours}:${remainingMinutes < 10 ? '0' : ''}${remainingMinutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`
  }

  return (
    <div
      style={{
        backgroundImage: "url('http://masters.com/assets/images/leaderboard/bgs/bg_lb_xs.jpg')",
        width: '100%',
        backgroundSize: 'cover',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          flex: 1,
          flexDirection: 'column',
          paddingBottom: '100px',
          width: '100%', // margin: 0 auto;
          //   padding:  0 2rem ;
        }}
      >
        <div>
          <h1> Masters Leader Board</h1>
          <p>Last updated at: {formatLastUpdated(lastUpdated)}</p>
          <p>Time left until next refresh: {formatTimeLeft(timeLeft)}</p>
          <MastersLeaderboard
            players={players}
            loading={loading}
            error={error}
            tableStyle={tableStyle}
          />
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <CompLeaderboard
            players={players}
            loading={loading}
            error={error}
            tableStyle={tableStyle}
          />
          <br />
          <br />
          <br />
        </div>
      </div>
    </div>
  )
}

export default App
