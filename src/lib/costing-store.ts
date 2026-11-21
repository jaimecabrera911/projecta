// src/lib/costing-store.ts
// HU-13: Matriz Financiera en Vivo de Presupuesto vs Real (Job Costing)
// Operación de cálculo, persistencia local y datos iniciales de obra.

export type ExpenseCategory = 'material' | 'labor' | 'equipment' | 'subcontract';

export interface ExpenseRecord {
	id: string;
	chapter_id: string;
	date: string; // YYYY-MM-DD
	concept: string;
	category: ExpenseCategory;
	registered_by: string;
	amount: number;
	receipt_url: string; // Data URL o SVG/imagen
	vendor: string;
	notes?: string;
	created_at: string;
}

export interface CostingChapter {
	chapter_id: string;
	name: string;
	order_index: number;
	base_cost: number;
	change_orders_cost: number;
	current_budget: number;
	actual_spent: number;
	variance: number; // Saldo Disponible: current_budget - actual_spent
	utilization_pct: number;
	status: 'normal' | 'warning' | 'danger';
	expenses: ExpenseRecord[];
}

export interface ProjectCosting {
	project_id: string;
	title: string;
	client_name: string;
	address: string;
	status: 'active' | 'completed' | 'paused';
	target_sale_price: number;
	total_budget_direct_cost: number;
	approved_change_orders_cost: number;
	current_budget_cost: number;
	actual_spent_cost: number;
	remaining_balance: number;
	budget_utilization_pct: number;
	projected_margin_pct: number;
	actual_current_margin_pct: number;
	updated_at: string;
	chapters: CostingChapter[];
}

export const STORAGE_KEY_COSTING = 'obraflow_job_costing_v1';

// Semáforo financiero según especificación HU-13:
// 🟢 Normal (< 85%)
// 🟡 Advertencia (85% - 99.9%)
// 🔴 Sobrecosto / Peligro (>= 100%)
export function getUtilizationStatus(utilizationPct: number): 'normal' | 'warning' | 'danger' {
	if (utilizationPct >= 100) return 'danger';
	if (utilizationPct >= 85) return 'warning';
	return 'normal';
}

/**
 * Calcula los totales y estados derivados para un proyecto y sus capítulos.
 */
export function calculateProjectCosting(project: {
	project_id: string;
	title: string;
	client_name: string;
	address: string;
	status: 'active' | 'completed' | 'paused';
	target_sale_price: number;
	chapters: Array<{
		chapter_id: string;
		name: string;
		order_index: number;
		base_cost: number;
		change_orders_cost: number;
		expenses: ExpenseRecord[];
	}>;
}): ProjectCosting {
	let totalBaseCost = 0;
	let totalChangeOrders = 0;
	let totalCurrentBudget = 0;
	let totalActualSpent = 0;

	const processedChapters: CostingChapter[] = project.chapters.map((ch) => {
		const base_cost = Math.max(0, ch.base_cost || 0);
		const change_orders_cost = Math.max(0, ch.change_orders_cost || 0);
		const current_budget = base_cost + change_orders_cost;

		const expenses = Array.isArray(ch.expenses) ? ch.expenses : [];
		const actual_spent = expenses.reduce((sum, exp) => sum + (Number(exp.amount) || 0), 0);
		const variance = current_budget - actual_spent;
		const utilization_pct = current_budget > 0 ? (actual_spent / current_budget) * 100 : 0;
		const status = getUtilizationStatus(utilization_pct);

		totalBaseCost += base_cost;
		totalChangeOrders += change_orders_cost;
		totalCurrentBudget += current_budget;
		totalActualSpent += actual_spent;

		return {
			chapter_id: ch.chapter_id,
			name: ch.name,
			order_index: ch.order_index,
			base_cost,
			change_orders_cost,
			current_budget,
			actual_spent,
			variance,
			utilization_pct: Math.round(utilization_pct * 10) / 10,
			status,
			expenses
		};
	});

	const remaining_balance = totalCurrentBudget - totalActualSpent;
	const budget_utilization_pct =
		totalCurrentBudget > 0 ? Math.round((totalActualSpent / totalCurrentBudget) * 1000) / 10 : 0;

	// Margen Proyectado: (Precio de Venta Contratado - Costo Presupuestado Vigente) / Precio de Venta
	// Margen Real Actual: (Precio de Venta Contratado - Costo Real Gastado) / Precio de Venta
	const targetSale = project.target_sale_price || totalCurrentBudget * 1.35; // Fallback 35% margen
	const projectedProfit = targetSale - totalCurrentBudget;
	const projected_margin_pct =
		targetSale > 0 ? Math.round((projectedProfit / targetSale) * 1000) / 10 : 0;

	const actualProfit = targetSale - totalActualSpent;
	const actual_current_margin_pct =
		targetSale > 0 ? Math.round((actualProfit / targetSale) * 1000) / 10 : 0;

	return {
		project_id: project.project_id,
		title: project.title,
		client_name: project.client_name,
		address: project.address,
		status: project.status,
		target_sale_price: targetSale,
		total_budget_direct_cost: totalBaseCost,
		approved_change_orders_cost: totalChangeOrders,
		current_budget_cost: totalCurrentBudget,
		actual_spent_cost: totalActualSpent,
		remaining_balance,
		budget_utilization_pct,
		projected_margin_pct,
		actual_current_margin_pct,
		updated_at: new Date().toISOString(),
		chapters: processedChapters
	};
}

// Generador de Recibos SVG realistas autocontenidos (sin dependencias externas)
export function generateReceiptSvg(vendor: string, amount: number, concept: string, date: string): string {
	const formattedAmount = new Intl.NumberFormat('es-CO', {
		style: 'currency',
		currency: 'COP',
		maximumFractionDigits: 0
	}).format(amount);

	const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 560" width="100%" height="100%">
		<defs>
			<filter id="paper-shadow" x="-5%" y="-5%" width="110%" height="110%">
				<feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#0F172A" flood-opacity="0.12"/>
			</filter>
		</defs>
		<rect width="380" height="540" x="10" y="10" rx="6" fill="#FFFDF8" stroke="#E2E8F0" stroke-width="1.5" filter="url(#paper-shadow)"/>
		<path d="M 10 20 L 25 10 L 40 20 L 55 10 L 70 20 L 85 10 L 100 20 L 115 10 L 130 20 L 145 10 L 160 20 L 175 10 L 190 20 L 205 10 L 220 20 L 235 10 L 250 20 L 265 10 L 280 20 L 295 10 L 310 20 L 325 10 L 340 20 L 355 10 L 370 20 L 385 10 L 390 15 L 390 535 L 375 545 L 360 535 L 345 545 L 330 535 L 315 545 L 300 535 L 285 545 L 270 535 L 255 545 L 240 535 L 225 545 L 210 535 L 195 545 L 180 535 L 165 545 L 150 535 L 135 545 L 120 535 L 105 545 L 90 535 L 75 545 L 60 535 L 45 545 L 30 535 L 15 545 L 10 540 Z" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="1"/>
		<g font-family="monospace" fill="#1E293B">
			<text x="200" y="55" font-size="16" font-weight="bold" text-anchor="middle" letter-spacing="1">${vendor.toUpperCase()}</text>
			<text x="200" y="75" font-size="11" text-anchor="middle" fill="#64748B">NIT: 900.518.231-1 • RÉGIMEN COMÚN</text>
			<text x="200" y="92" font-size="10" text-anchor="middle" fill="#94A3B8">RECIBO DE CAJA / COMPROBANTE DE COMPRA</text>
			<line x1="30" y1="105" x2="370" y2="105" stroke="#94A3B8" stroke-dasharray="4 4" stroke-width="1"/>
			<text x="35" y="130" font-size="11" fill="#475569">FECHA:</text>
			<text x="365" y="130" font-size="11" font-weight="bold" text-anchor="end">${date}</text>
			<text x="35" y="150" font-size="11" fill="#475569">HORA:</text>
			<text x="365" y="150" font-size="11" text-anchor="end">14:32:08 COT</text>
			<text x="35" y="170" font-size="11" fill="#475569">OBRA:</text>
			<text x="365" y="170" font-size="11" font-weight="bold" text-anchor="end">PENTHOUSE EL POBLADO</text>
			<line x1="30" y1="190" x2="370" y2="190" stroke="#CBD5E1" stroke-width="1"/>
			<text x="35" y="215" font-size="11" font-weight="bold">DESCRIPCIÓN DEL GASTO</text>
			<text x="365" y="215" font-size="11" font-weight="bold" text-anchor="end">VALOR</text>
			<line x1="30" y1="225" x2="370" y2="225" stroke="#CBD5E1" stroke-width="1"/>
			<text x="35" y="255" font-size="12" font-weight="bold" fill="#0F172A">${concept}</text>
			<text x="35" y="275" font-size="10" fill="#64748B">IMPUTACIÓN DIRECTA A CAPÍTULO DE OBRA</text>
			<text x="365" y="255" font-size="13" font-weight="bold" text-anchor="end" fill="#0F172A">${formattedAmount}</text>
			<line x1="30" y1="360" x2="370" y2="360" stroke="#94A3B8" stroke-dasharray="4 4" stroke-width="1"/>
			<text x="35" y="390" font-size="13" font-weight="bold">TOTAL PAGADO:</text>
			<text x="365" y="390" font-size="16" font-weight="bold" text-anchor="end" fill="#059669">${formattedAmount}</text>
			<text x="35" y="415" font-size="10" fill="#64748B">FORMA DE PAGO: TRANSFERENCIA INMEDIATA</text>
			<g transform="translate(100, 440)">
				<rect width="200" height="42" fill="#F1F5F9" rx="4" stroke="#CBD5E1"/>
				<text x="100" y="25" font-size="11" font-weight="bold" text-anchor="middle" fill="#334155">✓ VERIFICADO EN CAMPO</text>
			</g>
			<text x="200" y="515" font-size="9" text-anchor="middle" fill="#94A3B8">DOCUMENTO SOPORTE AUDITABLE • OBRAFLOW SAAS</text>
		</g>
	</svg>`;

	return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

// Datos Semilla Realistas para HU-13 (Penthouse El Poblado)
export const INITIAL_DEMO_PROJECT: ProjectCosting = calculateProjectCosting({
	project_id: 'proj_andina_001',
	title: 'Remodelación Penthouse El Poblado',
	client_name: 'Dr. Andrés Restrepo',
	address: 'Cra. 32 # 9 Sur - 45, Medellín',
	status: 'active',
	target_sale_price: 64500000, // Precio de venta comercial contratado
	chapters: [
		{
			chapter_id: 'chap_01',
			name: '01. Demoliciones y Retiro de Escombros',
			order_index: 1,
			base_cost: 4500000,
			change_orders_cost: 0,
			expenses: [
				{
					id: 'exp_01_1',
					chapter_id: 'chap_01',
					date: '2026-11-04',
					concept: 'Volqueta retiro de escombros (3 viajes)',
					category: 'subcontract',
					registered_by: 'Carlos Mendoza (Residente)',
					amount: 1800000,
					receipt_url: generateReceiptSvg(
						'Transportes & Escombros Andina',
						1800000,
						'Volqueta retiro 3 viajes',
						'2026-11-04'
					),
					vendor: 'Transportes & Escombros Andina',
					notes: 'Descarga autorizada en escombrera San Antonio',
					created_at: '2026-11-04T15:30:00Z'
				},
				{
					id: 'exp_01_2',
					chapter_id: 'chap_01',
					date: '2026-11-07',
					concept: 'Cuadrilla demolición muros divisorios (Semana 1)',
					category: 'labor',
					registered_by: 'Carlos Mendoza (Residente)',
					amount: 2400000,
					receipt_url: generateReceiptSvg(
						'Ferretería & Cuadrillas El Martillo',
						2400000,
						'Jornales cuadrilla demolición 4 oficiales',
						'2026-11-07'
					),
					vendor: 'Cuadrilla Hermanos Gómez',
					notes: 'Incluye pago de seguridad social parafiscales',
					created_at: '2026-11-07T18:00:00Z'
				}
			]
		},
		{
			chapter_id: 'chap_02',
			name: '02. Redes Hidráulicas y Sanitarias',
			order_index: 2,
			base_cost: 8200000,
			change_orders_cost: 1200000, // Orden de Cambio #1 aprobada
			expenses: [
				{
					id: 'exp_02_1',
					chapter_id: 'chap_02',
					date: '2026-11-10',
					concept: 'Tubería Pavco RDE 9 y accesorios CPVC',
					category: 'material',
					registered_by: 'Carlos Mendoza (Residente)',
					amount: 4350000,
					receipt_url: generateReceiptSvg(
						'Homecenter San Fernando',
						4350000,
						'Tubería PVC presión y sanitaria 3 y 4 pulg',
						'2026-11-10'
					),
					vendor: 'Sodimac Corona Homecenter',
					notes: 'Factura electrónica FE-882910',
					created_at: '2026-11-10T11:20:00Z'
				},
				{
					id: 'exp_02_2',
					chapter_id: 'chap_02',
					date: '2026-11-14',
					concept: 'Mano de obra plomería hidrosanitaria',
					category: 'labor',
					registered_by: 'Carlos Mendoza (Residente)',
					amount: 3200000,
					receipt_url: generateReceiptSvg(
						'Servicios Hidrosanitarios del Valle',
						3200000,
						'Avance plomería baños y cocina',
						'2026-11-14'
					),
					vendor: 'Instalaciones Hidráulicas SAS',
					notes: 'Prueba de presión manométrica a 100 PSI exitosa',
					created_at: '2026-11-14T17:45:00Z'
				},
				{
					id: 'exp_02_3',
					chapter_id: 'chap_02',
					date: '2026-11-18',
					concept: 'Reubicación imprevista de montante general (Sobrecosto)',
					category: 'material',
					registered_by: 'Carlos Mendoza (Residente)',
					amount: 2400000,
					receipt_url: generateReceiptSvg(
						'Distribuidora Hidroflow Medellín',
						2400000,
						'Abrazaderas de anclaje, cheques y codos 90',
						'2026-11-18'
					),
					vendor: 'Hidroflow Medellín',
					notes: 'Intervención de emergencia solicitada en obra',
					created_at: '2026-11-18T09:15:00Z'
				}
			]
		},
		{
			chapter_id: 'chap_03',
			name: '03. Enchapes y Revestimientos Porcelánicos',
			order_index: 3,
			base_cost: 16500000,
			change_orders_cost: 2300000, // Orden de Cambio #2 aprobada
			expenses: [
				{
					id: 'exp_03_1',
					chapter_id: 'chap_03',
					date: '2026-11-12',
					concept: 'Porcelanato Calacatta Gold 60x120 (140 m2)',
					category: 'material',
					registered_by: 'Carlos Mendoza (Residente)',
					amount: 8900000,
					receipt_url: generateReceiptSvg(
						'Alfa Cerámicas & Acabados',
						8900000,
						'Porcelanato rectificado 60x120 lote 4',
						'2026-11-12'
					),
					vendor: 'Alfa Cerámicas SAS',
					notes: 'Entrega en obra piso 14 Penthouse',
					created_at: '2026-11-12T14:00:00Z'
				},
				{
					id: 'exp_03_2',
					chapter_id: 'chap_03',
					date: '2026-11-15',
					concept: 'Pegacor blanco flexible (45 bultos) y boquilla',
					category: 'material',
					registered_by: 'Carlos Mendoza (Residente)',
					amount: 3500000,
					receipt_url: generateReceiptSvg(
						'Ferretería El Maestro Poblado',
						3500000,
						'Pegacor flexible Corona y separadores 2mm',
						'2026-11-15'
					),
					vendor: 'Ferretería El Maestro',
					notes: 'Descarga con malacate de fachada',
					created_at: '2026-11-15T10:30:00Z'
				}
			]
		},
		{
			chapter_id: 'chap_04',
			name: '04. Carpintería Arquitectónica y Acabados',
			order_index: 4,
			base_cost: 15800000,
			change_orders_cost: 0,
			expenses: [
				{
					id: 'exp_04_1',
					chapter_id: 'chap_04',
					date: '2026-11-19',
					concept: 'Anticipo 30% fabricación puertas entableradas en roble',
					category: 'subcontract',
					registered_by: 'Carlos Mendoza (Residente)',
					amount: 3800000,
					receipt_url: generateReceiptSvg(
						'Mobiliario & Diseños Rústicos SAS',
						3800000,
						'Anticipo carpintería puertas y marcos',
						'2026-11-19'
					),
					vendor: 'Mobiliario & Diseños Rústicos SAS',
					notes: 'Taller San Antonio de Pereira',
					created_at: '2026-11-19T16:10:00Z'
				}
			]
		}
	]
});

// Segundo proyecto demo para validar selector multi-proyecto
export const SECOND_DEMO_PROJECT: ProjectCosting = calculateProjectCosting({
	project_id: 'proj_andina_002',
	title: 'Adecuación Oficinas Coworking Laureles',
	client_name: 'Inversiones Nova SAS',
	address: 'Circular 4 # 73 - 18, Medellín',
	status: 'active',
	target_sale_price: 38000000,
	chapters: [
		{
			chapter_id: 'chap_02_1',
			name: '01. Drywall y Divisiones en Vidrio Templado',
			order_index: 1,
			base_cost: 14000000,
			change_orders_cost: 1500000,
			expenses: [
				{
					id: 'exp_nov_1',
					chapter_id: 'chap_02_1',
					date: '2026-11-16',
					concept: 'Perfiles estructurales y placas Gyplac yeso',
					category: 'material',
					registered_by: 'Carlos Mendoza (Residente)',
					amount: 6200000,
					receipt_url: generateReceiptSvg(
						'Distribuidora Drywall Antioquia',
						6200000,
						'Perfiles cal 26 y placas 1/2 pulgada',
						'2026-11-16'
					),
					vendor: 'Distribuidora Drywall Antioquia',
					notes: 'Remisión #1044',
					created_at: '2026-11-16T11:00:00Z'
				}
			]
		},
		{
			chapter_id: 'chap_02_2',
			name: '02. Redes Eléctricas e Iluminación LED',
			order_index: 2,
			base_cost: 11000000,
			change_orders_cost: 0,
			expenses: [
				{
					id: 'exp_nov_2',
					chapter_id: 'chap_02_2',
					date: '2026-11-17',
					concept: 'Cableado estructurado Cat 6A y paneles LED',
					category: 'material',
					registered_by: 'Carlos Mendoza (Residente)',
					amount: 4800000,
					receipt_url: generateReceiptSvg(
						'Electroferretería La Candelaria',
						4800000,
						'Bobinas cable UTP y luminarias 60x60',
						'2026-11-17'
					),
					vendor: 'Electroferretería La Candelaria',
					notes: 'Certificación RETIE',
					created_at: '2026-11-17T14:40:00Z'
				}
			]
		}
	]
});

/**
 * Carga todos los proyectos almacenados o inicializa con los datos semilla.
 */
export function loadAllProjects(): ProjectCosting[] {
	if (typeof window === 'undefined') {
		return [INITIAL_DEMO_PROJECT, SECOND_DEMO_PROJECT];
	}

	try {
		const raw = localStorage.getItem(STORAGE_KEY_COSTING);
		if (!raw) {
			const initial = [INITIAL_DEMO_PROJECT, SECOND_DEMO_PROJECT];
			localStorage.setItem(STORAGE_KEY_COSTING, JSON.stringify(initial));
			return initial;
		}
		const parsed = JSON.parse(raw);
		if (Array.isArray(parsed) && parsed.length > 0) {
			return parsed.map((p) => calculateProjectCosting(p));
		}
	} catch (e) {
		console.error('Error cargando proyectos de Job Costing:', e);
	}

	const fallback = [INITIAL_DEMO_PROJECT, SECOND_DEMO_PROJECT];
	try {
		localStorage.setItem(STORAGE_KEY_COSTING, JSON.stringify(fallback));
	} catch (_) {}
	return fallback;
}

/**
 * Obtiene un proyecto específico por ID.
 */
export function getProjectById(projectId: string): ProjectCosting | null {
	const projects = loadAllProjects();
	const found = projects.find((p) => p.project_id === projectId);
	return found ? calculateProjectCosting(found) : null;
}

/**
 * Guarda o actualiza un proyecto en el almacenamiento de Job Costing.
 */
export function saveCostingProject(project: ProjectCosting): void {
	if (typeof window === 'undefined') return;
	const projects = loadAllProjects();
	const index = projects.findIndex((p) => p.project_id === project.project_id);
	if (index >= 0) {
		projects[index] = project;
	} else {
		projects.push(project);
	}
	localStorage.setItem(STORAGE_KEY_COSTING, JSON.stringify(projects));
	window.dispatchEvent(
		new CustomEvent('obraflow:project-updated', {
			detail: { project }
		})
	);
}

/**
 * Agrega un nuevo gasto a un capítulo y recalcula el proyecto completo en tiempo real.
 */
export function addExpenseToChapter(
	projectId: string,
	chapterId: string,
	expenseData: {
		concept: string;
		category: ExpenseCategory;
		registered_by: string;
		amount: number;
		vendor: string;
		receipt_url?: string;
		notes?: string;
		date?: string;
	}
): ProjectCosting | null {
	if (typeof window === 'undefined') return null;

	const projects = loadAllProjects();
	const projectIndex = projects.findIndex((p) => p.project_id === projectId);
	if (projectIndex === -1) return null;

	const project = projects[projectIndex];
	const chapterIndex = project.chapters.findIndex((c) => c.chapter_id === chapterId);
	if (chapterIndex === -1) return null;

	const today = new Date().toISOString().split('T')[0];
	const dateStr = expenseData.date || today;

	const receipt =
		expenseData.receipt_url ||
		generateReceiptSvg(
			expenseData.vendor || 'Proveedor de Obra',
			expenseData.amount,
			expenseData.concept,
			dateStr
		);

	const newExpense: ExpenseRecord = {
		id: `exp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
		chapter_id: chapterId,
		date: dateStr,
		concept: expenseData.concept.trim(),
		category: expenseData.category,
		registered_by: expenseData.registered_by.trim() || 'Carlos Mendoza (Residente)',
		amount: Math.max(0, Number(expenseData.amount) || 0),
		receipt_url: receipt,
		vendor: expenseData.vendor.trim() || 'Proveedor Local',
		notes: expenseData.notes?.trim() || '',
		created_at: new Date().toISOString()
	};

	project.chapters[chapterIndex].expenses.unshift(newExpense);

	const recalculated = calculateProjectCosting(project);
	projects[projectIndex] = recalculated;

	localStorage.setItem(STORAGE_KEY_COSTING, JSON.stringify(projects));

	// Despachar evento para sincronización reactiva de UI
	window.dispatchEvent(
		new CustomEvent('obraflow:expense-added', {
			detail: { projectId, chapterId, expense: newExpense, project: recalculated }
		})
	);

	return recalculated;
}

/**
 * Restablece los datos de demo al estado inicial.
 */
export function resetDemoCostingData(): ProjectCosting[] {
	if (typeof window === 'undefined') return [INITIAL_DEMO_PROJECT, SECOND_DEMO_PROJECT];
	const initial = [INITIAL_DEMO_PROJECT, SECOND_DEMO_PROJECT];
	localStorage.setItem(STORAGE_KEY_COSTING, JSON.stringify(initial));
	window.dispatchEvent(new CustomEvent('obraflow:costing-reset'));
	return initial;
}
