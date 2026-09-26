import { parentescos } from './../enum/diccionarios';
import { Departamento } from './../enum/departamentos';
import { Municipio } from './../interface/interfaces';
import { Dict } from "../enum/diccionarios";
import { Parentescos } from '../enum/parentescos';




/** Catálogos territoriales y clínicos entregados juntos a formularios. */
export interface Enumeradores {
  estadocivil: Dict[];
  gradoacademico: Dict[];
  idiomas: Dict[];
  parentescos: typeof Parentescos;
  pueblos: Dict[];
  departamentos: Departamento[];
  municipios: Municipio[];
}
