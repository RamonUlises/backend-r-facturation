export interface Productos {
  id: string;
  nombre: string;
  precio: number;
  cantidad: number;
}

export interface RutasProductosType {
  id: string;
  ruta: string;
  productos: Productos[];
}