import { ISector } from "./sector.interface";

export interface IAlumno {
    id: number;
    nombre: string;
    ape1: string;
    ape2: string;
    email: string;
    sector: ISector;
}