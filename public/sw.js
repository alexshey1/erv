// Service Worker moderno para ErvApp PWA
// Versão: 1.2.0

const CACHE_NAME = 'ervapp-v1.2.0'
const STATIC_CACHE = 'ervapp-static-v1.2.0'
const DYNAMIC_CACHE = 'ervapp-dynamic-v1.2.0'
const IMAGE_CACHE = 'ervapp-images-v1.2.0'

// URLs para cache inicial (críticas para funcionamento offline)
const STATIC_ASSETS = [
  '/',
  '/dashboard',
  '/manifest.json',
  '/offline',
  '/favicon.ico',
  '/cannabis11414267.png'
]

// URLs que devem ser sempre buscadas da rede
const NETWORK_ONLY = [
  '/api/',
  '/auth/',
  '/_next/webpack-hmr',
  'vercel-scripts.com',
  'fonts.googleapis.com'
]

// URLs que podem usar cache-first strategy
const CACHE_FIRST = [
  '/images/',
  '/icons/',
  '/_next/static/'
]

// Instalação do Service Worker
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker: Instalando versão', CACHE_NAME)
  
  event.waitUntil(
    Promise.all([
      // Cache dos recursos estáticos críticos
      caches.open(STATIC_CACHE).then((cache) => {
        return cache.addAll(STATIC_ASSETS).catch((error) => {
          console.error('Erro ao cachear recursos estáticos:', error)
          // Tentar adicionar individualmente em caso de erro
          return Promise.allSettled(
            STATIC_ASSETS.map(url => cache.add(url))
          )
        })
      }),
      
      // Pre-cache de recursos importantes
      self.skipWaiting() // Força a ativação imediata
    ])
  )
})

// Ativação do Service Worker
self.addEventListener('activate', (event) => {
  console.log('✅ Service Worker: Ativando versão', CACHE_NAME)
  
  event.waitUntil(
    Promise.all([
      // Limpeza de caches antigos - versão otimizada
      caches.keys().then((cacheNames) => {
        const VALID_CACHES = [STATIC_CACHE, DYNAMIC_CACHE, IMAGE_CACHE, CACHE_NAME]
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (!VALID_CACHES.includes(cacheName)) {
              console.log('🗑️ Service Worker: Removendo cache antigo:', cacheName)
              return caches.delete(cacheName)
            }
          })
        )
      }),
      
      // Tomar controle de todas as abas
      self.clients.claim()
    ])
  )
})

// Estratégia de cache para diferentes tipos de requisições
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)
  
  // Ignorar requisições de desenvolvimento, extensões e recursos externos problemáticos
  if (
    url.protocol === 'chrome-extension:' ||
    url.protocol === 'moz-extension:' ||
    request.url.includes('_next/webpack-hmr') ||
    request.url.includes('hot-reload') ||
    request.url.includes('vercel-scripts.com') ||
    request.url.includes('fonts.googleapis.com')
  ) {
    return
  }

  // Só cachear requisições GET
  if (request.method !== 'GET') {
    return
  }

  // API routes - sempre da rede
  if (NETWORK_ONLY.some(path => url.pathname.startsWith(path))) {
    event.respondWith(networkFirst(request))
    return
  }

  // Recursos estáticos - cache first
  if (CACHE_FIRST.some(path => url.pathname.startsWith(path))) {
    event.respondWith(cacheFirst(request))
    return
  }

  // Imagens - cache com fallback
  if (request.destination === 'image') {
    event.respondWith(imageHandler(request))
    return
  }

  // Páginas HTML - network first com fallback
  if (request.destination === 'document') {
    event.respondWith(pageHandler(request))
    return
  }

  // Outros recursos - stale while revalidate
  event.respondWith(staleWhileRevalidate(request))
})

// Estratégias de cache

// Network First - tenta rede primeiro, fallback para cache
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request)
    
    if (networkResponse.ok && networkResponse.status < 400 && request.method === 'GET') {
      const cache = await caches.open(DYNAMIC_CACHE)
      // Só clonar se necessário e se a resposta não foi usada
      try {
        cache.put(request, networkResponse.clone())
      } catch (cloneError) {
        console.log('Não foi possível clonar response para cache:', request.url)
      }
    }
    
    return networkResponse
  } catch (error) {
    console.log('Network failed, tentando cache:', request.url)
    
    // Só tentar cache para requisições GET
    if (request.method === 'GET') {
      const cachedResponse = await caches.match(request)
      if (cachedResponse) {
        return cachedResponse
      }
    }
    
    // Fallback para página offline se for documento HTML
    if (request.destination === 'document') {
      return caches.match('/offline') || new Response('Offline', { 
        status: 503, 
        statusText: 'Service Unavailable',
        headers: { 'Content-Type': 'text/html' }
      })
    }
    
    // Retornar resposta vazia para outros recursos
    return new Response('', { status: 404, statusText: 'Offline' })
  }
}

// Cache First - tenta cache primeiro, fallback para rede
async function cacheFirst(request) {
  // Só funciona com requisições GET
  if (request.method !== 'GET') {
    return fetch(request)
  }
  
  const cachedResponse = await caches.match(request)
  
  if (cachedResponse) {
    // Atualizar em background se necessário
    fetch(request).then(networkResponse => {
      if (networkResponse.ok) {
        caches.open(STATIC_CACHE).then(cache => {
          cache.put(request, networkResponse.clone())
        })
      }
    }).catch(() => {
      // Ignorar erros de background update
    })
    
    return cachedResponse
  }
  
  try {
    const networkResponse = await fetch(request)
    
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE)
      // Só clonar se a resposta não foi usada
      cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
  } catch (error) {
    console.error('Cache e rede falharam para:', request.url)
    // Retornar resposta vazia em vez de throw
    return new Response('', { status: 404, statusText: 'Offline' })
  }
}

// Handler para imagens
async function imageHandler(request) {
  const cachedResponse = await caches.match(request)
  
  if (cachedResponse) {
    return cachedResponse
  }
  
  try {
    const networkResponse = await fetch(request)
    
    if (networkResponse.ok && networkResponse.status < 400) {
      const cache = await caches.open(IMAGE_CACHE)
      try {
        cache.put(request, networkResponse.clone())
      } catch (cloneError) {
        console.log('Não foi possível clonar response de imagem:', request.url)
      }
    }
    
    return networkResponse
  } catch (error) {
    // Retornar imagem placeholder se disponível
    const placeholder = await caches.match('/placeholder.png')
    return placeholder || new Response('', { 
      status: 404, 
      statusText: 'Image not found',
      headers: { 'Content-Type': 'image/png' }
    })
  }
}

// Handler para páginas
async function pageHandler(request) {
  try {
    const networkResponse = await fetch(request)
    
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE)
      cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
  } catch (error) {
    console.log('Página offline, tentando cache:', request.url)
    const cachedResponse = await caches.match(request)
    
    return cachedResponse || 
           caches.match('/offline') || 
           new Response(`
             <!DOCTYPE html>
             <html>
               <head>
                 <title>ErvApp - Offline</title>
                 <meta charset="utf-8">
                 <meta name="viewport" content="width=device-width, initial-scale=1">
                 <style>
                   body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
                   .offline { color: #666; }
                 </style>
               </head>
               <body>
                 <div class="offline">
                   <h1>🌱 ErvApp</h1>
                   <p>Você está offline. Conecte-se à internet para acessar esta página.</p>
                   <button onclick="window.location.reload()">Tentar novamente</button>
                 </div>
               </body>
             </html>
           `, {
             status: 200,
             headers: { 'Content-Type': 'text/html; charset=utf-8' }
           })
  }
}

// Stale While Revalidate - retorna cache e atualiza em background
async function staleWhileRevalidate(request) {
  // Só funciona com requisições GET
  if (request.method !== 'GET') {
    return fetch(request)
  }
  
  const cachedResponse = await caches.match(request)
  
  const fetchPromise = fetch(request).then(networkResponse => {
    if (networkResponse.ok && networkResponse.status < 400) {
      caches.open(DYNAMIC_CACHE).then(cache => {
        try {
          cache.put(request, networkResponse.clone())
        } catch (cloneError) {
          console.log('Não foi possível clonar response para cache:', request.url)
        }
      }).catch(() => {
        // Ignorar erros de cache
      })
    }
    return networkResponse
  }).catch((error) => {
    console.log('Fetch failed for:', request.url)
    return null
  })
  
  return cachedResponse || fetchPromise || new Response('', { status: 404, statusText: 'Offline' })
}

// Handler para Push Notifications
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push recebido', event)
  
  let notificationData = {}
  
  try {
    if (event.data) {
      // Tentar JSON primeiro
      try {
        notificationData = event.data.json()
      } catch (jsonError) {
        // Se falhar, tentar como texto simples
        const textData = event.data.text()
        notificationData = {
          title: 'ErvApp',
          body: textData || 'Nova notificação disponível',
          icon: '/cannabis11414267.png'
        }
      }
    } else {
      notificationData = {
        title: 'ErvApp',
        body: 'Nova notificação disponível',
        icon: '/cannabis11414267.png'
      }
    }
  } catch (error) {
    console.error('Erro ao processar dados do push:', error)
    notificationData = {
      title: 'ErvApp',
      body: 'Nova notificação disponível',
      icon: '/cannabis11414267.png'
    }
  }

  const {
    title = 'ErvApp',
    body = 'Nova notificação',
    icon = '/cannabis11414267.png',
    badge = '/cannabis11414267.png',
    data = {},
    actions = [],
    requireInteraction = false,
    tag,
    renotify = false
  } = notificationData

  const notificationOptions = {
    body,
    icon,
    badge,
    data: {
      ...data,
      timestamp: Date.now(),
      url: data.url || '/'
    },
    actions,
    requireInteraction,
    tag: tag || 'ervapp-notification',
    renotify,
    vibrate: [200, 100, 200], // Padrão de vibração
    silent: false
  }

  event.waitUntil(
    self.registration.showNotification(title, notificationOptions)
      .then(() => {
        console.log('Notificação exibida:', title)
        
        // Registrar evento de entrega (opcional)
        if (data.notificationId) {
          fetch('/api/analytics/notifications/delivered', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              notificationId: data.notificationId,
              timestamp: Date.now()
            })
          }).catch(err => console.log('Erro ao registrar entrega:', err))
        }
      })
      .catch(error => {
        console.error('Erro ao exibir notificação:', error)
      })
  )
})

// Handler para cliques em notificações
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Clique na notificação', event)
  
  const notification = event.notification
  const data = notification.data || {}
  
  // Fechar a notificação
  notification.close()

  // Registrar clique (analytics)
  if (data.notificationId) {
    fetch('/api/analytics/notifications/clicked', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        notificationId: data.notificationId,
        action: event.action || 'default',
        timestamp: Date.now()
      })
    }).catch(err => console.log('Erro ao registrar clique:', err))
  }

  // Determinar URL de destino
  let targetUrl = '/'
  
  if (event.action) {
    // Ação específica foi clicada
    const action = notification.actions?.find(a => a.action === event.action)
    targetUrl = action?.data?.url || data.url || '/'
  } else {
    // Clique na notificação principal
    targetUrl = data.url || '/'
  }

  // Abrir/focar na janela da aplicação
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Procurar por uma janela já aberta
        for (const client of clientList) {
          if (client.url.includes(self.location.origin)) {
            // Se encontrou, focar e navegar
            return client.focus().then(() => {
              if (client.navigate && targetUrl !== '/') {
                return client.navigate(targetUrl)
              }
            })
          }
        }
        
        // Se não encontrou janela aberta, abrir nova
        if (clients.openWindow) {
          return clients.openWindow(targetUrl)
        }
      })
      .catch(error => {
        console.error('Erro ao abrir janela:', error)
      })
  )
})

// Handler para fechamento de notificações
self.addEventListener('notificationclose', (event) => {
  console.log('Service Worker: Notificação fechada', event)
  
  const notification = event.notification
  const data = notification.data || {}
  
  // Registrar fechamento (analytics)
  if (data.notificationId) {
    fetch('/api/analytics/notifications/dismissed', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        notificationId: data.notificationId,
        timestamp: Date.now()
      })
    }).catch(err => console.log('Erro ao registrar fechamento:', err))
  }
})

// Background Sync (para quando voltar online)
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync', event.tag)
  
  if (event.tag === 'notification-sync') {
    event.waitUntil(
      // Sincronizar notificações pendentes
      fetch('/api/notifications/sync', {
        method: 'POST'
      }).catch(err => {
        console.log('Erro na sincronização:', err)
      })
    )
  }
})

// Mensagens do cliente (comunicação bidirecional)
self.addEventListener('message', (event) => {
  console.log('Service Worker: Mensagem recebida', event.data)
  
  const { type, payload } = event.data
  
  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting()
      break
      
    case 'GET_VERSION':
      event.ports[0].postMessage({ version: CACHE_NAME })
      break
      
    case 'CLEAR_NOTIFICATIONS':
      // Limpar todas as notificações
      self.registration.getNotifications()
        .then(notifications => {
          notifications.forEach(notification => notification.close())
        })
      break
      
    default:
      console.log('Tipo de mensagem desconhecido:', type)
  }
})

// Error handler global
self.addEventListener('error', (event) => {
  console.error('Service Worker: Erro global', event.error)
})

// Unhandled promise rejection handler
self.addEventListener('unhandledrejection', (event) => {
  console.error('Service Worker: Promise rejection não tratada', event.reason)
  event.preventDefault()
})