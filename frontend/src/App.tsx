import { useState } from 'react'

function App() {
  const [message, setMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleClick = async () => {
    setLoading(true)
    setError(null)
    try {
      const apiUrl = import.meta.env.VITE_API_URL ?? ''
      const res = await fetch(`${apiUrl}/api/hello`)
      if (!res.ok) {
        throw new Error(`HTTPエラー: ${res.status}`)
      }
      const data = await res.json()
      setMessage(data.message)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'エラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>AgentTest App</h1>
      <button onClick={handleClick} disabled={loading}>
        {loading ? '読み込み中...' : 'クリック'}
      </button>
      {message && <p>{message}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  )
}

export default App
