'use client'

import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@/utils/react-query'
import { GlobalProvider } from '@/app/context/GeoLocationContext'
import { PostHogProvider } from './PostHogProvider'

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <PostHogProvider>
      <QueryClientProvider client={queryClient}>
        <GlobalProvider>{children}</GlobalProvider>
      </QueryClientProvider>
    </PostHogProvider>
  )
}