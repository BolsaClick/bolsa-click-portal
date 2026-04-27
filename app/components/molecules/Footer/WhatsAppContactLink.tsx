'use client'

import { Phone, MessageCircle } from 'lucide-react'
import { useWhatsappFeatureFlag } from '@/app/lib/hooks/usePostHogFeatureFlags'

export function WhatsAppSocialIcon() {
  const showWhatsapp = useWhatsappFeatureFlag()
  if (!showWhatsapp) return null

  return (
    <a
      href="https://wa.me/5511936200198"
      className="text-neutral-500 hover:text-white transition-colors"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="WhatsApp"
    >
      <MessageCircle size={18} />
    </a>
  )
}

export function WhatsAppPhoneLink() {
  const showWhatsapp = useWhatsappFeatureFlag()
  if (!showWhatsapp) return null

  return (
    <a
      href="https://wa.me/5511936200198"
      className="flex items-center text-neutral-300 text-sm hover:text-white transition-colors"
    >
      <Phone size={16} className="text-neutral-400 mr-2 flex-shrink-0" />
      (11) 93620-0198
    </a>
  )
}
