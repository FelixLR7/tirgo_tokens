import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import fsClassic from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const logFilePath = path.join(__dirname, 'log.txt');

let lock = false;

/**
 * Registra un mensaje en consola y en un archivo de texto.
 * @param {string} message - El mensaje que quieres loggear.
 * @param {'info'|'error'|'warn'} [type='info'] - Tipo de mensaje.
 */
export function log(message, type = 'info') {
  const timestamp = new Date().toISOString();
  const formatted = `[${timestamp}] [${type.toUpperCase()}] ${message}`;

  // Mostrar en consola
  switch (type) {
    case 'error':
      console.error(formatted);
      break;
    case 'warn':
      console.warn(formatted);
      break;
    default:
      console.log(formatted);
  }

  // Guardar en el archivo
  fs.appendFile(logFilePath, formatted + '\n', err => {
    if (err) {
      console.error('Error al escribir en el log:', err.message);
    }
  });
}

export function fileExists(filePath) {
  return fsClassic.existsSync(filePath);
}

// Leer el archivo de datos
export async function readDataFile(filePath) {
  const fullPath = path.resolve(filePath);

  try {
    const data = await fs.readFile(fullPath, 'utf8');

    const lines = data.split('\n').filter(line => line.trim() !== '');
    const parsed = lines.map(line => {
      const [token, used, username] = line.split('|');

      return { token, used, username };
    });

    return parsed;

  } catch (err) {
    console.error('Error al leer el archivo:', err);
    return [];
  }
}

async function safeWrite(updateFn, filePath) {
  while (lock) await new Promise(r => setTimeout(r, 10));
  lock = true;

  try {
    const content = await fs.readFile(filePath, 'utf8');
    const lines = content.split('\n').filter(Boolean);
    const updatedLines = updateFn(lines);
    await fs.writeFile(filePath, updatedLines.join('\n'), 'utf8');
  } finally {
    lock = false;
  }
}

export async function appendArrayToFile(filePath, array) {
  await fs.appendFile(filePath, array.join('\n'), 'utf8');
}

export async function updateLineByToken(filePath, targetToken) {
  await safeWrite((lines) => {
    return lines.map(line => {
      const [token, used, username] = line.split('|');

      if (token === targetToken) {
        return `${token}|true|${username}`;
      }
      return line;
    });
  }, filePath);
}

export async function deleteFile(filePath) {
  fsClassic.unlink(filePath, (err) => {
    if (err) {
      console.error('Error al eliminar el archivo:', err);
    } else {
      console.log('Archivo eliminado correctamente');
    }
  });
}

export async function readFileContent(filePath) {
  try {
    const content = await fsClassic.readFile(filePath, 'utf8');

    return content;   
  }
  catch (err) {
    console.error('Error al leer el archivo:', err);
    return null;
  }
}