// src/lib/icons.ts
// Mapa central de iconos de ObraFlow basado en react-icons (Tabler Icons).
// Fuente única de verdad para la iconografía del sistema.
// Provee tanto los componentes de React como generador de SVG estático para plantillas y scripts cliente.

import type { ComponentType } from 'react';
import {
	TbFileInvoice,
	TbClipboardList,
	TbClipboardText,
	TbArrowsExchange,
	TbBrandWhatsapp,
	TbLayoutKanban,
	TbLayoutList,
	TbChevronLeft,
	TbChevronRight,
	TbChevronDown,
	TbPin,
	TbFolder,
	TbBuildingSkyscraper,
	TbBuildingCommunity,
	TbUser,
	TbMapPin,
	TbBulb,
	TbMessageDots,
	TbCheck,
	TbSun,
	TbCloudRain,
	TbCloud,
	TbClock,
	TbCalendar,
	TbHelmet,
	TbCamera,
	TbAlertTriangle,
	TbReceipt,
	TbWifi,
	TbWifiOff,
	TbBolt,
	TbTrash,
	TbCircleDot,
	TbBox,
	TbTractor,
	TbUsers,
	TbX
} from 'react-icons/tb';

export const ICONS = {
	budget: TbFileInvoice,
	visit: TbClipboardList,
	clipboard: TbClipboardText,
	move: TbArrowsExchange,
	whatsapp: TbBrandWhatsapp,
	kanban: TbLayoutKanban,
	list: TbLayoutList,
	chevronLeft: TbChevronLeft,
	chevronRight: TbChevronRight,
	chevronDown: TbChevronDown,
	pin: TbPin,
	folder: TbFolder,
	building: TbBuildingSkyscraper,
	community: TbBuildingCommunity,
	user: TbUser,
	mapPin: TbMapPin,
	bulb: TbBulb,
	message: TbMessageDots,
	check: TbCheck,
	sun: TbSun,
	rain: TbCloudRain,
	cloud: TbCloud,
	clock: TbClock,
	calendar: TbCalendar,
	worker: TbHelmet,
	camera: TbCamera,
	alert: TbAlertTriangle,
	receipt: TbReceipt,
	wifi: TbWifi,
	wifiOff: TbWifiOff,
	bolt: TbBolt,
	trash: TbTrash,
	dot: TbCircleDot,
	box: TbBox,
	truck: TbTractor,
	users: TbUsers,
	x: TbX
} as const;

export type IconName = keyof typeof ICONS;

export interface IconProps {
	size?: number;
	className?: string;
	color?: string;
}

export function resolveIcon(name: IconName): ComponentType<any> {
	return ICONS[name] as ComponentType<any>;
}

// Rutas vectoriales nativas extraídas de react-icons/tb (Tabler Icons)
// Permite renderizar SVGs en scripts de cliente y servidor con cero costo de bundle.
const TABLER_PATHS: Record<IconName, string> = {
	budget: '<path d="M14 3v4a1 1 0 0 0 1 1h4"></path><path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z"></path><line x1="9" y1="7" x2="10" y2="7"></line><line x1="9" y1="13" x2="15" y2="13"></line><line x1="13" y1="17" x2="15" y2="17"></line><line x1="9" y1="17" x2="10" y2="17"></line>',
	visit: '<path d="M9 5h-2a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-12a2 2 0 0 0 -2 -2h-2"></path><path d="M9 5a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2a2 2 0 0 1 -2 2h-2a2 2 0 0 1 -2 -2"></path><path d="M9 12h6"></path><path d="M9 16h6"></path>',
	clipboard: '<path d="M9 5h-2a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-12a2 2 0 0 0 -2 -2h-2"></path><path d="M9 5a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2a2 2 0 0 1 -2 2h-2a2 2 0 0 1 -2 -2"></path><path d="M9 12h6"></path><path d="M9 16h6"></path>',
	move: '<path d="M7 10h14l-4 -4"></path><path d="M17 14h-14l4 4"></path>',
	whatsapp: '<path d="M3 21l1.65 -3.8a9 9 0 1 1 3.4 2.9l-5.05 .9"></path><path d="M9 10a.5 .5 0 0 0 1 0v-1a.5 .5 0 0 0 -1 0v1a5 5 0 0 0 5 5h1a.5 .5 0 0 0 0 -1h-1a.5 .5 0 0 0 0 1"></path>',
	kanban: '<path d="M4 4m0 2a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2z"></path><line x1="10" y1="4" x2="10" y2="20"></line><line x1="14" y1="4" x2="14" y2="20"></line>',
	list: '<line x1="9" y1="6" x2="20" y2="6"></line><line x1="9" y1="12" x2="20" y2="12"></line><line x1="9" y1="18" x2="20" y2="18"></line><line x1="5" y1="6" x2="5" y2="6.01"></line><line x1="5" y1="12" x2="5" y2="12.01"></line><line x1="5" y1="18" x2="5" y2="18.01"></line>',
	chevronLeft: '<polyline points="15 6 9 12 15 18"></polyline>',
	chevronRight: '<polyline points="9 6 15 12 9 18"></polyline>',
	chevronDown: '<polyline points="6 9 12 15 18 9"></polyline>',
	pin: '<path d="M15 4.5l-4 4l-4 1.5l-1.5 1.5l7 7l1.5 -1.5l1.5 -4l4 -4"></path><path d="M9 15l-4.5 4.5"></path><path d="M14.5 4l5.5 5.5"></path>',
	folder: '<path d="M5 4h4l3 3h7a2 2 0 0 1 2 2v8a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-11a2 2 0 0 1 2 -2"></path>',
	building: '<path d="M3 21l18 0"></path><path d="M5 21v-14l8 -4v18"></path><path d="M19 21v-10l-6 -4"></path><path d="M9 9l0 .01"></path><path d="M9 12l0 .01"></path><path d="M9 15l0 .01"></path><path d="M9 18l0 .01"></path>',
	community: '<path d="M8 9l5 5v7h-5v-4m0 4h-5v-7l5 -5m1 1v-6a1 1 0 0 1 1 -1h10a1 1 0 0 1 1 1v17h-8"></path><path d="M13 7l0 .01"></path><path d="M17 7l0 .01"></path><path d="M17 11l0 .01"></path><path d="M17 15l0 .01"></path>',
	user: '<path d="M8 7a4 4 0 1 0 8 0a4 4 0 0 0 -8 0"></path><path d="M6 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2"></path>',
	mapPin: '<path d="M9 11a3 3 0 1 0 6 0a3 3 0 0 0 -6 0"></path><path d="M17.657 16.657l-4.243 4.243a2 2 0 0 1 -2.827 0l-4.244 -4.243a8 8 0 1 1 11.314 0"></path>',
	bulb: '<path d="M3 12h1m8 -9v1m8 8h1m-15.4 -6.4l.7 .7m12.1 -.7l-.7 .7"></path><path d="M9 16a5 5 0 1 1 6 0a3.5 3.5 0 0 0 -1 3a2 2 0 0 1 -4 0a3.5 3.5 0 0 0 -1 -3"></path><path d="M9.7 17l4.6 0"></path>',
	message: '<path d="M12 11v.01"></path><path d="M8 11v.01"></path><path d="M16 11v.01"></path><path d="M18 4a3 3 0 0 1 3 3v8a3 3 0 0 1 -3 3h-5l-5 3v-3h-2a3 3 0 0 1 -3 -3v-8a3 3 0 0 1 3 -3l12 0"></path>',
	check: '<path d="M5 12l5 5l10 -10"></path>',
	sun: '<path d="M8 12a4 4 0 1 0 8 0a4 4 0 1 0 -8 0"></path><path d="M3 12h1m8 -9v1m8 8h1m-9 8v1m-6.4 -15.4l.7 .7m12.1 -.7l-.7 .7m0 11.4l.7 .7m-12.1 -.7l-.7 .7"></path>',
	rain: '<path d="M7 18a4.6 4.4 0 0 1 0 -9a5 4.5 0 0 1 11 2h1a3.5 3.5 0 0 1 0 7"></path><path d="M11 13v2m0 3v2m4 -5v2m0 3v2"></path>',
	cloud: '<path d="M6.657 18c-2.572 0 -4.657 -2.007 -4.657 -4.483c0 -2.475 2.085 -4.482 4.657 -4.482c.393 -1.762 1.794 -3.2 3.675 -3.773c1.88 -.572 3.956 -.193 5.444 1c1.488 1.19 2.162 3.007 1.77 4.769h.99c1.913 0 3.464 1.56 3.464 3.486c0 1.927 -1.551 3.487 -3.465 3.487h-11.878"></path>',
	clock: '<path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0"></path><path d="M12 7v5l3 3"></path>',
	calendar: '<path d="M4 7a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2v-12"></path><path d="M16 3v4"></path><path d="M8 3v4"></path><path d="M4 11h16"></path><path d="M11 15h1"></path><path d="M12 15v3"></path>',
	worker: '<path d="M12 4a9 9 0 0 1 5.656 16h-11.312a9 9 0 0 1 5.656 -16"></path><path d="M20 9h-8.8a1 1 0 0 0 -.968 1.246c.507 2 1.596 3.418 3.268 4.254c2 1 4.333 1.5 7 1.5"></path>',
	camera: '<path d="M5 7h1a2 2 0 0 0 2 -2a1 1 0 0 1 1 -1h6a1 1 0 0 1 1 1a2 2 0 0 0 2 2h1a2 2 0 0 1 2 2v9a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-9a2 2 0 0 1 2 -2"></path><path d="M9 13a3 3 0 1 0 6 0a3 3 0 0 0 -6 0"></path>',
	alert: '<path d="M12 9v4"></path><path d="M10.363 3.591l-8.106 13.534a1.914 1.914 0 0 0 1.636 2.871h16.214a1.914 1.914 0 0 0 1.636 -2.87l-8.106 -13.536a1.914 1.914 0 0 0 -3.274 0"></path><path d="M12 16h.01"></path>',
	receipt: '<path d="M5 21v-16a2 2 0 0 1 2 -2h10a2 2 0 0 1 2 2v16l-3 -2l-2 2l-2 -2l-2 2l-2 -2l-3 2m4 -14h6m-6 4h6m-2 4h2"></path>',
	wifi: '<path d="M12 18l.01 0"></path><path d="M9.172 15.172a4 4 0 0 1 5.656 0"></path><path d="M6.343 12.343a8 8 0 0 1 11.314 0"></path><path d="M3.515 9.515c4.686 -4.687 12.284 -4.687 17 0"></path>',
	wifiOff: '<line x1="3" y1="3" x2="21" y2="21"></line><path d="M12 18l.01 0"></path><path d="M9.172 15.172a4 4 0 0 1 5.656 0"></path><path d="M6.343 12.343a7.963 7.963 0 0 1 3.864 -2.14m4.163 .155a7.965 7.965 0 0 1 3.287 1.985"></path>',
	bolt: '<path d="M13 3l0 7l6 0l-8 11l0 -7l-6 0l8 -11"></path>',
	trash: '<line x1="4" y1="7" x2="20" y2="7"></line><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line><path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12"></path><path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3"></path>',
	dot: '<path d="M12 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"></path><path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0"></path>',
	box: '<path d="M12 3l8 4.5l0 9l-8 4.5l-8 -4.5l0 -9l8 -4.5"></path><path d="M12 12l8 -4.5"></path><path d="M12 12l0 9"></path><path d="M12 12l-8 -4.5"></path>',
	truck: '<path d="M3 15a4 4 0 1 0 8 0a4 4 0 1 0 -8 0"></path><path d="M7 15l0 .01"></path><path d="M17 17a2 2 0 1 0 4 0a2 2 0 1 0 -4 0"></path><path d="M10.5 17l6.5 0"></path><path d="M20 15.2v-4.2a1 1 0 0 0 -1 -1h-6l-2 -5h-6v6.5"></path><path d="M18 5h-1a1 1 0 0 0 -1 1v4"></path>',
	users: '<path d="M5 7a4 4 0 1 0 8 0a4 4 0 1 0 -8 0"></path><path d="M3 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path><path d="M21 21v-2a4 4 0 0 0 -3 -3.85"></path>',
	x: '<path d="M18 6l-12 12"></path><path d="M6 6l12 12"></path>'
};

/**
 * Renderiza el SVG puro correspondiente al icono Tabler de react-icons.
 * Totalmente compatible tanto en scripts de cliente como en renderizado SSR.
 */
export function renderIconSvg(name: IconName, props: IconProps = {}): string {
	const paths = TABLER_PATHS[name] || TABLER_PATHS.check;
	const size = props.size ?? 16;
	const className = props.className ? ` class="${props.className}"` : '';
	const color = props.color ? ` stroke="${props.color}"` : ' stroke="currentColor"';

	return `<svg${color} fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" height="${size}" width="${size}" xmlns="http://www.w3.org/2000/svg"${className} aria-hidden="true">${paths}</svg>`;
}
