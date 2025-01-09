import { Request, Response } from 'express';
import ProductosModels from '../models/productos';
import io from '@/app';
import crypto from 'node:crypto';

class ProductosControllers {
  async obtenerProductos(req: Request, res: Response) {
    try {
      const productos = await ProductosModels.obtenerProductos();

      if (productos.length === 0) {
        return res.status(404).json({ message: 'Sin productos registrados' });
      }

      return res.status(200).json(productos);
    } catch {
      res.status(500).json({ message: 'Error al obtener productos' });
    }
  }
  async obtenerProducto(req: Request, res: Response) {
    try {
      const { id } = req.params as { id: string };

      if (!id) {
        return res.status(400).json({ message: 'Producto requerido' });
      }

      const producto = await ProductosModels.obtenerProducto(id);

      if (!producto) {
        return res.status(404).json({ message: 'Producto no encontrado' });
      }

      delete producto._id;
      delete producto.__v;

      return res.status(200).json(producto);
    } catch {
      res.status(500).json({ message: 'Error al obtener producto' });
    }
  }
  async crearProducto(req: Request, res: Response) {
    try {
      const { nombre, cantidad, precioCompra, precioVenta } = req.body as {
        nombre: string;
        cantidad: number;
        precioCompra: number;
        precioVenta: number;
      };

      if (!nombre || !cantidad || !precioCompra || !precioVenta) {
        return res.status(400).json({ message: 'Datos requeridos' });
      }

      const id = crypto.randomUUID();

      const result = await ProductosModels.crearProducto(
        id,
        nombre.toLowerCase(),
        precioCompra,
        precioVenta,
        cantidad,
      );

      if (result === 'Producto ya existe') {
        return res.status(400).json({ message: result });
      }

      if(result === 'Error al crear producto') {
        return res.status(500).json({ message: result });
      }

      io.emit('productAdd', { id, nombre: nombre.toLowerCase(), precioCompra, precioVenta, cantidad });

      return res.status(200).json({ message: result });
    } catch(error) {
      console.log(error);
      res.status(500).json({ message: 'Error al crear producto' });
    }
  }
  async actualizarProducto(req: Request, res: Response) {
    try {
      const { id } = req.params as { id: string };
      const { nombre, cantidad, precioCompra, precioVenta } = req.body as {
        nombre: string;
        precioCompra: number;
        precioVenta: number;
        cantidad: number;
      };

      if (!id || !nombre || !precioCompra || !cantidad || !precioVenta) {
        return res.status(400).json({ message: 'Datos requeridos' });
      }

      const result = await ProductosModels.actualizarProducto(
        id,
        nombre.toLowerCase(),
        precioCompra,
        precioVenta,
        cantidad,
      );

      if (result === 'Producto no existe') {
        return res.status(400).json({ message: result });
      }

      if (result === 'Nombre de producto ya existe') {
        return res.status(400).json({ message: result });
      }

      if(result === 'Error al actualizar producto') {
        return res.status(500).json({ message: result });
      }

      io.emit('productUpdate', { id, nombre: nombre.toLowerCase(), precioCompra, precioVenta, cantidad });

      return res.status(200).json({ message: result });
    } catch {
      res.status(500).json({ message: 'Error al actualizar producto' });
    }
  }
  async eliminarProducto(req: Request, res: Response) {
    try {
      const { id } = req.params as { id: string };

      if (!id) {
        return res.status(400).json({ message: 'Producto requerido' });
      }

      const result = await ProductosModels.eliminarProducto(id);

      if (result === 'Producto no existe') {
        return res.status(400).json({ message: result });
      }

      io.emit('productDelete', id);

      return res.status(200).json({ message: result });
    } catch {
      res.status(500).json({ message: 'Error al eliminar producto' });
    }
  }
}

export default new ProductosControllers();
