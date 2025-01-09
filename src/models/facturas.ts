import { FacturasSchemas } from '@/schemas/facturas';
import { ClientesSchema } from '@/schemas/clientes';
import { FacturaType, ProductoFacturaType } from '@/types/facturas';
import { ProductosSchema } from '@/schemas/productos';
import io from '@/app';
import UsuarioModels from '@/models/usuarios';

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

      for (const producto of factura.productos) {
        const productoEncontrado = await ProductosSchema.findOne({
          nombre: producto.nombre,
        });

        if (!productoEncontrado) {
          return 'Producto no encontrado';
        }
      }

      const suma = factura.productos.reduce(
        (acc: number, producto: ProductoFacturaType) => {
          return acc + producto.precio * producto.cantidad;
        },
        0,
      );

      if (factura.tipo === 'credito') {
        await ClientesSchema.updateOne(
          { nombres: factura.nombre },
          { credito: cliente.credito + suma },
        );

        io.emit('credito', {
          id: cliente.id as string,
          credito: cliente.credito + suma,
        });
      }

      await FacturasSchemas.create({ ...factura, total: suma });
      await UsuarioModels.actualizarCantidad(factura['id-facturador'], factura.productos);

      return 'Factura creada';
    } catch {
      return 'Error al crear la factura';
    }
  }
  async actualizarFactura(id: string, productos: ProductoFacturaType[]) {
    try {
      const factur = await FacturasSchemas.findOne({ id });

      if (!factur) {
        return 'Factura no encontrada';
      }

      for (const producto of productos) {
        const productoEncontrado = await ProductosSchema.findOne({
          nombre: producto.nombre,
        });

        if (!productoEncontrado) {
          return 'Producto no encontrado';
        }
      }

      const suma = productos.reduce(
        (acc: number, producto: ProductoFacturaType) => {
          return acc + producto.precio * producto.cantidad;
        },
        0,
      );

      if (factur.tipo === 'credito') {
        const sumaAnterior = factur.productos.reduce(
          (acc: number, producto: ProductoFacturaType) => {
            return acc + producto.precio * producto.cantidad;
          },
          0,
        );

        const cliente = await ClientesSchema.findOne({
          nombres: factur.nombre,
        });

        if (!cliente) {
          return 'Cliente no encontrado';
        }

        const total = cliente.credito - sumaAnterior + suma;
        await ClientesSchema.updateOne(
          { nombres: factur.nombre },
          { credito: suma },
        );

        io.emit('credito', { id: cliente.id as string, credito: total });
      }

      await FacturasSchemas.updateOne({ id }, { productos, total: suma });

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

      return 'Factura eliminada';
    } catch {
      return 'Error al eliminar la factura';
    }
  }
}

export default new FacturasModels();
