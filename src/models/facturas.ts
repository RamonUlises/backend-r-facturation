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

      await FacturasSchemas.create({ ...factura, total: suma });
      await UsuarioModels.actualizarCantidad(factura['id-facturador'], factura.productos);

      io.emit('facturaAdd', { id: factura.id, nombre: factura.nombre, fecha: factura.fecha, productos: factura.productos, tipo: factura.tipo, total: suma, pagado: factura.pagado, 'id-facturador': factura['id-facturador'] });

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

      await FacturasSchemas.updateOne({ id }, { productos, total: suma, tipo, pagado });
      await UsuarioModels.actualizarCantidadUpdate(factur['id-facturador'], productos, factur.productos);

      io.emit('facturaUpdate', { id, productos, total: suma, tipo, pagado, facturador: factur['id-facturador'] });

      return 'Factura actualizada';
    } catch {
      return 'Error al actualizar la factura';
    }
  }
  async eliminarFactura(id: string) {
    try {
      const factur = await FacturasSchemas.findOne({ id });

      if (!factur) {
        return 'Factura no encontrada';
      }

      await FacturasSchemas.deleteOne({ id });
      io.emit('facturaDelete', id, factur['id-facturador']);

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
  async obtenerFacturasFacturador(id: string) {
    try {
      const facturas: FacturaType[] = await FacturasSchemas.find({ 'id-facturador': id });

      return facturas;
    } catch {
      return [];
    }
  }
}

export default new FacturasModels();
