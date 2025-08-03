import { RecuperacionSchemas } from '@/schemas/recuperacion';
import { RecuperacionType } from '@/types/recuperacion';
import { Request, Response, Router } from 'express';

const router = Router();

router.get('/facturador/:id/:fecha', (req, res) => {
  void obtenerFacturas(req, res);
});

async function obtenerFacturas(req: Request, res: Response) {
  try {
    const { id, fecha } = req.params;

    const localDate = new Date(fecha);

    const inicioDelDia = new Date(localDate);
    inicioDelDia.setUTCHours(6, 0, 0, 0);

    const finDelDia = new Date(localDate);
    finDelDia.setUTCHours(29, 59, 59, 999);

    const recuperaciones: RecuperacionType[] = await RecuperacionSchemas.find({
      facturador: id,
      fecha: {
        $gte: inicioDelDia,
        $lte: finDelDia,
      },
    });

    if (recuperaciones.length === 0) {
      return res.status(404).json({ message: 'No hay recuperaciones' });
    }

    return res.status(200).json(recuperaciones);
  } catch {
    res.status(500).json({ message: 'Error al obtener recuperaciones' });
  }
}
export default router;
