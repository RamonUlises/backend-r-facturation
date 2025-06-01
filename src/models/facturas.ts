import { FacturasSchemas } from '@/schemas/facturas';
import { ClientesSchema } from '@/schemas/clientes';
import { FacturaType, ProductoFacturaType } from '@/types/facturas';
import UsuarioModels from '@/models/usuarios';
import io from '@/app';

class FacturasModels {
  async obtenerFacturas() {
    try {
      const facturas: FacturaType[] = await FacturasSchemas.find();

      return facturas;
    } catch {
      return [];
    }
  }
  async obtenerFactura(id: string) {
    try {
      const factura: FacturaType | null = await FacturasSchemas.findOne({ id });

      return factura;
    } catch {
      return null;
    }
  }
  async crearFactura(factura: FacturaType) {
    try {
      const cliente = await ClientesSchema.findOne({ nombres: factura.nombre });

      if (!cliente) {
        return 'Cliente no encontrado';
      }

      const suma = factura.productos.reduce(
        (acc: number, producto: ProductoFacturaType) => {
          return acc + producto.precio * producto.cantidad;
        },
        0,
      );

      await FacturasSchemas.create({ ...factura, total: Math.ceil(suma) });
      await UsuarioModels.actualizarCantidad(factura['id-facturador'], factura.productos);

      io.emit('facturaAdd', { id: factura.id, nombre: factura.nombre, fecha: factura.fecha, productos: factura.productos, tipo: factura.tipo, total: Math.ceil(suma), pagado: factura.pagado, 'id-facturador': factura['id-facturador'] });

      return 'Factura creada';
    } catch(err) {
      console.log(err);
      return 'Error al crear la factura';
    }
  }
  async actualizarFactura(id: string, productos: ProductoFacturaType[], tipo: string, pagado: number) {
    try {
      const factur = await FacturasSchemas.findOne({ id });

      if (!factur) {
        return 'Factura no encontrada';
      }

      const suma = productos.reduce(
        (acc: number, producto: ProductoFacturaType) => {
          return acc + producto.precio * producto.cantidad;
        },
        0,
      );

      await FacturasSchemas.updateOne({ id }, { productos, total: Math.ceil(suma), tipo, pagado });
      await UsuarioModels.actualizarCantidadUpdate(factur['id-facturador'], productos, factur.productos);

      io.emit('facturaUpdate', { id, productos, total: Math.ceil(suma), tipo, pagado, facturador: factur['id-facturador'] });

      return 'Factura actualizada';
    } catch {
      return 'Error al actualizar la factura';
    }
  }
  async eliminarFactura(id: string, facturador: string) {
    try {
      const factur = await FacturasSchemas.findOne({ id });

      if (!factur) {
        return 'Factura no encontrada';
      }

      await FacturasSchemas.deleteOne({ id });
      await UsuarioModels.actualizarCantidadDelete(facturador, factur.productos);
      io.emit('facturaDelete', id, factur['id-facturador']);
      io.emit('updateProd');

      return 'Factura eliminada';
    } catch {
      return 'Error al eliminar la factura';
    }
  }
  async abonarFactura(id: string, abono: number) {
    try {
      const factur: FacturaType | null = await FacturasSchemas.findOne({ id });

      if (!factur) {
        return 'Factura no encontrada';
      }

      const total = factur.pagado + abono;

      await FacturasSchemas.updateOne({ id }, { pagado: total });
      io.emit('facturaAbonar', { id, total });

      return 'Factura abonada';
    }  catch {
      return 'Error al abonar la factura';
    }
  }
  async obtenerFacturasFacturador(id: string, fecha: string) {
    try {
      const localDate = new Date(fecha); // Este ya está en UTC-6 por el string que envías
  
      // Calculamos el inicio y fin del día en UTC-6, pero convertimos al UTC real que maneja el servidor
      const inicioDelDia = new Date(localDate);
      inicioDelDia.setUTCHours(6, 0, 0, 0); // UTC-6 => 00:00 en local es 06:00 en UTC
  
      const finDelDia = new Date(localDate);
      finDelDia.setUTCHours(29, 59, 59, 999); // 23:59 en UTC-6 es 05:59 del día siguiente en UTC
  
      const facturas: FacturaType[] = await FacturasSchemas.find({
        'id-facturador': id,
        fecha: {
          $gte: inicioDelDia,
          $lte: finDelDia,
        },
      });
  
      return facturas;
    } catch (error) {
      console.error('Error al obtener facturas:', error);
      return [];
    }
  }  
  
  async actualizarClienteFactura(lastName: string, newName: string) {
    try {
      await FacturasSchemas.updateMany({ nombre: lastName }, { nombre: newName });

      io.emit('updateName');

      return 'Facturas actualizadas';
    } catch {
      return 'Error al actualizar las facturas';
    }
  }
}

export default new FacturasModels();
