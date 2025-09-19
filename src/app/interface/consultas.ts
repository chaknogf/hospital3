export interface Ciclos {
  clave: string;  // ejemplo "activo", "egreso", ...
  valor: string; // ejemplo "2025-09-18", "2025-09-20", ...
}

export interface Indicadores {
  clave: string;  // ejemplo "prenatal", "lactancia", ...
  valor: string; // ejemplo true, false, 4, ...
}

export interface DetalleClinico {
  medico: string;
  diagnostico: string;
  motivo_consulta: string;
  enfermedad_actual: string;
}

export interface Ansigmas {
  clave: string;  // ejemplo "sintomas", "examen_fisico", ...
  valor: string; // ejemplo "dolor de cabeza", "sin alteraciones", ...

}

export interface Antecedentes {
  clave: string;  // ejemplo "familiares", "medicos", "traumaticos", "quirurgicos" ...
  valor: string; // ejemplo "quebradura", "diabetes", ...
}

export interface SignosVitales {
  clave: string;  // ejemplo "temperatura", "presion_arterial", ...
  valor: string; // ejemplo "36.5", "120/80", ...
}

export interface Ordenes {
  tipo: string;  // ejemplo "examenes", "medicamentos", "procedimientos", ...
  valor: string; // ejemplo "examen de orina", "paracetamol", ...
  medico: string; // ejemplo "Dr. Juan Perez"
  registro: string; // ejemplo "2025-09-18T14:30:00Z"
}

export interface Estudios {
  tipo: string;  // ejemplo "examenes", "medicamentos", "procedimientos", ...
  valor: string; // ejemplo "examen de orina", "paracetamol", ...
  origen: string; // ejemplo "Dr. Juan Perez"
  registro: string; // ejemplo "2025-09-18T14:30:00Z"
}

export interface Sistema {
  usuario: string; // ejemplo "admin"
  accion: string; // ejemplo "creacion", "modificacion", "eliminacion"
  fecha: string; // formato ISO "2025-09-18T14:30:00Z"
}

// Interface principal de la consulta
export interface Consulta {
  paciente_id: number;
  tipo_consulta: number;
  especialidad: number;
  servicio: number;
  documento: string;
  fecha_consulta: string;   // formato ISO "2025-09-18"
  hora_consulta: string;    // formato ISO con hora "21:34:52.457Z"

  ciclo: { [key: string]: Ciclos };
  indicadores: { [key: string]: Indicadores };
  detalle_clinico: { [key: string]: any };
  sistema: { [key: string]: Sistema };
  signos_vitales: { [key: string]: SignosVitales };
  ansigmas: { [key: string]: Ansigmas };
  antecedentes: { [key: string]: Antecedentes };
  ordenes: { [key: string]: Ordenes };
  estudios: { [key: string]: Estudios };
}

// CREATE TABLE consultas (
//     id SERIAL PRIMARY KEY,
//     paciente_id INTEGER NOT NULL REFERENCES pacientes (id) ON DELETE CASCADE ON UPDATE CASCADE,
//     tipo_consulta INTEGER,
//     especialidad INTEGER,
//     servicio INTEGER,
//     documento VARCHAR(20),
//     fecha_consulta DATE,
//     hora_consulta TIME,
//     ciclo JSONB, -- { "activo": "...", "egreso": "...", ... }
//     indicadores JSONB, -- { "prenatal": 4, "lactancia": true, ... }
//     detalle_clinico JSONB, -- { "medico": "...", "diagnostico": "...", ... }
//     sistema JSONB, -- { "usuario_creador": "...", ... }
//     signos_vitales JSONB, -- { "temperatura": ..., "presion_arterial": "...", ... }
//     ansigmas JSONB, -- { "sintomas": [...], "examen_fisico": "...", ... }
//     antecedentes JSONB, -- { "alergias": [...], "enfermedades": [...], ... }
//     ordenes JSONB, -- { "medicamentos": [...], "examen_fisico": "...", ... }
//     estudios JSONB, -- { "laboratorios": [...], "rayos_x": "...", ... }
//     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
// );

// class Detalle_clinico(BaseModel):
//     clave: str
//     valor: str

// class Sistema(BaseModel):
//     usuario: str
//     accion: str
//     fecha: str
