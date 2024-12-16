import mongoose from 'mongoose';

const UsuarioSchema = new mongoose.Schema({
  id: { type: String, required: true },
  usuario: { type: String, required: true },
  password: { type: String, required: true },
});

export const UsuariosSchemas = mongoose.model('usuarios', UsuarioSchema);
