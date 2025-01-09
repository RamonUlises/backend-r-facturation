import { Request, Response } from 'express';
import ClientesModels from '../models/clientes';
import io from '@/app';
import crypto from 'node:crypto';

class ClientesControllers {
  async obtenerClientes(req: Request, res: Response) {
    try {
      const clientes = await ClientesModels.obtenerClientes();

      if (clientes.length === 0) {
        return res.status(404).json({ message: 'No hay clientes' });
      }

      return res.status(200).json(clientes);
    } catch {
      return res.status(500).json('Error al obtener clientes');
    }
  }
  async obtenerCliente(req: Request, res: Response) {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: 'Falta el id' });
    }

    try {
      const cliente = await ClientesModels.obtenerCliente(id);

      if (!cliente) {
        return res.status(404).json({ message: 'Cliente no encontrado' });
      }

      return res.status(200).json(cliente);
    } catch {
      return res.status(500).json('Error al obtener cliente');
    }
  }
  async crearCliente(req: Request, res: Response) {
    const { nombres, direccion, telefono } = req.body as { nombres: string; direccion: string; telefono: string };

    if (!nombres || !direccion || !telefono) {
      return res.status(400).json({ message: 'Datos requeridos' });
    }

    try {
      const id = crypto.randomUUID();
      const resultado = await ClientesModels.crearCliente(
        id,
        nombres,
        direccion,
        telefono,
      );

      if (resultado === 'Cliente ya existe') {
        return res.status(400).json({ message: resultado });
      }

      io.emit('clienteAdd', { id, nombres, direccion, telefono, credito: 0 });

      return res.status(200).json({ message: resultado });
    } catch {
      return res.status(500).json('Error al crear cliente');
    }
  }
  async actualizarCliente(req: Request, res: Response) {
    const { id } = req.params;
    const { nombres, direccion, telefono } = req.body as { nombres: string; direccion: string; telefono: string };

    if (!id || !nombres || !direccion || !telefono) {
      return res.status(400).json({ message: 'Datos requeridos' });
    }

    try {
      const resultado = await ClientesModels.actualizarCliente(
        id,
        nombres,
        direccion,
        telefono,
      );

      if (resultado === 'Cliente no existe') {
        return res.status(404).json({ message: resultado });
      }

      if (resultado === 'Nombre de cliente ya existe') {
        return res.status(400).json({ message: resultado });
      }

      io.emit('clienteUpdate', { id, nombres, direccion, telefono });

      return res.status(200).json({ message: resultado });
    } catch {
      return res.status(500).json('Error al actualizar cliente');
    }
  }
  async eliminarCliente(req: Request, res: Response) {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: 'Falta el id' });
    }

    try {
      const resultado = await ClientesModels.eliminarCliente(id);

      if (resultado === 'Cliente no existe') {
        return res.status(404).json({ message: resultado });
      }

      io.emit('clienteDelete', id);

      return res.status(200).json({ message: resultado });
    } catch {
      return res.status(500).json('Error al eliminar cliente');
    }
  }
}

export default new ClientesControllers();
