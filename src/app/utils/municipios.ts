// src/app/utils/municipios.util.ts

export async function obtenerMunicipiosUtil(
  apiService: any,
  depto?: any,
  codigo?: any,
  muni?: any
): Promise<any[]> {
  try {
    const municipios = await apiService.getMunicipios({
      limit: 25,
      departamento: depto,
      codigo: codigo,
      municipio: muni
    });

    return municipios;
  } catch (error) {
    console.error('❌ Error al obtener municipios (util):', error);
    return [];
  }
}
