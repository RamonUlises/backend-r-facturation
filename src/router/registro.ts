import { Router } from 'express';
import RegistroController from '../controllers/registro';

const router = Router();

router.get('/', (req, res) => {
  void RegistroController.obtenerRegistros(req, res);
});

router.post('/', (req, res) => {
  void RegistroController.crearRegistro(req, res);
});

router.delete('/:id', (req, res) => {
  void RegistroController.eliminarRegistro(req, res);
});

router.put('/terminar/:id', (req, res) => {
  void RegistroController.terminarRegistro(req, res);
});

export default router;
