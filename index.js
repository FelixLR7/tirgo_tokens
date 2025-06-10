// archivo: server.js
import express from 'express';
import multer from 'multer';

import { config } from './config.js';
import { verifyToken } from './verify-token.js';
import { readDataFile, updateLineByToken, fileExists, readFileContent, deleteFile } from "./utils.js";

const multerConfig = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './'); // Carpeta donde se guarda
  },
  filename: function (req, file, cb) {
    // Guarda con el nombre original
    cb(null, file.originalname);
  }
});
const upload = multer({ storage: multerConfig });
const app = express();
const filePath = './users.txt';

app.get('/statusTokens', async (req, res) => {
    const users = await readDataFile(filePath);

    res.send(users);
})

app.post('/upload', upload.single('file'), (req, res) => {
  console.log('Archivo recibido:', req.file);
  res.send('Archivo subido correctamente');
});

// Endpoint de acceso al enlace ofuscado
app.get('/join/:token', async (req, res) => {
    if(!fileExists(filePath)) {
      const content = await readFileContent('./processing_links.html');
      console.log('Contenido del archivo de enlaces:', content);
      return res.status(402).send(content);
    }

    const { token } = req.params;
    const verifyResponse = await verifyToken(token);

    if (!verifyResponse) {
      const content = await readFileContent('./invalid_link.html');
      console.log('Contenido del archivo de enlaces:', content);
      return res.status(404).send(content);
    }

    await updateLineByToken(filePath, token); // Actualizar el estado del token
    return res.redirect(config.whatsappCommunityUrl);
});

app.get('/tokensFile', async (req, res) => {
  const content = await readFileContent(filePath);
  console.log('Contenido leído');
  res.send(`Contenido del archivo:\n<pre>${content}</pre>`);
});

app.get('/deleteFile', async (req, res) => {
  await deleteFile(filePath);
  res.send('Archivo eliminado correctamente');
});

app.listen(config.port, () => {
  console.log(`Servidor en marcha`);
});