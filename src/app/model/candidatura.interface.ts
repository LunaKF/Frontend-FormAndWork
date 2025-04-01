import { IOferta } from './oferta.interface';
import { IAlumno } from './alumno.interface';
export interface ICandidatura {
    id: number;
    alumno: IAlumno;
    oferta: IOferta;
    fecha: Date;
}