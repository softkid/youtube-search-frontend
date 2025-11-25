import { VideoData } from '../types'
import VideoCard from './VideoCard'
import './TrendingVideos.css'

interface TrendingVideosProps {
  videos: VideoData[]
  loading: boolean
  regionCode?: string
  categoryId?: string
  onAnalyze?: (videoId: string, videoTitle: string) => void
  onChannelClick?: (channelId: string, channelTitle: string) => void
  onTranscript?: (videoId: string, videoTitle: string) => void
  onComments?: (videoId: string, videoTitle: string) => void
}

function TrendingVideos({ videos, loading, regionCode, categoryId, onAnalyze, onChannelClick, onTranscript, onComments }: TrendingVideosProps) {
  if (loading) {
    return (
      <div className="trending-videos-section">
        <h2 className="trending-title">트렌딩 비디오</h2>
        <div className="trending-loading">로딩 중...</div>
      </div>
    )
  }

  const displayRegionCode = regionCode || 'US'

  if (!loading && videos.length === 0) {
    return null
  }

  return (
    <div className="trending-videos-section">
      <h2 className="trending-title">
        트렌딩 비디오
        {categoryId && <span className="trending-subtitle"> (카테고리: {categoryId})</span>}
        <span className="trending-subtitle"> (지역: {displayRegionCode})</span>
      </h2>
      <div className="trending-videos-grid">
        {videos.map(video => (
          <VideoCard 
            key={video.id} 
            video={video} 
            onAnalyze={onAnalyze} 
            onChannelClick={onChannelClick}
            onTranscript={onTranscript}
            onComments={onComments}
          />
        ))}
      </div>
    </div>
  )
}

export default TrendingVideos

