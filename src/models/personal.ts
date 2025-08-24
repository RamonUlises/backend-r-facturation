import io from '@/app';
import { PersonalSchema } from '@/schemas/personal';
import { PersonalType } from '@/types/personal';
import crypto from 'node:crypto';

class PersonalModels {
  async obtenerPersonal() {
    try {
      const personal: PersonalType[] = await PersonalSchema.find();

      return personal;
    } catch {
      return [];
    }
  }
  async agregarPersonal(
    nombres: string,
    apellidos: string,
    direccion: string,
    cedula: string,
    telefono: string,
    fechaNacimiento: string,
    imagen: string,
    salario: number,
    inicioTrabajo: string,
  ) {
    try {

      const id = crypto.randomUUID();

      await PersonalSchema.create({
        id,
        nombres,
        apellidos,
        direccion,
        cedula,
        telefono,
        fechaNacimiento,
        imagen,
        salario,
        inicioTrabajo,
      });

      io.emit('personalAdd', { id, nombres, apellidos, direccion, cedula, telefono, fechaNacimiento, imagen, salario, inicioTrabajo });

      return 'Personal creado';
    } catch(err) {
      console.log(err);
      return 'Error al agregar el personal';
    }
  }
  async actualizarPersonal(
    id: string,
    nombres: string,
    apellidos: string,
    direccion: string,
    cedula: string,
    telefono: string,
    fechaNacimiento: string,
    imagen: string,
    salario: number,
    inicioTrabajo: string,
  ) {
    try {
      const personal = await PersonalSchema.findOne({ id });

      if (!personal) {
        return 'Personal no existe';
      }

      await PersonalSchema.updateOne(
        { id },
        {
          nombres,
          apellidos,
          direccion,
          cedula,
          telefono,
          fechaNacimiento,
          imagen,
          salario,
          inicioTrabajo,
        },
      );

      io.emit('personalUpdate', { id, nombres, apellidos, direccion, cedula, telefono, fechaNacimiento, imagen, salario, inicioTrabajo });

      return 'Personal actualizado';
    } catch {
      return 'Error al actualizar el personal';
    }
  }
  async eliminarPersonal(id: string) {
    try {
      const personal = await PersonalSchema.findOne({ id });

      if (!personal) {
        return 'Personal no existe';
      }

      await PersonalSchema.deleteOne({ id });

      io.emit('personalDelete', id);

      return 'Personal eliminado';
    } catch {
      return 'Error al eliminar el personal';
    }
  }
}

export default new PersonalModels();
