import usuarios from '@/controllers/usuarios';
import { Router, Request, Response } from 'express';

const router: Router = Router();

router.get('/', (req: Request, res: Response) => {
  void usuarios.obtenerUsuarios(req, res);
});

router.get('/:id', (req: Request, res: Response) => {
  void usuarios.obtenerUsuario(req, res);
});

router.post('/', (req: Request, res: Response) => {
  void usuarios.crearUsuario(req, res);
});

router.put('/:id', (req: Request, res: Response) => {
  void usuarios.actualizarUsuario(req, res);
});

router.delete('/:id', (req: Request, res: Response) => {
  void usuarios.eliminarUsuario(req, res);
});

router.post('/login', (req: Request, res: Response) => {
  void usuarios.login(req, res);
});

export default router;
