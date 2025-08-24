import io from '@/app';
import { CreditosSchema } from '@/schemas/creditos';
import crypto from 'node:crypto';

class CreditosModel {
  async obtenerCreditos() {
    try {
      const creditos = await CreditosSchema.find();
      return creditos;
    } catch {
      return [];
    }
  }
  async crearCredito(
    proveedor: string,
    monto: number,
    abono: number,
    fechaInicio: string,
    fechaFin: string,
  ) {
    try {
      const id = crypto.randomUUID();

      await CreditosSchema.create({
        id,
        proveedor,
        monto,
        abono,
        fechaInicio,
        fechaFin,
      });

      io.emit('creditosAdd', {
        id,
        proveedor,
        monto,
        abono,
        fechaInicio,
        fechaFin,
      });

      return 'Credito creado';
    } catch {
      return 'Error al crear credito';
    }
  }
  async eliminarCredito(id: string) {
    try {
      const credito = await CreditosSchema.findOne({ id });

      if (!credito) {
        return 'Credito no existe';
      }

      await CreditosSchema.deleteOne({ id });

      io.emit('creditosDelete', id);

      return 'Credito eliminado';
    } catch {
      return 'Error al eliminar credito';
    }
  }
  async abonarCredito(id: string, abono: number) {
    try {
      const credito = await CreditosSchema.findOne({ id });

      if (!credito) {
        return 'Credito no existe';
      }

      const newAbono = credito.abono + abono;

      await CreditosSchema.updateOne({ id }, { abono: newAbono });

      io.emit('creditosAbonar', {
        id,
        abono: newAbono,
      });

      return 'Credito abonado';
    } catch {
      return 'Error al abonar credito';
    }
  }
}

export default new CreditosModel();
