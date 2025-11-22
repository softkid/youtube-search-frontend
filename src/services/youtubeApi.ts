import axios from 'axios'
import { VideoData, FilterOptions } from '../types'
import { formatDuration, parseISO8601Duration } from '../utils/duration'
import { subDays } from 'date-fns'

// YouTube MCP Server API URL
const MCP_SERVER_URL = import.meta.env.VITE_MCP_SERVER_URL || 'http://localhost:3000'

// YouTube MCP Server API를 통해 비디오 검색
export async function searchVideos(query: string, filters: FilterOptions): Promise<VideoData[]> {
  try {
    // 기간 필터를 publishedAfter로 변환
    let publishedAfter: string | undefined
    if (filters.period !== 'all') {
      const daysMap: Record<string, number> = {
        '1month': 30,
        '2months': 60,
        '6months': 180,
        '1year': 365
      }
      const days = daysMap[filters.period]
      if (days) {
        publishedAfter = subDays(new Date(), days).toISOString()
      }
    }

    // 길이 필터를 videoDuration으로 변환
    let videoDuration: 'short' | 'medium' | 'long' | undefined
    if (filters.duration === 'short') {
      videoDuration = 'short' // YouTube API의 short는 <4분이지만, 클라이언트에서 추가 필터링
    } else if (filters.duration === 'long') {
      videoDuration = 'long' // YouTube API의 long은 >20분이지만, 클라이언트에서 추가 필터링
    }

    // MCP Server API 호출
    const response = await axios.post(`${MCP_SERVER_URL}/api/search-videos`, {
      query,
      maxResults: 50,
      order: 'viewCount',
      type: 'video',
      videoDuration,
      publishedAfter
    })

    let videos: VideoData[] = response.data.items || []

    // 클라이언트 사이드 필터링 (YouTube API의 duration 필터와 다를 수 있음)
    if (filters.duration === 'short') {
      videos = videos.filter(v => v.durationSeconds < 60)
    } else if (filters.duration === 'long') {
      videos = videos.filter(v => v.durationSeconds >= 60)
    }

    // 조회/구독 비율 필터 적용
    if (filters.viewSubscriberRatio.length > 0) {
      videos = videos.filter(v => {
        const ratio = v.viewSubscriberRatio
        return filters.viewSubscriberRatio.some(level => {
          switch (level) {
            case 1: return ratio < 0.2
            case 2: return ratio >= 0.2 && ratio < 0.6
            case 3: return ratio >= 0.6 && ratio < 1.4
            case 4: return ratio >= 1.4 && ratio < 3.0
            case 5: return ratio >= 3.0
            default: return false
          }
        })
      })
    }

    return videos
  } catch (error) {
    console.error('MCP Server API error:', error)
    throw error
  }
}

// 비디오 분석 API 호출
export interface VideoAnalysisResponse {
  videoId: string
  title: string
  channelTitle: string
  analysisPrompt: string
  data: {
    videoId: string
    title: string
    channelTitle: string
    publishedAt: string
    description: string
    statistics: {
      viewCount: number
      likeCount: number
      commentCount: number
      duration: string
    }
    transcript: string
    tags: string[]
    thumbnail: string
  }
}

export async function analyzeVideo(videoId: string): Promise<VideoAnalysisResponse> {
  try {
    const response = await axios.post(`${MCP_SERVER_URL}/api/video-analysis`, {
      videoId
    })
    return response.data
  } catch (error) {
    console.error('Video analysis error:', error)
    throw error
  }
}

// 트렌딩 비디오 가져오기
export async function getTrendingVideos(regionCode: string = 'US', categoryId?: string, maxResults: number = 10): Promise<VideoData[]> {
  try {
    const response = await axios.post(`${MCP_SERVER_URL}/api/get-trending-videos`, {
      regionCode,
      categoryId,
      maxResults
    })
    return response.data.items || []
  } catch (error) {
    console.error('Trending videos error:', error)
    throw error
  }
}

// 비디오 카테고리 가져오기
export interface VideoCategory {
  id: string
  title: string
}

export async function getVideoCategories(regionCode: string = 'US'): Promise<VideoCategory[]> {
  try {
    const response = await axios.post(`${MCP_SERVER_URL}/api/get-video-categories`, {
      regionCode
    })
    return response.data.categories || []
  } catch (error) {
    console.error('Video categories error:', error)
    throw error
  }
}

// 채널 통계 가져오기
export interface ChannelStats {
  channelId: string
  title: string
  description: string
  createdAt: string
  subscriberCount: number
  videoCount: number
  viewCount: number
  thumbnailUrl: string
}

export async function getChannelStats(channelId: string): Promise<ChannelStats> {
  try {
    const response = await axios.post(`${MCP_SERVER_URL}/api/get-channel-stats`, {
      channelId
    })
    return response.data
  } catch (error) {
    console.error('Channel stats error:', error)
    throw error
  }
}

// 채널 비디오 분석
export interface ChannelVideoAnalysis {
  channelId: string
  videoCount: number
  averages: {
    viewCount: number
    likeCount: number
    commentCount: number
  }
  videos: Array<{
    videoId: string
    title: string | null | undefined
    publishedAt: string | null | undefined
    duration: string | null | undefined
    viewCount: number
    likeCount: number
    commentCount: number
  }>
}

export async function analyzeChannelVideos(channelId: string, maxResults: number = 10, sortBy: 'date' | 'viewCount' | 'rating' = 'date'): Promise<ChannelVideoAnalysis> {
  try {
    const response = await axios.post(`${MCP_SERVER_URL}/api/analyze-channel-videos`, {
      channelId,
      maxResults,
      sortBy
    })
    return response.data
  } catch (error) {
    console.error('Channel analysis error:', error)
    throw error
  }
}

// 비디오 트랜스크립트 가져오기
export interface VideoTranscript {
  videoId: string
  transcript: string
  segments: Array<{
    text: string
    offset: number
    duration: number
  }>
}

export async function getVideoTranscript(videoId: string, language?: string): Promise<VideoTranscript> {
  try {
    const response = await axios.post(`${MCP_SERVER_URL}/api/get-video-transcript`, {
      videoId,
      language
    })
    return response.data
  } catch (error) {
    console.error('Video transcript error:', error)
    throw error
  }
}

// 향상된 트랜스크립트 가져오기
export async function getEnhancedTranscript(
  videoIds: string[],
  options?: {
    language?: string
    format?: 'raw' | 'timestamped' | 'merged'
    includeMetadata?: boolean
    filters?: {
      timeRange?: { start?: number; end?: number }
      search?: { query: string; caseSensitive?: boolean; contextLines?: number }
      segment?: { method?: 'equal' | 'smart'; count?: number }
    }
  }
): Promise<any> {
  try {
    const response = await axios.post(`${MCP_SERVER_URL}/api/enhanced-transcript`, {
      videoIds,
      ...options
    })
    return response.data
  } catch (error) {
    console.error('Enhanced transcript error:', error)
    throw error
  }
}

// 주요 순간 추출
export interface KeyMoments {
  videoId: string
  text: string
  metadata?: any
}

export async function getKeyMoments(videoId: string, maxMoments: number = 5): Promise<KeyMoments> {
  try {
    const response = await axios.post(`${MCP_SERVER_URL}/api/get-key-moments`, {
      videoId,
      maxMoments
    })
    return response.data
  } catch (error) {
    console.error('Key moments error:', error)
    throw error
  }
}

// 세그먼트별 트랜스크립트 가져오기
export interface SegmentedTranscript {
  videoId: string
  text: string
  metadata?: any
}

export async function getSegmentedTranscript(videoId: string, segmentCount: number = 4): Promise<SegmentedTranscript> {
  try {
    const response = await axios.post(`${MCP_SERVER_URL}/api/get-segmented-transcript`, {
      videoId,
      segmentCount
    })
    return response.data
  } catch (error) {
    console.error('Segmented transcript error:', error)
    throw error
  }
}

// 비디오 댓글 가져오기
export interface VideoComment {
  id: string
  author: string
  authorChannelId?: string
  text: string
  likeCount: number
  publishedAt: string
  updatedAt?: string
  replies: Array<{
    id: string
    author: string
    text: string
    likeCount: number
    publishedAt: string
  }>
}

export interface VideoCommentsResponse {
  videoId: string
  totalResults: number
  comments: VideoComment[]
  nextPageToken?: string
  pageInfo?: {
    totalResults: number
    resultsPerPage: number
  }
}

export async function getVideoComments(
  videoId: string,
  options?: {
    maxResults?: number
    order?: 'time' | 'relevance'
    includeReplies?: boolean
    pageToken?: string
  }
): Promise<VideoCommentsResponse> {
  try {
    const response = await axios.post(`${MCP_SERVER_URL}/api/get-video-comments`, {
      videoId,
      maxResults: options?.maxResults || 20,
      order: options?.order || 'relevance',
      includeReplies: options?.includeReplies || false,
      pageToken: options?.pageToken
    })
    return response.data
  } catch (error) {
    console.error('Video comments error:', error)
    throw error
  }
}

