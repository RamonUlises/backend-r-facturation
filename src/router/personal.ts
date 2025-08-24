import { Router } from 'express';
import personalControllers from '@/controllers/personal';

const router = Router();

router.get('/', (req, res) => {
  void personalControllers.obtenerPersonal(req, res);
});

router.post('/', (req, res) => {
  void personalControllers.agregarPersonal(req, res);
});

router.put('/:id', (req, res) => {
  void personalControllers.actualizarPersonal(req, res);
});

router.delete('/:id', (req, res) => {
  void personalControllers.eliminarPersonal(req, res);
});

export default router;
