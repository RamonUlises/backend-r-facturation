import { UsuariosSchemas } from '@/schemas/usuarios';
import { UsuariosTypes } from '@/types/usuarios';
import { decrypt } from '@/lib/encrypt';
import io from '@/app';
import { RutasProductosSchemas } from '@/schemas/rutasProductos';
import { Productos, RutasProductosType } from '@/types/rutasProductos';
import { ProductoType } from '@/types/productos';
import { ProductosSchema } from '@/schemas/productos';

class UsuariosModels {
  async obtenerUsuarios() {
    try {
      const usuarios: UsuariosTypes[] = await UsuariosSchemas.find();

      return usuarios;
    } catch {
      return [];
    }
  }
  async obtenerUsuario(id: string) {
    try {
      const user = await UsuariosSchemas.findOne({ id });

      if (user) {
        return user;
      } else {
        return null;
      }
    } catch {
      return null;
    }
  }
  async crearUsuario(usuario: string, password: string) {
    try {
      const user: UsuariosTypes | null = await UsuariosSchemas.findOne({
        usuario,
      });

      if (user) {
        return 'Usuario ya existe';
      }

      const id = crypto.randomUUID();
      const idRutaPrd = crypto.randomUUID();

      await UsuariosSchemas.create({ id, usuario, password });
      await RutasProductosSchemas.create({
        id: idRutaPrd,
        ruta: id,
        productos: [],
      });

      io.emit('rutaAdd', { id, usuario, password });

      return 'Usuario creado';
    } catch {
      return 'Error al crear usuario';
    }
  }
  async actualizarUsuario(id: string, usuario: string, password: string) {
    try {
      const user = await UsuariosSchemas.findOne({ id });

      if (!user) {
        return 'Usuario no encontrado';
      }

      const user2 = await UsuariosSchemas.findOne({ usuario });

      if (user2 && user2.id !== id) {
        return 'Usuario ya existe';
      }

      await UsuariosSchemas.updateOne({ id }, { usuario, password });

      io.emit('rutaUpdate', { id, usuario, password });

      return 'Usuario actualizado';
    } catch {
      return 'Error al actualizar usuario';
    }
  }
  async eliminarUsuario(id: string) {
    try {
      const user = await UsuariosSchemas.findOne({ id });

      if (!user) {
        return 'Usuario no encontrado';
      }

      await UsuariosSchemas.deleteOne({ id });

      io.emit('rutaDelete', id);

      return 'Usuario eliminado';
    } catch {
      return 'Error al eliminar usuario';
    }
  }
  async login(
    usuario: string,
    password: string,
  ): Promise<{ status: boolean; message: string; token: string }> {
    try {
      const user: UsuariosTypes | null = await UsuariosSchemas.findOne({
        usuario,
      });

      if (user == null) {
        return { status: false, message: 'Usuario no encontrado', token: '' };
      }

      const pass = decrypt(user.password);

      if (user.usuario === usuario && pass === password) {
        return { status: true, message: 'Usuario logueado', token: user.id };
      } else {
        return { status: false, message: 'Contraseña incorrecta', token: '' };
      }
    } catch {
      return { status: false, message: 'Error al loguear usuario', token: '' };
    }
  }
  async obtenerProductosRuta(ruta: string) {
    try {
      const productos: RutasProductosType | null =
        await RutasProductosSchemas.findOne({ ruta });

      if (productos) {
        return productos;
      } else {
        return null;
      }
    } catch {
      return null;
    }
  }
  async actualizarProductosRuta(
    id: string,
    productos: Productos[],
    newProductos: ProductoType[],
  ) {
    try {
      const ruta: RutasProductosType | null =
        await RutasProductosSchemas.findOne({ id });

      if (!ruta) {
        return 'Ruta no encontrada';
      }

      await RutasProductosSchemas.updateOne({ id }, { productos });

      await Promise.all(
        newProductos.map(async (prd) => {
          await ProductosSchema.updateOne(
            { id: prd.id },
            { cantidad: prd.cantidad },
          );
        }),
      );

      return 'Productos actualizados';
    } catch {
      return 'Error al actualizar';
    }
  }
}

export default new UsuariosModels();
