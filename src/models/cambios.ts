import { CambiosSchemas } from '@/schemas/cambios';
import { CambiosType, ProductoCambio } from '@/types/cambios';
import UsuarioModels from '@/models/usuarios';
import io from '@/app';
import { RegistroSchemas } from '@/schemas/registro';
import { RegistroType } from '@/types/registro';

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
      const registro: RegistroType | null = await RegistroSchemas.findOne({
        ruta: cambios.facturador,
        terminada: false,
      });

      if (!registro) return;

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const newcambios: Record<string, number> = JSON.parse(JSON.stringify(registro.cambios));

      cambios.productos.forEach((producto) => {
        newcambios[producto.nombre] = newcambios[producto.nombre]
          ? newcambios[producto.nombre] + producto.cantidad
          : producto.cantidad;
      });

      await RegistroSchemas.updateOne(
        { id: registro.id },
        { $set: { cambios: newcambios } },
      );

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
    } catch (error) {
      console.error('Error al crear el cambio:', error);
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
  async obtenerCambiosFacturador(id: string, fecha: string) {
    try {
      const localDate = new Date(fecha); // Este ya está en UTC-6 por el string que envías

      // Calculamos el inicio y fin del día en UTC-6, pero convertimos al UTC real que maneja el servidor
      const inicioDelDia = new Date(localDate);
      inicioDelDia.setUTCHours(6, 0, 0, 0); // UTC-6 => 00:00 en local es 06:00 en UTC

      const finDelDia = new Date(localDate);
      finDelDia.setUTCHours(29, 59, 59, 999); // 23:59 en UTC-6 es 05:59 del día siguiente en UTC

      const cambios = await CambiosSchemas.find({
        facturador: id,
        fecha: { $gte: inicioDelDia, $lte: finDelDia },
      });
      return cambios;
    } catch {
      return [];
    }
  }
}

export default new CambiosModels();
