const PROVIDER_STYLES = {
  GEMINI: {
    bg: 'bg-amber-100 dark:bg-amber-900/30',
    text: 'text-brand-amber',
    label: 'Gemini'
  },
  OPENAI: {
    bg: 'bg-red-100 dark:bg-red-900/30',
    text: 'text-brand-coral',
    label: 'OpenAI'
  },
  CACHE: {
    bg: 'bg-teal-100 dark:bg-teal-900/30',
    text: 'text-brand-teal',
    label: 'Cached'
  },
  FALLBACK: {
    bg: 'bg-gray-100 dark:bg-gray-800',
    text: 'text-gray-500',
    label: 'Fallback'
  }
}

export default function ProviderBadge({ provider }) {
  const style = PROVIDER_STYLES[provider?.toUpperCase()] || PROVIDER_STYLES.FALLBACK
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${style.bg} ${style.text}`}>
      {style.label}
    </span>
  )
}
