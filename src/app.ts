import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import { Server } from 'socket.io';
import http from 'http';
import './database/connection';

import usuarios from './router/usuarios';
import productos from './router/productos';
import clientes from './router/clientes';
import facturas from './router/facturas';

const app = express();
const port: number | string = process.env.PORT ?? 3000;

// eslint-disable-next-line @typescript-eslint/no-misused-promises
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(morgan('dev'));

app.use('/usuarios', usuarios);
app.use('/productos', productos);
app.use('/clientes', clientes);
app.use('/facturas', facturas);

app.use((req, res) => {
  res.status(404).send({ message: 'Ruta no encontrada' });
});

server.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port.toString()}`);
});

export default io;
