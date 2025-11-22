import { VideoData } from '../types'
import { format } from 'date-fns'
import './VideoTable.css'

interface VideoTableProps {
  videos: VideoData[]
  onAnalyze?: (videoId: string, videoTitle: string) => void
  onChannelClick?: (channelId: string, channelTitle: string) => void
  onTranscript?: (videoId: string, videoTitle: string) => void
  onComments?: (videoId: string, videoTitle: string) => void
}

function VideoTable({ videos, onAnalyze, onChannelClick, onTranscript, onComments }: VideoTableProps) {
  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  return (
    <div className="video-table-wrapper">
      <table className="video-table">
        <thead>
          <tr>
            <th>썸네일</th>
            <th>제목</th>
            <th>채널</th>
            <th>국가</th>
            <th>게시일</th>
            <th>조회수</th>
            <th>좋아요</th>
            <th>길이</th>
            <th>구독자</th>
            <th>조회/구독 비율</th>
            <th>태그</th>
            <th>링크</th>
            {(onAnalyze || onTranscript || onComments) && <th>작업</th>}
          </tr>
        </thead>
        <tbody>
          {videos.map(video => (
            <tr key={video.id}>
              <td>
                <img 
                  src={video.thumbnail} 
                  alt={video.title}
                  className="table-thumbnail"
                />
              </td>
              <td>
                <div className="table-title" title={video.title}>
                  {video.title}
                </div>
                {video.description && (
                  <div className="table-description" title={video.description}>
                    {video.description.length > 100 
                      ? `${video.description.substring(0, 100)}...` 
                      : video.description}
                  </div>
                )}
              </td>
              <td>
                {onChannelClick ? (
                  <span 
                    className="channel-link"
                    onClick={() => onChannelClick(video.channelId, video.channelTitle)}
                  >
                    {video.channelTitle}
                  </span>
                ) : (
                  video.channelTitle
                )}
              </td>
              <td>
                {video.channelCountry || '-'}
              </td>
              <td>
                {format(new Date(video.publishedAt), 'yyyy-MM-dd')}
              </td>
              <td className="number-cell">{formatNumber(video.viewCount)}</td>
              <td className="number-cell">{formatNumber(video.likeCount)}</td>
              <td>{video.duration}</td>
              <td className="number-cell">{formatNumber(video.subscriberCount)}</td>
              <td className="number-cell">{video.viewSubscriberRatio.toFixed(2)}</td>
              <td>
                {video.tags && video.tags.length > 0 ? (
                  <div className="table-tags">
                    {video.tags.slice(0, 3).map((tag, idx) => (
                      <span key={idx} className="table-tag">{tag}</span>
                    ))}
                    {video.tags.length > 3 && (
                      <span className="table-tag-more">+{video.tags.length - 3}</span>
                    )}
                  </div>
                ) : (
                  '-'
                )}
              </td>
              <td>
                <a
                  href={`https://www.youtube.com/watch?v=${video.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="table-link"
                >
                  보기
                </a>
              </td>
              {(onAnalyze || onTranscript || onComments) && (
                <td>
                  <div className="table-action-buttons">
                    {onAnalyze && (
                      <button
                        onClick={() => onAnalyze(video.id, video.title)}
                        className="table-action-button table-analyze-button"
                        title="분석"
                      >
                        분석
                      </button>
                    )}
                    {onTranscript && (
                      <button
                        onClick={() => onTranscript(video.id, video.title)}
                        className="table-action-button table-transcript-button"
                        title="스크립트"
                      >
                        스크립트
                      </button>
                    )}
                    {onComments && (
                      <button
                        onClick={() => onComments(video.id, video.title)}
                        className="table-action-button table-comments-button"
                        title="댓글"
                      >
                        댓글
                      </button>
                    )}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default VideoTable

