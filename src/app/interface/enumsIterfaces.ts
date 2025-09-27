import { Departamento } from './../enum/departamentos';
import { Municipio } from './../interface/interfaces';
import { Dict } from "../enum/diccionarios";




export interface Enumeradores {
  estadocivil: Dict[],
  gradoacademico: Dict[],
  idiomas: Dict[],
  parentescos: Dict[],
  pueblos: Dict[],
  departamentos: Departamento[],
  municipios: Municipio[]
}
