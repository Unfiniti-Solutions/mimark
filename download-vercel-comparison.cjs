#!/usr/bin/env node

/**
 * Script para descargar el código fuente directamente del deployment de Vercel
 * Basado en get-vercel-source-code de zehfernandes
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const DEPLOYMENT_ID = 'dpl_EgRrmCmHHiU7nCe3kP5H7Y5ZBK6M';
const TEAM_ID = 'team_sMUAMXQj3rliZhEHYEx5e2On';
const DESTDIR = path.join(__dirname, '..', 'mimark-vercel-comparison');

// Obtener el token de Vercel
function getVercelToken() {
  // Intentar desde variable de entorno
  if (process.env.VERCEL_TOKEN) {
    return process.env.VERCEL_TOKEN;
  }
  
  // Intentar desde archivo .env
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const match = envContent.match(/VERCEL_TOKEN\s*=\s*(.+)/);
    if (match) {
      return match[1].trim().replace(/['"]/g, '');
    }
  }
  
  // Intentar desde auth.json
  const authPath = path.join(process.env.HOME || process.env.USERPROFILE, '.vercel', 'auth.json');
  if (fs.existsSync(authPath)) {
    try {
      const auth = JSON.parse(fs.readFileSync(authPath, 'utf8'));
      if (auth.token) {
        return auth.token;
      }
    } catch (e) {
      // Ignorar errores de parsing
    }
  }
  
  throw new Error('No se encontró VERCEL_TOKEN. Por favor:\n1. Obtén tu token en https://vercel.com/account/tokens\n2. Ejecuta: export VERCEL_TOKEN=tu_token\n3. O crea un archivo .env con: VERCEL_TOKEN=tu_token');
}

// Hacer petición a la API de Vercel
function apiRequest(endpoint) {
  return new Promise((resolve, reject) => {
    const token = getVercelToken();
    const url = `https://api.vercel.com${endpoint}${endpoint.includes('?') ? '&' : '?'}teamId=${TEAM_ID}`;
    
    const options = {
      hostname: 'api.vercel.com',
      path: url.replace('https://api.vercel.com', ''),
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            resolve(data);
          }
        } else {
          reject(new Error(`API Error: ${res.statusCode} - ${data}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
  });
}

// Descargar archivo
function downloadFile(deploymentId, fileId, destination) {
  return new Promise((resolve, reject) => {
    const token = getVercelToken();
    const endpoint = `/v7/deployments/${deploymentId}/files/${fileId}?teamId=${TEAM_ID}`;
    
    const options = {
      hostname: 'api.vercel.com',
      path: endpoint,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };

    const req = https.request(options, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`Failed to download: ${res.statusCode}`));
        return;
      }

      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          const decodedValue = Buffer.from(response.data, 'base64');
          
          const dir = path.dirname(destination);
          if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
          }
          
          fs.writeFile(destination, decodedValue, (err) => {
            if (err) reject(err);
            else resolve();
          });
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
  });
}

// Aplanar árbol de archivos
function flattenTree(node, prefix = '') {
  const name = prefix ? `${prefix}/${node.name}` : node.name;
  const result = [];
  
  if (node.type === 'file') {
    result.push({ ...node, name });
  } else if (node.type === 'directory' && node.children) {
    result.push({ ...node, name, type: 'directory' });
    node.children.forEach(child => {
      result.push(...flattenTree(child, name));
    });
  }
  
  return result;
}

// Función principal
async function main() {
  try {
    console.log('🔍 Obteniendo token de Vercel...');
    getVercelToken(); // Verificar que existe
    console.log('✅ Token encontrado');
    
    console.log('📦 Obteniendo archivos del deployment...');
    const files = await apiRequest(`/v6/deployments/${DEPLOYMENT_ID}/files`);
    
    // Buscar el directorio raíz (no "src", sino el directorio raíz del proyecto)
    let rootDir = files.find(f => f.name === '.' || f.name === 'src' || f.type === 'directory');
    
    if (!rootDir) {
      // Si no hay directorio raíz, usar todos los archivos
      rootDir = { name: '.', children: files, type: 'directory' };
    }
    
    console.log(`✅ Encontrados archivos en: ${rootDir.name}`);
    
    // Aplanar el árbol
    const flatFiles = flattenTree(rootDir);
    const filesToDownload = flatFiles.filter(f => f.type === 'file');
    
    console.log(`📄 Total de archivos a descargar: ${filesToDownload.length}`);
    console.log(`📁 Directorio de destino: ${DESTDIR}`);
    
    // Crear directorio de destino
    if (!fs.existsSync(DESTDIR)) {
      fs.mkdirSync(DESTDIR, { recursive: true });
    }
    
    // Crear directorios primero
    flatFiles.filter(f => f.type === 'directory').forEach(dir => {
      const dirPath = path.join(DESTDIR, dir.name.replace(/^\.\//, '').replace(/^src\//, ''));
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
    });
    
    // Descargar archivos
    let downloaded = 0;
    for (const file of filesToDownload) {
      const filePath = path.join(DESTDIR, file.name.replace(/^\.\//, '').replace(/^src\//, ''));
      
      // Saltar si ya existe
      if (fs.existsSync(filePath)) {
        downloaded++;
        continue;
      }
      
      try {
        process.stdout.write(`\r📥 Descargando ${downloaded + 1}/${filesToDownload.length}: ${file.name}`);
        await downloadFile(DEPLOYMENT_ID, file.uid, filePath);
        downloaded++;
      } catch (error) {
        console.error(`\n❌ Error descargando ${file.name}:`, error.message);
      }
    }
    
    console.log(`\n\n✅ Código fuente descargado en: ${DESTDIR}`);
    console.log(`📊 Archivos descargados: ${downloaded}/${filesToDownload.length}`);
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.message.includes('VERCEL_TOKEN')) {
      console.log('\n💡 Para obtener tu token:');
      console.log('   1. Ve a https://vercel.com/account/tokens');
      console.log('   2. Crea un nuevo token');
      console.log('   3. Ejecuta: export VERCEL_TOKEN=tu_token');
      console.log('   4. O crea un archivo .env con: VERCEL_TOKEN=tu_token');
    }
    process.exit(1);
  }
}

main();

