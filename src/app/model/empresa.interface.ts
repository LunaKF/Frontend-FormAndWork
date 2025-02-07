import { ISector } from "./sector.interface";

export interface IEmpresa {
    id: number;
    nombre: string;
    sector: ISector;
    email: string;
}