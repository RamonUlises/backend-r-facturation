import { CambiosSchemas } from '@/schemas/cambios';
import { CambiosType, ProductoCambio } from '@/types/cambios';
import UsuarioModels from '@/models/usuarios';
import io from '@/app';

class CambiosModels {
  async obtenerCambios() {
    try {
      const cambios: CambiosType[] = await CambiosSchemas.find();
      return cambios;
    } catch {
      return [];
    }
  }
  async crearCambio(cambios: CambiosType) {
    try {
      await CambiosSchemas.create(cambios);
      await UsuarioModels.actualizarCantidadCambio(
        cambios.facturador,
        cambios.productos,
      );

      io.emit('cambioAdd', {
        id: cambios.id,
        facturador: cambios.facturador,
        nombre: cambios.nombre,
        fecha: cambios.fecha,
        productos: cambios.productos,
      });

      return 'Cambio creado';
    } catch {
      return 'Error al crear cambio';
    }
  }
  async editarCambio(id: string, productos: ProductoCambio[]) {
    try {
      const cambio = await CambiosSchemas.findOne({ id });

      if (!cambio) {
        return 'Cambio no encontrado';
      }

      const productosAnteriores: ProductoCambio[] = cambio.productos;

      await CambiosSchemas.updateOne({ id }, { productos });
      await UsuarioModels.actualizarCantidadCambioUpdate(
        cambio.facturador,
        productos,
        productosAnteriores,
      );

      io.emit('cambioUpdate', { id, facturador: cambio.facturador, productos });

      return 'Cambio editado';
    } catch {
      return 'Error al editar cambio';
    }
  }
  async eliminarCambio(id: string) {
    try {
      const cambio = await CambiosSchemas.findOne({ id });

      if (!cambio) {
        return 'Cambio no encontrado';
      }

      await CambiosSchemas.deleteOne({ id });

      io.emit('cambioDelete', id);

      return 'Cambio eliminado';
    } catch {
      return 'Error al eliminar cambio';
    }
  }
  async obtenerCambiosFacturador(id: string) {
    try {
      const cambios = await CambiosSchemas.find({ facturador: id });
      return cambios;
    } catch {
      return [];
    }
  }
}

export default new CambiosModels();
