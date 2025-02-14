import mongoose from 'mongoose';

const ProductosDevolucion = new mongoose.Schema({
  id: { type: String, required: true },
  nombre: { type: String, required: true },
  cantidad: { type: Number, required: true },
  precio: { type: Number, required: true },
});

const DevolcuionesSchema = new mongoose.Schema({
  id: { type: String, required: true },
  facturador: { type: String, required: true },
  nombre: { type: String, required: true },
  fecha: { type: Date, required: true },
  productos: { type: [ProductosDevolucion], required: true },
  total: { type: Number, required: true },
});

export const DevolucionesSchemas = mongoose.model('devoluciones', DevolcuionesSchema);