export async function getMessages(locale: string) {
  switch (locale) {
    case 'en':
      return (await import('@/locales/en/common.json')).default;
    case 'es':
      return (await import('@/locales/es/common.json')).default;
    case 'pt-BR':
    default:
      return (await import('@/locales/pt-BR/common.json')).default;
  }
} 