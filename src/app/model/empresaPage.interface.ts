import { IEmpresa } from './empresa.interface';

export interface IEmpresaPage {
  content: IEmpresa[];
  totalPages: number;
  totalElements: number;
  last: boolean;
}
