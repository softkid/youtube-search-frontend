import { useState, useEffect } from 'react'
import { getVideoComments, VideoCommentsResponse, VideoComment } from '../services/youtubeApi'
import { format } from 'date-fns'
import './CommentsModal.css'

interface CommentsModalProps {
  videoId: string
  videoTitle: string
  isOpen: boolean
  onClose: () => void
}

function CommentsModal({ videoId, videoTitle, isOpen, onClose }: CommentsModalProps) {
  const [commentsData, setCommentsData] = useState<VideoCommentsResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [order, setOrder] = useState<'time' | 'relevance'>('relevance')
  const [includeReplies, setIncludeReplies] = useState(false)

  useEffect(() => {
    if (isOpen && videoId) {
      loadComments()
    }
  }, [isOpen, videoId, order, includeReplies])

  const loadComments = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getVideoComments(videoId, {
        maxResults: 50,
        order,
        includeReplies
      })
      setCommentsData(data)
    } catch (err: any) {
      setError(err.response?.data?.error || '댓글을 불러오는 중 오류가 발생했습니다.')
      console.error('Comments loading error:', err)
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
      <div className="modal-content comments-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>댓글</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          <div className="comments-header">
            <h3>{videoTitle}</h3>
            <div className="comments-controls">
              <select 
                value={order} 
                onChange={(e) => setOrder(e.target.value as 'time' | 'relevance')}
                className="comments-order-select"
              >
                <option value="relevance">관련성순</option>
                <option value="time">최신순</option>
              </select>
              <label className="comments-replies-toggle">
                <input
                  type="checkbox"
                  checked={includeReplies}
                  onChange={(e) => setIncludeReplies(e.target.checked)}
                />
                답글 포함
              </label>
            </div>
          </div>

          {loading && (
            <div className="comments-loading">
              <div className="spinner"></div>
              <p>댓글 로딩 중...</p>
            </div>
          )}

          {error && !loading && (
            <div className="comments-error">
              <p>오류: {error}</p>
              <button onClick={loadComments} className="retry-button">다시 시도</button>
            </div>
          )}

          {commentsData && !loading && (
            <div className="comments-content">
              <div className="comments-summary">
                총 {commentsData.totalResults.toLocaleString()}개의 댓글
              </div>

              <div className="comments-list">
                {commentsData.comments.length === 0 ? (
                  <div className="no-comments">댓글이 없습니다.</div>
                ) : (
                  commentsData.comments.map((comment) => (
                    <CommentItem key={comment.id} comment={comment} formatNumber={formatNumber} />
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

interface CommentItemProps {
  comment: VideoComment
  formatNumber: (num: number) => string
}

function CommentItem({ comment, formatNumber }: CommentItemProps) {
  const [showReplies, setShowReplies] = useState(false)

  return (
    <div className="comment-item">
      <div className="comment-header">
        <div className="comment-author">
          <strong>{comment.author}</strong>
          <span className="comment-date">
            {format(new Date(comment.publishedAt), 'yyyy-MM-dd HH:mm')}
          </span>
        </div>
      </div>
      <div className="comment-text" dangerouslySetInnerHTML={{ __html: comment.text }} />
      <div className="comment-footer">
        <span className="comment-likes">👍 {formatNumber(comment.likeCount)}</span>
        {comment.replies.length > 0 && (
          <button
            className="comment-replies-toggle"
            onClick={() => setShowReplies(!showReplies)}
          >
            {showReplies ? '답글 숨기기' : `답글 ${comment.replies.length}개 보기`}
          </button>
        )}
      </div>
      {showReplies && comment.replies.length > 0 && (
        <div className="comment-replies">
          {comment.replies.map((reply) => (
            <div key={reply.id} className="comment-reply">
              <div className="reply-header">
                <strong>{reply.author}</strong>
                <span className="reply-date">
                  {format(new Date(reply.publishedAt), 'yyyy-MM-dd HH:mm')}
                </span>
              </div>
              <div className="reply-text" dangerouslySetInnerHTML={{ __html: reply.text }} />
              <div className="reply-footer">
                <span className="reply-likes">👍 {formatNumber(reply.likeCount)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default CommentsModal

