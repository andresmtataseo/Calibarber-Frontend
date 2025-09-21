export const environment = {
  production: (globalThis as any)?.['NG_APP_PRODUCTION'] === 'true' || false,
  apiUrl: `${(globalThis as any)?.['NG_APP_API_BASE_URL'] || 'http://localhost:8080'}/api/${(globalThis as any)?.['NG_APP_API_VERSION'] || 'v1'}`,
  apiBaseUrl: (globalThis as any)?.['NG_APP_API_BASE_URL'] || 'http://localhost:8080',
  apiVersion: (globalThis as any)?.['NG_APP_API_VERSION'] || 'v1',
  
  // Configuración de autenticación
  tokenKey: (globalThis as any)?.['NG_APP_TOKEN_KEY'] || 'calibarber_token',
  userKey: (globalThis as any)?.['NG_APP_USER_KEY'] || 'calibarber_user',
  tokenExpiry: parseInt((globalThis as any)?.['NG_APP_TOKEN_EXPIRY'] || '1440'),
  
  // Configuración de servicios externos
  avatarServiceUrl: (globalThis as any)?.['NG_APP_AVATAR_SERVICE_URL'] || 'https://ui-avatars.com/api/',
  avatarDefaults: {
    background: (globalThis as any)?.['NG_APP_AVATAR_DEFAULT_BACKGROUND'] || '570df8',
    color: (globalThis as any)?.['NG_APP_AVATAR_DEFAULT_COLOR'] || 'fff',
    size: parseInt((globalThis as any)?.['NG_APP_AVATAR_DEFAULT_SIZE'] || '40')
  },
  
  // URLs de desarrollo
  swaggerDocsUrl: (globalThis as any)?.['NG_APP_SWAGGER_DOCS_URL'] || 'http://localhost:8080/swagger-ui',
  apiDocsUrl: (globalThis as any)?.['NG_APP_API_DOCS_URL'] || 'http://localhost:8080/api-docs',
  mockApiUrl: (globalThis as any)?.['NG_APP_MOCK_API_URL'] || 'http://localhost:3000/api',
  
  // Redes sociales
  socialMedia: {
    instagram: (globalThis as any)?.['NG_APP_INSTAGRAM_URL'] || 'https://instagram.com/calibarber',
    facebook: (globalThis as any)?.['NG_APP_FACEBOOK_URL'] || 'https://facebook.com/calibarber',
    twitter: (globalThis as any)?.['NG_APP_TWITTER_URL'] || 'https://twitter.com/calibarber'
  },
  
  // Configuración de desarrollo y debug
  debugMode: (globalThis as any)?.['NG_APP_DEBUG_MODE'] === 'true' || true,
  logLevel: (globalThis as any)?.['NG_APP_LOG_LEVEL'] || 'debug',
  
  // Configuración de performance
  httpTimeout: parseInt((globalThis as any)?.['NG_APP_HTTP_TIMEOUT'] || '30000'),
  maxRetries: parseInt((globalThis as any)?.['NG_APP_MAX_RETRIES'] || '3')
};