import io from '@/app';
import { DevolucionesSchemas } from '@/schemas/devoluciones';
import { DevolucionesType, ProductosDevolucion } from '@/types/devoluciones';

class DevolucionesModels {
  async obtenerDevoluciones() {
    try {
      const devoluciones = await DevolucionesSchemas.find();
      return devoluciones;
    } catch {
      return [];
    }
  }
  async crearDevolucion(devolucion: DevolucionesType) {
    try {
      await DevolucionesSchemas.create(devolucion);

      io.emit('devolucionAdd', devolucion);

      return 'Devolución creada';
    } catch {
      return 'Error al crear la devolución';
    }
  }
  async actualizarDevolucion(id: string, productos: ProductosDevolucion[]) {
    try {
      const devolucion = await DevolucionesSchemas.findOne({ id });

      if (!devolucion) {
        return 'Devolución no encontrada';
      }

      const total = productos.reduce((acc, producto) => {
        return acc + producto.cantidad * producto.precio;
      }, 0);

      await DevolucionesSchemas.updateOne({ id }, { productos, total });

      io.emit('devolucionUpdate', { id, productos, total });

      return 'Devolución actualizada';
    } catch {
      return 'Error al actualizar la devolución';
    }
  }
  async eliminarDevolucion(id: string) {
    try {
      const devolucion = await DevolucionesSchemas.findOne({ id });

      if (!devolucion) {
        return 'Devolución no encontrada';
      }

      await DevolucionesSchemas.deleteOne({ id });

      io.emit('devolucionDelete', id);

      return 'Devolución eliminada';
    } catch {
      return 'Error al eliminar la devolución';
    }
  }
  async ObtenerDevolucionesFacturador(id: string, fecha: string) {
    try {
      const localDate = new Date(fecha); // Este ya está en UTC-6 por el string que envías
  
      // Calculamos el inicio y fin del día en UTC-6, pero convertimos al UTC real que maneja el servidor
      const inicioDelDia = new Date(localDate);
      inicioDelDia.setUTCHours(6, 0, 0, 0); // UTC-6 => 00:00 en local es 06:00 en UTC
  
      const finDelDia = new Date(localDate);
      finDelDia.setUTCHours(29, 59, 59, 999); // 23:59 en UTC-6 es 05:59 del día siguiente en UTC

      const devoluciones = await DevolucionesSchemas.find({ 
        facturador: id,
        fecha: {
          $gte: inicioDelDia,
          $lte: finDelDia,
        },
      });
      return devoluciones;
    } catch {
      return [];
    }
  }
    
}

export default new DevolucionesModels();
