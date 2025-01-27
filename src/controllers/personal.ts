import { Request, Response } from 'express';
import PersonalModels from '../models/personal';

class PersonalControllers {
  async obtenerPersonal(req: Request, res: Response) {
    try {
      const personal = await PersonalModels.obtenerPersonal();

      if (personal.length === 0) {
        return res.status(404).json({ message: 'No hay personal' });
      }

      res.status(200).json( personal );
    } catch {
      res.status(500).json({ message: 'Error al obtener el personal' });
    }
  }
  async agregarPersonal(req: Request, res: Response) {
    try {
      const {
        nombres,
        apellidos,
        direccion,
        cedula,
        telefono,
        fechaNacimiento,
        imagen,
        salario,
        inicioTrabajo,
      } = req.body as {
        nombres: string;
        apellidos: string;
        direccion: string;
        cedula: string;
        telefono: string;
        fechaNacimiento: string;
        imagen: string;
        salario: number;
        inicioTrabajo: string;
      };

      if (
        !nombres ||
        !apellidos ||
        !direccion ||
        !cedula ||
        !telefono ||
        !fechaNacimiento ||
        !salario ||
        !inicioTrabajo
      ) {
        return res
          .status(400)
          .json({ message: 'Faltan campos para crear el personal' });
      }

      const img = imagen ? imagen : '';

      const response = await PersonalModels.agregarPersonal(
        nombres,
        apellidos,
        direccion,
        cedula,
        telefono,
        fechaNacimiento,
        img,
        salario,
        inicioTrabajo,
      );

      if(response === 'Error al agregar el personal') {
        return res.status(500).json({ message: response });
      }

      res.status(200).json({ message: response });
    } catch {
      res.status(500).json({ message: 'Error al agregar el personal' });
    }
  }
  async actualizarPersonal(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const {
        nombres,
        apellidos,
        direccion,
        cedula,
        telefono,
        fechaNacimiento,
        imagen,
        salario,
        inicioTrabajo,
      } = req.body as {
        nombres: string;
        apellidos: string;
        direccion: string;
        cedula: string;
        telefono: string;
        fechaNacimiento: string;
        imagen: string;
        salario: number;
        inicioTrabajo: string;
      };

      if (
        !nombres ||
        !apellidos ||
        !direccion ||
        !cedula ||
        !telefono ||
        !fechaNacimiento ||
        !salario ||
        !inicioTrabajo
      ) {
        return res
          .status(400)
          .json({ message: 'Faltan campos para actualizar el personal' });
      }

      const img = imagen ? imagen : '';

      const response = await PersonalModels.actualizarPersonal(
        id,
        nombres,
        apellidos,
        direccion,
        cedula,
        telefono,
        fechaNacimiento,
        img,
        salario,
        inicioTrabajo,
      );

      if (response === 'Personal no existe') {
        return res.status(404).json({ message: response });
      }

      if (response === 'Error al actualizar el personal') {
        return res.status(500).json({ message: response });
      }

      res.status(200).json({ message: response });
    } catch {
      res.status(500).json({ message: 'Error al actualizar el personal' });
    }
  }
  async eliminarPersonal(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const response = await PersonalModels.eliminarPersonal(id);

      if (response === 'Personal no existe') {
        return res.status(404).json({ message: response });
      }

      if (response === 'Error al eliminar el personal') {
        return res.status(500).json({ message: response });
      }

      res.status(200).json({ message: response });
    } catch {
      res.status(500).json({ message: 'Error al eliminar el personal' });
    }
  }
}

export default new PersonalControllers();
