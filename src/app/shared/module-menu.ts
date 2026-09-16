// Paleta de acento para las tarjetas de los menús de módulos.
// Reutiliza los colores del dashboard para mantener identidad visual.

export const MENU_PALETTE = [
  '#3b82f6', // azul
  '#818cf8', // índigo
  '#e879f9', // fucsia
  '#22d3ee', // cian
  '#34d399', // esmeralda
  '#fbbf24', // ámbar
  '#f472b6', // rosa
  '#a78bfa', // violeta
];

export function menuColor(index: number): string {
  return MENU_PALETTE[index % MENU_PALETTE.length];
}