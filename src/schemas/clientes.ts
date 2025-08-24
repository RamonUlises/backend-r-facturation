import mongoose from 'mongoose';

const Clientes = new mongoose.Schema({
  id: { type: String, required: true },
  nombres: { type: String, required: true },
  direccion: { type: String, required: true },
  telefono: { type: String, required: true },
});

export const ClientesSchema = mongoose.model('clientes', Clientes);
