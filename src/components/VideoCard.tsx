import { VideoData } from '../types'
import { format } from 'date-fns'
import './VideoCard.css'

interface VideoCardProps {
  video: VideoData
  onAnalyze?: (videoId: string, videoTitle: string) => void
  onChannelClick?: (channelId: string, channelTitle: string) => void
  onTranscript?: (videoId: string, videoTitle: string) => void
  onComments?: (videoId: string, videoTitle: string) => void
}

function VideoCard({ video, onAnalyze, onChannelClick, onTranscript, onComments }: VideoCardProps) {
  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  return (
    <div className="video-card">
      <div className="video-thumbnail">
        <img src={video.thumbnail} alt={video.title} />
        <span className="video-duration">{video.duration}</span>
      </div>
      <div className="video-content">
        <h3 className="video-title" title={video.title}>
          {video.title}
        </h3>
        <div className="video-channel">
          {onChannelClick ? (
            <strong 
              className="channel-link"
              onClick={() => onChannelClick(video.channelId, video.channelTitle)}
            >
              {video.channelTitle}
            </strong>
          ) : (
            <strong>{video.channelTitle}</strong>
          )}
          {video.channelCountry && (
            <span className="channel-country"> ({video.channelCountry})</span>
          )}
        </div>
        <div className="video-stats">
          <div className="stat-item">
            <span className="stat-label">조회수:</span>
            <span className="stat-value">{formatNumber(video.viewCount)}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">좋아요:</span>
            <span className="stat-value">{formatNumber(video.likeCount)}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">구독자:</span>
            <span className="stat-value">{formatNumber(video.subscriberCount)}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">조회/구독 비율:</span>
            <span className="stat-value">{video.viewSubscriberRatio.toFixed(2)}</span>
          </div>
        </div>
        <div className="video-meta">
          <span className="video-date">
            {format(new Date(video.publishedAt), 'yyyy년 MM월 dd일')}
          </span>
        </div>
        {video.description && (
          <p className="video-description" title={video.description}>
            {video.description.length > 100 
              ? `${video.description.substring(0, 100)}...` 
              : video.description}
          </p>
        )}
        {video.tags && video.tags.length > 0 && (
          <div className="video-tags">
            {video.tags.slice(0, 5).map((tag, idx) => (
              <span key={idx} className="tag">{tag}</span>
            ))}
          </div>
        )}
        <div className="video-actions">
          <a
            href={`https://www.youtube.com/watch?v=${video.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="video-link"
          >
            YouTube에서 보기 →
          </a>
          <div className="video-action-buttons">
            {onAnalyze && (
              <button
                onClick={() => onAnalyze(video.id, video.title)}
                className="video-action-button video-analyze-button"
              >
                분석
              </button>
            )}
            {onTranscript && (
              <button
                onClick={() => onTranscript(video.id, video.title)}
                className="video-action-button video-transcript-button"
              >
                스크립트
              </button>
            )}
            {onComments && (
              <button
                onClick={() => onComments(video.id, video.title)}
                className="video-action-button video-comments-button"
              >
                댓글
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default VideoCard

