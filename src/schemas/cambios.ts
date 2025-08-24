import mongoose from 'mongoose';

const ProductosCambio = new mongoose.Schema({
  id: { type: String, required: true },
  nombre: { type: String, required: true },
  cantidad: { type: Number, required: true },
});

const CambiosSchema = new mongoose.Schema({
  id: { type: String, required: true },
  facturador: { type: String, required: true },
  nombre: { type: String, required: true },
  fecha: { type: Date, required: true },
  productos: { type: [ProductosCambio], required: true },
});

export const CambiosSchemas = mongoose.model('cambios', CambiosSchema);