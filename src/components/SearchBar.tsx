import { useState } from 'react'
import './SearchBar.css'

interface SearchBarProps {
  onSearch: (query: string) => void
  loading: boolean
}

function SearchBar({ onSearch, loading }: SearchBarProps) {
  const [query, setQuery] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      onSearch(query.trim())
    }
  }

  return (
    <form className="search-bar" onSubmit={handleSubmit}>
      <div className="search-input-wrapper">
        <input
          type="text"
          className="search-input"
          placeholder="YouTube 채널 또는 키워드 검색..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          disabled={loading}
        />
        <button 
          type="submit" 
          className="search-button"
          disabled={loading || !query.trim()}
        >
          {loading ? '검색 중...' : '검색'}
        </button>
      </div>
    </form>
  )
}

export default SearchBar

