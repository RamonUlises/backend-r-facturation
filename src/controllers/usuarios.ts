import { encrypt } from '@/lib/encrypt';
import UsuariosModels from '@/models/usuarios';
import { Request, Response } from 'express';

class UsuariosControllers {
  async obtenerUsuarios(req: Request, res: Response) {
    try {
      const usuarios = await UsuariosModels.obtenerUsuarios();

      if (usuarios.length === 0) {
        return res.status(404).json({ message: 'Sin usuarios registrados' });
      }

      return res.status(200).json(usuarios);
    } catch {
      return res.status(500).json({ message: 'Error al obtener usuarios' });
    }
  }
  async obtenerUsuario(req: Request, res: Response) {
    try {
      const { id } = req.params as { id: string };

      if (!id) {
        return res.status(400).json({ message: 'Usuario requerido' });
      }

      const user = await UsuariosModels.obtenerUsuario(id);

      if (!user) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }

      return res.status(200).json(user);
    } catch {
      return res.status(500).json({ message: 'Error al obtener usuario' });
    }
  }
  async crearUsuario(req: Request, res: Response) {
    try {
      const { usuario, password } = req.body as {
        usuario: string;
        password: string;
      };

      if (!usuario || !password) {
        return res
          .status(400)
          .json({ message: 'Usuario y contraseña requeridos' });
      }

      const newPassword = encrypt(password);

      const result = await UsuariosModels.crearUsuario(usuario, newPassword);

      return res.status(200).json({ message: result });
    } catch {
      return res.status(500).json({ message: 'Error al crear usuario' });
    }
  }
  async actualizarUsuario(req: Request, res: Response) {
    try {
      const { id } = req.params as { id: string };
      const { usuario, password } = req.body as {
        usuario: string;
        password: string;
      };

      if (!id || !usuario || !password) {
        return res
          .status(400)
          .json({ message: 'Usuario, contraseña y id requeridos' });
      }

      const newPassword = encrypt(password);

      const result = await UsuariosModels.actualizarUsuario(
        id,
        usuario,
        newPassword,
      );

      return res.status(200).json({ message: result });
    } catch {
      return res.status(500).json({ message: 'Error al actualizar usuario' });
    }
  }
  async eliminarUsuario(req: Request, res: Response) {
    try {
      const { id } = req.params as { id: string };

      if (!id) {
        return res.status(400).json({ message: 'Usuario requerido' });
      }

      const result = await UsuariosModels.eliminarUsuario(id);

      return res.status(200).json({ message: result });
    } catch {
      return res.status(500).json({ message: 'Error al eliminar usuario' });
    }
  }
  async login(req: Request, res: Response) {
    try {
      const { usuario, password } = req.body as {
        usuario: string;
        password: string;
      };

      if (!usuario || !password) {
        return res
          .status(400)
          .json({ message: 'Usuario y contraseña requeridos' });
      }

      const result = await UsuariosModels.login(usuario, password);

      if (!result.status) {
        return res.status(404).json({ message: result.message });
      }

      return res
        .status(200)
        .json({ message: 'Login correcto', token: result.token });
    } catch {
      return res.status(500).json({ message: 'Error al hacer login' });
    }
  }
}

export default new UsuariosControllers();
