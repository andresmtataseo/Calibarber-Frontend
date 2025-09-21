import { getEnvVar, isProduction, getApiBaseUrl, getApiVersion } from './env-vars';

export const environment = {
  production: isProduction(),
  apiUrl: `${getApiBaseUrl()}/api/${getApiVersion()}`,
  apiBaseUrl: getApiBaseUrl(),
  apiVersion: getApiVersion(),
  
  // Configuración de autenticación
  tokenKey: getEnvVar('NG_APP_TOKEN_KEY', 'calibarber_token'),
  userKey: getEnvVar('NG_APP_USER_KEY', 'calibarber_user'),
  tokenExpiry: parseInt(getEnvVar('NG_APP_TOKEN_EXPIRY', '1440')),
  
  // Configuración de servicios externos
  avatarServiceUrl: getEnvVar('NG_APP_AVATAR_SERVICE_URL', 'https://ui-avatars.com/api/'),
  avatarDefaults: {
    background: getEnvVar('NG_APP_AVATAR_DEFAULT_BACKGROUND', '570df8'),
    color: getEnvVar('NG_APP_AVATAR_DEFAULT_COLOR', 'fff'),
    size: parseInt(getEnvVar('NG_APP_AVATAR_DEFAULT_SIZE', '40'))
  },
  
  // URLs de desarrollo
  swaggerDocsUrl: getEnvVar('NG_APP_SWAGGER_DOCS_URL', 'http://localhost:8080/swagger-ui'),
  apiDocsUrl: getEnvVar('NG_APP_API_DOCS_URL', 'http://localhost:8080/api-docs'),
  mockApiUrl: getEnvVar('NG_APP_MOCK_API_URL', 'http://localhost:3000/api'),
  
  // Redes sociales
  socialMedia: {
    instagram: getEnvVar('NG_APP_INSTAGRAM_URL', 'https://instagram.com/calibarber'),
    facebook: getEnvVar('NG_APP_FACEBOOK_URL', 'https://facebook.com/calibarber'),
    twitter: getEnvVar('NG_APP_TWITTER_URL', 'https://twitter.com/calibarber')
  },
  
  // Configuración de desarrollo y debug
  debugMode: getEnvVar('NG_APP_DEBUG_MODE', 'true') === 'true',
  logLevel: getEnvVar('NG_APP_LOG_LEVEL', 'debug'),
  
  // Configuración de performance
  httpTimeout: parseInt(getEnvVar('NG_APP_HTTP_TIMEOUT', '30000')),
  maxRetries: parseInt(getEnvVar('NG_APP_MAX_RETRIES', '3'))
};