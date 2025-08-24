import mongoose from 'mongoose';

const Productos = new mongoose.Schema({
  id: { type: String, required: true },
  nombre: { type: String, required: true },
  precioCompra: { type: Number, required: true },
  precioVenta: { type: Number, required: true },
  cantidad: { type: Number, required: true },
});

export const ProductosSchema = mongoose.model('productos', Productos);
