import { Request, Response } from 'express';
import FacturasModels from '../models/facturas';
import { ProductoFacturaType } from '@/types/facturas';
import DevolucionesModels from '../models/devoluciones';
import CambiosModels from '../models/cambios';
import RecuperacionModels from '../models/recuperacion';

class FacturasControllers {
  async obtenerFacturas(req: Request, res: Response) {
    try {
      const { fecha } = req.params;

      const facturas = await FacturasModels.obtenerFacturas(fecha);

      if (facturas.length === 0) {
        return res.status(404).json({ message: 'No hay facturas' });
      }

      return res.status(200).json(facturas);
    } catch {
      res.status(500).json({ message: 'Error al obtener facturas' });
    }
  }
  async obtenerFactura(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const factura = await FacturasModels.obtenerFactura(id);

      if (!factura) {
        return res.status(404).json({ message: 'Factura no existe' });
      }

      return res.status(200).json(factura);
    } catch {
      res.status(500).json({ message: 'Error al obtener factura' });
    }
  }
  async crearFactura(req: Request, res: Response) {
    try {
      const { id, nombre, productos, tipo, facturador, fecha, pagado } =
        req.body as {
          id: string;
          nombre: string;
          productos: ProductoFacturaType[];
          tipo: string;
          facturador: string;
          fecha: Date;
          pagado: number;
        };

      if (
        !nombre ||
        !Array.isArray(productos) ||
        !tipo ||
        !facturador ||
        isNaN(new Date(fecha).getTime())
      ) {
        return res.status(400).json({ message: 'Faltan datos' });
      }

      const response = await FacturasModels.crearFactura({
        id,
        nombre,
        fecha,
        productos,
        tipo,
        total: 0,
        'id-facturador': facturador,
        pagado,
      });

      if (response === 'Cliente no encontrado') {
        return res.status(404).json({ message: response });
      }

      if (response === 'Error al crear la factura') {
        return res.status(400).json({ message: response });
      }

      return res.status(200).json({ message: response });
    } catch {
      res.status(500).json({ message: 'Error al crear factura' });
    }
  }
  async actualizarFactura(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { productos, tipo, pagado } = req.body as {
        productos: ProductoFacturaType[];
        tipo: string;
        pagado: number;
      };

      if (!Array.isArray(productos)) {
        return res.status(400).json({ message: 'Faltan datos' });
      }

      const response = await FacturasModels.actualizarFactura(
        id,
        productos,
        tipo,
        pagado,
      );

      if (response === 'Factura no encontrada') {
        return res.status(404).json({ message: response });
      }

      if (response === 'Error al actualizar la factura') {
        return res.status(400).json({ message: response });
      }

      return res.status(200).json({ message: response });
    } catch {
      res.status(500).json({ message: 'Error al actualizar factura' });
    }
  }
  async eliminarFactura(req: Request, res: Response) {
    try {
      const { id, facturador } = req.params;

      if (!facturador) {
        return res.status(400).json({ message: 'Faltan datos' });
      }

      const response = await FacturasModels.eliminarFactura(id, facturador);

      if (response === 'Error al eliminar la factura') {
        return res.status(400).json({ message: response });
      }

      return res.status(200).json({ message: response });
    } catch {
      res.status(500).json({ message: 'Error al eliminar factura' });
    }
  }
  async abonarFactura(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { abono } = req.body as { abono: number };

      if (isNaN(abono)) {
        return res.status(400).json({ message: 'Faltan datos' });
      }

      const response = await FacturasModels.abonarFactura(id, abono);

      if (response === 'Factura no encontrada') {
        return res.status(404).json({ message: response });
      }

      if (response === 'Error al abonar la factura') {
        return res.status(400).json({ message: response });
      }

      return res.status(200).json({ message: response });
    } catch {
      res.status(500).json({ message: 'Error al abonar factura' });
    }
  }
  async abonarFacturaFacturador(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { abono, fecha, idRecuperacion } = req.body as { abono: number, fecha: string, idRecuperacion: string };

      if (isNaN(abono) || !fecha, !idRecuperacion) {
        return res.status(400).json({ message: 'Faltan datos' });
      }

      const response = await FacturasModels.abonarFacturaFacturador(id, idRecuperacion, abono, fecha);

      if (response === 'Factura no encontrada') {
        return res.status(404).json({ message: response });
      }

      if (response === 'Error al abonar la factura') {
        return res.status(400).json({ message: response });
      }

      return res.status(200).json({ message: response });
    } catch {
      res.status(500).json({ message: 'Error al abonar factura' });
    }
  }
  async obtenerFacturasFacturador(req: Request, res: Response) {
    try {
      const { id, fecha } = req.params;

      const facturas = await FacturasModels.obtenerFacturasFacturador(
        id,
        fecha,
      );

      if (facturas.length === 0) {
        return res.status(404).json({ message: 'No hay facturas' });
      }

      return res.status(200).json(facturas);
    } catch {
      res.status(500).json({ message: 'Error al obtener facturas' });
    }
  }
  async obtenerFacturasFacturadorTotal(req: Request, res: Response) {
    try {
      const { id, fecha } = req.params;

      const facturas = await FacturasModels.obtenerFacturasFacturador(
        id,
        fecha,
      );

      if (facturas.length === 0) {
        return res.status(404).json({ monto: 0 });
      }

      const monto = facturas.reduce(
        (total, factura) => total + factura.total,
        0,
      );

      return res.status(200).json({ monto });
    } catch {
      res.status(500).json({ message: 'Error al obtener facturas' });
    }
  }
  async obtenerResumenFacturasFacturador(req: Request, res: Response) {
    try {
      const { id, fecha } = req.params;

      const facturas = await FacturasModels.obtenerFacturasFacturador(
        id,
        fecha,
      );
      const devoluciones =
        await DevolucionesModels.ObtenerDevolucionesFacturador(id, fecha);
      const cambios = await CambiosModels.obtenerCambiosFacturador(id, fecha);
      const recuperacion = await RecuperacionModels.obtenerRecuperacionesFacturador(id, fecha);

      return res.status(200).json({ facturas, devoluciones, cambios, recuperacion });
    } catch {
      res.status(500).json({ message: 'Error al obtener resumen de facturas' });
    }
  }
  async obtenerCredito(req: Request, res: Response) {
    try {
      const credito = await FacturasModels.obtenerCredito();

      return res.status(200).json(credito);
    } catch {
      res.status(500).json({ message: 'Error al obtener credito' });
    }
  }
  async obtenerResumenSemanas(req: Request, res: Response) {
    try {
      const { facturas1, facturas2, fecha1, fecha2 } =
        await FacturasModels.obtenerResumenSemanas();

      return res.status(200).json({ facturas1, facturas2, fecha1, fecha2 });
    } catch {
      return res
        .status(500)
        .json({ message: 'Error al obtener resumen de facturas' });
    }
  }
  async obtenerFacturasCliente(req: Request, res: Response) {
    try {
      const { cliente, facturador } = req.params;

      const facturas = await FacturasModels.obtenerFacturasCliente(
        cliente,
        facturador,
      );

      if (facturas.length === 0) {
        return res.status(404).json({ message: 'No hay facturas' });
      }

      return res.status(200).json(facturas);
    } catch {
      res.status(500).json({ message: 'Error al obtener facturas' });
    }
  }
  async obtenerFacturasRango(req: Request, res: Response) {
    try {
      const { fechaInicio, fechaFin } = req.params;

      const facturas = await FacturasModels.obtenerFacturasRango(
        fechaInicio,
        fechaFin,
      );

      if (facturas.length === 0) {
        return res.status(404).json({ message: 'No hay facturas' });
      }

      return res.status(200).json(facturas);
    } catch {
      res.status(500).json({ message: 'Error al obtener factura' });
    }
  }
  async obtenerCreditos(req: Request, res: Response) {
    try {
      const creditos = await FacturasModels.obtenerCreditos();

      if (creditos.length === 0) {
        return res.status(404).json({ message: 'No hay creditos' });
      }

      return res.status(200).json(creditos);
    } catch {
      return res.status(500).json('Error al obtener creditos');
    }
  }
}

export default new FacturasControllers();
