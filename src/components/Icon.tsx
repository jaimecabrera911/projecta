// src/components/Icon.tsx
// Componente React que renderiza un icono del set Tabler de react-icons.
// Se usa en plantillas .astro; se renderiza en el servidor (sin hidratación).
import { resolveIcon, type IconName, type IconProps } from '../lib/icons';

export default function Icon({ name, size = 18, className }: { name: IconName } & IconProps) {
	const Component = resolveIcon(name);
	return <Component size={size} className={className} aria-hidden="true" />;
}
