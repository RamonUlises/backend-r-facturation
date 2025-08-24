import { Router } from 'express';
import FacturasControllers from '../controllers/facturas';

const router = Router();

router.get('/fecha/:fecha', (req, res) => {
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

router.delete('/:id/facturador/:facturador', (req, res) => {
  void FacturasControllers.eliminarFactura(req, res);
});

router.put('/abonar/:id', (req, res) => {
  void FacturasControllers.abonarFactura(req, res);
});

router.put('/abonar/facturador/:id', (req, res) => {
  void FacturasControllers.abonarFacturaFacturador(req, res);
});

router.get('/rutas/:id/fecha/:fecha', (req, res) => {
  void FacturasControllers.obtenerFacturasFacturador(req, res);
});

router.get('/rutas/:id/fecha/:fecha/total', (req, res) => {
  void FacturasControllers.obtenerFacturasFacturadorTotal(req, res);
});

router.get('/resumen/:id/fecha/:fecha', (req, res) => {
  void FacturasControllers.obtenerResumenFacturasFacturador(req, res);
});

router.get('/estado/credito', (req, res) => {
  void FacturasControllers.obtenerCredito(req, res);
});

router.get('/resumen/semanas', (req, res) => {
  void FacturasControllers.obtenerResumenSemanas(req, res);
});

router.get('/clientes/:cliente/facturador/:facturador', (req, res) => {
  void FacturasControllers.obtenerFacturasCliente(req, res);
});

router.get('/rango/:fechaInicio/:fechaFin', (req, res) => {
  void FacturasControllers.obtenerFacturasRango(req, res);
});

router.get('/creditos/no-canceladas', (req, res) => {
  void FacturasControllers.obtenerCreditos(req, res);
});

router.put('/cambiar-cliente/factura/:id', (req, res) => {
  void FacturasControllers.cambiarClienteFactura(req, res);
});

export default router;
