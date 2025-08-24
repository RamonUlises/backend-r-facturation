import mongoose from 'mongoose';

const Productos = new mongoose.Schema({
  id: { type: String, required: true },
  nombre: { type: String, required: true },
  precio: { type: Number, required: true },
  cantidad: { type: Number, required: true },
});

const RutasProductosSchema = new mongoose.Schema({
  id: { type: String, required: true },
  ruta: { type: String, required: true },
  productos: [Productos],
});

export const RutasProductosSchemas = mongoose.model('rutasProductos', RutasProductosSchema);
