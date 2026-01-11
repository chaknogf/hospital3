export const Parentescos: { label: string; value: string }[] = [
  'Padre',
  'Madre',
  'Hijo/a',
  'Hermano/a',
  'Abuelo/a',
  'Tío/a',
  'Primo/a',
  'Sobrino/a',
  'Yerno/Nuera',
  'Esposo/a',
  'Suegro/a',
  'Tutor',
  'Amistad',
  'Novio/a',
  'Cuñado/a',
  'Nieto/a',
  'Hijastro/a',
  'Padrastro/Madrastra',
  'Otro'
].map(p => ({
  label: p,
  value: p
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}));
