import mongoose from 'mongoose';

const RecuperacionSchema = new mongoose.Schema({
  id: { type: String, required: true },
  facturador: { type: String, required: true },
  fecha: { type: Date, required: true },
  recuperacion: { type: Number, required: true },
  factura: { type: String, required: true },
});

export const RecuperacionSchemas = mongoose.model('recuperacion', RecuperacionSchema);