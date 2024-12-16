import mongoose from 'mongoose';

const Productos = new mongoose.Schema({
  id: { type: String, required: true },
  nombre: { type: String, required: true },
  precio: { type: Number, required: true },
  cantidad: { type: Number, required: true },
});

export const ProductosSchema = mongoose.model('productos', Productos);
