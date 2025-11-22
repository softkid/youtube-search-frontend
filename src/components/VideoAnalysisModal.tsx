import { useState, useEffect } from 'react'
import { analyzeVideo, VideoAnalysisResponse } from '../services/youtubeApi'
import './VideoAnalysisModal.css'

interface VideoAnalysisModalProps {
  videoId: string
  videoTitle: string
  isOpen: boolean
  onClose: () => void
}

function VideoAnalysisModal({ videoId, videoTitle, isOpen, onClose }: VideoAnalysisModalProps) {
  const [analysis, setAnalysis] = useState<VideoAnalysisResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen && videoId) {
      loadAnalysis()
    }
  }, [isOpen, videoId])

  const loadAnalysis = async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await analyzeVideo(videoId)
      setAnalysis(result)
    } catch (err: any) {
      setError(err.response?.data?.error || '분석 중 오류가 발생했습니다.')
      console.error('Analysis error:', err)
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
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>비디오 분석</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          {loading && (
            <div className="analysis-loading">
              <div className="spinner"></div>
              <p>분석 중...</p>
            </div>
          )}

          {error && (
            <div className="analysis-error">
              <p>오류: {error}</p>
              <button onClick={loadAnalysis} className="retry-button">다시 시도</button>
            </div>
          )}

          {analysis && !loading && (
            <div className="analysis-content">
              <div className="analysis-video-info">
                <h3>{analysis.title}</h3>
                <p className="analysis-channel">{analysis.channelTitle}</p>
                
                {analysis.data.thumbnail && (
                  <img 
                    src={analysis.data.thumbnail} 
                    alt={analysis.title}
                    className="analysis-thumbnail"
                  />
                )}

                <div className="analysis-stats">
                  <div className="stat-row">
                    <span className="stat-label">조회수:</span>
                    <span className="stat-value">{formatNumber(analysis.data.statistics.viewCount)}</span>
                  </div>
                  <div className="stat-row">
                    <span className="stat-label">좋아요:</span>
                    <span className="stat-value">{formatNumber(analysis.data.statistics.likeCount)}</span>
                  </div>
                  <div className="stat-row">
                    <span className="stat-label">댓글:</span>
                    <span className="stat-value">{formatNumber(analysis.data.statistics.commentCount)}</span>
                  </div>
                </div>

                {analysis.data.description && (
                  <div className="analysis-description">
                    <h4>설명</h4>
                    <p>{analysis.data.description}</p>
                  </div>
                )}

                {analysis.data.tags && analysis.data.tags.length > 0 && (
                  <div className="analysis-tags">
                    <h4>태그</h4>
                    <div className="tags-list">
                      {analysis.data.tags.map((tag, idx) => (
                        <span key={idx} className="tag">{tag}</span>
                      ))}
                    </div>
                  </div>
                )}

                {analysis.data.transcript && (
                  <div className="analysis-transcript">
                    <h4>트랜스크립트</h4>
                    <div className="transcript-content">
                      {analysis.data.transcript.length > 1000 
                        ? `${analysis.data.transcript.substring(0, 1000)}...` 
                        : analysis.data.transcript}
                    </div>
                  </div>
                )}

                <div className="analysis-prompt">
                  <h4>분석 프롬프트</h4>
                  <div className="prompt-content">
                    {analysis.analysisPrompt}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default VideoAnalysisModal

