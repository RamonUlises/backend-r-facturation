import { Request, Response } from 'express';
import RecuperacionModels from '../models/recuperacion';

class RecuperacionController {
  async obtenerRecuperacionesFecha(req: Request, res: Response) {
    try {
      const { fecha } = req.params;

      const recuperaciones = await RecuperacionModels.obtenerRecuperacionesFecha(
        fecha,
      );

      if (recuperaciones.length === 0) {
        return res.status(404).json({ message: 'No hay recuperaciones' });
      }

      return res.status(200).json(recuperaciones);
    } catch {
      res.status(500).json({ message: 'Error al obtener recuperaciones' });
    }
  }
  async obtenerRecuperacionesFacturador(req: Request, res: Response) {
    try {
      const { id, fecha } = req.params;

      const recuperaciones =
        await RecuperacionModels.obtenerRecuperacionesFacturador(id, fecha);

      if (recuperaciones.length === 0) {
        return res.status(404).json({ message: 'No hay recuperaciones' });
      }

      return res.status(200).json(recuperaciones);
    } catch {
      res.status(500).json({ message: 'Error al obtener recuperaciones' });
    }
  }
}

export default new RecuperacionController();
