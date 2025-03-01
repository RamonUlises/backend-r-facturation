import { Request, Response } from 'express';
import DevolucionesModels from '../models/devoluciones';

class DevolucionesController {
  async obtenerDevoluciones(req: Request, res: Response) {
    try {
      const devoluciones = await DevolucionesModels.obtenerDevoluciones();

      if (devoluciones.length === 0) {
        return res.status(404).json({ message: 'No hay devoluciones' });
      }

      res.status(200).json(devoluciones);
    } catch {
      res.status(500).json({ message: 'Error al obtener las devoluciones' });
    }
  }
  async crearDevolucion(req: Request, res: Response) {
    try {
      const { id, facturador, nombre, fecha, productos } = req.body as {
        id: string;
        facturador: string;
        nombre: string;
        fecha: string;
        productos: {
          id: string;
          nombre: string;
          cantidad: number;
          precio: number;
        }[];
      };

      if (!id || !facturador || !nombre || !fecha || !Array.isArray(productos)) {
        return res.status(400).json({ message: 'Faltan datos' });
      }

      const total = productos.reduce((acc, producto) => {
        return acc + producto.cantidad * producto.precio;
      }, 0);

      const response = await DevolucionesModels.crearDevolucion({
        id,
        facturador,
        nombre,
        fecha,
        productos,
        total,
      });

      if (response === 'Error al crear la devolución') {
        return res.status(400).json({ message: response });
      }

      res.status(200).json({ message: response });
    } catch {
      res.status(500).json({ message: 'Error al crear la devolución' });
    }
  }
  async actualizarDevolucion(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { productos } = req.body as {
        productos: {
          id: string;
          nombre: string;
          cantidad: number;
          precio: number;
        }[];
      };

      if (!id || !Array.isArray(productos)) {
        return res.status(400).json({ message: 'Faltan datos' });
      }

      const response = await DevolucionesModels.actualizarDevolucion(
        id,
        productos,
      );

      if (response === 'Devolución no encontrada') {
        return res.status(404).json({ message: response });
      }

      if (response === 'Error al actualizar la devolución') {
        return res.status(400).json({ message: response });
      }

      res.status(200).json({ message: response });
    } catch {
      res.status(500).json({ message: 'Error al actualizar la devolución' });
    }
  }
  async eliminarDevolucion(req: Request, res: Response) {
    try {
      const { id } = req.params as { id: string };

      if (!id) {
        return res.status(400).json({ message: 'Faltan datos' });
      }

      const response = await DevolucionesModels.eliminarDevolucion(id);

      if (response === 'Error al eliminar la devolución') {
        return res.status(400).json({ message: response });
      }

      if (response === 'Devolución no encontrada') {
        return res.status(404).json({ message: response });
      }

      res.status(200).json({ message: response });
    } catch {
      res.status(500).json({ message: 'Error al eliminar la devolución' });
    }
  }
  async obtenerDevolucionesFacturador(req: Request, res: Response) {
    try {
      const { facturador } = req.params as { facturador: string };

      if (!facturador) {
        return res.status(400).json({ message: 'Faltan datos' });
      }

      const devoluciones = await DevolucionesModels.ObtenerDevolucionesFacturador(facturador);

      if (devoluciones.length === 0) {
        return res.status(404).json({ message: 'No hay devoluciones' });
      }

      res.status(200).json(devoluciones);
    } catch {
      res.status(500).json({ message: 'Error al obtener las devoluciones' });
    }
  }
}

export default new DevolucionesController();
