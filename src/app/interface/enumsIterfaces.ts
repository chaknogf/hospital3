import { Departamento } from './../enum/departamentos';
import { Municipio } from './../interface/interfaces';
import { Estadocivil } from "../enum/estados_civil";
import { GradoAcademico } from "../enum/gradoAcademico";
import { Idioma } from "../enum/idiomas";
import { Parentesco } from "../enum/parentescos";
import { Pueblo } from "../enum/pueblos";



export interface Enumeradores {
  estadocivil: Estadocivil[],
  gradoacademico: GradoAcademico[],
  idiomas: Idioma[],
  parentescos: Parentesco[],
  pueblos: Pueblo[],
  departamentos: Departamento[],
  municipios: Municipio[]
}
