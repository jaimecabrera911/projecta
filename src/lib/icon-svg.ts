// src/lib/icon-svg.ts
// Renderiza un icono de react-icons (Tabler Icons) a una cadena SVG estática.
// Compatible tanto con servidor como con scripts de cliente en navegador.
import { renderIconSvg, type IconName, type IconProps } from './icons';

export function iconSvg(name: IconName, props: IconProps = {}): string {
	return renderIconSvg(name, props);
}

export { renderIconSvg };
