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
  vecindad: string;
  municipio: string;
  departamento: string;
  codigo: string
}

export const municipios: Municipio[] = [
  {
    "vecindad": "Quesada, Jutiapa",
    "municipio": "Quesada",
    "departamento": "Jutiapa",
    "codigo": "2217"
  },
  {
    "vecindad": "San José Acatempa, Jutiapa",
    "municipio": "San José Acatempa",
    "departamento": "Jutiapa",
    "codigo": "2216"
  },
  {
    "vecindad": "Pasaco, Jutiapa",
    "municipio": "Pasaco",
    "departamento": "Jutiapa",
    "codigo": "2215"
  },
  {
    "vecindad": "Moyuta, Jutiapa",
    "municipio": "Moyuta",
    "departamento": "Jutiapa",
    "codigo": "2214"
  },
  {
    "vecindad": "Conguaco, Jutiapa",
    "municipio": "Conguaco",
    "departamento": "Jutiapa",
    "codigo": "2213"
  },
  {
    "vecindad": "Jalpatagua, Jutiapa",
    "municipio": "Jalpatagua",
    "departamento": "Jutiapa",
    "codigo": "2212"
  },
  {
    "vecindad": "Comapa, Jutiapa",
    "municipio": "Comapa",
    "departamento": "Jutiapa",
    "codigo": "2211"
  },
  {
    "vecindad": "Zapotitlán, Jutiapa",
    "municipio": "Zapotitlán",
    "departamento": "Jutiapa",
    "codigo": "2210"
  },
  {
    "vecindad": "El Adelanto, Jutiapa",
    "municipio": "El Adelanto",
    "departamento": "Jutiapa",
    "codigo": "2209"
  },
  {
    "vecindad": "Jerez, Jutiapa",
    "municipio": "Jerez",
    "departamento": "Jutiapa",
    "codigo": "2208"
  },
  {
    "vecindad": "Atescatempa, Jutiapa",
    "municipio": "Atescatempa",
    "departamento": "Jutiapa",
    "codigo": "2207"
  },
  {
    "vecindad": "Yupiltepeque, Jutiapa",
    "municipio": "Yupiltepeque",
    "departamento": "Jutiapa",
    "codigo": "2206"
  },
  {
    "vecindad": "Asunción Mita, Jutiapa",
    "municipio": "Asunción Mita",
    "departamento": "Jutiapa",
    "codigo": "2205"
  },
  {
    "vecindad": "Agua Blanca, Jutiapa",
    "municipio": "Agua Blanca",
    "departamento": "Jutiapa",
    "codigo": "2204"
  },
  {
    "vecindad": "Santa Catarina Mita, Jutiapa",
    "municipio": "Santa Catarina Mita",
    "departamento": "Jutiapa",
    "codigo": "2203"
  },
  {
    "vecindad": "El Progreso, Jutiapa",
    "municipio": "El Progreso",
    "departamento": "Jutiapa",
    "codigo": "2202"
  },
  {
    "vecindad": "Jutiapa, Jutiapa",
    "municipio": "Jutiapa",
    "departamento": "Jutiapa",
    "codigo": "2201"
  },
  {
    "vecindad": "Mataquescuintla, Jalapa",
    "municipio": "Mataquescuintla",
    "departamento": "Jalapa",
    "codigo": "2107"
  },
  {
    "vecindad": "Monjas, Jalapa",
    "municipio": "Monjas",
    "departamento": "Jalapa",
    "codigo": "2106"
  },
  {
    "vecindad": "San Carlos Alzatate, Jalapa",
    "municipio": "San Carlos Alzatate",
    "departamento": "Jalapa",
    "codigo": "2105"
  },
  {
    "vecindad": "San Manuel Chaparrón, Jalapa",
    "municipio": "San Manuel Chaparrón",
    "departamento": "Jalapa",
    "codigo": "2104"
  },
  {
    "vecindad": "San Luis Jilotepeque, Jalapa",
    "municipio": "San Luis Jilotepeque",
    "departamento": "Jalapa",
    "codigo": "2103"
  },
  {
    "vecindad": "San Pedro Pinula, Jalapa",
    "municipio": "San Pedro Pinula",
    "departamento": "Jalapa",
    "codigo": "2102"
  },
  {
    "vecindad": "Jalapa, Jalapa",
    "municipio": "Jalapa",
    "departamento": "Jalapa",
    "codigo": "2101"
  },
  {
    "vecindad": "Ipala, Chiquimula",
    "municipio": "Ipala",
    "departamento": "Chiquimula",
    "codigo": "2011"
  },
  {
    "vecindad": "San Jacinto, Chiquimula",
    "municipio": "San Jacinto",
    "departamento": "Chiquimula",
    "codigo": "2010"
  },
  {
    "vecindad": "Quezaltepeque, Chiquimula",
    "municipio": "Quezaltepeque",
    "departamento": "Chiquimula",
    "codigo": "2009"
  },
  {
    "vecindad": "Concepción Las Minas, Chiquimula",
    "municipio": "Concepción Las Minas",
    "departamento": "Chiquimula",
    "codigo": "2008"
  },
  {
    "vecindad": "Esquipulas, Chiquimula",
    "municipio": "Esquipulas",
    "departamento": "Chiquimula",
    "codigo": "2007"
  },
  {
    "vecindad": "Olopa, Chiquimula",
    "municipio": "Olopa",
    "departamento": "Chiquimula",
    "codigo": "2006"
  },
  {
    "vecindad": "Camotán, Chiquimula",
    "municipio": "Camotán",
    "departamento": "Chiquimula",
    "codigo": "2005"
  },
  {
    "vecindad": "Jocotán, Chiquimula",
    "municipio": "Jocotán",
    "departamento": "Chiquimula",
    "codigo": "2004"
  },
  {
    "vecindad": "San Juan Ermita, Chiquimula",
    "municipio": "San Juan Ermita",
    "departamento": "Chiquimula",
    "codigo": "2003"
  },
  {
    "vecindad": "San José La Arada, Chiquimula",
    "municipio": "San José La Arada",
    "departamento": "Chiquimula",
    "codigo": "2002"
  },
  {
    "vecindad": "Chiquimula, Chiquimula",
    "municipio": "Chiquimula",
    "departamento": "Chiquimula",
    "codigo": "2001"
  },
  {
    "vecindad": "San Jorge, Zacapa",
    "municipio": "San Jorge",
    "departamento": "Zacapa",
    "codigo": "1911"
  },
  {
    "vecindad": "Huité, Zacapa",
    "municipio": "Huité",
    "departamento": "Zacapa",
    "codigo": "1910"
  },
  {
    "vecindad": "La Unión, Zacapa",
    "municipio": "La Unión",
    "departamento": "Zacapa",
    "codigo": "1909"
  },
  {
    "vecindad": "San Diego, Zacapa",
    "municipio": "San Diego",
    "departamento": "Zacapa",
    "codigo": "1908"
  },
  {
    "vecindad": "Cabañas, Zacapa",
    "municipio": "Cabañas",
    "departamento": "Zacapa",
    "codigo": "1907"
  },
  {
    "vecindad": "Usumatlán, Zacapa",
    "municipio": "Usumatlán",
    "departamento": "Zacapa",
    "codigo": "1906"
  },
  {
    "vecindad": "Teculután, Zacapa",
    "municipio": "Teculután",
    "departamento": "Zacapa",
    "codigo": "1905"
  },
  {
    "vecindad": "Gualán, Zacapa",
    "municipio": "Gualán",
    "departamento": "Zacapa",
    "codigo": "1904"
  },
  {
    "vecindad": "Río Hondo, Zacapa",
    "municipio": "Río Hondo",
    "departamento": "Zacapa",
    "codigo": "1903"
  },
  {
    "vecindad": "Estanzuela, Zacapa",
    "municipio": "Estanzuela",
    "departamento": "Zacapa",
    "codigo": "1902"
  },
  {
    "vecindad": "Zacapa, Zacapa",
    "municipio": "Zacapa",
    "departamento": "Zacapa",
    "codigo": "1901"
  },
  {
    "vecindad": "Los Amates, Izabal",
    "municipio": "Los Amates",
    "departamento": "Izabal",
    "codigo": "1805"
  },
  {
    "vecindad": "Morales, Izabal",
    "municipio": "Morales",
    "departamento": "Izabal",
    "codigo": "1804"
  },
  {
    "vecindad": "El Estor, Izabal",
    "municipio": "El Estor",
    "departamento": "Izabal",
    "codigo": "1803"
  },
  {
    "vecindad": "Livingston, Izabal",
    "municipio": "Livingston",
    "departamento": "Izabal",
    "codigo": "1802"
  },
  {
    "vecindad": "Puerto Barrios, Izabal",
    "municipio": "Puerto Barrios",
    "departamento": "Izabal",
    "codigo": "1801"
  },
  {
    "vecindad": "El Chal, Petén",
    "municipio": "El Chal",
    "departamento": "Petén",
    "codigo": "1714"
  },
  {
    "vecindad": "Las Cruces, Petén",
    "municipio": "Las Cruces",
    "departamento": "Petén",
    "codigo": "1713"
  },
  {
    "vecindad": "Poptún, Petén",
    "municipio": "Poptún",
    "departamento": "Petén",
    "codigo": "1712"
  },
  {
    "vecindad": "Melchor de Mencos, Petén",
    "municipio": "Melchor de Mencos",
    "departamento": "Petén",
    "codigo": "1711"
  },
  {
    "vecindad": "Sayaxché, Petén",
    "municipio": "Sayaxché",
    "departamento": "Petén",
    "codigo": "1710"
  },
  {
    "vecindad": "San Luis, Petén",
    "municipio": "San Luis",
    "departamento": "Petén",
    "codigo": "1709"
  },
  {
    "vecindad": "Dolores, Petén",
    "municipio": "Dolores",
    "departamento": "Petén",
    "codigo": "1708"
  },
  {
    "vecindad": "Santa Ana, Petén",
    "municipio": "Santa Ana",
    "departamento": "Petén",
    "codigo": "1707"
  },
  {
    "vecindad": "San Francisco, Petén",
    "municipio": "San Francisco",
    "departamento": "Petén",
    "codigo": "1706"
  },
  {
    "vecindad": "La Libertad, Petén",
    "municipio": "La Libertad",
    "departamento": "Petén",
    "codigo": "1705"
  },
  {
    "vecindad": "San Andrés, Petén",
    "municipio": "San Andrés",
    "departamento": "Petén",
    "codigo": "1704"
  },
  {
    "vecindad": "San Benito, Petén",
    "municipio": "San Benito",
    "departamento": "Petén",
    "codigo": "1703"
  },
  {
    "vecindad": "San José, Petén",
    "municipio": "San José",
    "departamento": "Petén",
    "codigo": "1702"
  },
  {
    "vecindad": "Flores, Petén",
    "municipio": "Flores",
    "departamento": "Petén",
    "codigo": "1701"
  },
  {
    "vecindad": "Raxruhá, Alta Verapaz",
    "municipio": "Raxruhá",
    "departamento": "Alta Verapaz",
    "codigo": "1617"
  },
  {
    "vecindad": "Santa Catalina La Tinta, Alta Verapaz",
    "municipio": "Santa Catalina La Tinta",
    "departamento": "Alta Verapaz",
    "codigo": "1616"
  },
  {
    "vecindad": "Fray Bartolomé de Las Casas, Alta Verapaz",
    "municipio": "Fray Bartolomé de Las Casas",
    "departamento": "Alta Verapaz",
    "codigo": "1615"
  },
  {
    "vecindad": "Chahal, Alta Verapaz",
    "municipio": "Chahal",
    "departamento": "Alta Verapaz",
    "codigo": "1614"
  },
  {
    "vecindad": "Chisec, Alta Verapaz",
    "municipio": "Chisec",
    "departamento": "Alta Verapaz",
    "codigo": "1613"
  },
  {
    "vecindad": "Santa María Cahabón, Alta Verapaz",
    "municipio": "Santa María Cahabón",
    "departamento": "Alta Verapaz",
    "codigo": "1612"
  },
  {
    "vecindad": "San Agustín Lanquín, Alta Verapaz",
    "municipio": "San Agustín Lanquín",
    "departamento": "Alta Verapaz",
    "codigo": "1611"
  },
  {
    "vecindad": "San Juan Chamelco, Alta Verapaz",
    "municipio": "San Juan Chamelco",
    "departamento": "Alta Verapaz",
    "codigo": "1610"
  },
  {
    "vecindad": "San Pedro Carchá, Alta Verapaz",
    "municipio": "San Pedro Carchá",
    "departamento": "Alta Verapaz",
    "codigo": "1609"
  },
  {
    "vecindad": "Senahú, Alta Verapaz",
    "municipio": "Senahú",
    "departamento": "Alta Verapaz",
    "codigo": "1608"
  },
  {
    "vecindad": "Panzós, Alta Verapaz",
    "municipio": "Panzós",
    "departamento": "Alta Verapaz",
    "codigo": "1607"
  },
  {
    "vecindad": "San Miguel Tucurú, Alta Verapaz",
    "municipio": "San Miguel Tucurú",
    "departamento": "Alta Verapaz",
    "codigo": "1606"
  },
  {
    "vecindad": "Tamahú, Alta Verapaz",
    "municipio": "Tamahú",
    "departamento": "Alta Verapaz",
    "codigo": "1605"
  },
  {
    "vecindad": "Tactic, Alta Verapaz",
    "municipio": "Tactic",
    "departamento": "Alta Verapaz",
    "codigo": "1604"
  },
  {
    "vecindad": "San Cristóbal Verapaz, Alta Verapaz",
    "municipio": "San Cristóbal Verapaz",
    "departamento": "Alta Verapaz",
    "codigo": "1603"
  },
  {
    "vecindad": "Santa Cruz Verapaz, Alta Verapaz",
    "municipio": "Santa Cruz Verapaz",
    "departamento": "Alta Verapaz",
    "codigo": "1602"
  },
  {
    "vecindad": "Cobán, Alta Verapaz",
    "municipio": "Cobán",
    "departamento": "Alta Verapaz",
    "codigo": "1601"
  },
  {
    "vecindad": "Purulhá, Baja Verapaz",
    "municipio": "Purulhá",
    "departamento": "Baja Verapaz",
    "codigo": "1508"
  },
  {
    "vecindad": "San Jerónimo, Baja Verapaz",
    "municipio": "San Jerónimo",
    "departamento": "Baja Verapaz",
    "codigo": "1507"
  },
  {
    "vecindad": "Santa Cruz El Chol, Baja Verapaz",
    "municipio": "Santa Cruz El Chol",
    "departamento": "Baja Verapaz",
    "codigo": "1506"
  },
  {
    "vecindad": "Granados, Baja Verapaz",
    "municipio": "Granados",
    "departamento": "Baja Verapaz",
    "codigo": "1505"
  },
  {
    "vecindad": "Cubulco, Baja Verapaz",
    "municipio": "Cubulco",
    "departamento": "Baja Verapaz",
    "codigo": "1504"
  },
  {
    "vecindad": "Rabinal, Baja Verapaz",
    "municipio": "Rabinal",
    "departamento": "Baja Verapaz",
    "codigo": "1503"
  },
  {
    "vecindad": "San Miguel Chicaj, Baja Verapaz",
    "municipio": "San Miguel Chicaj",
    "departamento": "Baja Verapaz",
    "codigo": "1502"
  },
  {
    "vecindad": "Salamá, Baja Verapaz",
    "municipio": "Salamá",
    "departamento": "Baja Verapaz",
    "codigo": "1501"
  },
  {
    "vecindad": "Pachalum, Guatemala",
    "municipio": "Pachalum",
    "departamento": "Guatemala",
    "codigo": "1421"
  },
  {
    "vecindad": "Playa Grande Ixcán, Guatemala",
    "municipio": "Playa Grande Ixcán",
    "departamento": "Guatemala",
    "codigo": "1420"
  },
  {
    "vecindad": "Chicamán, Guatemala",
    "municipio": "Chicamán",
    "departamento": "Guatemala",
    "codigo": "1419"
  },
  {
    "vecindad": "Canillá, Guatemala",
    "municipio": "Canillá",
    "departamento": "Guatemala",
    "codigo": "1418"
  },
  {
    "vecindad": "San Bartolomé Jocotenango, Guatemala",
    "municipio": "San Bartolomé Jocotenango",
    "departamento": "Guatemala",
    "codigo": "1417"
  },
  {
    "vecindad": "Sacapulas, Guatemala",
    "municipio": "Sacapulas",
    "departamento": "Guatemala",
    "codigo": "1416"
  },
  {
    "vecindad": "San Miguel Uspantán, Guatemala",
    "municipio": "San Miguel Uspantán",
    "departamento": "Guatemala",
    "codigo": "1415"
  },
  {
    "vecindad": "San Andrés Sajcabajá, Guatemala",
    "municipio": "San Andrés Sajcabajá",
    "departamento": "Guatemala",
    "codigo": "1414"
  },
  {
    "vecindad": "Santa María Nebaj, Guatemala",
    "municipio": "Santa María Nebaj",
    "departamento": "Guatemala",
    "codigo": "1413"
  },
  {
    "vecindad": "Joyabaj, Guatemala",
    "municipio": "Joyabaj",
    "departamento": "Guatemala",
    "codigo": "1412"
  },
  {
    "vecindad": "San Juan Cotzal, Guatemala",
    "municipio": "San Juan Cotzal",
    "departamento": "Guatemala",
    "codigo": "1411"
  },
  {
    "vecindad": "Cunén, Guatemala",
    "municipio": "Cunén",
    "departamento": "Guatemala",
    "codigo": "1410"
  },
  {
    "vecindad": "San Pedro Jocopilas, Guatemala",
    "municipio": "San Pedro Jocopilas",
    "departamento": "Guatemala",
    "codigo": "1409"
  },
  {
    "vecindad": "San Antonio Ilotenango, Guatemala",
    "municipio": "San Antonio Ilotenango",
    "departamento": "Guatemala",
    "codigo": "1408"
  },
  {
    "vecindad": "Patzité, Guatemala",
    "municipio": "Patzité",
    "departamento": "Guatemala",
    "codigo": "1407"
  },
  {
    "vecindad": "Santo Tomás Chichicastenango, Guatemala",
    "municipio": "Santo Tomás Chichicastenango",
    "departamento": "Guatemala",
    "codigo": "1406"
  },
  {
    "vecindad": "Chajul, Guatemala",
    "municipio": "Chajul",
    "departamento": "Guatemala",
    "codigo": "1405"
  },
  {
    "vecindad": "Zacualpa, Guatemala",
    "municipio": "Zacualpa",
    "departamento": "Guatemala",
    "codigo": "1404"
  },
  {
    "vecindad": "Chinique, Guatemala",
    "municipio": "Chinique",
    "departamento": "Guatemala",
    "codigo": "1403"
  },
  {
    "vecindad": "Chiché, Guatemala",
    "municipio": "Chiché",
    "departamento": "Guatemala",
    "codigo": "1402"
  },
  {
    "vecindad": "Santa Cruz del Quiché, Guatemala",
    "municipio": "Santa Cruz del Quiché",
    "departamento": "Guatemala",
    "codigo": "1401"
  },
  {
    "vecindad": "Petatán, Huehuetenango",
    "municipio": "Petatán",
    "departamento": "Huehuetenango",
    "codigo": "1333"
  },
  {
    "vecindad": "Unión Cantinil, Huehuetenango",
    "municipio": "Unión Cantinil",
    "departamento": "Huehuetenango",
    "codigo": "1332"
  },
  {
    "vecindad": "Santa Ana Huista, Huehuetenango",
    "municipio": "Santa Ana Huista",
    "departamento": "Huehuetenango",
    "codigo": "1331"
  },
  {
    "vecindad": "Santiago Chimaltenango, Huehuetenango",
    "municipio": "Santiago Chimaltenango",
    "departamento": "Huehuetenango",
    "codigo": "1330"
  },
  {
    "vecindad": "San Gaspar Ixchil, Huehuetenango",
    "municipio": "San Gaspar Ixchil",
    "departamento": "Huehuetenango",
    "codigo": "1329"
  },
  {
    "vecindad": "San Rafael Petzal, Huehuetenango",
    "municipio": "San Rafael Petzal",
    "departamento": "Huehuetenango",
    "codigo": "1328"
  },
  {
    "vecindad": "Aguacatán, Huehuetenango",
    "municipio": "Aguacatán",
    "departamento": "Huehuetenango",
    "codigo": "1327"
  },
  {
    "vecindad": "Santa Cruz Barillas, Huehuetenango",
    "municipio": "Santa Cruz Barillas",
    "departamento": "Huehuetenango",
    "codigo": "1326"
  },
  {
    "vecindad": "San Sebastián Coatán, Huehuetenango",
    "municipio": "San Sebastián Coatán",
    "departamento": "Huehuetenango",
    "codigo": "1325"
  },
  {
    "vecindad": "San Antonio Huista, Huehuetenango",
    "municipio": "San Antonio Huista",
    "departamento": "Huehuetenango",
    "codigo": "1324"
  },
  {
    "vecindad": "San Juan Ixcoy, Huehuetenango",
    "municipio": "San Juan Ixcoy",
    "departamento": "Huehuetenango",
    "codigo": "1323"
  },
  {
    "vecindad": "Concepción Huista, Huehuetenango",
    "municipio": "Concepción Huista",
    "departamento": "Huehuetenango",
    "codigo": "1322"
  },
  {
    "vecindad": "Tectitán, Huehuetenango",
    "municipio": "Tectitán",
    "departamento": "Huehuetenango",
    "codigo": "1321"
  },
  {
    "vecindad": "San Sebastián Huehuetenango, Huehuetenango",
    "municipio": "San Sebastián Huehuetenango",
    "departamento": "Huehuetenango",
    "codigo": "1320"
  },
  {
    "vecindad": "Colotenango, Huehuetenango",
    "municipio": "Colotenango",
    "departamento": "Huehuetenango",
    "codigo": "1319"
  },
  {
    "vecindad": "San Mateo Ixtatán, Huehuetenango",
    "municipio": "San Mateo Ixtatán",
    "departamento": "Huehuetenango",
    "codigo": "1318"
  },
  {
    "vecindad": "Santa Eulalia, Huehuetenango",
    "municipio": "Santa Eulalia",
    "departamento": "Huehuetenango",
    "codigo": "1317"
  },
  {
    "vecindad": "San Juan Atitán, Huehuetenango",
    "municipio": "San Juan Atitán",
    "departamento": "Huehuetenango",
    "codigo": "1316"
  },
  {
    "vecindad": "Todos Santos Cuchumatán, Huehuetenango",
    "municipio": "Todos Santos Cuchumatán",
    "departamento": "Huehuetenango",
    "codigo": "1315"
  },
  {
    "vecindad": "San Rafael La Independencia, Huehuetenango",
    "municipio": "San Rafael La Independencia",
    "departamento": "Huehuetenango",
    "codigo": "1314"
  },
  {
    "vecindad": "San Miguel Acatán, Huehuetenango",
    "municipio": "San Miguel Acatán",
    "departamento": "Huehuetenango",
    "codigo": "1313"
  },
  {
    "vecindad": "La Democracia, Huehuetenango",
    "municipio": "La Democracia",
    "departamento": "Huehuetenango",
    "codigo": "1312"
  },
  {
    "vecindad": "La Libertad, Huehuetenango",
    "municipio": "La Libertad",
    "departamento": "Huehuetenango",
    "codigo": "1311"
  },
  {
    "vecindad": "Santa Bárbara, Huehuetenango",
    "municipio": "Santa Bárbara",
    "departamento": "Huehuetenango",
    "codigo": "1310"
  },
  {
    "vecindad": "San Ildefonso Ixtahuacán, Huehuetenango",
    "municipio": "San Ildefonso Ixtahuacán",
    "departamento": "Huehuetenango",
    "codigo": "1309"
  },
  {
    "vecindad": "San Pedro Soloma, Huehuetenango",
    "municipio": "San Pedro Soloma",
    "departamento": "Huehuetenango",
    "codigo": "1308"
  },
  {
    "vecindad": "Jacaltenango, Huehuetenango",
    "municipio": "Jacaltenango",
    "departamento": "Huehuetenango",
    "codigo": "1307"
  },
  {
    "vecindad": "San Pedro Necta, Huehuetenango",
    "municipio": "San Pedro Necta",
    "departamento": "Huehuetenango",
    "codigo": "1306"
  },
  {
    "vecindad": "Nentón, Huehuetenango",
    "municipio": "Nentón",
    "departamento": "Huehuetenango",
    "codigo": "1305"
  },
  {
    "vecindad": "Cuilco, Huehuetenango",
    "municipio": "Cuilco",
    "departamento": "Huehuetenango",
    "codigo": "1304"
  },
  {
    "vecindad": "Malacatancito, Huehuetenango",
    "municipio": "Malacatancito",
    "departamento": "Huehuetenango",
    "codigo": "1303"
  },
  {
    "vecindad": "Chiantla, Huehuetenango",
    "municipio": "Chiantla",
    "departamento": "Huehuetenango",
    "codigo": "1302"
  },
  {
    "vecindad": "Huehuetenango, Huehuetenango",
    "municipio": "Huehuetenango",
    "departamento": "Huehuetenango",
    "codigo": "1301"
  },
  {
    "vecindad": "La Blanca, San Marcos",
    "municipio": "La Blanca",
    "departamento": "San Marcos",
    "codigo": "1230"
  },
  {
    "vecindad": "San Lorenzo, San Marcos",
    "municipio": "San Lorenzo",
    "departamento": "San Marcos",
    "codigo": "1229"
  },
  {
    "vecindad": "Río Blanco, San Marcos",
    "municipio": "Río Blanco",
    "departamento": "San Marcos",
    "codigo": "1228"
  },
  {
    "vecindad": "Esquipulas Palo Gordo, San Marcos",
    "municipio": "Esquipulas Palo Gordo",
    "departamento": "San Marcos",
    "codigo": "1227"
  },
  {
    "vecindad": "Sipacapa, San Marcos",
    "municipio": "Sipacapa",
    "departamento": "San Marcos",
    "codigo": "1226"
  },
  {
    "vecindad": "San Cristóbal Cucho, San Marcos",
    "municipio": "San Cristóbal Cucho",
    "departamento": "San Marcos",
    "codigo": "1225"
  },
  {
    "vecindad": "San José Ojetenam, San Marcos",
    "municipio": "San José Ojetenam",
    "departamento": "San Marcos",
    "codigo": "1224"
  },
  {
    "vecindad": "Ixchiguán, San Marcos",
    "municipio": "Ixchiguán",
    "departamento": "San Marcos",
    "codigo": "1223"
  },
  {
    "vecindad": "Pajapita, San Marcos",
    "municipio": "Pajapita",
    "departamento": "San Marcos",
    "codigo": "1222"
  },
  {
    "vecindad": "La Reforma, San Marcos",
    "municipio": "La Reforma",
    "departamento": "San Marcos",
    "codigo": "1221"
  },
  {
    "vecindad": "El Quetzal, San Marcos",
    "municipio": "El Quetzal",
    "departamento": "San Marcos",
    "codigo": "1220"
  },
  {
    "vecindad": "San Pablo, San Marcos",
    "municipio": "San Pablo",
    "departamento": "San Marcos",
    "codigo": "1219"
  },
  {
    "vecindad": "Ocós, San Marcos",
    "municipio": "Ocós",
    "departamento": "San Marcos",
    "codigo": "1218"
  },
  {
    "vecindad": "Ayutla, San Marcos",
    "municipio": "Ayutla",
    "departamento": "San Marcos",
    "codigo": "1217"
  },
  {
    "vecindad": "Catarina, San Marcos",
    "municipio": "Catarina",
    "departamento": "San Marcos",
    "codigo": "1216"
  },
  {
    "vecindad": "Malacatán, San Marcos",
    "municipio": "Malacatán",
    "departamento": "San Marcos",
    "codigo": "1215"
  },
  {
    "vecindad": "San José el Rodeo, San Marcos",
    "municipio": "San José el Rodeo",
    "departamento": "San Marcos",
    "codigo": "1214"
  },
  {
    "vecindad": "El Tumbador, San Marcos",
    "municipio": "El Tumbador",
    "departamento": "San Marcos",
    "codigo": "1213"
  },
  {
    "vecindad": "Nuevo Progreso, San Marcos",
    "municipio": "Nuevo Progreso",
    "departamento": "San Marcos",
    "codigo": "1212"
  },
  {
    "vecindad": "San Rafael Pie de la Cuesta, San Marcos",
    "municipio": "San Rafael Pie de la Cuesta",
    "departamento": "San Marcos",
    "codigo": "1211"
  },
  {
    "vecindad": "Tejutla, San Marcos",
    "municipio": "Tejutla",
    "departamento": "San Marcos",
    "codigo": "1210"
  },
  {
    "vecindad": "Tajumulco, San Marcos",
    "municipio": "Tajumulco",
    "departamento": "San Marcos",
    "codigo": "1209"
  },
  {
    "vecindad": "Sibinal, San Marcos",
    "municipio": "Sibinal",
    "departamento": "San Marcos",
    "codigo": "1208"
  },
  {
    "vecindad": "Tacaná, San Marcos",
    "municipio": "Tacaná",
    "departamento": "San Marcos",
    "codigo": "1207"
  },
  {
    "vecindad": "Concepción Tutuapa, San Marcos",
    "municipio": "Concepción Tutuapa",
    "departamento": "San Marcos",
    "codigo": "1206"
  },
  {
    "vecindad": "San Miguel Ixtahuacán, San Marcos",
    "municipio": "San Miguel Ixtahuacán",
    "departamento": "San Marcos",
    "codigo": "1205"
  },
  {
    "vecindad": "Comitancillo, San Marcos",
    "municipio": "Comitancillo",
    "departamento": "San Marcos",
    "codigo": "1204"
  },
  {
    "vecindad": "San Antonio Sacatepéquez, San Marcos",
    "municipio": "San Antonio Sacatepéquez",
    "departamento": "San Marcos",
    "codigo": "1203"
  },
  {
    "vecindad": "San Pedro Sacatepéquez, San Marcos",
    "municipio": "San Pedro Sacatepéquez",
    "departamento": "San Marcos",
    "codigo": "1202"
  },
  {
    "vecindad": "San Marcos, San Marcos",
    "municipio": "San Marcos",
    "departamento": "San Marcos",
    "codigo": "1201"
  },
  {
    "vecindad": "El Asintal, Retalhuleu",
    "municipio": "El Asintal",
    "departamento": "Retalhuleu",
    "codigo": "1109"
  },
  {
    "vecindad": "Nuevo San Carlos, Retalhuleu",
    "municipio": "Nuevo San Carlos",
    "departamento": "Retalhuleu",
    "codigo": "1108"
  },
  {
    "vecindad": "Champerico, Retalhuleu",
    "municipio": "Champerico",
    "departamento": "Retalhuleu",
    "codigo": "1107"
  },
  {
    "vecindad": "San Andrés Villa Seca, Retalhuleu",
    "municipio": "San Andrés Villa Seca",
    "departamento": "Retalhuleu",
    "codigo": "1106"
  },
  {
    "vecindad": "San Felipe, Retalhuleu",
    "municipio": "San Felipe",
    "departamento": "Retalhuleu",
    "codigo": "1105"
  },
  {
    "vecindad": "San Martín Zapotitlán, Retalhuleu",
    "municipio": "San Martín Zapotitlán",
    "departamento": "Retalhuleu",
    "codigo": "1104"
  },
  {
    "vecindad": "Santa Cruz Muluá, Retalhuleu",
    "municipio": "Santa Cruz Muluá",
    "departamento": "Retalhuleu",
    "codigo": "1103"
  },
  {
    "vecindad": "San Sebastián, Retalhuleu",
    "municipio": "San Sebastián",
    "departamento": "Retalhuleu",
    "codigo": "1102"
  },
  {
    "vecindad": "Retalhuleu, Retalhuleu",
    "municipio": "Retalhuleu",
    "departamento": "Retalhuleu",
    "codigo": "1101"
  },
  {
    "vecindad": "San José La Máquina, Suchitepéquez",
    "municipio": "San José La Máquina",
    "departamento": "Suchitepéquez",
    "codigo": "1021"
  },
  {
    "vecindad": "Río Bravo, Suchitepéquez",
    "municipio": "Río Bravo",
    "departamento": "Suchitepéquez",
    "codigo": "1020"
  },
  {
    "vecindad": "Pueblo Nuevo, Suchitepéquez",
    "municipio": "Pueblo Nuevo",
    "departamento": "Suchitepéquez",
    "codigo": "1019"
  },
  {
    "vecindad": "Zunilito, Suchitepéquez",
    "municipio": "Zunilito",
    "departamento": "Suchitepéquez",
    "codigo": "1018"
  },
  {
    "vecindad": "Santo Tomas La Unión, Suchitepéquez",
    "municipio": "Santo Tomas La Unión",
    "departamento": "Suchitepéquez",
    "codigo": "1017"
  },
  {
    "vecindad": "San Juan Bautista, Suchitepéquez",
    "municipio": "San Juan Bautista",
    "departamento": "Suchitepéquez",
    "codigo": "1016"
  },
  {
    "vecindad": "Santa Bárbara, Suchitepéquez",
    "municipio": "Santa Bárbara",
    "departamento": "Suchitepéquez",
    "codigo": "1015"
  },
  {
    "vecindad": "Patulul, Suchitepéquez",
    "municipio": "Patulul",
    "departamento": "Suchitepéquez",
    "codigo": "1014"
  },
  {
    "vecindad": "Chicacao, Suchitepéquez",
    "municipio": "Chicacao",
    "departamento": "Suchitepéquez",
    "codigo": "1013"
  },
  {
    "vecindad": "San Gabriel, Suchitepéquez",
    "municipio": "San Gabriel",
    "departamento": "Suchitepéquez",
    "codigo": "1012"
  },
  {
    "vecindad": "San Miguel Panán, Suchitepéquez",
    "municipio": "San Miguel Panán",
    "departamento": "Suchitepéquez",
    "codigo": "1011"
  },
  {
    "vecindad": "San Antonio Suchitepéquez, Suchitepéquez",
    "municipio": "San Antonio Suchitepéquez",
    "departamento": "Suchitepéquez",
    "codigo": "1010"
  },
  {
    "vecindad": "San Pablo Jocopilas, Suchitepéquez",
    "municipio": "San Pablo Jocopilas",
    "departamento": "Suchitepéquez",
    "codigo": "1009"
  },
  {
    "vecindad": "Samayac, Suchitepéquez",
    "municipio": "Samayac",
    "departamento": "Suchitepéquez",
    "codigo": "1008"
  },
  {
    "vecindad": "San Lorenzo, Suchitepéquez",
    "municipio": "San Lorenzo",
    "departamento": "Suchitepéquez",
    "codigo": "1007"
  },
  {
    "vecindad": "Santo Domingo Suchitepéquez, Suchitepéquez",
    "municipio": "Santo Domingo Suchitepéquez",
    "departamento": "Suchitepéquez",
    "codigo": "1006"
  },
  {
    "vecindad": "San José el Ídolo, Suchitepéquez",
    "municipio": "San José el Ídolo",
    "departamento": "Suchitepéquez",
    "codigo": "1005"
  },
  {
    "vecindad": "San Bernardino, Suchitepéquez",
    "municipio": "San Bernardino",
    "departamento": "Suchitepéquez",
    "codigo": "1004"
  },
  {
    "vecindad": "San Francisco Zapotitlán, Suchitepéquez",
    "municipio": "San Francisco Zapotitlán",
    "departamento": "Suchitepéquez",
    "codigo": "1003"
  },
  {
    "vecindad": "Cuyotenango, Suchitepéquez",
    "municipio": "Cuyotenango",
    "departamento": "Suchitepéquez",
    "codigo": "1002"
  },
  {
    "vecindad": "Mazatenango, Suchitepéquez",
    "municipio": "Mazatenango",
    "departamento": "Suchitepéquez",
    "codigo": "1001"
  },
  {
    "vecindad": "Palestina de Los Altos, Quetzaltenango",
    "municipio": "Palestina de Los Altos",
    "departamento": "Quetzaltenango",
    "codigo": "0924"
  },
  {
    "vecindad": "La Esperanza, Quetzaltenango",
    "municipio": "La Esperanza",
    "departamento": "Quetzaltenango",
    "codigo": "0923"
  },
  {
    "vecindad": "Flores Costa Cuca, Quetzaltenango",
    "municipio": "Flores Costa Cuca",
    "departamento": "Quetzaltenango",
    "codigo": "0922"
  },
  {
    "vecindad": "Génova, Quetzaltenango",
    "municipio": "Génova",
    "departamento": "Quetzaltenango",
    "codigo": "0921"
  },
  {
    "vecindad": "Coatepeque, Quetzaltenango",
    "municipio": "Coatepeque",
    "departamento": "Quetzaltenango",
    "codigo": "0920"
  },
  {
    "vecindad": "El Palmar, Quetzaltenango",
    "municipio": "El Palmar",
    "departamento": "Quetzaltenango",
    "codigo": "0919"
  },
  {
    "vecindad": "San Francisco La Unión, Quetzaltenango",
    "municipio": "San Francisco La Unión",
    "departamento": "Quetzaltenango",
    "codigo": "0918"
  },
  {
    "vecindad": "Colomba Costa Cuca, Quetzaltenango",
    "municipio": "Colomba Costa Cuca",
    "departamento": "Quetzaltenango",
    "codigo": "0917"
  },
  {
    "vecindad": "Zunil, Quetzaltenango",
    "municipio": "Zunil",
    "departamento": "Quetzaltenango",
    "codigo": "0916"
  },
  {
    "vecindad": "Huitán, Quetzaltenango",
    "municipio": "Huitán",
    "departamento": "Quetzaltenango",
    "codigo": "0915"
  },
  {
    "vecindad": "Cantel, Quetzaltenango",
    "municipio": "Cantel",
    "departamento": "Quetzaltenango",
    "codigo": "0914"
  },
  {
    "vecindad": "Almolonga, Quetzaltenango",
    "municipio": "Almolonga",
    "departamento": "Quetzaltenango",
    "codigo": "0913"
  },
  {
    "vecindad": "San Martín Sacatepéquez, Quetzaltenango",
    "municipio": "San Martín Sacatepéquez",
    "departamento": "Quetzaltenango",
    "codigo": "0912"
  },
  {
    "vecindad": "Concepción Chiquirichapa, Quetzaltenango",
    "municipio": "Concepción Chiquirichapa",
    "departamento": "Quetzaltenango",
    "codigo": "0911"
  },
  {
    "vecindad": "San Mateo, Quetzaltenango",
    "municipio": "San Mateo",
    "departamento": "Quetzaltenango",
    "codigo": "0910"
  },
  {
    "vecindad": "San Juan Ostuncalco, Quetzaltenango",
    "municipio": "San Juan Ostuncalco",
    "departamento": "Quetzaltenango",
    "codigo": "0909"
  },
  {
    "vecindad": "San Miguel Siguilá, Quetzaltenango",
    "municipio": "San Miguel Siguilá",
    "departamento": "Quetzaltenango",
    "codigo": "0908"
  },
  {
    "vecindad": "Cajolá, Quetzaltenango",
    "municipio": "Cajolá",
    "departamento": "Quetzaltenango",
    "codigo": "0907"
  },
  {
    "vecindad": "Cabricán, Quetzaltenango",
    "municipio": "Cabricán",
    "departamento": "Quetzaltenango",
    "codigo": "0906"
  },
  {
    "vecindad": "Sibilia, Quetzaltenango",
    "municipio": "Sibilia",
    "departamento": "Quetzaltenango",
    "codigo": "0905"
  },
  {
    "vecindad": "San Carlos Sija, Quetzaltenango",
    "municipio": "San Carlos Sija",
    "departamento": "Quetzaltenango",
    "codigo": "0904"
  },
  {
    "vecindad": "San Juan Olintepeque, Quetzaltenango",
    "municipio": "San Juan Olintepeque",
    "departamento": "Quetzaltenango",
    "codigo": "0903"
  },
  {
    "vecindad": "Salcajá, Quetzaltenango",
    "municipio": "Salcajá",
    "departamento": "Quetzaltenango",
    "codigo": "0902"
  },
  {
    "vecindad": "Quetzaltenango, Quetzaltenango",
    "municipio": "Quetzaltenango",
    "departamento": "Quetzaltenango",
    "codigo": "0901"
  },
  {
    "vecindad": "San Bartolo Aguas Calientes, Totonicapán",
    "municipio": "San Bartolo Aguas Calientes",
    "departamento": "Totonicapán",
    "codigo": "0808"
  },
  {
    "vecindad": "Santa Lucía la Reforma, Totonicapán",
    "municipio": "Santa Lucía la Reforma",
    "departamento": "Totonicapán",
    "codigo": "0807"
  },
  {
    "vecindad": "Santa María Chiquimula, Totonicapán",
    "municipio": "Santa María Chiquimula",
    "departamento": "Totonicapán",
    "codigo": "0806"
  },
  {
    "vecindad": "Momostenango, Totonicapán",
    "municipio": "Momostenango",
    "departamento": "Totonicapán",
    "codigo": "0805"
  },
  {
    "vecindad": "San Andrés Xecul, Totonicapán",
    "municipio": "San Andrés Xecul",
    "departamento": "Totonicapán",
    "codigo": "0804"
  },
  {
    "vecindad": "San Francisco El Alto, Totonicapán",
    "municipio": "San Francisco El Alto",
    "departamento": "Totonicapán",
    "codigo": "0803"
  },
  {
    "vecindad": "San Cristóbal Totonicapán, Totonicapán",
    "municipio": "San Cristóbal Totonicapán",
    "departamento": "Totonicapán",
    "codigo": "0802"
  },
  {
    "vecindad": "Totonicapán, Totonicapán",
    "municipio": "Totonicapán",
    "departamento": "Totonicapán",
    "codigo": "0801"
  },
  {
    "vecindad": "Santiago Atitlán, Sololá",
    "municipio": "Santiago Atitlán",
    "departamento": "Sololá",
    "codigo": "0719"
  },
  {
    "vecindad": "San Pedro La Laguna, Sololá",
    "municipio": "San Pedro La Laguna",
    "departamento": "Sololá",
    "codigo": "0718"
  },
  {
    "vecindad": "San Juan La Laguna, Sololá",
    "municipio": "San Juan La Laguna",
    "departamento": "Sololá",
    "codigo": "0717"
  },
  {
    "vecindad": "San Marcos La Laguna, Sololá",
    "municipio": "San Marcos La Laguna",
    "departamento": "Sololá",
    "codigo": "0716"
  },
  {
    "vecindad": "San Pablo La Laguna, Sololá",
    "municipio": "San Pablo La Laguna",
    "departamento": "Sololá",
    "codigo": "0715"
  },
  {
    "vecindad": "Santa Cruz La Laguna, Sololá",
    "municipio": "Santa Cruz La Laguna",
    "departamento": "Sololá",
    "codigo": "0714"
  },
  {
    "vecindad": "San Lucas Tolimán, Sololá",
    "municipio": "San Lucas Tolimán",
    "departamento": "Sololá",
    "codigo": "0713"
  },
  {
    "vecindad": "San Antonio Palopó, Sololá",
    "municipio": "San Antonio Palopó",
    "departamento": "Sololá",
    "codigo": "0712"
  },
  {
    "vecindad": "Santa Catarina Palopó, Sololá",
    "municipio": "Santa Catarina Palopó",
    "departamento": "Sololá",
    "codigo": "0711"
  },
  {
    "vecindad": "Panajachel, Sololá",
    "municipio": "Panajachel",
    "departamento": "Sololá",
    "codigo": "0710"
  },
  {
    "vecindad": "San Andrés Semetabaj, Sololá",
    "municipio": "San Andrés Semetabaj",
    "departamento": "Sololá",
    "codigo": "0709"
  },
  {
    "vecindad": "Concepción, Sololá",
    "municipio": "Concepción",
    "departamento": "Sololá",
    "codigo": "0708"
  },
  {
    "vecindad": "Santa Clara La Laguna, Sololá",
    "municipio": "Santa Clara La Laguna",
    "departamento": "Sololá",
    "codigo": "0707"
  },
  {
    "vecindad": "Santa Catarina Ixtahuacán, Sololá",
    "municipio": "Santa Catarina Ixtahuacán",
    "departamento": "Sololá",
    "codigo": "0706"
  },
  {
    "vecindad": "Nahualá, Sololá",
    "municipio": "Nahualá",
    "departamento": "Sololá",
    "codigo": "0705"
  },
  {
    "vecindad": "Santa Lucía Utatlán, Sololá",
    "municipio": "Santa Lucía Utatlán",
    "departamento": "Sololá",
    "codigo": "0704"
  },
  {
    "vecindad": "Santa María Visitación, Sololá",
    "municipio": "Santa María Visitación",
    "departamento": "Sololá",
    "codigo": "0703"
  },
  {
    "vecindad": "San José Chacayá, Sololá",
    "municipio": "San José Chacayá",
    "departamento": "Sololá",
    "codigo": "0702"
  },
  {
    "vecindad": "Sololá, Sololá",
    "municipio": "Sololá",
    "departamento": "Sololá",
    "codigo": "0701"
  },
  {
    "vecindad": "Nueva Santa Rosa, Santa Rosa",
    "municipio": "Nueva Santa Rosa",
    "departamento": "Santa Rosa",
    "codigo": "0614"
  },
  {
    "vecindad": "Pueblo Nuevo Viñas, Santa Rosa",
    "municipio": "Pueblo Nuevo Viñas",
    "departamento": "Santa Rosa",
    "codigo": "0613"
  },
  {
    "vecindad": "Santa Cruz Naranjo, Santa Rosa",
    "municipio": "Santa Cruz Naranjo",
    "departamento": "Santa Rosa",
    "codigo": "0612"
  },
  {
    "vecindad": "Guazacapán, Santa Rosa",
    "municipio": "Guazacapán",
    "departamento": "Santa Rosa",
    "codigo": "0611"
  },
  {
    "vecindad": "Santa María Ixhuatán, Santa Rosa",
    "municipio": "Santa María Ixhuatán",
    "departamento": "Santa Rosa",
    "codigo": "0610"
  },
  {
    "vecindad": "Taxisco, Santa Rosa",
    "municipio": "Taxisco",
    "departamento": "Santa Rosa",
    "codigo": "0609"
  },
  {
    "vecindad": "Chiquimulilla, Santa Rosa",
    "municipio": "Chiquimulilla",
    "departamento": "Santa Rosa",
    "codigo": "0608"
  },
  {
    "vecindad": "San Juan Tecuaco, Santa Rosa",
    "municipio": "San Juan Tecuaco",
    "departamento": "Santa Rosa",
    "codigo": "0607"
  },
  {
    "vecindad": "Oratorio, Santa Rosa",
    "municipio": "Oratorio",
    "departamento": "Santa Rosa",
    "codigo": "0606"
  },
  {
    "vecindad": "San Rafael Las Flores, Santa Rosa",
    "municipio": "San Rafael Las Flores",
    "departamento": "Santa Rosa",
    "codigo": "0605"
  },
  {
    "vecindad": "Casillas, Santa Rosa",
    "municipio": "Casillas",
    "departamento": "Santa Rosa",
    "codigo": "0604"
  },
  {
    "vecindad": "Santa Rosa de Lima, Santa Rosa",
    "municipio": "Santa Rosa de Lima",
    "departamento": "Santa Rosa",
    "codigo": "0603"
  },
  {
    "vecindad": "Barberena, Santa Rosa",
    "municipio": "Barberena",
    "departamento": "Santa Rosa",
    "codigo": "0602"
  },
  {
    "vecindad": "Cuilapa, Santa Rosa",
    "municipio": "Cuilapa",
    "departamento": "Santa Rosa",
    "codigo": "0601"
  },
  {
    "vecindad": "Sipacate, Escuintla",
    "municipio": "Sipacate",
    "departamento": "Escuintla",
    "codigo": "0514"
  },
  {
    "vecindad": "Nueva Concepción, Escuintla",
    "municipio": "Nueva Concepción",
    "departamento": "Escuintla",
    "codigo": "0513"
  },
  {
    "vecindad": "San Vicente Pacaya, Escuintla",
    "municipio": "San Vicente Pacaya",
    "departamento": "Escuintla",
    "codigo": "0512"
  },
  {
    "vecindad": "Palín, Escuintla",
    "municipio": "Palín",
    "departamento": "Escuintla",
    "codigo": "0511"
  },
  {
    "vecindad": "Iztapa, Escuintla",
    "municipio": "Iztapa",
    "departamento": "Escuintla",
    "codigo": "0510"
  },
  {
    "vecindad": "San José, Escuintla",
    "municipio": "San José",
    "departamento": "Escuintla",
    "codigo": "0509"
  },
  {
    "vecindad": "Guanagazapa, Escuintla",
    "municipio": "Guanagazapa",
    "departamento": "Escuintla",
    "codigo": "0508"
  },
  {
    "vecindad": "La Gomera, Escuintla",
    "municipio": "La Gomera",
    "departamento": "Escuintla",
    "codigo": "0507"
  },
  {
    "vecindad": "Tiquisate, Escuintla",
    "municipio": "Tiquisate",
    "departamento": "Escuintla",
    "codigo": "0506"
  },
  {
    "vecindad": "Masagua, Escuintla",
    "municipio": "Masagua",
    "departamento": "Escuintla",
    "codigo": "0505"
  },
  {
    "vecindad": "Siquinalá, Escuintla",
    "municipio": "Siquinalá",
    "departamento": "Escuintla",
    "codigo": "0504"
  },
  {
    "vecindad": "La Democracia, Escuintla",
    "municipio": "La Democracia",
    "departamento": "Escuintla",
    "codigo": "0503"
  },
  {
    "vecindad": "Santa Lucía Cotzumalguapa, Escuintla",
    "municipio": "Santa Lucía Cotzumalguapa",
    "departamento": "Escuintla",
    "codigo": "0502"
  },
  {
    "vecindad": "Escuintla, Escuintla",
    "municipio": "Escuintla",
    "departamento": "Escuintla",
    "codigo": "0501"
  },
  {
    "vecindad": "El Tejar, Chimaltenango",
    "municipio": "El Tejar",
    "departamento": "Chimaltenango",
    "codigo": "0416"
  },
  {
    "vecindad": "Zaragoza, Chimaltenango",
    "municipio": "Zaragoza",
    "departamento": "Chimaltenango",
    "codigo": "0415"
  },
  {
    "vecindad": "Parramos, Chimaltenango",
    "municipio": "Parramos",
    "departamento": "Chimaltenango",
    "codigo": "0414"
  },
  {
    "vecindad": "San Andrés Itzapa, Chimaltenango",
    "municipio": "San Andrés Itzapa",
    "departamento": "Chimaltenango",
    "codigo": "0413"
  },
  {
    "vecindad": "San Pedro Yepocapa, Chimaltenango",
    "municipio": "San Pedro Yepocapa",
    "departamento": "Chimaltenango",
    "codigo": "0412"
  },
  {
    "vecindad": "Acatenango, Chimaltenango",
    "municipio": "Acatenango",
    "departamento": "Chimaltenango",
    "codigo": "0411"
  },
  {
    "vecindad": "Santa Cruz Balanyá, Chimaltenango",
    "municipio": "Santa Cruz Balanyá",
    "departamento": "Chimaltenango",
    "codigo": "0410"
  },
  {
    "vecindad": "Patzicía, Chimaltenango",
    "municipio": "Patzicía",
    "departamento": "Chimaltenango",
    "codigo": "0409"
  },
  {
    "vecindad": "San Miguel Pochuta, Chimaltenango",
    "municipio": "San Miguel Pochuta",
    "departamento": "Chimaltenango",
    "codigo": "0408"
  },
  {
    "vecindad": "Patzún, Chimaltenango",
    "municipio": "Patzún",
    "departamento": "Chimaltenango",
    "codigo": "0407"
  },
  {
    "vecindad": "Tecpán Guatemala, Chimaltenango",
    "municipio": "Tecpán Guatemala",
    "departamento": "Chimaltenango",
    "codigo": "0406"
  },
  {
    "vecindad": "Santa Apolonia, Chimaltenango",
    "municipio": "Santa Apolonia",
    "departamento": "Chimaltenango",
    "codigo": "0405"
  },
  {
    "vecindad": "San Juan Comalapa, Chimaltenango",
    "municipio": "San Juan Comalapa",
    "departamento": "Chimaltenango",
    "codigo": "0404"
  },
  {
    "vecindad": "San Martín Jilotepeque, Chimaltenango",
    "municipio": "San Martín Jilotepeque",
    "departamento": "Chimaltenango",
    "codigo": "0403"
  },
  {
    "vecindad": "San José Poaquil, Chimaltenango",
    "municipio": "San José Poaquil",
    "departamento": "Chimaltenango",
    "codigo": "0402"
  },
  {
    "vecindad": "Chimaltenango, Chimaltenango",
    "municipio": "Chimaltenango",
    "departamento": "Chimaltenango",
    "codigo": "0401"
  },
  {
    "vecindad": "Santa Catarina Barahona, Sacatepéquez",
    "municipio": "Santa Catarina Barahona",
    "departamento": "Sacatepéquez",
    "codigo": "0316"
  },
  {
    "vecindad": "San Antonio Aguas Calientes, Sacatepéquez",
    "municipio": "San Antonio Aguas Calientes",
    "departamento": "Sacatepéquez",
    "codigo": "0315"
  },
  {
    "vecindad": "San Juan Alotenango, Sacatepéquez",
    "municipio": "San Juan Alotenango",
    "departamento": "Sacatepéquez",
    "codigo": "0314"
  },
  {
    "vecindad": "San Miguel Dueñas, Sacatepéquez",
    "municipio": "San Miguel Dueñas",
    "departamento": "Sacatepéquez",
    "codigo": "0313"
  },
  {
    "vecindad": "Ciudad Vieja, Sacatepéquez",
    "municipio": "Ciudad Vieja",
    "departamento": "Sacatepéquez",
    "codigo": "0312"
  },
  {
    "vecindad": "Santa María de Jesús, Sacatepéquez",
    "municipio": "Santa María de Jesús",
    "departamento": "Sacatepéquez",
    "codigo": "0311"
  },
  {
    "vecindad": "Magdalena Milpas Altas, Sacatepéquez",
    "municipio": "Magdalena Milpas Altas",
    "departamento": "Sacatepéquez",
    "codigo": "0310"
  },
  {
    "vecindad": "Santa Lucía Milpas Altas, Sacatepéquez",
    "municipio": "Santa Lucía Milpas Altas",
    "departamento": "Sacatepéquez",
    "codigo": "0309"
  },
  {
    "vecindad": "San Lucas Sacatepéquez, Sacatepéquez",
    "municipio": "San Lucas Sacatepéquez",
    "departamento": "Sacatepéquez",
    "codigo": "0308"
  },
  {
    "vecindad": "San Bartolomé Milpas Altas, Sacatepéquez",
    "municipio": "San Bartolomé Milpas Altas",
    "departamento": "Sacatepéquez",
    "codigo": "0307"
  },
  {
    "vecindad": "Santiago Sacatepéquez, Sacatepéquez",
    "municipio": "Santiago Sacatepéquez",
    "departamento": "Sacatepéquez",
    "codigo": "0306"
  },
  {
    "vecindad": "Santo Domingo Xenacoj, Sacatepéquez",
    "municipio": "Santo Domingo Xenacoj",
    "departamento": "Sacatepéquez",
    "codigo": "0305"
  },
  {
    "vecindad": "Sumpango, Sacatepéquez",
    "municipio": "Sumpango",
    "departamento": "Sacatepéquez",
    "codigo": "0304"
  },
  {
    "vecindad": "Pastores, Sacatepéquez",
    "municipio": "Pastores",
    "departamento": "Sacatepéquez",
    "codigo": "0303"
  },
  {
    "vecindad": "Jocotenango, Sacatepéquez",
    "municipio": "Jocotenango",
    "departamento": "Sacatepéquez",
    "codigo": "0302"
  },
  {
    "vecindad": "Antigua Guatemala, Sacatepéquez",
    "municipio": "Antigua Guatemala",
    "departamento": "Sacatepéquez",
    "codigo": "0301"
  },
  {
    "vecindad": "San Antonio La Paz, El Progreso",
    "municipio": "San Antonio La Paz",
    "departamento": "El Progreso",
    "codigo": "0208"
  },
  {
    "vecindad": "Sanarate, El Progreso",
    "municipio": "Sanarate",
    "departamento": "El Progreso",
    "codigo": "0207"
  },
  {
    "vecindad": "Sansare, El Progreso",
    "municipio": "Sansare",
    "departamento": "El Progreso",
    "codigo": "0206"
  },
  {
    "vecindad": "El Jícaro, El Progreso",
    "municipio": "El Jícaro",
    "departamento": "El Progreso",
    "codigo": "0205"
  },
  {
    "vecindad": "San Cristóbal Acasaguastlán, El Progreso",
    "municipio": "San Cristóbal Acasaguastlán",
    "departamento": "El Progreso",
    "codigo": "0204"
  },
  {
    "vecindad": "San Agustín Acasaguastlán, El Progreso",
    "municipio": "San Agustín Acasaguastlán",
    "departamento": "El Progreso",
    "codigo": "0203"
  },
  {
    "vecindad": "Morazán, El Progreso",
    "municipio": "Morazán",
    "departamento": "El Progreso",
    "codigo": "0202"
  },
  {
    "vecindad": "Guastatoya, El Progreso",
    "municipio": "Guastatoya",
    "departamento": "El Progreso",
    "codigo": "0201"
  },
  {
    "vecindad": "San Miguel Petapa, Guatemala",
    "municipio": "San Miguel Petapa",
    "departamento": "Guatemala",
    "codigo": "0117"
  },
  {
    "vecindad": "Villa Canales, Guatemala",
    "municipio": "Villa Canales",
    "departamento": "Guatemala",
    "codigo": "0116"
  },
  {
    "vecindad": "Villa Nueva, Guatemala",
    "municipio": "Villa Nueva",
    "departamento": "Guatemala",
    "codigo": "0115"
  },
  {
    "vecindad": "Amatitlán, Guatemala",
    "municipio": "Amatitlán",
    "departamento": "Guatemala",
    "codigo": "0114"
  },
  {
    "vecindad": "Fraijanes, Guatemala",
    "municipio": "Fraijanes",
    "departamento": "Guatemala",
    "codigo": "0113"
  },
  {
    "vecindad": "Chuarrancho, Guatemala",
    "municipio": "Chuarrancho",
    "departamento": "Guatemala",
    "codigo": "0112"
  },
  {
    "vecindad": "San Raymundo, Guatemala",
    "municipio": "San Raymundo",
    "departamento": "Guatemala",
    "codigo": "0111"
  },
  {
    "vecindad": "San Juan Sacatepéquez, Guatemala",
    "municipio": "San Juan Sacatepéquez",
    "departamento": "Guatemala",
    "codigo": "0110"
  },
  {
    "vecindad": "San Pedro Sacatepéquez, Guatemala",
    "municipio": "San Pedro Sacatepéquez",
    "departamento": "Guatemala",
    "codigo": "0109"
  },
  {
    "vecindad": "Mixco, Guatemala",
    "municipio": "Mixco",
    "departamento": "Guatemala",
    "codigo": "0108"
  },
  {
    "vecindad": "San Pedro Ayampuc, Guatemala",
    "municipio": "San Pedro Ayampuc",
    "departamento": "Guatemala",
    "codigo": "0107"
  },
  {
    "vecindad": "Chinautla, Guatemala",
    "municipio": "Chinautla",
    "departamento": "Guatemala",
    "codigo": "0106"
  },
  {
    "vecindad": "Palencia, Guatemala",
    "municipio": "Palencia",
    "departamento": "Guatemala",
    "codigo": "0105"
  },
  {
    "vecindad": "San José del Golfo, Guatemala",
    "municipio": "San José del Golfo",
    "departamento": "Guatemala",
    "codigo": "0104"
  },
  {
    "vecindad": "San José Pinula, Guatemala",
    "municipio": "San José Pinula",
    "departamento": "Guatemala",
    "codigo": "0103"
  },
  {
    "vecindad": "Santa Catarina Pinula, Guatemala",
    "municipio": "Santa Catarina Pinula",
    "departamento": "Guatemala",
    "codigo": "0102"
  },
  {
    "vecindad": "Guatemala, Guatemala",
    "municipio": "Guatemala",
    "departamento": "Guatemala",
    "codigo": "0101"
  }
]
