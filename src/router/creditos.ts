import { Router } from 'express';
import CreditosController from '../controllers/creditos';

const router = Router();

router.get('/', (req, res) => {
  void CreditosController.obtenerCreditos(req, res);
});

router.post('/', (req, res) => {
  void CreditosController.crearCredito(req, res);
});

router.put('/abonar/:id', (req, res) => {
  void CreditosController.abonarCredito(req, res);
});

router.delete('/:id', (req, res) => {
  void CreditosController.eliminarCredito(req, res);
});

export default router;