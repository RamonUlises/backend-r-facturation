export type ProductosDiasType = Record<string, number>;

export interface RegistroType {
  id: string;
  ruta: string;
  fechaInicio: string;
  fechaFin: string;
  productos: Record<string, ProductosDiasType>;
  sobrantes: Record<string, number>;
  cambios: Record<string, number>;
  descuentos: number;
  terminada: boolean;
}
