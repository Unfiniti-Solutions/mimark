import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, unlinkSync } from 'fs';
import { promisify } from 'util';
import { exec } from 'child_process';

const execAsync = promisify(exec);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuración de todos los iconos necesarios
const icons = [
  // PWA icons
  { size: 64, name: 'icon-64x64.png' },
  { size: 120, name: 'icon-120x120.png' },
  { size: 144, name: 'icon-144x144.png' },
  { size: 152, name: 'icon-152x152.png' },
  { size: 192, name: 'icon-192x192.png' },
  { size: 384, name: 'icon-384x384.png' },
  { size: 512, name: 'icon-512x512.png' },
  // Favicons
  { size: 32, name: 'favicon-32x32.png' },
  { size: 16, name: 'favicon-16x16.png' },
  // Apple Touch Icon
  { size: 180, name: 'apple-touch-icon.png' }
];

// Tamaños para el favicon.ico
const faviconSizes = [16, 32, 48];

const sourceIcon = join(__dirname, '../public/icon.png');
const publicDir = join(__dirname, '../public');

async function generatePngIcons() {
  try {
    // Verificar que el icono fuente existe
    if (!existsSync(sourceIcon)) {
      console.error('Error: No se encuentra el archivo icon.png en la carpeta public');
      process.exit(1);
    }

    // Generar los diferentes tamaños
    for (const icon of icons) {
      const outputPath = join(publicDir, icon.name);
      await sharp(sourceIcon)
        .resize(icon.size, icon.size)
        .toFile(outputPath);
      console.log(`✅ Generado ${icon.name}`);
    }

    // Generar los PNG temporales para el favicon.ico
    const tempFiles = [];
    for (const size of faviconSizes) {
      const tempFile = join(publicDir, `temp-favicon-${size}.png`);
      await sharp(sourceIcon)
        .resize(size, size)
        .toFile(tempFile);
      tempFiles.push(tempFile);
    }

    // Generar el favicon.ico usando ImageMagick
    const faviconPath = join(publicDir, 'favicon.ico');
    
    // Escapar las rutas para evitar problemas con espacios
    const escapedTempFiles = tempFiles.map(file => `"${file}"`).join(' ');
    const escapedFaviconPath = `"${faviconPath}"`;
    
    try {
      // Intentar con 'magick' primero (ImageMagick v7)
      await execAsync(`magick ${escapedTempFiles} ${escapedFaviconPath}`);
      console.log('✅ Generado favicon.ico');
    } catch (magickError) {
      try {
        // Fallback a 'convert' (ImageMagick v6)
        await execAsync(`convert ${escapedTempFiles} ${escapedFaviconPath}`);
        console.log('✅ Generado favicon.ico');
      } catch (convertError) {
        console.warn('⚠️  No se pudo generar favicon.ico. ImageMagick no está disponible.');
        console.warn('   Los archivos PNG individuales se generaron correctamente.');
      }
    }

    // Limpiar archivos temporales
    for (const tempFile of tempFiles) {
      try {
        unlinkSync(tempFile);
      } catch (error) {
        console.warn(`⚠️  No se pudo eliminar archivo temporal: ${tempFile}`);
      }
    }

    console.log('¡Todos los iconos han sido generados correctamente!');
  } catch (error) {
    console.error('Error al generar los iconos:', error);
    process.exit(1);
  }
}

generatePngIcons(); 
