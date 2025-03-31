import { ISector } from "./sector.interface";
import { IEmpresa } from "./empresa.interface";

export interface IOferta {
    id: number;
    titulo: string;
    descripcion: string;
    empresa: IEmpresa;
    sector: ISector;
}