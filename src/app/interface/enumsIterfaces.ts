import { parentescos } from './../enum/diccionarios';
import { Departamento } from './../enum/departamentos';
import { Municipio } from './../interface/interfaces';
import { Dict } from "../enum/diccionarios";
import { Parentescos } from '../enum/parentescos';




export interface Enumeradores {
  estadocivil: Dict[];
  gradoacademico: Dict[];
  idiomas: Dict[];
  parentescos: typeof Parentescos;
  pueblos: Dict[];
  departamentos: Departamento[];
  municipios: Municipio[];
}
