declare module 'google-trends-api' {
  interface RelatedQueriesOptions {
    keyword: string
    geo?: string
    startTime?: Date
    endTime?: Date
    hl?: string
    category?: number
    timezone?: number
  }

  interface InterestOverTimeOptions {
    keyword: string | string[]
    geo?: string
    startTime?: Date
    endTime?: Date
    hl?: string
    timezone?: number
  }

  const api: {
    relatedQueries: (options: RelatedQueriesOptions) => Promise<string>
    relatedTopics: (options: RelatedQueriesOptions) => Promise<string>
    interestOverTime: (options: InterestOverTimeOptions) => Promise<string>
    interestByRegion: (options: RelatedQueriesOptions) => Promise<string>
    realTimeTrends: (options: { geo: string; category?: string }) => Promise<string>
    dailyTrends: (options: { geo: string; trendDate?: Date }) => Promise<string>
  }

  export default api
}
