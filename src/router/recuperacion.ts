import { Router } from 'express';
import RecuperacionControllers from '../controllers/recuperacion';

const router = Router();

router.get('/facturador/:id/:fecha', (req, res) => {
  void RecuperacionControllers.obtenerRecuperacionesFacturador(req, res);
});
export default router;
