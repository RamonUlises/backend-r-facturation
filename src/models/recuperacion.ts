import { RecuperacionType } from '@/types/recuperacion';
import { RecuperacionSchemas } from '@/schemas/recuperacion';

class RecuperacionModels {
  async obtenerRecuperacionesFecha(fecha: string) {
    try {
      const localDate = new Date(fecha);

      const inicioDelDia = new Date(localDate);
      inicioDelDia.setUTCHours(6, 0, 0, 0);

      const finDelDia = new Date(localDate);
      finDelDia.setUTCHours(29, 59, 59, 999);

      const recuperaciones: RecuperacionType[] = await RecuperacionSchemas.find({
        fecha: {
          $gte: inicioDelDia,
          $lte: finDelDia,
        },
      });

      return recuperaciones;
    } catch {
      return [];
    }
  }
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
  async eliminarRecuperacion(id: string) {
    try {
      await RecuperacionSchemas.deleteOne({ id });

      return 'Recuperacion eliminada';
    } catch {
      return 'Error al eliminar la recuperación';
    }
  }
}

export default new RecuperacionModels();
