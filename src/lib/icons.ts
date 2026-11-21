// src/lib/icons.ts
// Mapa de iconos de ObraFlow basado en react-icons (set Tabler).
// Fuente única de verdad para los iconos usados por el embudo comercial.
import type { ComponentType } from 'react';
import {
	TbFileInvoice,
	TbClipboardList,
	TbArrowsExchange,
	TbBrandWhatsapp,
	TbLayoutKanban,
	TbLayoutList,
	TbChevronLeft,
	TbChevronRight
} from 'react-icons/tb';

export const ICONS = {
	budget: TbFileInvoice,
	visit: TbClipboardList,
	move: TbArrowsExchange,
	whatsapp: TbBrandWhatsapp,
	kanban: TbLayoutKanban,
	list: TbLayoutList,
	chevronLeft: TbChevronLeft,
	chevronRight: TbChevronRight
} as const;

export type IconName = keyof typeof ICONS;

export interface IconProps {
	size?: number;
	className?: string;
}

export function resolveIcon(name: IconName): ComponentType<any> {
	return ICONS[name] as ComponentType<any>;
}
