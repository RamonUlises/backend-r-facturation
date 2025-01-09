import { ProductosSchema } from '@/schemas/productos';
import { ProductoType } from '@/types/productos';

class ProductosModels {
  async obtenerProductos() {
    try {
      const productos: ProductoType[] = await ProductosSchema.find();
      return productos.sort((a, b) => a.nombre.localeCompare(b.nombre));
    } catch {
      return [];
    }
  }
  async obtenerProducto(id: string) {
    try {
      const producto: ProductoType | null = await ProductosSchema.findOne({
        id,
      });

      if (producto) {
        return producto;
      } else {
        return null;
      }
    } catch {
      return null;
    }
  }
  async crearProducto(
    id: string,
    nombre: string,
    precioCompra: number,
    precioVenta: number,
    cantidad: number,
  ) {
    try {
      const product = await ProductosSchema.findOne({ nombre });

      if (product) {
        return 'Producto ya existe';
      }

      await ProductosSchema.create({ id, nombre, cantidad, precioCompra, precioVenta });

      return 'Producto creado';
    } catch(error) {
      console.log(error);
      return 'Error al crear producto';
    }
  }
  async actualizarProducto(
    id: string,
    nombre: string,
    precioCompra: number,
    precioVenta: number,
    cantidad: number,
  ) {
    try {
      const product = await ProductosSchema.findOne({ id });

      if (!product) {
        return 'Producto no existe';
      }

      const productNombre = await ProductosSchema.findOne({ nombre });

      if (productNombre && productNombre.id !== id) {
        return 'Nombre de producto ya existe';
      }

      await ProductosSchema.updateOne({ id }, { nombre, cantidad, precioCompra, precioVenta });

      return 'Producto actualizado';
    } catch {
      return 'Error al actualizar producto';
    }
  }
  async eliminarProducto(id: string) {
    try {
      const product = await ProductosSchema.findOne({ id });

      if (!product) {
        return 'Producto no existe';
      }

      await ProductosSchema.deleteOne({ id });

      return 'Producto eliminado';
    } catch {
      return 'Error al eliminar producto';
    }
  }
}

export default new ProductosModels();
