export type PageKind =
  | "cover"
  | "menu"
  | "content"
  | "gallery"
  | "rsvp"
  | "location"
  | "gift"
  | "closing";

export type BackgroundKind = "image" | "video" | "color";

export type MenuIcon =
  | "location"
  | "gift"
  | "rsvp"
  | "dresscode"
  | "guide"
  | "gallery"
  | "heart";

export type MenuItem = {
  icon: MenuIcon;
  label: string;
  /** Página de destino, pelo `kind` ou pelo id. */
  target: string;
};

export type GalleryItem = {
  url: string;
  kind: "image" | "video";
  caption?: string;
};

export type PageConfig = {
  items?: MenuItem[];
  gallery?: GalleryItem[];
  align?: "center" | "bottom";
  [key: string]: unknown;
};

export type InvitePage = {
  id: string;
  position: number;
  kind: PageKind;
  is_visible: boolean;
  eyebrow: string | null;
  title: string | null;
  subtitle: string | null;
  body: string | null;
  background_url: string | null;
  background_kind: BackgroundKind;
  overlay: number;
  config: PageConfig;
};

export type Theme = {
  /** Cor de destaque: filetes, ícones, botões. */
  accent?: string;
  paper?: string;
  ink?: string;
  /** Envelope de entrada e o lacre de cera. */
  envelope?: string;
  seal?: string;
  /** Tamanho do lacre de cera. 1 = padrão. */
  seal_scale?: number;
  /** Tamanho das iniciais gravadas no lacre. 1 = padrão. */
  monogram_scale?: number;
  /** Tamanho das iniciais em relevo, no alto do envelope. 1 = padrão. */
  emboss_scale?: number;
  /** Texto secundário: datas, legendas, apoio. */
  ink_soft?: string;
  /** Combinação de fontes, uma chave de FONT_PAIRS. */
  font_pair?: string;
  /** Só o texto corrido, uma chave de TEXT_FONTS. Vazio = a fonte do par. */
  font_text?: string;
  /** Tamanho do texto do convite inteiro. 1 = padrão. */
  font_scale?: number;
  /** Peso do texto corrido: 300 leve, 400 normal, 500 forte. */
  text_weight?: number;
  /** Arte personalizada do envelope. */
  envelope_image?: string;
  /** "fundo" mantém a aba e o relevo por cima; "arte" deixa só a imagem. */
  envelope_image_mode?: "fundo" | "arte";
  /** Escurecimento sobre a imagem, para o lacre e a etiqueta continuarem lendo. */
  envelope_overlay?: number;
};

export type EventRecord = {
  id: string;
  slug: string;
  couple_names: string;
  monogram: string | null;
  title: string;
  blessing_line: string | null;
  event_date: string;
  rsvp_deadline: string | null;
  venue_name: string | null;
  venue_address: string | null;
  venue_maps_url: string | null;
  venue_lat: number | null;
  venue_lng: number | null;
  music_url: string | null;
  theme: Theme;
  pix_key: string | null;
  pix_key_owner: string | null;
  pix_city: string | null;
  pix_suggestions: number[];
  whatsapp_template: string | null;
  base_url: string | null;
};

export type GuestStatus = "pending" | "confirmed" | "declined";

export type Guest = {
  id: string;
  name: string;
  is_child: boolean;
  position: number;
  status: GuestStatus;
};

export type InviteStatus = "pending" | "sent" | "failed";

export type Household = {
  id: string;
  event_id: string;
  slug: string;
  family_name: string;
  greeting: string | null;
  phone: string | null;
  note: string | null;
  invite_status: InviteStatus;
  invite_sent_at: string | null;
  responded_at: string | null;
  guests: Guest[];
};

export type Invite = {
  event: EventRecord;
  pages: InvitePage[];
  household: Household | null;
};
