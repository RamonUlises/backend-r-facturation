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
      const date = new Date(fecha);
  
      // Rango del día completo en la zona horaria del servidor
      const inicioDelDia = new Date(date);
      inicioDelDia.setHours(0, 0, 0, 0);
  
      const finDelDia = new Date(date);
      finDelDia.setHours(23, 59, 59, 999);

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
