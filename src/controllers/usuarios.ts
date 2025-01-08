import { encrypt } from '@/lib/encrypt';
import UsuariosModels from '@/models/usuarios';
import { ProductoType } from '@/types/productos';
import { Productos } from '@/types/rutasProductos';
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

      if (result === 'Usuario ya existe') {
        return res.status(400).json({ message: result });
      }

      if (result === 'Error al crear usuario') {
        return res.status(500).json({ message: result });
      }

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

      if (result === 'Usuario no encontrado') {
        return res.status(404).json({ message: result });
      }

      if (result === 'Error al actualizar usuario') {
        return res.status(500).json({ message: result });
      }

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

      if (result === 'Usuario no encontrado') {
        return res.status(404).json({ message: result });
      }

      if (result === 'Error al eliminar usuario') {
        return res.status(500).json({ message: result });
      }

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
  async obtenerProductosRuta(req: Request, res: Response) {
    try {
      const { ruta } = req.params as { ruta: string };

      const response = await UsuariosModels.obtenerProductosRuta(ruta);

      if (response == null) {
        return res.status(404).json({ message: 'Sin productos en la ruta' });
      }
      
      return res.status(200).json(response);
    } catch {
      res
        .status(500)
        .json({ message: 'Error al obtener productos de la ruta' });
    }
  }
  async actualizarProductosRuta(req: Request, res: Response){
    try {
      const { ruta } = req.params as { ruta: string };
      const { productos, newProductos } = req.body as { productos: Productos[], newProductos: ProductoType[] };

      const response = await UsuariosModels.actualizarProductosRuta(ruta, productos, newProductos);

      if(response === 'Ruta no encontrada'){
        res.status(404).json({ message: response });
      }

      if(response === 'Error al actualizar'){
        res.status(500).json({ message: response });
      }
      
      res.status(200).json({ message: response });
    } catch {
      res.status(500).json({ message: 'Error al actualizar'});
    }
  }
}

export default new UsuariosControllers();
