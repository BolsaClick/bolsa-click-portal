/**
 * Detecta se o user-agent atual é de um bot/crawler.
 * Usado para evitar geolocalização por IP em crawlers (ex: Googlebot em Mountain View, CA).
 */
export function isBot(): boolean {
  if (typeof navigator === 'undefined') return true

  const ua = navigator.userAgent

  if (!ua) return true

  const botPatterns = [
    'Googlebot',
    'bingbot',
    'Baiduspider',
    'YandexBot',
    'DuckDuckBot',
    'Slurp',
    'facebookexternalhit',
    'LinkedInBot',
    'Twitterbot',
    'Applebot',
    'SemrushBot',
    'AhrefsBot',
    'MJ12bot',
    'Bytespider',
    'GPTBot',
    'ChatGPT-User',
    'Google-InspectionTool',
    'Storebot-Google',
    'GoogleOther',
    'PetalBot',
    'Sogou',
    'crawler',
    'spider',
    'bot/',
    'Bot/',
  ]

  return botPatterns.some((pattern) => ua.includes(pattern))
}
