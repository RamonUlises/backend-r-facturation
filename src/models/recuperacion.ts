import { RecuperacionType } from '@/types/recuperacion';
import { RecuperacionSchemas } from '@/schemas/recuperacion';

class RecuperacionModels {
  async obtenerRecuperacionesFacturador(id: string, fecha: string) {
    try {
      const localDate = new Date(fecha);

      const inicioDelDia = new Date(localDate);
      inicioDelDia.setUTCHours(6, 0, 0, 0);

      const finDelDia = new Date(localDate);
      finDelDia.setUTCHours(29, 59, 59, 999);

      const recuperaciones: RecuperacionType[] = await RecuperacionSchemas.find(
        {
          facturador: id,
          fecha: {
            $gte: inicioDelDia,
            $lte: finDelDia,
          },
        },
      );

      return recuperaciones;
    } catch {
      return [];
    }
  }
}

export default new RecuperacionModels();
