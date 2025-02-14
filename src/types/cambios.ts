export interface ProductoCambio {
  id: string;
  nombre: string;
  cantidad: number;
}

export interface CambiosType {
  id: string;
  facturador: string;
  nombre: string;
  fecha: Date;
  productos: ProductoCambio[];
}