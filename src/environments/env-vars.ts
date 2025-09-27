
// Archivo generado automáticamente - NO EDITAR
// Variables de entorno cargadas desde .env

export const ENV_VARS: { [key: string]: string } = {
  "NG_APP_API_BASE_URL": "http://localhost:8080",
  "NG_APP_API_VERSION": "v1",
  "NG_APP_ENVIRONMENT": "development",
  "NG_APP_PRODUCTION": "false",
  "NG_APP_TOKEN_KEY": "calibarber_token",
  "NG_APP_USER_KEY": "calibarber_user",
  "NG_APP_TOKEN_EXPIRY": "1440",
  "NG_APP_AVATAR_SERVICE_URL": "https://ui-avatars.com/api/",
  "NG_APP_AVATAR_DEFAULT_BACKGROUND": "570df8",
  "NG_APP_AVATAR_DEFAULT_COLOR": "fff",
  "NG_APP_AVATAR_DEFAULT_SIZE": "40",
  "NG_APP_SWAGGER_DOCS_URL": "http://localhost:8080/swagger-ui",
  "NG_APP_API_DOCS_URL": "http://localhost:8080/api-docs",
  "NG_APP_MOCK_API_URL": "http://localhost:3000/api",
  "NG_APP_INSTAGRAM_URL": "https://instagram.com/calibarber",
  "NG_APP_FACEBOOK_URL": "https://facebook.com/calibarber",
  "NG_APP_TWITTER_URL": "https://twitter.com/calibarber",
  "NG_APP_DEBUG_MODE": "true",
  "NG_APP_LOG_LEVEL": "debug",
  "NG_APP_HTTP_TIMEOUT": "30000",
  "NG_APP_MAX_RETRIES": "3"
};

// Función para obtener una variable de entorno
export function getEnvVar(key: string, defaultValue: string = ''): string {
  return ENV_VARS[key] || defaultValue;
}

// Función para verificar si estamos en modo producción
export function isProduction(): boolean {
  return getEnvVar('NG_APP_PRODUCTION', 'false') === 'true';
}

// Función para obtener la URL base de la API
export function getApiBaseUrl(): string {
  return getEnvVar('NG_APP_API_BASE_URL', 'http://localhost:8080');
}

// Función para obtener la versión de la API
export function getApiVersion(): string {
  return getEnvVar('NG_APP_API_VERSION', 'v1');
}
