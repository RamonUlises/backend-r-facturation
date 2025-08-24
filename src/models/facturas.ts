import { FacturasSchemas } from '@/schemas/facturas';
import { FacturaType, ProductoFacturaType } from '@/types/facturas';
import UsuarioModels from '@/models/usuarios';
import ProductosModels from '@/models/productos';
import io from '@/app';
import { getMondayUTCMinus6 } from '@/lib/compararFacturas';
import { RegistroType } from '@/types/registro';
import { RegistroSchemas } from '@/schemas/registro';
import { RecuperacionSchemas } from '@/schemas/recuperacion';
import { PipelineStage } from 'mongoose';

class FacturasModels {
  async obtenerFacturas(fecha: string) {
    try {
      const localDate = new Date(fecha); // Este ya está en UTC-6 por el string que envías

      // Calculamos el inicio y fin del día en UTC-6, pero convertimos al UTC real que maneja el servidor
      const inicioDelDia = new Date(localDate);
      inicioDelDia.setUTCHours(6, 0, 0, 0); // UTC-6 => 00:00 en local es 06:00 en UTC

      const finDelDia = new Date(localDate);
      finDelDia.setUTCHours(29, 59, 59, 999); // 23:59 en UTC-6 es 05:59 del día siguiente en UTC

      const facturas: FacturaType[] = await FacturasSchemas.find({
        fecha: {
          $gte: inicioDelDia,
          $lte: finDelDia,
        },
      });

      return facturas;
    } catch {
      return [];
    }
  }
  async obtenerFactura(id: string) {
    try {
      const factura: FacturaType | null = await FacturasSchemas.findOne({ id });

      return factura;
    } catch {
      return null;
    }
  }
  async crearFactura(factura: FacturaType) {
    try {
      const suma = factura.productos.reduce(
        (acc: number, producto: ProductoFacturaType) => {
          return acc + producto.precio * producto.cantidad;
        },
        0,
      );

      const productos = await ProductosModels.obtenerProductos();

      const descuento = Math.ceil(
        factura.productos.reduce((acc, prd) => {
          const prod = productos.find((p) => p.id === prd.id);

          if (!prod) return acc;

          return acc + (prod.precioVenta - prd.precio) * prd.cantidad;
        }, 0),
      );

      await FacturasSchemas.create({
        ...factura,
        total: Math.ceil(suma),
        descuento,
      });
      await UsuarioModels.actualizarCantidad(
        factura['id-facturador'],
        factura.productos,
      );

      io.emit('facturaAdd', {
        id: factura.id,
        nombre: factura.nombre,
        fecha: factura.fecha,
        productos: factura.productos,
        tipo: factura.tipo,
        total: Math.ceil(suma),
        pagado: factura.pagado,
        'id-facturador': factura['id-facturador'],
        descuento,
      });

      const registro: RegistroType | null = await RegistroSchemas.findOne({
        ruta: factura['id-facturador'],
        terminada: false,
      });

      if (registro) {
        await RegistroSchemas.updateOne(
          { id: registro.id },
          { descuentos: registro.descuentos + descuento },
        );
      }

      return 'Factura creada';
    } catch {
      return 'Error al crear la factura';
    }
  }
  async actualizarFactura(
    id: string,
    productos: ProductoFacturaType[],
    tipo: string,
    pagado: number,
  ) {
    try {
      const factur = await FacturasSchemas.findOne({ id });

      if (!factur) {
        return 'Factura no encontrada';
      }

      const suma = productos.reduce(
        (acc: number, producto: ProductoFacturaType) => {
          return acc + producto.precio * producto.cantidad;
        },
        0,
      );

      const prods = await ProductosModels.obtenerProductos();

      const descuentoAnterior = Math.ceil(
        factur.productos.reduce((acc, prd) => {
          const prod = prods.find((p) => p.id === prd.id);

          if (!prod) return acc;

          return acc + (prod.precioVenta - prd.precio) * prd.cantidad;
        }, 0),
      );

      const descuentoNuevo = Math.ceil(
        productos.reduce((acc, prd) => {
          const prod = prods.find((p) => p.id === prd.id);

          if (!prod) return acc;

          return acc + (prod.precioVenta - prd.precio) * prd.cantidad;
        }, 0),
      );

      await FacturasSchemas.updateOne(
        { id },
        {
          productos,
          total: Math.ceil(suma),
          tipo,
          pagado,
          descuento: descuentoNuevo,
        },
      );
      await UsuarioModels.actualizarCantidadUpdate(
        factur['id-facturador'],
        productos,
        factur.productos,
      );

      io.emit('facturaUpdate', {
        id,
        productos,
        total: Math.ceil(suma),
        tipo,
        pagado,
        facturador: factur['id-facturador'],
        descuento: descuentoNuevo,
      });

      const registro: RegistroType | null = await RegistroSchemas.findOne({
        ruta: factur['id-facturador'],
        terminada: false,
      });

      if (registro) {
        await RegistroSchemas.updateOne(
          { id: registro.id },
          {
            descuentos:
              registro.descuentos + (descuentoNuevo - descuentoAnterior),
          },
        );
      }

      return 'Factura actualizada';
    } catch {
      return 'Error al actualizar la factura';
    }
  }
  async eliminarFactura(id: string, facturador: string) {
    try {
      const factur = await FacturasSchemas.findOne({ id });

      if (!factur) {
        return 'Factura no encontrada';
      }

      await FacturasSchemas.deleteOne({ id });
      await UsuarioModels.actualizarCantidadDelete(
        facturador,
        factur.productos,
      );
      io.emit('facturaDelete', id, factur['id-facturador']);
      io.emit('updateProd');

      const productos = await ProductosModels.obtenerProductos();

      const descuento = Math.ceil(
        factur.productos.reduce((acc, prd) => {
          const prod = productos.find((p) => p.id === prd.id);

          if (!prod) return acc;

          return acc + (prod.precioVenta - prd.precio) * prd.cantidad;
        }, 0),
      );

      const registro: RegistroType | null = await RegistroSchemas.findOne({
        ruta: factur['id-facturador'],
        terminada: false,
      });

      if (registro) {
        await RegistroSchemas.updateOne(
          { id: registro.id },
          { descuentos: registro.descuentos - descuento },
        );
      }

      return 'Factura eliminada';
    } catch {
      return 'Error al eliminar la factura';
    }
  }
  async abonarFactura(id: string, abono: number) {
    try {
      const factur: FacturaType | null = await FacturasSchemas.findOne({ id });

      if (!factur) {
        return 'Factura no encontrada';
      }

      const total = factur.pagado + abono;

      await FacturasSchemas.updateOne({ id }, { pagado: total });
      io.emit('facturaAbonar', { id, total });

      return 'Factura abonada';
    } catch {
      return 'Error al abonar la factura';
    }
  }
  async abonarFacturaFacturador(
    id: string,
    idRecuperacion: string,
    abono: number,
    fecha: string,
  ) {
    try {
      const factur: FacturaType | null = await FacturasSchemas.findOne({ id });

      if (!factur) {
        return 'Factura no encontrada';
      }

      const total = factur.pagado + abono;

      await FacturasSchemas.updateOne({ id }, { pagado: total });
      await RecuperacionSchemas.create({
        id: idRecuperacion,
        fecha,
        facturador: factur['id-facturador'],
        factura: factur.id,
        recuperacion: abono,
        cliente: factur.nombre,
      });

      io.emit('recuperacionAdd', {
        id: idRecuperacion,
        fecha,
        facturador: factur['id-facturador'],
        factura: factur.id,
        recuperacion: abono,
        cliente: factur.nombre,
      });

      io.emit('facturaAbonar', { id, total });

      return 'Factura abonada';
    } catch (err) {
      console.log(err);
      return 'Error al abonar la factura';
    }
  }
  async obtenerFacturasFacturador(id: string, fecha: string) {
    try {
      const localDate = new Date(fecha); // Este ya está en UTC-6 por el string que envías

      // Calculamos el inicio y fin del día en UTC-6, pero convertimos al UTC real que maneja el servidor
      const inicioDelDia = new Date(localDate);
      inicioDelDia.setUTCHours(6, 0, 0, 0); // UTC-6 => 00:00 en local es 06:00 en UTC

      const finDelDia = new Date(localDate);
      finDelDia.setUTCHours(29, 59, 59, 999); // 23:59 en UTC-6 es 05:59 del día siguiente en UTC

      const facturas: FacturaType[] = await FacturasSchemas.find({
        'id-facturador': id,
        fecha: {
          $gte: inicioDelDia,
          $lte: finDelDia,
        },
      });

      return facturas;
    } catch (error) {
      console.error('Error al obtener facturas:', error);
      return [];
    }
  }
  async actualizarClienteFactura(lastName: string, newName: string) {
    try {
      await FacturasSchemas.updateMany(
        { nombre: lastName },
        { nombre: newName },
      );

      io.emit('updateName');

      return 'Facturas actualizadas';
    } catch {
      return 'Error al actualizar las facturas';
    }
  }
  async obtenerCredito(): Promise<{ count: number; total: number }> {
    try {
      const credito = await FacturasSchemas.find({ tipo: 'crédito' });

      const total = credito.reduce(
        (acc: number, factura: FacturaType) =>
          acc + (factura.total - factura.pagado),
        0,
      );

      const creditoPagado = credito.reduce(
        (acc: number, factura: FacturaType) => {
          if (factura.pagado === factura.total) return acc;

          return acc + 1;
        },
        0,
      );

      return { count: creditoPagado, total };
    } catch {
      return { count: 0, total: 0 };
    }
  }
  async obtenerResumenSemanas(): Promise<{
    facturas1: FacturaType[];
    facturas2: FacturaType[];
    fecha1: string;
    fecha2: string;
  }> {
    try {
      const ahora = new Date();
      const lunesActual = getMondayUTCMinus6(ahora);

      // Semana pasada
      const lunesSemanaPasada = new Date(lunesActual);
      lunesSemanaPasada.setUTCDate(lunesSemanaPasada.getUTCDate() - 7);
      const domingoSemanaPasada = new Date(lunesSemanaPasada);
      domingoSemanaPasada.setUTCDate(domingoSemanaPasada.getUTCDate() + 6);
      domingoSemanaPasada.setUTCHours(23, 59, 59, 999);

      // Semana anterior a la pasada
      const lunesSemanaAnterior = new Date(lunesSemanaPasada);
      lunesSemanaAnterior.setUTCDate(lunesSemanaAnterior.getUTCDate() - 7);
      const domingoSemanaAnterior = new Date(lunesSemanaAnterior);
      domingoSemanaAnterior.setUTCDate(domingoSemanaAnterior.getUTCDate() + 6);
      domingoSemanaAnterior.setUTCHours(23, 59, 59, 999);

      // Consultas
      const facturas1: FacturaType[] = await FacturasSchemas.find({
        fecha: {
          $gte: lunesSemanaPasada,
          $lte: domingoSemanaPasada,
        },
      });
      const facturas2: FacturaType[] = await FacturasSchemas.find({
        fecha: {
          $gte: lunesSemanaAnterior,
          $lte: domingoSemanaAnterior,
        },
      });

      return {
        facturas1,
        facturas2,
        fecha1: `${lunesSemanaPasada.toLocaleDateString('es-MX', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        })} - ${domingoSemanaPasada.toLocaleDateString('es-MX', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        })}`,
        fecha2: `${lunesSemanaAnterior.toLocaleDateString('es-MX', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        })} - ${domingoSemanaAnterior.toLocaleDateString('es-MX', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        })}`,
      };
    } catch {
      return { facturas1: [], facturas2: [], fecha1: '', fecha2: '' };
    }
  }
  async obtenerFacturasCliente(cliente: string, facturador: string) {
    try {
      const facturas: FacturaType[] = await FacturasSchemas.find({
        'id-facturador': facturador,
        nombre: cliente,
      });

      return facturas;
    } catch {
      return [];
    }
  }
  async obtenerFacturasRango(fechaInicio: string, fechaFin: string) {
    try {
      const localDate = new Date(fechaInicio);
      const localDate2 = new Date(fechaFin);

      const inicioDelDia = new Date(localDate);
      inicioDelDia.setUTCHours(6, 0, 0, 0);

      const finDelDia = new Date(localDate2);
      finDelDia.setUTCHours(29, 59, 59, 999);

      const facturas: FacturaType[] = await FacturasSchemas.find({
        fecha: {
          $gte: inicioDelDia,
          $lte: finDelDia,
        },
      });

      return facturas;
    } catch {
      return [];
    }
  }
  async obtenerCreditos() {
    try {
      const creditos = await FacturasSchemas.find({
        tipo: 'crédito',
        $expr: { $lt: ['$pagado', '$total'] },
      });

      return creditos;
    } catch {
      return [];
    }
  }
  async cambiarClienteFactura(id: string, cliente: string) {
    try {
      const factura = await FacturasSchemas.findOne({ id });

      if (!factura) {
        return 'No existe la factura';
      }

      await FacturasSchemas.updateOne({ id }, { nombre: cliente });
      io.emit('updateNameFac', { id, nombre: cliente });

      return 'Cliente cambiado';
    } catch {
      return 'Error al cambiar cliente';
    }
  }
  async obtenerReporteRangos(
    fechaInicio: string,
    fechaFin: string,
  ): Promise<{
    facturasTotales: number;
    montoTotal: number;
    montoMensual: {
      _id: {
        mes: string;
        anio: string;
      };
      total: number;
    }[];
    montoAnual: {
      _id: {
        anio: string;
      };
      total: number;
    }[];
  }> {
    try {
      const localDate = new Date(fechaInicio);
      const localDate2 = new Date(fechaFin);

      const inicioDelDia = new Date(localDate);
      inicioDelDia.setUTCHours(6, 0, 0, 0);

      const finDelDia = new Date(localDate2);
      finDelDia.setUTCHours(23, 59, 59, 999);

      console.log(inicioDelDia, finDelDia);

      const pipeline: PipelineStage[] = [
        {
          $match: {
            fecha: { $gte: inicioDelDia, $lte: finDelDia },
          },
        },
        {
          $facet: {
            // total de facturas
            facturasTotales: [{ $count: 'totalFacturas' }],

            // monto total en el rango
            montoTotal: [{ $group: { _id: null, total: { $sum: '$total' } } }],

            // monto agrupado por mes
            montoMensual: [
              {
                $group: {
                  _id: { mes: { $month: '$fecha' }, anio: { $year: '$fecha' } },
                  total: { $sum: '$total' },
                },
              },
              { $sort: { '_id.anio': 1, '_id.mes': 1 } },
            ],

            // monto agrupado por año
            montoAnual: [
              {
                $group: {
                  _id: { anio: { $year: '$fecha' } },
                  total: { $sum: '$total' },
                },
              },
              { $sort: { '_id.anio': 1 } },
            ],
          },
        },
      ];

      const resultado: {
        facturasTotales: { totalFacturas: number }[];
        montoTotal: { total: number }[];
        montoMensual: { _id: { mes: string; anio: string }; total: number }[];
        montoAnual: { _id: { anio: string }; total: number }[];
      }[] = await FacturasSchemas.aggregate(pipeline);

      return {
        facturasTotales: resultado[0].facturasTotales[0]?.totalFacturas || 0,
        montoTotal: resultado[0].montoTotal[0]?.total || 0,
        montoMensual: resultado[0].montoMensual,
        montoAnual: resultado[0].montoAnual,
      };
    } catch {
      return {
        facturasTotales: 0,
        montoTotal: 0,
        montoMensual: [],
        montoAnual: [],
      };
    }
  }
}

export default new FacturasModels();
