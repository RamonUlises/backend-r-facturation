import mongoose from 'mongoose';

const Personal = new mongoose.Schema({
  id: { type: String, required: true },
  nombres: { type: String, required: true },
  apellidos: { type: String, required: true },
  direccion: { type: String, required: true },
  cedula: { type: String, required: true },
  telefono: { type: String, required: true },
  fechaNacimiento: { type: String, required: true },
  imagen: { type: String, required: false },
  salario: { type: Number, required: true },
  inicioTrabajo: { type: String, required: true },
});

export const PersonalSchema = mongoose.model('personal', Personal);
