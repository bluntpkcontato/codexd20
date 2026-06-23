/**
 * D&D Equipment Icon Catalog — Uses sliced images from the grids.
 * Each equipment item maps to its icon image in /equip/
 */
import React from "react";
import Image from "next/image";

// ─── EQUIPMENT ITEM INTERFACE ────────────────────────────
export interface DnDEquipmentItem {
  id: string;
  name: string;
  category: "armadura_leve" | "armadura_media" | "armadura_pesada" | "escudo" | "arma_simples_corpo" | "arma_simples_distancia" | "arma_marcial_corpo" | "arma_marcial_distancia" | "arma_especial";
  ca?: string;
  damage?: string;
  properties?: string;
  icon: string; // path to /equip/xxx.png
}

// ─── FULL D&D EQUIPMENT CATALOG ─────────────────────────

export const DND_EQUIPMENT_CATALOG: DnDEquipmentItem[] = [
  // ── ARMADURAS LEVES ──
  { id: "acolchoada", name: "Acolchoada", category: "armadura_leve", ca: "11 + DES", icon: "/equip/arm_acolchoada.png" },
  { id: "couro", name: "Couro", category: "armadura_leve", ca: "11 + DES", icon: "/equip/arm_couro.png" },
  { id: "couro_batido", name: "Couro Batido", category: "armadura_leve", ca: "12 + DES", icon: "/equip/arm_couro_batido.png" },
  { id: "vestes", name: "Vestes", category: "armadura_leve", ca: "11 + DES", icon: "/equip/arm_vestes.png" },
  { id: "roupas_estudo", name: "Roupas de Estudos", category: "armadura_leve", ca: "11 + DES", icon: "/equip/arm_roupas_estudo.png" },

  // ── ARMADURAS MÉDIAS ──
  { id: "couro_curtido", name: "Couro Curtido", category: "armadura_media", ca: "12 + DES (máx.2)", icon: "/equip/arm_couro_curtido.png" },
  { id: "cota_media", name: "Armadura de Cota", category: "armadura_media", ca: "13 + DES (máx.2)", icon: "/equip/arm_cota_media.png" },
  { id: "corselete", name: "Corselete", category: "armadura_media", ca: "14 + DES (máx.2)", icon: "/equip/arm_corselete.png" },
  { id: "meia_armadura", name: "Meia Armadura", category: "armadura_media", ca: "15 + DES (máx.2)", icon: "/equip/arm_meia_armadura.png" },
  { id: "brigantina", name: "Brigantina", category: "armadura_media", ca: "14 + DES (máx.2)", icon: "/equip/arm_brigantina.png" },

  // ── ARMADURAS PESADAS ──
  { id: "cota_malha", name: "Cota de Malha", category: "armadura_pesada", ca: "16", icon: "/equip/arm_cota_malha.png" },
  { id: "escamada", name: "Escamada", category: "armadura_pesada", ca: "16", icon: "/equip/arm_escamada.png" },
  { id: "peitoral", name: "Peitoral", category: "armadura_pesada", ca: "16", icon: "/equip/arm_peitoral.png" },
  { id: "placas", name: "Arm. de Placas", category: "armadura_pesada", ca: "18", icon: "/equip/arm_placas.png" },
  { id: "placas_completa", name: "Placas Completa", category: "armadura_pesada", ca: "18", icon: "/equip/arm_placas_completa.png" },

  // ── ESCUDOS ──
  { id: "escudo", name: "Escudo", category: "escudo", ca: "+2", icon: "/equip/esc_escudo.png" },
  { id: "escudo_grande", name: "Escudo Grande", category: "escudo", ca: "+2", icon: "/equip/esc_escudo_grande.png" },
  { id: "escudo_torre", name: "Escudo de Torre", category: "escudo", ca: "+2", icon: "/equip/esc_escudo_torre.png" },
  { id: "escudo_redondo", name: "Escudo Redondo", category: "escudo", ca: "+2", icon: "/equip/esc_escudo_redondo.png" },

  // ── ARMAS SIMPLES (CORPO A CORPO) ──
  { id: "clava", name: "Clava", category: "arma_simples_corpo", damage: "1d4", properties: "Leve", icon: "/equip/arma_clava.png" },
  { id: "adaga", name: "Adaga", category: "arma_simples_corpo", damage: "1d4", properties: "Fina, Leve, Arremesso", icon: "/equip/arma_adaga.png" },
  { id: "lanca_simples", name: "Lança", category: "arma_simples_corpo", damage: "1d6", properties: "Arremesso, Versátil", icon: "/equip/arma_lanca_simples.png" },
  { id: "bastao", name: "Bastão", category: "arma_simples_corpo", damage: "1d6", properties: "Versátil (1d8)", icon: "/equip/arma_bastao.png" },
  { id: "cimitarra_simples", name: "Cimitarra", category: "arma_simples_corpo", damage: "1d6", properties: "Leve, Fina", icon: "/equip/arma_cimitarra_simples.png" },
  { id: "foice", name: "Foice", category: "arma_simples_corpo", damage: "1d10", properties: "Pesada, Alcance", icon: "/equip/arma_foice.png" },
  { id: "chicote", name: "Chicote", category: "arma_simples_corpo", damage: "1d4", properties: "Alcance", icon: "/equip/arma_chicote.png" },

  // ── ARMAS SIMPLES (DISTÂNCIA) ──
  { id: "besta_leve", name: "Besta Leve", category: "arma_simples_distancia", damage: "1d8", properties: "Munição, Recarregar", icon: "/equip/arma_besta_leve.png" },
  { id: "dardo", name: "Dardo", category: "arma_simples_distancia", damage: "1d4", properties: "Arremesso (20/60)", icon: "/equip/arma_dardo.png" },
  { id: "estilingue", name: "Estilingue", category: "arma_simples_distancia", damage: "1d4", properties: "Munição (30/120)", icon: "/equip/arma_estilingue.png" },
  { id: "arco_curto", name: "Arco Curto", category: "arma_simples_distancia", damage: "1d6", properties: "Munição (80/320), 2 mãos", icon: "/equip/arma_arco_curto.png" },

  // ── ARMAS MARCIAIS (CORPO A CORPO) ──
  { id: "espada_curta", name: "Espada Curta", category: "arma_marcial_corpo", damage: "1d6", properties: "Fina, Leve", icon: "/equip/arma_espada_curta.png" },
  { id: "espada_longa", name: "Espada Longa", category: "arma_marcial_corpo", damage: "1d8", properties: "Versátil (1d10)", icon: "/equip/arma_espada_longa.png" },
  { id: "espada_larga", name: "Espada Larga", category: "arma_marcial_corpo", damage: "2d6", properties: "Pesada, 2 mãos", icon: "/equip/arma_espada_larga.png" },
  { id: "rapieira", name: "Rapieira", category: "arma_marcial_corpo", damage: "1d8", properties: "Fina", icon: "/equip/arma_rapieira.png" },
  { id: "machado_batalha", name: "Machado de Batalha", category: "arma_marcial_corpo", damage: "1d8", properties: "Versátil (1d10)", icon: "/equip/arma_machado_batalha.png" },
  { id: "machado_grande", name: "Machado Grande", category: "arma_marcial_corpo", damage: "1d12", properties: "Pesada, 2 mãos", icon: "/equip/arma_machado_grande.png" },
  { id: "martelo_guerra", name: "Martelo de Guerra", category: "arma_marcial_corpo", damage: "1d8", properties: "Versátil (1d10)", icon: "/equip/arma_martelo_guerra.png" },
  { id: "martelo_leve", name: "Martelo Leve", category: "arma_marcial_corpo", damage: "1d4", properties: "Leve, Arremesso", icon: "/equip/arma_martelo_leve.png" },
  { id: "maca", name: "Maça", category: "arma_marcial_corpo", damage: "1d6", properties: "—", icon: "/equip/arma_maca.png" },
  { id: "maca_pesada", name: "Maça Pesada", category: "arma_marcial_corpo", damage: "1d8", properties: "Pesada", icon: "/equip/arma_maca_pesada.png" },
  { id: "lanca_marc", name: "Lança Marcial", category: "arma_marcial_corpo", damage: "1d6", properties: "Arremesso (20/60)", icon: "/equip/arma_lanca_marc.png" },
  { id: "tridente", name: "Tridente", category: "arma_marcial_corpo", damage: "1d6", properties: "Arremesso, Versátil", icon: "/equip/arma_tridente.png" },
  { id: "glaive", name: "Glaive", category: "arma_marcial_corpo", damage: "1d10", properties: "Pesada, Alcance, 2 mãos", icon: "/equip/arma_glaive.png" },
  { id: "alabarda", name: "Alabarda", category: "arma_marcial_corpo", damage: "1d10", properties: "Pesada, Alcance, 2 mãos", icon: "/equip/arma_alabarda.png" },

  // ── ARMAS MARCIAIS (DISTÂNCIA) ──
  { id: "besta_mao", name: "Besta de Mão", category: "arma_marcial_distancia", damage: "1d6", properties: "Munição, Leve, Recarregar", icon: "/equip/arma_besta_mao.png" },
  { id: "besta_pesada", name: "Besta Pesada", category: "arma_marcial_distancia", damage: "1d10", properties: "Pesada, Recarregar, 2 mãos", icon: "/equip/arma_besta_pesada.png" },
  { id: "arco_longo", name: "Arco Longo", category: "arma_marcial_distancia", damage: "1d8", properties: "Munição (150/600), Pesada, 2 mãos", icon: "/equip/arma_arco_longo.png" },
  { id: "arco_composto", name: "Arco Composto", category: "arma_marcial_distancia", damage: "1d8", properties: "Alcance (150/600)", icon: "/equip/arma_arco_composto.png" },

  // ── ARMAS ESPECIAIS / EXÓTICAS ──
  { id: "nunchaku", name: "Nunchaku", category: "arma_especial", damage: "1d6", properties: "Fina", icon: "/equip/arma_nunchaku.png" },
  { id: "kama", name: "Kama", category: "arma_especial", damage: "1d4", properties: "Fina", icon: "/equip/arma_kama.png" },
  { id: "kukri", name: "Kukri", category: "arma_especial", damage: "1d6", properties: "Fina", icon: "/equip/arma_kukri.png" },
  { id: "garras", name: "Garras", category: "arma_especial", damage: "1d6", properties: "Fina", icon: "/equip/arma_garras.png" },
  { id: "manopla", name: "Manopla", category: "arma_especial", damage: "1d4", properties: "Leve", icon: "/equip/arma_manopla.png" },
];

// ─── CATEGORY LABELS & COLORS ─────────────────────────────

export const CATEGORY_META: Record<string, { label: string; colorClass: string; borderClass: string; bgClass: string }> = {
  armadura_leve: { label: "Armaduras Leves", colorClass: "text-amber-300", borderClass: "border-amber-500/30", bgClass: "bg-amber-900/10" },
  armadura_media: { label: "Armaduras Médias", colorClass: "text-blue-300", borderClass: "border-blue-500/30", bgClass: "bg-blue-900/10" },
  armadura_pesada: { label: "Armaduras Pesadas", colorClass: "text-gray-300", borderClass: "border-gray-400/30", bgClass: "bg-gray-800/10" },
  escudo: { label: "Escudos", colorClass: "text-green-300", borderClass: "border-green-500/30", bgClass: "bg-green-900/10" },
  arma_simples_corpo: { label: "Armas Simples (Corpo)", colorClass: "text-orange-300", borderClass: "border-orange-500/30", bgClass: "bg-orange-900/10" },
  arma_simples_distancia: { label: "Armas Simples (Distância)", colorClass: "text-emerald-300", borderClass: "border-emerald-500/30", bgClass: "bg-emerald-900/10" },
  arma_marcial_corpo: { label: "Armas Marciais (Corpo)", colorClass: "text-red-300", borderClass: "border-red-500/30", bgClass: "bg-red-900/10" },
  arma_marcial_distancia: { label: "Armas Marciais (Distância)", colorClass: "text-purple-300", borderClass: "border-purple-500/30", bgClass: "bg-purple-900/10" },
  arma_especial: { label: "Armas Especiais", colorClass: "text-cyan-300", borderClass: "border-cyan-500/30", bgClass: "bg-cyan-900/10" },
};

// ─── EQUIPMENT CARD COMPONENT ─────────────────────────────

interface EquipmentCardProps {
  item: DnDEquipmentItem;
  selected?: boolean;
  onClick?: () => void;
  size?: "sm" | "md";
}

export const EquipmentCard: React.FC<EquipmentCardProps> = ({ item, selected, onClick, size = "sm" }) => {
  const meta = CATEGORY_META[item.category];
  const imgSize = size === "sm" ? 40 : 56;

  return (
    <div
      onClick={onClick}
      className={`
        group relative flex flex-col items-center gap-1 p-2 rounded-xl border cursor-pointer
        transition-all duration-200 hover:scale-105
        ${selected
          ? `bg-[#1a1025]/60 border-[#c9a84c] shadow-[0_0_16px_rgba(201,168,76,0.2)]`
          : `bg-[#0a0a12]/60 ${meta.borderClass} hover:border-white/20 hover:bg-white/[0.03]`
        }
      `}
      title={`${item.name}${item.damage ? ` — ${item.damage}` : ""}${item.ca ? ` — CA: ${item.ca}` : ""}${item.properties ? ` — ${item.properties}` : ""}`}
    >
      {/* Icon image */}
      <div className="relative" style={{ width: imgSize, height: imgSize + 12 }}>
        <Image
          src={item.icon}
          alt={item.name}
          fill
          className="object-contain drop-shadow-[0_0_4px_rgba(201,168,76,0.3)]"
          sizes={`${imgSize}px`}
        />
      </div>

      {/* Name */}
      <span className={`text-[8px] font-heading font-bold uppercase tracking-wide text-center leading-tight ${selected ? "text-[#c9a84c]" : "text-gray-400 group-hover:text-white"}`}>
        {item.name}
      </span>

      {/* Stats tooltip on hover */}
      {(item.damage || item.ca) && (
        <span className={`text-[7px] ${selected ? "text-[#c9a84c]/60" : "text-gray-600"} text-center leading-tight`}>
          {item.damage || `CA: ${item.ca}`}
        </span>
      )}
    </div>
  );
};

// ─── EQUIPMENT CATEGORY SECTION ────────────────────────────

interface EquipmentCategorySectionProps {
  category: string;
  items: DnDEquipmentItem[];
  selectedIds?: string[];
  onToggle?: (id: string) => void;
}

export const EquipmentCategorySection: React.FC<EquipmentCategorySectionProps> = ({
  category,
  items,
  selectedIds = [],
  onToggle,
}) => {
  const meta = CATEGORY_META[category];
  if (!meta || items.length === 0) return null;

  return (
    <div className={`space-y-2 ${meta.bgClass} border ${meta.borderClass} rounded-xl p-3`}>
      <p className={`text-[9px] font-heading font-bold ${meta.colorClass} uppercase tracking-widest`}>
        {meta.label}
      </p>
      <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 gap-1.5">
        {items.map(item => (
          <EquipmentCard
            key={item.id}
            item={item}
            selected={selectedIds.includes(item.id)}
            onClick={() => onToggle?.(item.id)}
            size="sm"
          />
        ))}
      </div>
    </div>
  );
};

// ─── HELPER: GROUP ITEMS BY CATEGORY ────────────────────────

export function groupByCategory(items: DnDEquipmentItem[]): Record<string, DnDEquipmentItem[]> {
  const groups: Record<string, DnDEquipmentItem[]> = {};
  for (const item of items) {
    if (!groups[item.category]) groups[item.category] = [];
    groups[item.category].push(item);
  }
  return groups;
}

// ─── HELPER: GET ICON FOR BACKGROUND EQUIPMENT ITEM ─────────
// Maps keywords from background equipment text to an equipment icon path

const BG_EQUIP_ICON_MAP: { keywords: string[]; icon: string }[] = [
  { keywords: ["espada"], icon: "/equip/arma_espada_longa.png" },
  { keywords: ["adaga", "faca", "lâmina"], icon: "/equip/arma_adaga.png" },
  { keywords: ["cajado", "bordão", "bastão"], icon: "/equip/arma_bastao.png" },
  { keywords: ["arco"], icon: "/equip/arma_arco_curto.png" },
  { keywords: ["besta"], icon: "/equip/arma_besta_leve.png" },
  { keywords: ["lança"], icon: "/equip/arma_lanca_simples.png" },
  { keywords: ["martelo"], icon: "/equip/arma_martelo_guerra.png" },
  { keywords: ["maça", "clava", "porrete"], icon: "/equip/arma_maca.png" },
  { keywords: ["machado"], icon: "/equip/arma_machado_batalha.png" },
  { keywords: ["escudo"], icon: "/equip/esc_escudo.png" },
  { keywords: ["armadura de placas", "placas completa"], icon: "/equip/arm_placas.png" },
  { keywords: ["cota de malha"], icon: "/equip/arm_cota_malha.png" },
  { keywords: ["armadura de couro", "couro batido"], icon: "/equip/arm_couro_batido.png" },
  { keywords: ["couro"], icon: "/equip/arm_couro.png" },
];

export function getBackgroundEquipIcon(itemName: string): string | null {
  const lower = itemName.toLowerCase();
  for (const entry of BG_EQUIP_ICON_MAP) {
    for (const kw of entry.keywords) {
      if (lower.includes(kw)) return entry.icon;
    }
  }
  return null;
}
