import { Router } from 'express';
import RecuperacionControllers from '../controllers/recuperacion';

const router = Router();

router.get('/fecha/:fecha', (req, res) => {
  void RecuperacionControllers.obtenerRecuperacionesFecha(req, res);
});

router.get('/facturador/:id/:fecha', (req, res) => {
  void RecuperacionControllers.obtenerRecuperacionesFacturador(req, res);
});

router.delete('/:id', (req, res) => {
  void RecuperacionControllers.eliminarRecuperacion(req, res);
});

export default router;
