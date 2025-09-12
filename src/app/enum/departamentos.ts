export interface Departamento {
  value: string;
  label: string;
}

export const departamentos: Departamento[] = [
  { value: '01', label: 'Guatemala' },
  { value: '02', label: 'El Progreso' },
  { value: '03', label: 'Sacatepéquez' },
  { value: '04', label: 'Chimaltenango' },
  { value: '05', label: 'Escuintla' },
  { value: '06', label: 'Santa Rosa' },
  { value: '07', label: 'Sololá' },
  { value: '08', label: 'Totonicapán' },
  { value: '09', label: 'Quetzaltenango' },
  { value: '10', label: 'Suchitepéquez' },
  { value: '11', label: 'Retalhuleu' },
  { value: '12', label: 'San Marcos' },
  { value: '13', label: 'Huehuetenango' },
  { value: '14', label: 'Quiché' },
  { value: '15', label: 'Baja Verapaz' },
  { value: '16', label: 'Alta Verapaz' },
  { value: '17', label: 'Petén' },
  { value: '18', label: 'Izabal' },
  { value: '19', label: 'Zacapa' },
  { value: '20', label: 'Chiquimula' },
  { value: '21', label: 'Jalapa' },
  { value: '22', label: 'Jutiapa' }
];


export interface Municipio {
  value: string;
  label: string;
  municipio: string;
  departamento: string;
}

export const municipios: Municipio[] = [
  { "value": "0101", "label": "Guatemala, Guatemala", "municipio": "Guatemala", "departamento": "Guatemala" },
  { "value": "0102", "label": "Santa Catarina Pinula, Guatemala", "municipio": "Santa Catarina Pinula", "departamento": "Guatemala" },
  { "value": "0103", "label": "San José Pinula, Guatemala", "municipio": "San José Pinula", "departamento": "Guatemala" },
  { "value": "0104", "label": "San José del Golfo, Guatemala", "municipio": "San José del Golfo", "departamento": "Guatemala" },
  { "value": "0105", "label": "Palencia, Guatemala", "municipio": "Palencia", "departamento": "Guatemala" },
  { "value": "0106", "label": "Chinautla, Guatemala", "municipio": "Chinautla", "departamento": "Guatemala" },
  { "value": "0107", "label": "San Pedro Ayampuc, Guatemala", "municipio": "San Pedro Ayampuc", "departamento": "Guatemala" },
  { "value": "0108", "label": "Mixco, Guatemala", "municipio": "Mixco", "departamento": "Guatemala" },
  { "value": "0109", "label": "San Pedro Sacatepéquez, Guatemala", "municipio": "San Pedro Sacatepéquez", "departamento": "Guatemala" },
  { "value": "0110", "label": "San Juan Sacatepéquez, Guatemala", "municipio": "San Juan Sacatepéquez", "departamento": "Guatemala" }
];
