import productosControllers from '@/controllers/productos';
import { Router } from 'express';

const router: Router = Router();

router.get('/', (req, res) => {
  void productosControllers.obtenerProductos(req, res);
});

router.get('/:id', (req, res) => {
  void productosControllers.obtenerProducto(req, res);
});

router.post('/', (req, res) => {
  void productosControllers.crearProducto(req, res);
});

router.put('/:id', (req, res) => {
  void productosControllers.actualizarProducto(req, res);
});

router.delete('/:id', (req, res) => {
  void productosControllers.eliminarProducto(req, res);
});

export default router;
