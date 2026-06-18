export type GameTag = "MTG" | "RiftBound";

export interface CollectionSummary {
  id: string;
  name: string;
  game: GameTag;
  ownedCount: number;
  totalCount: number;
  progressPercent: number; // 0-100
  gradientFrom: string; // classe Tailwind ex: "from-orange-500"
  gradientTo: string;
  icon: string; // emoji ou caractère utilisé comme illustration
}

export interface LibraryCardItem {
  id: string;
  name: string;
  game: GameTag;
  setLabel: string; // ex: "151 · 199/165"
  rarity: string; // ex: "Secret", "Rare", "Holo", "Mythic"
  trendPercent: number; // positif ou négatif, ex: 12.4 ou -1.8
  quantity: number; // ex: 2 -> "x2"
  gradientFrom: string;
  gradientTo: string;
  icon: string;
}