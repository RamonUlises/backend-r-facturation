import { Router } from 'express';
import CambiosController from '../controllers/cambios';

const router = Router();

router.get('/', (req, res) => {
  void CambiosController.obtenerCambios(req, res);
});

router.post('/', (req, res) => {
  void CambiosController.crearCambio(req, res);
});

router.put('/:id', (req, res) => {
  void CambiosController.editarCambio(req, res);
});

router.delete('/:id', (req, res) => {
  void CambiosController.eliminarCambio(req, res);
});

router.get('/rutas/:facturador', (req, res) => {
  void CambiosController.obtenerCambiosFacturador(req, res);
});

export default router;