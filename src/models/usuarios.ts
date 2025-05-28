import { UsuariosSchemas } from '@/schemas/usuarios';
import { UsuariosTypes } from '@/types/usuarios';
import { decrypt } from '@/lib/encrypt';
import io from '@/app';
import { RutasProductosSchemas } from '@/schemas/rutasProductos';
import { Productos, RutasProductosType } from '@/types/rutasProductos';
import { ProductoType } from '@/types/productos';
import { ProductosSchema } from '@/schemas/productos';
import crypto from 'node:crypto';
import { ProductoFacturaType } from '@/types/facturas';
import { ProductoCambio } from '@/types/cambios';
import { RegistroSchemas } from '@/schemas/registro';
import { RegistroType } from '@/types/registro';

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
  async crearUsuario(usuario: string, password: string, dias: string[]) {
    try {
      const user: UsuariosTypes | null = await UsuariosSchemas.findOne({
        usuario,
      });

      if (user) {
        return 'Usuario ya existe';
      }

      const id = crypto.randomUUID();
      const idRutaPrd = crypto.randomUUID();

      await UsuariosSchemas.create({ id, usuario, password, dias });
      await RutasProductosSchemas.create({
        id: idRutaPrd,
        ruta: id,
        productos: [],
      });

      io.emit('rutaAdd', { id, usuario, password, dias });

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
      await RutasProductosSchemas.deleteOne({ ruta: id });

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
  async actualizarCantidad(id: string, productos: ProductoFacturaType[]) {
    try {
      const ruta: RutasProductosType | null =
        await RutasProductosSchemas.findOne({ ruta: id });

      if (!ruta) return;

      const newProd = new Map<string, Productos>(); // Usamos un mapa para evitar duplicados.

      for (const prodRuta of ruta.productos) {
        // Busca si el producto de la ruta está en la factura
        const prodFac = productos.find((p) => p.nombre === prodRuta.nombre);

        if (prodFac) {
          // Si el producto está en la factura, actualiza la cantidad
          const nuevaCantidad = prodRuta.cantidad - prodFac.cantidad;

          newProd.set(prodRuta.id, {
            id: prodRuta.id,
            nombre: prodRuta.nombre,
            precio: prodRuta.precio,
            cantidad: nuevaCantidad,
          });
        } else {
          // Si el producto no está en la factura, lo agregamos tal cual
          newProd.set(prodRuta.id, {
            id: prodRuta.id,
            nombre: prodRuta.nombre,
            precio: prodRuta.precio,
            cantidad: prodRuta.cantidad,
          });
        }
      }

      // Convertimos el mapa a un array
      const updatedProducts = Array.from(newProd.values());

      // Actualizamos la base de datos con los nuevos productos
      await RutasProductosSchemas.updateOne(
        { ruta: id },
        { productos: updatedProducts },
      );

      // Emitimos los eventos
      io.emit('updateProdRuta', updatedProducts);
      io.emit('updateProd');
    } catch (error) {
      console.error('Error', error);
    }
  }
  async actualizarCantidadUpdate(
    id: string,
    newProductos: ProductoFacturaType[],
    oldProductos: ProductoFacturaType[],
  ) {
    try {
      const ruta: RutasProductosType | null =
        await RutasProductosSchemas.findOne({ ruta: id });

      if (!ruta) return;

      const newProd = new Map<string, Productos>(); // Usamos un mapa para evitar duplicados.

      for (const prodRuta of ruta.productos) {
        const prodOld = oldProductos.find((p) => p.nombre === prodRuta.nombre);
        const prodNew = newProductos.find((p) => p.nombre === prodRuta.nombre);

        if (prodNew && prodOld) {
          let newCantidad = prodRuta.cantidad;
          if (prodNew.cantidad > prodOld.cantidad) {
            newCantidad =
              prodRuta.cantidad - (prodNew.cantidad - prodOld.cantidad);
          } else if (prodNew.cantidad < prodOld.cantidad) {
            newCantidad =
              prodRuta.cantidad + (prodOld.cantidad - prodNew.cantidad);
          }

          newProd.set(prodRuta.id, {
            id: prodRuta.id,
            nombre: prodRuta.nombre,
            precio: prodRuta.precio,
            cantidad: newCantidad,
          });
        } else if (prodOld && !prodNew) {
          newProd.set(prodRuta.id, {
            id: prodRuta.id,
            nombre: prodRuta.nombre,
            precio: prodRuta.precio,
            cantidad: prodRuta.cantidad + prodOld.cantidad,
          });
        } else if (prodNew && !prodOld) {
          newProd.set(prodRuta.id, {
            id: prodRuta.id,
            nombre: prodRuta.nombre,
            precio: prodRuta.precio,
            cantidad: prodRuta.cantidad - prodNew.cantidad,
          });
        } else {
          newProd.set(prodRuta.id, {
            id: prodRuta.id,
            nombre: prodRuta.nombre,
            precio: prodRuta.precio,
            cantidad: prodRuta.cantidad,
          });
        }
      }
      // Convertimos el mapa a un array
      const updatedProducts = Array.from(newProd.values());

      // Actualizamos la base de datos con los nuevos productos
      await RutasProductosSchemas.updateOne(
        { ruta: id },
        { productos: updatedProducts },
      );

      // Emitimos los eventos
      io.emit('updateProdRuta', updatedProducts);
      io.emit('updateProd');
    } catch (error) {
      console.error('Error', error);
    }
  }

  async actualizarCantidadCambio(id: string, productos: ProductoCambio[]) {
    try {
      const ruta: RutasProductosType | null =
        await RutasProductosSchemas.findOne({ ruta: id });

      if (!ruta) return;

      const newProd = new Map<string, Productos>(); // Usamos un mapa para evitar duplicados.

      for (const prodRuta of ruta.productos) {
        // Busca si el producto de la ruta está en la factura
        const prodFac = productos.find((p) => p.nombre === prodRuta.nombre);

        if (prodFac) {
          // Si el producto está en la factura, actualiza la cantidad
          const nuevaCantidad = prodRuta.cantidad - prodFac.cantidad;

          newProd.set(prodRuta.id, {
            id: prodRuta.id,
            nombre: prodRuta.nombre,
            precio: prodRuta.precio,
            cantidad: nuevaCantidad,
          });
        } else {
          // Si el producto no está en la factura, lo agregamos tal cual
          newProd.set(prodRuta.id, {
            id: prodRuta.id,
            nombre: prodRuta.nombre,
            precio: prodRuta.precio,
            cantidad: prodRuta.cantidad,
          });
        }
      }

      // Convertimos el mapa a un array
      const updatedProducts = Array.from(newProd.values());

      // Actualizamos la base de datos con los nuevos productos
      await RutasProductosSchemas.updateOne(
        { ruta: id },
        { productos: updatedProducts },
      );

      // Emitimos los eventos
      io.emit('updateProdRuta', updatedProducts);
      io.emit('updateProd');
    } catch (error) {
      console.error('Error', error);
    }
  }
  async actualizarCantidadCambioUpdate(
    id: string,
    newProductos: ProductoCambio[],
    oldProductos: ProductoCambio[],
  ) {
    try {
      const ruta: RutasProductosType | null =
        await RutasProductosSchemas.findOne({ ruta: id });

      if (!ruta) return;

      const registro: RegistroType | null = await RegistroSchemas.findOne({
        ruta: id,
        terminada: false,
      });

      if (!registro) return 'Registro no encontrado';

      const cambiosAnteriores: Record<string, number> = oldProductos.reduce<
        Record<string, number>
      >((acc, p) => { 
        acc[p.nombre] = p.cantidad;
        return acc;
      }
      , {});
      
      const cambiosNuevos: Record<string, number> = newProductos.reduce<Record<string, number>>(
        (acc, p) => {
          acc[p.nombre] = p.cantidad;
          return acc;
        },
        {}
      );

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const cambios: Record<string, number> = JSON.parse(JSON.stringify(registro.cambios));

      const newProd = new Map<string, Productos>(); // Usamos un mapa para evitar duplicados.

      for (const prodRuta of ruta.productos) {
        const prodOld = oldProductos.find((p) => p.nombre === prodRuta.nombre);
        const prodNew = newProductos.find((p) => p.nombre === prodRuta.nombre);
        
        if (prodNew && prodOld) {
          let newCantidad = prodRuta.cantidad;
          if (prodNew.cantidad > prodOld.cantidad) {
            newCantidad =
              prodRuta.cantidad - (prodNew.cantidad - prodOld.cantidad);
          } else if (prodNew.cantidad < prodOld.cantidad) {
            newCantidad =
              prodRuta.cantidad + (prodOld.cantidad - prodNew.cantidad);
          }

          newProd.set(prodRuta.id, {
            id: prodRuta.id,
            nombre: prodRuta.nombre,
            precio: prodRuta.precio,
            cantidad: newCantidad,
          });
        } else if (prodOld && !prodNew) {
          newProd.set(prodRuta.id, {
            id: prodRuta.id,
            nombre: prodRuta.nombre,
            precio: prodRuta.precio,
            cantidad: prodRuta.cantidad + prodOld.cantidad,
          });
        } else if (prodNew && !prodOld) {
          newProd.set(prodRuta.id, {
            id: prodRuta.id,
            nombre: prodRuta.nombre,
            precio: prodRuta.precio,
            cantidad: prodRuta.cantidad - prodNew.cantidad,
          });
        } else {
          newProd.set(prodRuta.id, {
            id: prodRuta.id,
            nombre: prodRuta.nombre,
            precio: prodRuta.precio,
            cantidad: prodRuta.cantidad,
          });
        }

        const cambioOld = cambiosAnteriores[prodRuta.nombre];
        const cambioNew = cambiosNuevos[prodRuta.nombre];

        if (cambioNew && cambioOld) {
          let newCambio = cambioOld;
          
          if(cambioNew > cambioOld){
            newCambio = cambios[prodRuta.nombre] + (cambioNew - cambioOld);
          } else if(cambioNew < cambioOld){
            newCambio = cambios[prodRuta.nombre] - (cambioOld - cambioNew);
          } else {
            newCambio = cambios[prodRuta.nombre];
          }
          
          cambiosNuevos[prodRuta.nombre] = newCambio;
        } else if (cambioOld && !cambioNew) { 
          cambiosNuevos[prodRuta.nombre] = cambios[prodRuta.nombre] - cambioOld;
        }
        else if (cambioNew && !cambioOld) {
          cambiosNuevos[prodRuta.nombre] = cambios[prodRuta.nombre] + cambioNew;
        }
        else {
          cambiosNuevos[prodRuta.nombre] = cambios[prodRuta.nombre] || 0;
        }
      }

      await RegistroSchemas.updateOne(
        { id: registro.id },
        { $set: { cambios: cambiosNuevos } },
      );

      // Convertimos el mapa a un array
      const updatedProducts = Array.from(newProd.values());

      // Actualizamos la base de datos con los nuevos productos
      await RutasProductosSchemas.updateOne(
        { ruta: id },
        { productos: updatedProducts },
      );

      // Emitimos los eventos
      io.emit('updateProdRuta', updatedProducts);
      io.emit('updateProd');
    } catch (error) {
      console.error('Error', error);
    }
  }
  async actualizarPrecioProducto(idProd: string, precio: number, nombre: string) {
    try {
      const rutas = await RutasProductosSchemas.find();

      await Promise.all(
        rutas.map(async (ruta) => {
          const productos = ruta.productos.map((prd) => {
            if (prd.id === idProd) {
              prd.precio = precio;
              prd.nombre = nombre;
            }

            return prd;
          });

          await RutasProductosSchemas.updateOne(
            { ruta: ruta.ruta },
            { productos },
          );
        }),
      );
    } catch (error) {
      console.error('Error', error);
    }
  }
}

export default new UsuariosModels();
