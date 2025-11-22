import { useState, useEffect } from 'react'
import SearchBar from './components/SearchBar'
import FilterPanel from './components/FilterPanel'
import VideoList from './components/VideoList'
import TrendingVideos from './components/TrendingVideos'
import VideoAnalysisModal from './components/VideoAnalysisModal'
import ChannelModal from './components/ChannelModal'
import TranscriptModal from './components/TranscriptModal'
import CommentsModal from './components/CommentsModal'
import { VideoData, FilterOptions } from './types'
import { searchVideos, getTrendingVideos, getVideoCategories, VideoCategory } from './services/youtubeApi'
import * as XLSX from 'xlsx'
import './App.css'

function App() {
  const [videos, setVideos] = useState<VideoData[]>([])
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState<FilterOptions>({
    duration: 'all',
    period: 'all',
    viewSubscriberRatio: []
  })
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card')
  const [analysisModal, setAnalysisModal] = useState<{
    isOpen: boolean
    videoId: string
    videoTitle: string
  }>({
    isOpen: false,
    videoId: '',
    videoTitle: ''
  })
  const [regionCode, setRegionCode] = useState<string | undefined>(undefined)
  const [categoryId, setCategoryId] = useState<string | undefined>(undefined)
  const [trendingVideos, setTrendingVideos] = useState<VideoData[]>([])
  const [trendingLoading, setTrendingLoading] = useState(false)
  const [categories, setCategories] = useState<VideoCategory[]>([])
  const [categoriesLoading, setCategoriesLoading] = useState(false)
  const [channelModal, setChannelModal] = useState<{
    isOpen: boolean
    channelId: string
    channelTitle: string
  }>({
    isOpen: false,
    channelId: '',
    channelTitle: ''
  })
  const [transcriptModal, setTranscriptModal] = useState<{
    isOpen: boolean
    videoId: string
    videoTitle: string
  }>({
    isOpen: false,
    videoId: '',
    videoTitle: ''
  })
  const [commentsModal, setCommentsModal] = useState<{
    isOpen: boolean
    videoId: string
    videoTitle: string
  }>({
    isOpen: false,
    videoId: '',
    videoTitle: ''
  })

  const handleSearch = async (query: string) => {
    if (!query.trim()) return
    
    setLoading(true)
    try {
      const results = await searchVideos(query, filters)
      setVideos(results)
    } catch (error) {
      console.error('Search error:', error)
      alert('검색 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (newFilters: FilterOptions) => {
    setFilters(newFilters)
  }

  const handleAnalyze = (videoId: string, videoTitle: string) => {
    setAnalysisModal({
      isOpen: true,
      videoId,
      videoTitle
    })
  }

  const handleCloseAnalysis = () => {
    setAnalysisModal({
      isOpen: false,
      videoId: '',
      videoTitle: ''
    })
  }

  // 지역 변경 시 카테고리 로드
  useEffect(() => {
    const loadCategories = async () => {
      setCategoriesLoading(true)
      try {
        // 전체 지역 선택 시 기본 지역(US)의 카테고리 표시
        const regionToUse = regionCode || 'US'
        const cats = await getVideoCategories(regionToUse)
        setCategories(cats)
      } catch (error) {
        console.error('Failed to load categories:', error)
        setCategories([])
      } finally {
        setCategoriesLoading(false)
      }
    }
    loadCategories()
  }, [regionCode])

  // 지역 또는 카테고리 변경 시 트렌딩 비디오 로드
  useEffect(() => {
    const loadTrendingVideos = async () => {
      if (!regionCode) {
        setTrendingVideos([])
        setTrendingLoading(false)
        return
      }
      setTrendingLoading(true)
      try {
        const trending = await getTrendingVideos(regionCode, categoryId, 10)
        setTrendingVideos(trending)
      } catch (error) {
        console.error('Failed to load trending videos:', error)
        setTrendingVideos([])
      } finally {
        setTrendingLoading(false)
      }
    }
    loadTrendingVideos()
  }, [regionCode, categoryId])

  const handleRegionChange = (newRegionCode?: string) => {
    setRegionCode(newRegionCode)
    setCategoryId(undefined) // 지역 변경 시 카테고리 초기화
  }

  const handleCategoryChange = (newCategoryId?: string) => {
    setCategoryId(newCategoryId)
  }

  const handleChannelClick = (channelId: string, channelTitle: string) => {
    setChannelModal({
      isOpen: true,
      channelId,
      channelTitle
    })
  }

  const handleCloseChannel = () => {
    setChannelModal({
      isOpen: false,
      channelId: '',
      channelTitle: ''
    })
  }

  const handleTranscript = (videoId: string, videoTitle: string) => {
    setTranscriptModal({
      isOpen: true,
      videoId,
      videoTitle
    })
  }

  const handleCloseTranscript = () => {
    setTranscriptModal({
      isOpen: false,
      videoId: '',
      videoTitle: ''
    })
  }

  const handleComments = (videoId: string, videoTitle: string) => {
    setCommentsModal({
      isOpen: true,
      videoId,
      videoTitle
    })
  }

  const handleCloseComments = () => {
    setCommentsModal({
      isOpen: false,
      videoId: '',
      videoTitle: ''
    })
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>YouTube 채널 검색</h1>
      </header>
      <main className="app-main">
        <SearchBar onSearch={handleSearch} loading={loading} />
        <FilterPanel 
          filters={filters} 
          onFilterChange={handleFilterChange}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          regionCode={regionCode}
          onRegionChange={handleRegionChange}
          categoryId={categoryId}
          onCategoryChange={handleCategoryChange}
          categories={categories}
          categoriesLoading={categoriesLoading}
        />
        <TrendingVideos
          videos={trendingVideos}
          loading={trendingLoading}
          regionCode={regionCode}
          categoryId={categoryId}
          onAnalyze={handleAnalyze}
          onChannelClick={handleChannelClick}
          onTranscript={handleTranscript}
          onComments={handleComments}
        />
        <VideoList 
          videos={videos} 
          viewMode={viewMode}
          onExportExcel={() => {
            // 엑셀 변환 기능
            const data = videos.map(v => ({
              제목: v.title,
              게시일: v.publishedAt,
              조회수: v.viewCount,
              좋아요: v.likeCount,
              채널: v.channelTitle,
              길이: v.duration,
              구독자: v.subscriberCount,
              '조회/구독 비율': v.viewSubscriberRatio.toFixed(2),
              설명: v.description,
              태그: v.tags?.join(', ') || '',
              링크: `https://www.youtube.com/watch?v=${v.id}`
            }))
            const ws = XLSX.utils.json_to_sheet(data)
            const wb = XLSX.utils.book_new()
            XLSX.utils.book_append_sheet(wb, ws, 'YouTube 검색 결과')
            XLSX.writeFile(wb, `youtube_search_results_${new Date().toISOString().split('T')[0]}.xlsx`)
          }}
          onSendEmail={() => {
            // 이메일 전송 기능
            const subject = encodeURIComponent('YouTube 검색 결과 분석')
            const body = encodeURIComponent(`검색 결과: ${videos.length}개\n\n${window.location.href}`)
            window.location.href = `mailto:?subject=${subject}&body=${body}`
          }}
          onAnalyze={handleAnalyze}
          onChannelClick={handleChannelClick}
          onTranscript={handleTranscript}
          onComments={handleComments}
        />
        <VideoAnalysisModal
          videoId={analysisModal.videoId}
          videoTitle={analysisModal.videoTitle}
          isOpen={analysisModal.isOpen}
          onClose={handleCloseAnalysis}
        />
        <ChannelModal
          channelId={channelModal.channelId}
          channelTitle={channelModal.channelTitle}
          isOpen={channelModal.isOpen}
          onClose={handleCloseChannel}
        />
        <TranscriptModal
          videoId={transcriptModal.videoId}
          videoTitle={transcriptModal.videoTitle}
          isOpen={transcriptModal.isOpen}
          onClose={handleCloseTranscript}
        />
        <CommentsModal
          videoId={commentsModal.videoId}
          videoTitle={commentsModal.videoTitle}
          isOpen={commentsModal.isOpen}
          onClose={handleCloseComments}
        />
      </main>
    </div>
  )
}

export default App

