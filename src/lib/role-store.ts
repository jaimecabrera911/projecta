// src/lib/role-store.ts
// Gestión de roles de usuario y permisos contextuales para ObraFlow SaaS.

export type UserRole = 'admin' | 'resident' | 'supervisor' | 'client';

export interface RoleConfig {
	id: UserRole;
	name: string;
	label: string;
	badgeText: string;
	avatar: string;
	avatarBg: string;
	badgeBg: string;
	badgeColor: string;
	description: string;
	canViewFinancialMargins: boolean;
	canEditBudgets: boolean;
	canRegisterFieldExpenses: boolean;
	isFieldOnly: boolean;
}

export const ROLES_CONFIG: Record<UserRole, RoleConfig> = {
	admin: {
		id: 'admin',
		name: 'Carlos Mendoza',
		label: 'Administrador / Contratista General',
		badgeText: 'Admin',
		avatar: 'CM',
		avatarBg: 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)',
		badgeBg: '#FFF7ED',
		badgeColor: '#EA580C',
		description: 'Acceso total a finanzas, márgenes comerciales, catálogo, presupuestos y CRM.',
		canViewFinancialMargins: true,
		canEditBudgets: true,
		canRegisterFieldExpenses: true,
		isFieldOnly: false
	},
	resident: {
		id: 'resident',
		name: 'Ing. Mateo Gómez',
		label: 'Residente de Obra',
		badgeText: 'Residente',
		avatar: 'MG',
		avatarBg: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
		badgeBg: '#EFF6FF',
		badgeColor: '#1D4ED8',
		description: 'Operación en sitio: registro de compras en 3 toques, bitácora y visitas. Sin acceso a márgenes ni precios de venta.',
		canViewFinancialMargins: false,
		canEditBudgets: false,
		canRegisterFieldExpenses: true,
		isFieldOnly: true
	},
	supervisor: {
		id: 'supervisor',
		name: 'Maestro Pedro Flórez',
		label: 'Maestro Supervisor de Campo',
		badgeText: 'Maestro',
		avatar: 'PF',
		avatarBg: 'linear-gradient(135deg, #D97706 0%, #B45309 100%)',
		badgeBg: '#FEF3C7',
		badgeColor: '#B45309',
		description: 'Control directo de cuadrillas, jornales y captura ultra-rápida de fotos de recibos en obra.',
		canViewFinancialMargins: false,
		canEditBudgets: false,
		canRegisterFieldExpenses: true,
		isFieldOnly: true
	},
	client: {
		id: 'client',
		name: 'Dr. Andrés Restrepo',
		label: 'Cliente Final de la Obra',
		badgeText: 'Cliente',
		avatar: 'AR',
		avatarBg: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
		badgeBg: '#ECFDF5',
		badgeColor: '#047857',
		description: 'Portal del cliente: aprobación de propuestas, estado de cuenta y fotos de avance aprobadas.',
		canViewFinancialMargins: false,
		canEditBudgets: false,
		canRegisterFieldExpenses: false,
		isFieldOnly: false
	}
};

export const STORAGE_KEY_ROLE = 'obraflow_active_role';

/**
 * Obtiene el rol activo actual desde localStorage o retorna 'admin' por defecto.
 */
export function getActiveRole(): UserRole {
	if (typeof window === 'undefined') return 'admin';
	try {
		const stored = localStorage.getItem(STORAGE_KEY_ROLE) as UserRole | null;
		if (stored && ROLES_CONFIG[stored]) {
			return stored;
		}
	} catch (e) {
		console.error('Error leyendo rol activo:', e);
	}
	return 'admin';
}

/**
 * Cambia el rol activo en sesión y emite un evento para actualizar toda la UI.
 */
export function setActiveRole(role: UserRole): RoleConfig {
	const config = ROLES_CONFIG[role] || ROLES_CONFIG.admin;
	if (typeof window !== 'undefined') {
		try {
			localStorage.setItem(STORAGE_KEY_ROLE, role);
		} catch (e) {}

		window.dispatchEvent(
			new CustomEvent('obraflow:role-change', {
				detail: { role, config }
			})
		);
	}
	return config;
}

/**
 * Obtiene la configuración del rol activo actual.
 */
export function getActiveRoleConfig(): RoleConfig {
	return ROLES_CONFIG[getActiveRole()];
}
