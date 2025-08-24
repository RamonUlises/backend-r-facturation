import io from '@/app';
import { RegistroSchemas } from '@/schemas/registro';
import { ProductosDiasType, RegistroType } from '@/types/registro';
import crypto from 'node:crypto';
import RutasProductosModels from '@/models/usuarios';
import { Productos } from '@/types/rutasProductos';
import { RutasProductosSchemas } from '@/schemas/rutasProductos';
import ProductosModels from '@/models/productos';

class RegistroModel {
  async obtenerRegistros() {
    try {
      const registros = await RegistroSchemas.find();

      return registros;
    } catch {
      return [];
    }
  }
  async crearRegistro(
    ruta: string,
    fechaInicio: string,
    fechaFin: string,
    productos: ProductosDiasType,
    sobrantes: Record<string, number>,
    cambios: Record<string, number>,
  ) {
    try {
      const registros = await RegistroSchemas.find({ ruta });

      for (const registro of registros) {
        if (!registro.terminada) {
          return 'Ya existe un registro sin terminar';
        }
      }

      const id = crypto.randomUUID();
      await RegistroSchemas.create({
        id,
        ruta,
        fechaInicio,
        fechaFin,
        productos,
        sobrantes,
        cambios,
      });

      io.emit('registroAdd', {
        id,
        ruta,
        fechaInicio,
        fechaFin,
        productos,
        sobrantes,
        cambios,
        terminada: false,
      });

      return 'Registro creado correctamente';
    } catch {
      return 'Error al crear el registro';
    }
  }
  async actualizarRegistro(registro: RegistroType) {
    try {
      await RegistroSchemas.updateOne({ id: registro.id }, registro);

      io.emit('registroUpdate', registro);

      return 'Registro actualizado correctamente';
    } catch {
      return 'Error al actualizar el registro';
    }
  }
  async eliminarRegistro(id: string) {
    try {
      await RegistroSchemas.deleteOne({ id });

      io.emit('registroDelete', id);

      return 'Registro eliminado correctamente';
    } catch {
      return 'Error al eliminar el registro';
    }
  }
  async terminarRegistro(id: string, ruta: string) {
    try {
      const registro = await RegistroSchemas.findOne({ id });

      if (!registro) return 'No existe el registro';

      const productosRuta = await RutasProductosModels.obtenerProductosRuta(
        ruta,
      );

      if (!productosRuta) return 'No existen productos en la ruta';

      // Terminar el registro y guardar los sobrantes

      const sobrantes: Record<string, number> = {};

      productosRuta.productos.forEach((producto) => {
        sobrantes[producto.nombre] = producto.cantidad;
      });

      await RegistroSchemas.updateOne({ id }, { terminada: true, sobrantes });
      io.emit('registroTerminada', { id , sobrantes });

      // Dejar los productos de la ruta en 0

      const newProdRuta: Productos[] = [];

      productosRuta.productos.forEach((producto) => {
        newProdRuta.push({
          id: producto.id,
          nombre: producto.nombre,
          precio: producto.precio,
          cantidad: 0,
        });
      });

      await RutasProductosSchemas.updateOne(
        { ruta },
        { productos: newProdRuta },
      );

      // Regresar los sobrantes al inventario

      const inventario = await ProductosModels.obtenerProductos();

      for (const producto of inventario) {
        let cantidad = producto.cantidad;

        if (sobrantes[producto.nombre]) {
          cantidad += sobrantes[producto.nombre];

          await ProductosModels.actualizarProducto(
            producto.id,
            producto.nombre,
            producto.precioCompra,
            producto.precioVenta,
            cantidad,
          );
        }
      }

      io.emit('updateProd');

      return 'Registro terminado correctamente';
    } catch {
      return 'Error al terminar el registro';
    }
  }
}

export default new RegistroModel();
