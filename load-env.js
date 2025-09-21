/**
 * Script para cargar variables de entorno desde .env
 * Este script se ejecuta antes de que Angular compile la aplicación
 */

const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// Función para cargar variables de entorno
function loadEnvironmentVariables() {
  // En producción (Render), las variables están en process.env
  // En desarrollo, las cargamos desde archivos .env
  let envVars = {};

  // Primero intentar cargar desde process.env (para producción/Render)
  console.log('🔍 Buscando variables de entorno en process.env...');
  Object.keys(process.env).forEach(key => {
    if (key.startsWith('NG_APP_')) {
      envVars[key] = process.env[key];
      console.log(`✅ Variable encontrada en process.env: ${key}`);
    }
  });

  // Si no encontramos variables en process.env, cargar desde archivos .env
  if (Object.keys(envVars).length === 0) {
    console.log('📁 No se encontraron variables en process.env, cargando desde archivos .env...');

    // Buscar archivos .env en orden de prioridad
    // Los archivos se cargan en orden, los últimos sobrescriben a los primeros
    const envFiles = [
      '.env',
      '.env.development',
      '.env.production',
    ];

    // Cargar variables de cada archivo encontrado
    envFiles.forEach(file => {
      const envPath = path.resolve(process.cwd(), file);
      if (fs.existsSync(envPath)) {
        console.log(`📄 Cargando variables de entorno desde: ${file}`);
        const result = dotenv.config({ path: envPath });
        if (result.parsed) {
          // Solo agregar variables que empiecen con NG_APP_
          Object.keys(result.parsed).forEach(key => {
            if (key.startsWith('NG_APP_')) {
              envVars[key] = result.parsed[key];
            }
          });
        }
      }
    });
  }

  // Filtrar solo las variables que comienzan con NG_APP_
  // (Ya se filtran en el proceso de carga, pero mantenemos por compatibilidad)
  const angularEnvVars = {};
  Object.keys(envVars).forEach(key => {
    if (key.startsWith('NG_APP_')) {
      angularEnvVars[key] = envVars[key];
    }
  });

  // Mostrar variables cargadas (sin valores sensibles)
  const loadedKeys = Object.keys(angularEnvVars);
  if (loadedKeys.length > 0) {
    console.log(`✅ Variables de entorno cargadas: ${loadedKeys.length}`);
    console.log(`🔧 Variables disponibles: ${loadedKeys.join(', ')}`);
  } else {
    console.log('⚠️  No se encontraron variables de entorno con prefijo NG_APP_');
    console.log('💡 Asegúrate de que las variables estén configuradas en Render o en archivos .env');
  }

  // Inyectar variables en el objeto global para que estén disponibles en Angular
  if (typeof globalThis !== 'undefined') {
    Object.keys(angularEnvVars).forEach(key => {
      globalThis[key] = angularEnvVars[key];
    });
  }

  // También las agregamos a process.env para compatibilidad
  Object.keys(angularEnvVars).forEach(key => {
    process.env[key] = angularEnvVars[key];
  });

  return angularEnvVars;
}

// Ejecutar la carga de variables
try {
  const envVars = loadEnvironmentVariables();

  // Crear archivo temporal con las variables para que Angular las pueda usar
  const envContent = `
// Archivo generado automáticamente - NO EDITAR
// Variables de entorno cargadas desde .env

export const ENV_VARS: { [key: string]: string } = ${JSON.stringify(envVars, null, 2)};

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
`;

  // Escribir el archivo de variables de entorno
  const envFilePath = path.resolve(process.cwd(), 'src', 'environments', 'env-vars.ts');
  fs.writeFileSync(envFilePath, envContent);
  console.log(`📝 Archivo de variables generado: src/environments/env-vars.ts`);

} catch (error) {
  console.error('❌ Error al cargar variables de entorno:', error.message);
  process.exit(1);
}
