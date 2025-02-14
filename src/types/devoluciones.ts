export interface ProductosDevolucion {
  id: string;
  nombre: string;
  cantidad: number;
  precio: number;
}

export interface DevolucionesType {
  id: string;
  facturador: string;
  nombre: string;
  fecha: string;
  productos: ProductosDevolucion[];
  total: number;
}