import { Request, Response } from 'express';
import CambiosModels from '../models/cambios';

class CambiosController {
  async obtenerCambios(req: Request, res: Response) {
    try {
      const cambios = await CambiosModels.obtenerCambios();
      res.status(200).json(cambios);
    } catch {
      res.status(500).json({ message: 'Error al obtener cambios' });
    }
  }
  async crearCambio(req: Request, res: Response) {
    try {
      const { id, facturador, nombre, fecha, productos } = req.body as { id: string, facturador: string, nombre: string, fecha: string, productos: { id: string, nombre: string, cantidad: number }[] };

      if (!id || !facturador || !nombre || !fecha || !Array.isArray(productos)) {
        return res.status(400).json({ message: 'Faltan datos' });
      }

      const response = await CambiosModels.crearCambio({
        id,
        facturador,
        nombre,
        fecha: new Date(fecha),
        productos,
      }); 

      if(response === 'Error al crear cambio') {
        return res.status(400).json({ message: 'Error al crear cambio' });
      }

      return res.status(200).json({ message: 'Cambio creado' });
    } catch {
      res.status(500).json({ message: 'Error al crear cambio' });
    }
  }
  async editarCambio(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { productos } = req.body as { productos: { id: string, nombre: string, cantidad: number}[] };

      if (!id || !Array.isArray(productos)) {
        return res.status(400).json({ message: 'Faltan datos' });
      }

      const response = await CambiosModels.editarCambio(id, productos);

      if(response === 'Cambio no encontrado') {
        return res.status(404).json({ message: 'Cambio no encontrado' });
      }

      if(response === 'Error al editar cambio') {
        return res.status(400).json({ message: 'Error al editar cambio' });
      }

      return res.status(200).json({ message: 'Cambio editado' });
    } catch {
      res.status(500).json({ message: 'Error al editar cambio' });
    }
  }
  async eliminarCambio(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({ message: 'Faltan datos' });
      }

      const response = await CambiosModels.eliminarCambio(id);

      if(response === 'Cambio no encontrado') {
        return res.status(404).json({ message: 'Cambio no encontrado' });
      }

      if(response === 'Error al eliminar cambio') {
        return res.status(400).json({ message: 'Error al eliminar cambio' });
      }

      return res.status(200).json({ message: 'Cambio eliminado' });
    } catch {
      res.status(500).json({ message: 'Error al eliminar cambio' });
    }
  }
  async obtenerCambiosFacturador(req: Request, res: Response) {
    try {
      const { facturador, fecha } = req.params;

      if (!facturador) {
        return res.status(400).json({ message: 'Faltan datos' });
      }

      const cambios = await CambiosModels.obtenerCambiosFacturador(facturador, fecha);

      if(cambios.length === 0) {
        return res.status(404).json({ message: 'Cambio no encontrados' });
      }

      res.status(200).json(cambios);
    } catch {
      res.status(500).json({ message: 'Error al obtener cambios' });
    }
  }
}

export default new CambiosController();
