import { ClientesSchema } from '@/schemas/clientes';
import { ClienteType } from '@/types/clientes';
import FacturasModels from '@/models/facturas';

class ClientesModels {
  async obtenerClientes() {
    try {
      const clientes: ClienteType[] = await ClientesSchema.find();
      return clientes.sort((a, b) => a.nombres.localeCompare(b.nombres));
    } catch {
      return [];
    }
  }
  async obtenerCliente(id: string) {
    try {
      const cliente: ClienteType | null = await ClientesSchema.findOne({ id });

      if (cliente) {
        return cliente;
      } else {
        return null;
      }
    } catch {
      return null;
    }
  }
  async crearCliente(
    id: string,
    nombres: string,
    direccion: string,
    telefono: string,
  ) {
    try {
      const cliente = await ClientesSchema.findOne({ nombres });

      if (cliente) {
        return 'Cliente ya existe';
      }

      await ClientesSchema.create({ id, nombres, direccion, telefono });

      return 'Cliente creado';
    } catch {
      return 'Error al crear cliente';
    }
  }
  async actualizarCliente(
    id: string,
    nombres: string,
    direccion: string,
    telefono: string,
  ) {
    try {
      const cliente = await ClientesSchema.findOne({ id });

      if (!cliente) {
        return 'Cliente no existe';
      }

      const clienteNombre = await ClientesSchema.findOne({ nombres });

      if (clienteNombre && clienteNombre.id !== id) {
        return 'Nombre de cliente ya existe';
      }

      await ClientesSchema.updateOne({ id }, { nombres, direccion, telefono });

      // Actualizar nombre en las facturas
      await FacturasModels.actualizarClienteFactura(cliente.nombres, nombres);

      return 'Cliente actualizado';
    } catch {
      return 'Error al actualizar cliente';
    }
  }
  async eliminarCliente(id: string) {
    try {
      const cliente = await ClientesSchema.findOne({ id });

      if (!cliente) {
        return 'Cliente no existe';
      }

      await ClientesSchema.deleteOne({ id });
      return 'Cliente eliminado';
    } catch {
      return 'Error al eliminar cliente';
    }
  }
}

export default new ClientesModels();
