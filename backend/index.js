import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { connectDB } from './config/configDb.js';
import { PORT } from './config/configEnv.js';

const app = express();

app.get('/', (req, res) => {
  res.send('Backend funcionando :3');
});

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
  });
});
