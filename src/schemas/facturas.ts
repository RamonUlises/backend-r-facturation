import mongoose from 'mongoose';

const Producto = new mongoose.Schema({
  id: { type: String, required: true },
  nombre: { type: String, required: true },
  precio: { type: Number, required: true },
  cantidad: { type: Number, required: true },
});

const FacturaSchema = new mongoose.Schema({
  id: { type: String, required: true },
  'id-facturador': { type: String, required: true },
  nombre: { type: String, required: true },
  fecha: { type: Date, required: true },
  productos: { type: [Producto], required: true },
  tipo: { type: String, required: true },
  total: { type: Number, required: true },
  pagado: { type: Number, required: true }
});

export const FacturasSchemas = mongoose.model('facturas', FacturaSchema);
