import { Request, Response } from 'express';
import CreditosModels from '@/models/creditos';

class CreditosController {
  async obtenerCreditos(req: Request, res: Response) {
    try {
      const creditos = await CreditosModels.obtenerCreditos();

      if (creditos.length === 0) {
        return res.status(404).json({ message: 'No hay creditos' });
      }

      return res.status(200).json(creditos);
    } catch {
      return res.status(500).json('Error al obtener creditos');
    }
  }
  async crearCredito(req: Request, res: Response) {
    try {
      const { proveedor, monto, abono, fechaInicio, fechaFin } = req.body as { proveedor: string; monto: number; abono: number; fechaInicio: string; fechaFin: string };

      if (!proveedor || !monto || !fechaInicio || !fechaFin) {
        return res.status(400).json({ message: 'Faltan datos' });
      }

      console.log(proveedor, monto, abono, fechaInicio, fechaFin);

      const response = await CreditosModels.crearCredito(
        proveedor,
        monto,
        abono,
        fechaInicio,
        fechaFin,
      );

      if (response === 'Error al crear credito') {
        return res.status(500).json({ message: response });
      }

      return res.status(200).json({ message: response });
    } catch {
      res.status(500).json({ message: 'Error al crear credito' });
    }
  }
  async eliminarCredito(req: Request, res: Response) {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: 'Falta el id' });
    }

    try {
      const resultado = await CreditosModels.eliminarCredito(id);

      if (resultado === 'Credito no existe') {
        return res.status(404).json({ message: resultado });
      }

      return res.status(200).json({ message: resultado });
    } catch {
      return res.status(500).json('Error al eliminar credito');
    }
  }
  async abonarCredito(req: Request, res: Response) {
    const { id } = req.params;
    const { abono } = req.body as { abono: number };

    if (!id || !abono) {
      return res.status(400).json({ message: 'Falta el id o el monto' });
    }

    try {
      const resultado = await CreditosModels.abonarCredito(id, abono);

      if (resultado === 'Credito no existe') {
        return res.status(404).json({ message: resultado });
      }

      return res.status(200).json({ message: resultado });
    } catch {
      return res.status(500).json('Error al abonar credito');
    }
  }
}

export default new CreditosController();
