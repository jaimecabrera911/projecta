// src/lib/icon-svg.ts
// Renderiza un icono de react-icons a una cadena SVG estática (mismo glifo que el
// componente React), para inyectarlo en el HTML generado por los scripts cliente.
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { resolveIcon, type IconName, type IconProps } from './icons';

export function iconSvg(name: IconName, props: IconProps = {}): string {
	const Component = resolveIcon(name);
	return renderToStaticMarkup(
		createElement(Component, {
			size: props.size ?? 18,
			className: props.className,
			'aria-hidden': 'true'
		})
	);
}
