import { useState, useEffect } from 'react'
import { getChannelStats, analyzeChannelVideos, ChannelStats, ChannelVideoAnalysis } from '../services/youtubeApi'
import { format } from 'date-fns'
import './ChannelModal.css'

interface ChannelModalProps {
  channelId: string
  channelTitle: string
  isOpen: boolean
  onClose: () => void
}

function ChannelModal({ channelId, channelTitle, isOpen, onClose }: ChannelModalProps) {
  const [stats, setStats] = useState<ChannelStats | null>(null)
  const [analysis, setAnalysis] = useState<ChannelVideoAnalysis | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'stats' | 'analysis'>('stats')

  useEffect(() => {
    if (isOpen && channelId) {
      loadChannelData()
    }
  }, [isOpen, channelId])

  const loadChannelData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [statsData, analysisData] = await Promise.all([
        getChannelStats(channelId),
        analyzeChannelVideos(channelId, 10, 'date')
      ])
      setStats(statsData)
      setAnalysis(analysisData)
    } catch (err: any) {
      setError(err.response?.data?.error || '채널 정보를 불러오는 중 오류가 발생했습니다.')
      console.error('Channel data error:', err)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content channel-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>채널 정보</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          {loading && (
            <div className="channel-loading">
              <div className="spinner"></div>
              <p>로딩 중...</p>
            </div>
          )}

          {error && (
            <div className="channel-error">
              <p>오류: {error}</p>
              <button onClick={loadChannelData} className="retry-button">다시 시도</button>
            </div>
          )}

          {stats && !loading && (
            <>
              <div className="channel-header">
                {stats.thumbnailUrl && (
                  <img 
                    src={stats.thumbnailUrl} 
                    alt={stats.title}
                    className="channel-thumbnail"
                  />
                )}
                <div className="channel-header-info">
                  <h3>{stats.title}</h3>
                  <p className="channel-id">채널 ID: {stats.channelId}</p>
                </div>
              </div>

              <div className="channel-tabs">
                <button
                  className={activeTab === 'stats' ? 'active' : ''}
                  onClick={() => setActiveTab('stats')}
                >
                  채널 통계
                </button>
                <button
                  className={activeTab === 'analysis' ? 'active' : ''}
                  onClick={() => setActiveTab('analysis')}
                >
                  비디오 분석
                </button>
              </div>

              {activeTab === 'stats' && (
                <div className="channel-stats-content">
                  <div className="stats-grid">
                    <div className="stat-card">
                      <div className="stat-label">구독자</div>
                      <div className="stat-value">{formatNumber(stats.subscriberCount)}</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-label">총 조회수</div>
                      <div className="stat-value">{formatNumber(stats.viewCount)}</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-label">비디오 수</div>
                      <div className="stat-value">{formatNumber(stats.videoCount)}</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-label">생성일</div>
                      <div className="stat-value">
                        {format(new Date(stats.createdAt), 'yyyy년 MM월 dd일')}
                      </div>
                    </div>
                  </div>
                  
                  {stats.description && (
                    <div className="channel-description">
                      <h4>설명</h4>
                      <p>{stats.description}</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'analysis' && analysis && (
                <div className="channel-analysis-content">
                  <div className="analysis-summary">
                    <h4>분석 요약</h4>
                    <div className="summary-stats">
                      <div className="summary-item">
                        <span className="summary-label">분석된 비디오 수:</span>
                        <span className="summary-value">{analysis.videoCount}개</span>
                      </div>
                      <div className="summary-item">
                        <span className="summary-label">평균 조회수:</span>
                        <span className="summary-value">{formatNumber(Math.round(analysis.averages.viewCount))}</span>
                      </div>
                      <div className="summary-item">
                        <span className="summary-label">평균 좋아요:</span>
                        <span className="summary-value">{formatNumber(Math.round(analysis.averages.likeCount))}</span>
                      </div>
                      <div className="summary-item">
                        <span className="summary-label">평균 댓글:</span>
                        <span className="summary-value">{formatNumber(Math.round(analysis.averages.commentCount))}</span>
                      </div>
                    </div>
                  </div>

                  {analysis.videos.length > 0 && (
                    <div className="analysis-videos">
                      <h4>비디오 목록</h4>
                      <div className="videos-list">
                        {analysis.videos.map((video, idx) => (
                          <div key={video.videoId || idx} className="analysis-video-item">
                            <div className="video-item-header">
                              <span className="video-number">{idx + 1}</span>
                              <a
                                href={`https://www.youtube.com/watch?v=${video.videoId}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="video-item-title"
                              >
                                {video.title || '제목 없음'}
                              </a>
                            </div>
                            <div className="video-item-stats">
                              <span>조회수: {formatNumber(video.viewCount)}</span>
                              <span>좋아요: {formatNumber(video.likeCount)}</span>
                              <span>댓글: {formatNumber(video.commentCount)}</span>
                              {video.publishedAt && (
                                <span>{format(new Date(video.publishedAt), 'yyyy-MM-dd')}</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default ChannelModal

