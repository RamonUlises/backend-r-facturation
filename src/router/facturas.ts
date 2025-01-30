import { Router } from 'express';
import FacturasControllers from '../controllers/facturas';

const router = Router();

router.get('/', (req, res) => {
  void FacturasControllers.obtenerFacturas(req, res);
});

router.get('/:id', (req, res) => {
  void FacturasControllers.obtenerFactura(req, res);
});

router.post('/', (req, res) => {
  void FacturasControllers.crearFactura(req, res);
});

router.put('/:id', (req, res) => {
  void FacturasControllers.actualizarFactura(req, res);
});

router.delete('/:id', (req, res) => {
  void FacturasControllers.eliminarFactura(req, res);
});

router.put('/abonar/:id', (req, res) => {
  void FacturasControllers.abonarFactura(req, res);
});

router.get('/rutas/:id', (req, res) => {
  void FacturasControllers.obtenerFacturasFacturador(req, res);
});

export default router;
