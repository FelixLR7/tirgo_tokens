// archivo: server.js
import express from 'express';
import multer from 'multer';

import { config } from './config.js';
import { verifyToken } from './verify-token.js';
import { readDataFile, updateLineByToken, fileExists } from "./utils.js";

const multerConfig = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Carpeta donde se guarda
  },
  filename: function (req, file, cb) {
    // Guarda con el nombre original
    cb(null, file.originalname);
  }
});
const upload = multer({ storage: multerConfig });
const app = express();

app.get('/statusTokens', async (req, res) => {
    const users = await readDataFile('./users.txt');

    res.send(users);
})

app.post('/upload', upload.single('file'), (req, res) => {
  console.log('Archivo recibido:', req.file);
  res.send('Archivo subido correctamente');
});

// Endpoint de acceso al enlace ofuscado
app.get('/join/:token', async (req, res) => {
    if(!fileExists('./users.txt')) {
        return res.status(402).send("Estamos procesando los enlaces que os han llegado. Por favor, inténtalo en unos minutos.");
    }

    const { token } = req.params;
    const verifyResponse = await verifyToken(token);

    if (!verifyResponse) {
        return res.status(404).send("Enlace inválido.");
    }

    await updateLineByToken('./users.txt', token); // Actualizar el estado del token
    return res.redirect(config.whatsappCommunityUrl);
});

app.listen(config.port, () => {
  console.log(`Servidor en marcha`);
});