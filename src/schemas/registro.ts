import mongoose from 'mongoose';

const RegistroSchema = new mongoose.Schema({
  id: { type: String, required: true },
  ruta: { type: String, required: true },
  fechaInicio: { type: String, required: true },
  fechaFin: { type: String, required: true },
  productos: { type: Map, of: Map, required: true },
  cambios: { type: Map, of: Number, required: true },
  sobrantes: { type: Map, of: Number, required: true },
  terminada: { type: Boolean, default: false },
  descuentos: { type: Number, default: 0 },
});

export const RegistroSchemas = mongoose.model('registro', RegistroSchema);