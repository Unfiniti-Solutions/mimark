#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

const readdir = promisify(fs.readdir);

class FontConverter {
  constructor() {
    this.fontsDir = 'public/fonts';
    this.keepOriginals = process.argv.includes('--keep-originals') || process.argv.includes('-k');
    this.stats = {
      total: 0,
      converted: 0,
      skipped: 0,
      errors: 0,
      totalSizeSaved: 0,
      deletedOriginals: 0
    };
  }

  // Verificar si woff2 está instalado
  checkWoff2() {
    try {
      execSync('woff2_compress --version', { stdio: 'ignore' });
      return true;
    } catch {
      return false;
    }
  }

  // Instalar woff2 automáticamente
  async installWoff2() {
    console.log('📦 Instalando woff2...');
    
    const platform = process.platform;
    try {
      if (platform === 'darwin') {
        execSync('brew install woff2', { stdio: 'inherit' });
      } else if (platform === 'linux') {
        execSync('sudo apt-get update && sudo apt-get install -y woff2', { stdio: 'inherit' });
      } else {
        throw new Error('Sistema operativo no soportado');
      }
      console.log('✅ woff2 instalado correctamente');
    } catch (error) {
      console.error('❌ Error al instalar woff2:', error.message);
      process.exit(1);
    }
  }

  // Obtener tamaño de archivo en formato legible
  getFileSize(filePath) {
    const stats = fs.statSync(filePath);
    return this.formatBytes(stats.size);
  }

  // Formatear bytes a formato legible
  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Convertir archivo TTF/OTF a WOFF2
  async convertFile(fontPath) {
    const ext = path.extname(fontPath);
    const filename = path.basename(fontPath, ext);
    const woff2Path = path.join(path.dirname(fontPath), `${filename}.woff2`);
    
    console.log(`🔄 Procesando: ${filename}${ext}`);
    
    // Verificar si ya existe el archivo WOFF2
    if (fs.existsSync(woff2Path)) {
      console.log(`⏭️  Saltando: ${filename}.woff2 ya existe`);
      this.stats.skipped++;
      return;
    }
    
    try {
      // Obtener tamaño original
      const originalSize = fs.statSync(fontPath).size;
      
      // Convertir archivo
      execSync(`woff2_compress "${fontPath}"`, { stdio: 'pipe' });
      
      // Verificar que se creó el archivo
      if (fs.existsSync(woff2Path)) {
        const compressedSize = fs.statSync(woff2Path).size;
        const savedSize = originalSize - compressedSize;
        const savedPercentage = ((savedSize / originalSize) * 100).toFixed(1);
        
        console.log(`✅ Convertido: ${filename}${ext} → ${filename}.woff2`);
        console.log(`   📊 Tamaño: ${this.formatBytes(originalSize)} → ${this.formatBytes(compressedSize)}`);
        console.log(`   💾 Ahorro: ${this.formatBytes(savedSize)} (${savedPercentage}%)`);
        
        // Borrar archivo original por defecto (a menos que se especifique mantener)
        if (this.keepOriginals) {
          console.log(`💾 Mantenido: ${filename}${ext} (archivo original)`);
        } else {
          fs.unlinkSync(fontPath);
          console.log(`🗑️  Eliminado: ${filename}${ext} (archivo original)`);
          this.stats.deletedOriginals++;
        }
        
        this.stats.converted++;
        this.stats.totalSizeSaved += savedSize;
      } else {
        throw new Error('Archivo WOFF2 no se creó');
      }
    } catch (error) {
      console.error(`❌ Error al convertir ${filename}${ext}:`, error.message);
      this.stats.errors++;
    }
  }

  // Buscar y convertir todos los archivos TTF/OTF
  async convertAllFonts() {
    console.log('🔄 Iniciando conversión de fuentes TTF/OTF a WOFF2...\n');
    
    // Verificar si woff2 está instalado
    if (!this.checkWoff2()) {
      await this.installWoff2();
    }
    
    // Crear directorio si no existe
    if (!fs.existsSync(this.fontsDir)) {
      fs.mkdirSync(this.fontsDir, { recursive: true });
    }
    
    console.log(`📁 Buscando archivos TTF/OTF en ${this.fontsDir}...\n`);
    
    try {
      const files = await readdir(this.fontsDir);
      const fontFiles = files.filter(file => file.endsWith('.ttf') || file.endsWith('.otf'));
      
      this.stats.total = fontFiles.length;
      
      if (fontFiles.length === 0) {
        console.log('ℹ️  No se encontraron archivos TTF/OTF para convertir');
        return;
      }
      
      // Convertir cada archivo
      for (const file of fontFiles) {
        const fontPath = path.join(this.fontsDir, file);
        await this.convertFile(fontPath);
      }
      
      this.printSummary();
      
    } catch (error) {
      console.error('❌ Error al leer el directorio de fuentes:', error.message);
    }
  }

  // Imprimir resumen final
  printSummary() {
    console.log('\n📊 Resumen de conversión:');
    console.log(`   Total de archivos TTF/OTF: ${this.stats.total}`);
    console.log(`   Archivos convertidos: ${this.stats.converted}`);
    console.log(`   Archivos saltados: ${this.stats.skipped}`);
    console.log(`   Errores: ${this.stats.errors}`);
    console.log(`   Archivos originales eliminados: ${this.stats.deletedOriginals}`);
    console.log(`   Tamaño total ahorrado: ${this.formatBytes(this.stats.totalSizeSaved)}`);
    
    if (this.keepOriginals && this.stats.converted > 0) {
      console.log('\n💡 Para mantener archivos TTF/OTF originales, ejecuta:');
      console.log('   npm run fonts:convert -- --keep-originals');
    }
    
    console.log('\n📈 Archivos WOFF2 disponibles:');
    try {
      const files = fs.readdirSync(this.fontsDir);
      const woff2Files = files.filter(file => file.endsWith('.woff2'));
      
      woff2Files.forEach(file => {
        const filePath = path.join(this.fontsDir, file);
        const size = this.getFileSize(filePath);
        console.log(`   ✅ ${file} (${size})`);
      });
    } catch (error) {
      console.error('Error al listar archivos WOFF2:', error.message);
    }
    
    console.log('\n🎉 ¡Conversión completada!');
    console.log('💡 Recuerda actualizar tu nuxt.config.ts para usar los archivos .woff2');
    
    // Generar configuración de ejemplo
    if (this.stats.converted > 0) {
      this.generateConfigExample();
    }
  }

  // Generar ejemplo de configuración para nuxt.config.ts
  generateConfigExample() {
    console.log('\n📝 Ejemplo de configuración para nuxt.config.ts:');
    console.log('```typescript');
    console.log('fonts: {');
    console.log('  families: [');
    
    try {
      const files = fs.readdirSync(this.fontsDir);
      const woff2Files = files.filter(file => file.endsWith('.woff2'));
      
      woff2Files.forEach((file, index) => {
        const fontName = path.basename(file, '.woff2').replace(/[-_]/g, ' ');
        const isLast = index === woff2Files.length - 1;
        const comma = isLast ? '' : ',';
        
        console.log(`    {`);
        console.log(`      name: '${fontName}',`);
        console.log(`      src: '/fonts/${file}',`);
        console.log(`      weight: '400',`);
        console.log(`      style: 'normal',`);
        console.log(`      display: 'swap',`);
        console.log(`      preload: true,`);
        console.log(`      fallbacks: ['sans-serif']`);
        console.log(`    }${comma}`);
      });
    } catch {
      console.log('    // Error al generar ejemplo');
    }
    
    console.log('  ]');
    console.log('}');
    console.log('```');
  }
}

// Ejecutar el script
async function main() {
  const converter = new FontConverter();
  await converter.convertAllFonts();
}

// Manejar errores no capturados
process.on('unhandledRejection', (error) => {
  console.error('❌ Error no manejado:', error);
  process.exit(1);
});

main().catch(console.error); 