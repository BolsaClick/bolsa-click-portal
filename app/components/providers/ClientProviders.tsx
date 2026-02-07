'use client'

import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@/utils/react-query'
import { GlobalProvider } from '@/app/context/GeoLocationContext'
import { PostHogProvider } from './PostHogProvider'
import { AuthProvider } from '@/app/contexts/AuthContext'

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <PostHogProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <GlobalProvider>{children}</GlobalProvider>
        </AuthProvider>
      </QueryClientProvider>
    </PostHogProvider>
  )
}