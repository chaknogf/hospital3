/**
 * Utilidades de formato para los tiempos (en segundos) que devuelve el backend
 * de reportes de quirófano. Los valores nulos/negativos se muestran como "—".
 */

/** Segundos → "HH:MM" (o "—" si no hay valor). */
export function segundosAHoraMinuto(segundos?: number | null): string {
  if (segundos == null || segundos < 0) return '—';
  const total = Math.round(segundos);
  const horas = Math.floor(total / 3600);
  const minutos = Math.floor((total % 3600) / 60);
  return `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}`;
}

/** Segundos → "HH:MM:SS" (o "—" si no hay valor). */
export function segundosAHoraMinutoSegundo(segundos?: number | null): string {
  if (segundos == null || segundos < 0) return '—';
  const total = Math.round(segundos);
  const horas = Math.floor(total / 3600);
  const minutos = Math.floor((total % 3600) / 60);
  const seg = total % 60;
  return `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}:${String(seg).padStart(2, '0')}`;
}

/** Segundos → "H.h horas" con un decimal (o "—"). */
export function segundosAHoras(segundos?: number | null): string {
  if (segundos == null || segundos < 0) return '—';
  return `${(segundos / 3600).toFixed(1)} h`;
}

/** Fracción (0..1) → "83.3 %". */
export function formatoPorcentaje(fraccion?: number | null, decimales = 1): string {
  if (fraccion == null || Number.isNaN(fraccion)) return '—';
  return `${(fraccion * 100).toFixed(decimales)} %`;
}

/** Número de días promedio → "2.5 d" (o "—"). */
export function formatoDias(dias?: number | null, decimales = 1): string {
  if (dias == null || Number.isNaN(dias)) return '—';
  return `${dias.toFixed(decimales)} d`;
}
