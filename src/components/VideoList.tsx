import { VideoData } from '../types'
import VideoCard from './VideoCard'
import VideoTable from './VideoTable'
import './VideoList.css'

interface VideoListProps {
  videos: VideoData[]
  viewMode: 'card' | 'table'
  onExportExcel: () => void
  onSendEmail: () => void
  onAnalyze?: (videoId: string, videoTitle: string) => void
  onChannelClick?: (channelId: string, channelTitle: string) => void
  onTranscript?: (videoId: string, videoTitle: string) => void
  onComments?: (videoId: string, videoTitle: string) => void
}

function VideoList({ videos, viewMode, onExportExcel, onSendEmail, onAnalyze, onChannelClick, onTranscript, onComments }: VideoListProps) {
  if (videos.length === 0) {
    return (
      <div className="video-list-empty">
        <p>검색 결과가 없습니다. 검색어를 입력해주세요.</p>
      </div>
    )
  }

  return (
    <div className="video-list">
      <div className="video-list-header">
        <div className="video-count">
          총 <strong>{videos.length}</strong>개의 결과
        </div>
        <div className="video-actions">
          <button onClick={onExportExcel} className="action-button export-button">
            엑셀 변환 후 저장
          </button>
          <button onClick={onSendEmail} className="action-button email-button">
            결과 분석 링크 이메일 보내기
          </button>
        </div>
      </div>

      {viewMode === 'card' ? (
        <div className="video-grid">
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
      ) : (
        <VideoTable 
          videos={videos} 
          onAnalyze={onAnalyze} 
          onChannelClick={onChannelClick}
          onTranscript={onTranscript}
          onComments={onComments}
        />
      )}
    </div>
  )
}

export default VideoList

