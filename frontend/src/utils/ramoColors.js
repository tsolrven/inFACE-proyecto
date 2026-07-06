// Genera un color consistente para cada ramo, sin necesidad de guardar

const PALETTE = [
  '#818CF8', 
  '#E8546A', 
  '#34D399', 
  '#FBBF24', 
  '#60A5FA', 
  '#FB923C', 
  '#A78BFA', 
  '#F472B6', 
  '#2DD4BF', 
  '#F87171', 
];

export function colorPorRamo(ramoId = '') {
  let hash = 0;
  for (let i = 0; i < ramoId.length; i++) {
    hash = (hash << 5) - hash + ramoId.charCodeAt(i);
    hash |= 0; 
  }
  const index = Math.abs(hash) % PALETTE.length;
  return PALETTE[index];
}
