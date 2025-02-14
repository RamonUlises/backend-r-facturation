import { Router } from 'express';
import DevolucionesController from '../controllers/devoluciones';

const router = Router();

router.get('/', (req, res) => {
  void DevolucionesController.obtenerDevoluciones(req, res);
});

router.post('/', (req, res) => {
  void DevolucionesController.crearDevolucion(req, res);
});

router.put('/:id', (req, res) => {
  void DevolucionesController.actualizarDevolucion(req, res);
});

router.delete('/:id', (req, res) => {
  void DevolucionesController.eliminarDevolucion(req, res);
});

export default router;