import { Request, Response } from 'express';
import RegistroModel from '../models/registro';
import { ProductosDiasType } from '@/types/registro';

class RegistroController {
  async obtenerRegistros(req: Request, res: Response) {
    try {
      const registros = await RegistroModel.obtenerRegistros();

      if (registros.length === 0) {
        return res.status(404).json({ message: 'No hay registros' });
      }

      res.json(registros);
    } catch {
      res.status(500).json({ message: 'Error al obtener los registros' });
    }
  }
  async crearRegistro(req: Request, res: Response) {
    try {
      const { ruta, fechaInicio, fechaFin, productos, sobrantes } = req.body as {
        ruta: string;
        fechaInicio: string;
        fechaFin: string;
        productos: ProductosDiasType;
        sobrantes: Record<string, number>;
      };

      if (!ruta || !fechaInicio || !fechaFin) {
        return res.status(400).json({ message: 'Faltan campos' });
      }

      if(Object.keys(productos).length === 0) {
        return res.status(400).json({ message: 'No hay productos' });
      }

      const response = await RegistroModel.crearRegistro(
        ruta,
        fechaInicio,
        fechaFin,
        productos,
        sobrantes,
      );

      if(response === 'Error al crear el registro') {
        return res.status(400).json({ message: response });
      }

      if(response === 'Ya existe un registro sin terminar') {
        return res.status(400).json({ message: response });
      }

      res.json({ message: response });
    } catch {
      res.status(500).json({ message: 'Error al crear el registro' });
    }
  }
  async eliminarRegistro(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({ message: 'Falta el id' });
      }

      const response = await RegistroModel.eliminarRegistro(id);

      if(response === 'Error al eliminar el registro') {
        return res.status(400).json({ message: response });
      }

      res.json({ message: response });
    } catch {
      res.status(500).json({ message: 'Error al eliminar el registro' });
    }
  }
  async terminarRegistro(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { ruta } = req.body as { ruta: string };

      if (!ruta) {
        return res.status(400).json({ message: 'Falta la ruta' });
      }

      const response = await RegistroModel.terminarRegistro(id, ruta);

      if(response === 'Error al terminar el registro') return res.status(400).json({ message: response });
      if(response === 'No existe el registro') return res.status(400).json({ message: response });
      if(response === 'No existen productos en la ruta') return res.status(400).json({ message: response });

      res.json({ message: response });
    } catch {
      res.status(500).json({ message: 'Error al terminar el registro' });
    }
  }
}

export default new RegistroController();
