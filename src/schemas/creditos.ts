import mongoose from 'mongoose';

const Creditos = new mongoose.Schema({
  id: { type: String, required: true },
  proveedor: { type: String, required: true },
  monto: { type: Number, required: true },
  abono: { type: Number, required: true },
  fechaInicio: { type: String, required: true },
  fechaFin: { type: String, required: true },
});

export const CreditosSchema = mongoose.model('creditos', Creditos);