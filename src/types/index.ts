export interface VideoData {
  id: string
  title: string
  publishedAt: string
  viewCount: number
  likeCount: number
  channelTitle: string
  channelId: string
  channelCountry?: string | null
  duration: string
  durationSeconds: number
  subscriberCount: number
  viewSubscriberRatio: number
  description: string
  tags?: string[]
  thumbnail: string
  transcript?: string
}

export interface FilterOptions {
  duration: 'short' | 'long' | 'all'
  period: '1month' | '2months' | '6months' | '1year' | 'all'
  viewSubscriberRatio: number[]
}

export interface SearchParams {
  query: string
  filters: FilterOptions
}

