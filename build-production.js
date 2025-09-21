/**
 * Script de build específico para producción en Render
 * Este script se ejecuta antes del build de Angular en producción
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Iniciando build de producción...');

try {
  // 1. Cargar variables de entorno
  console.log('📋 Paso 1: Cargando variables de entorno...');
  execSync('node load-env.js', { stdio: 'inherit' });

  // 2. Verificar que el archivo de variables se generó correctamente
  const envVarsPath = path.join(__dirname, 'src', 'environments', 'env-vars.ts');
  if (!fs.existsSync(envVarsPath)) {
    throw new Error('No se pudo generar el archivo de variables de entorno');
  }

  // 3. Verificar que el archivo no esté vacío
  const envVarsContent = fs.readFileSync(envVarsPath, 'utf8');
  if (envVarsContent.includes('{}') && !envVarsContent.includes('NG_APP_')) {
    console.log('⚠️  El archivo de variables está vacío. Verificando variables disponibles...');
    
    // Mostrar variables disponibles en process.env
    const ngAppVars = Object.keys(process.env).filter(key => key.startsWith('NG_APP_'));
    if (ngAppVars.length > 0) {
      console.log('✅ Variables NG_APP_ encontradas en process.env:');
      ngAppVars.forEach(key => console.log(`   - ${key}`));
    } else {
      console.log('❌ No se encontraron variables NG_APP_ en process.env');
      console.log('💡 Asegúrate de configurar las variables en Render con prefijo NG_APP_');
    }
  }

  // 4. Ejecutar el build de Angular
  console.log('📋 Paso 2: Ejecutando build de Angular...');
  execSync('ng build --configuration production', { stdio: 'inherit' });

  console.log('✅ Build de producción completado exitosamente');

} catch (error) {
  console.error('❌ Error durante el build de producción:', error.message);
  process.exit(1);
}