export interface PanitiaData {
  id?: string;
  name: string;
  role: string;
  division?: string;
  customRoleTitle?: string;
  photoUrl: string;
  cardNumber?: string;
  photoScale?: number;
  photoPosition?: { x: number; y: number };
  themeVariant?: 'classic' | 'gold_modern' | 'dark_patriot';
  created_at?: string;
}

export interface CardStyleConfig {
  id: string;
  name: string;
  badgeColor: string;
  headerGradient: string;
  accentBorder: string;
}
