import { useState, useEffect } from 'react'
import { 
  getVideoTranscript, 
  getEnhancedTranscript, 
  getKeyMoments, 
  getSegmentedTranscript,
  VideoTranscript,
  KeyMoments,
  SegmentedTranscript
} from '../services/youtubeApi'
import './TranscriptModal.css'

interface TranscriptModalProps {
  videoId: string
  videoTitle: string
  isOpen: boolean
  onClose: () => void
}

function TranscriptModal({ videoId, videoTitle, isOpen, onClose }: TranscriptModalProps) {
  const [transcript, setTranscript] = useState<VideoTranscript | null>(null)
  const [enhancedTranscript, setEnhancedTranscript] = useState<any>(null)
  const [keyMoments, setKeyMoments] = useState<KeyMoments | null>(null)
  const [segmentedTranscript, setSegmentedTranscript] = useState<SegmentedTranscript | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'basic' | 'enhanced' | 'keyMoments' | 'segmented'>('basic')

  useEffect(() => {
    if (isOpen && videoId) {
      loadAllTranscripts()
    }
  }, [isOpen, videoId])

  const loadAllTranscripts = async () => {
    setLoading(true)
    setError(null)
    try {
      // 모든 스크립트 데이터를 병렬로 로드
      const [basic, enhanced, moments, segmented] = await Promise.allSettled([
        getVideoTranscript(videoId),
        getEnhancedTranscript([videoId], { format: 'timestamped', includeMetadata: true }),
        getKeyMoments(videoId, 5),
        getSegmentedTranscript(videoId, 4)
      ])

      if (basic.status === 'fulfilled') {
        setTranscript(basic.value)
      }
      if (enhanced.status === 'fulfilled') {
        setEnhancedTranscript(enhanced.value)
      }
      if (moments.status === 'fulfilled') {
        setKeyMoments(moments.value)
      }
      if (segmented.status === 'fulfilled') {
        setSegmentedTranscript(segmented.value)
      }

      // 모든 요청이 실패한 경우에만 에러 표시
      if (basic.status === 'rejected' && enhanced.status === 'rejected' && 
          moments.status === 'rejected' && segmented.status === 'rejected') {
        setError('스크립트를 불러올 수 없습니다. 이 비디오에는 자막이 없을 수 있습니다.')
      }
    } catch (err: any) {
      setError(err.response?.data?.error || '스크립트를 불러오는 중 오류가 발생했습니다.')
      console.error('Transcript loading error:', err)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  const formatTime = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content transcript-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>스크립트 정보</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          <div className="transcript-header">
            <h3>{videoTitle}</h3>
          </div>

          {loading && (
            <div className="transcript-loading">
              <div className="spinner"></div>
              <p>스크립트 로딩 중...</p>
            </div>
          )}

          {error && !loading && (
            <div className="transcript-error">
              <p>오류: {error}</p>
              <button onClick={loadAllTranscripts} className="retry-button">다시 시도</button>
            </div>
          )}

          {!loading && !error && (
            <>
              <div className="transcript-tabs">
                {transcript && (
                  <button
                    className={activeTab === 'basic' ? 'active' : ''}
                    onClick={() => setActiveTab('basic')}
                  >
                    기본 트랜스크립트
                  </button>
                )}
                {enhancedTranscript && (
                  <button
                    className={activeTab === 'enhanced' ? 'active' : ''}
                    onClick={() => setActiveTab('enhanced')}
                  >
                    향상된 트랜스크립트
                  </button>
                )}
                {keyMoments && (
                  <button
                    className={activeTab === 'keyMoments' ? 'active' : ''}
                    onClick={() => setActiveTab('keyMoments')}
                  >
                    주요 순간
                  </button>
                )}
                {segmentedTranscript && (
                  <button
                    className={activeTab === 'segmented' ? 'active' : ''}
                    onClick={() => setActiveTab('segmented')}
                  >
                    세그먼트별
                  </button>
                )}
              </div>

              <div className="transcript-content">
                {activeTab === 'basic' && transcript && (
                  <div className="transcript-section">
                    <h4>기본 트랜스크립트</h4>
                    <div className="transcript-text">
                      {transcript.transcript || '트랜스크립트가 없습니다.'}
                    </div>
                    {transcript.segments && transcript.segments.length > 0 && (
                      <div className="transcript-segments">
                        <h5>세그먼트 정보</h5>
                        <p>총 {transcript.segments.length}개의 세그먼트</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'enhanced' && enhancedTranscript && (
                  <div className="transcript-section">
                    <h4>향상된 트랜스크립트</h4>
                    <div className="transcript-text">
                      {typeof enhancedTranscript === 'string' 
                        ? enhancedTranscript 
                        : JSON.stringify(enhancedTranscript, null, 2)}
                    </div>
                  </div>
                )}

                {activeTab === 'keyMoments' && keyMoments && (
                  <div className="transcript-section">
                    <h4>주요 순간</h4>
                    <div className="transcript-text key-moments-text">
                      {keyMoments.text || '주요 순간을 찾을 수 없습니다.'}
                    </div>
                  </div>
                )}

                {activeTab === 'segmented' && segmentedTranscript && (
                  <div className="transcript-section">
                    <h4>세그먼트별 트랜스크립트</h4>
                    <div className="transcript-text segmented-text">
                      {segmentedTranscript.text || '세그먼트 트랜스크립트를 생성할 수 없습니다.'}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default TranscriptModal

