// src/lib/catalog.ts
// Catálogo maestro compartido entre HU-05 (CRUD) y HU-06 (selector de partidas).

export type CatalogCategory = 'material' | 'labor' | 'subcontract' | 'equipment';

export interface CatalogItem {
	id: string;
	code?: string;
	name: string;
	category: CatalogCategory;
	unit: string;
	unit_cost: number;
	suggested_supplier?: string;
	notes?: string;
	created_at: string;
	updated_at?: string;
}

export const DEFAULT_CATALOG_ITEMS: CatalogItem[] = [
	{
		id: 'cat_01',
		code: 'M-01',
		name: 'Cemento Gris Argos Tipo UG (bulto 50kg)',
		category: 'material',
		unit: 'un',
		unit_cost: 34500,
		suggested_supplier: 'Construrama / Homecenter',
		notes: 'Cemento estructural para mampostería, pañete y morteros de pega',
		created_at: new Date(Date.now() - 30 * 86400000).toISOString()
	},
	{
		id: 'cat_02',
		code: 'M-02',
		name: 'Arena de revoque lavada',
		category: 'material',
		unit: 'm³',
		unit_cost: 85000,
		suggested_supplier: 'Cantera Río Claro',
		notes: 'Arena fina de peña lavada libre de materia orgánica y arcilla',
		created_at: new Date(Date.now() - 30 * 86400000).toISOString()
	},
	{
		id: 'cat_03',
		code: 'M-03',
		name: 'Ladrillo tolete común 6x12x24cm',
		category: 'material',
		unit: 'un',
		unit_cost: 1450,
		suggested_supplier: 'Ladrillera Santafé',
		notes: 'Para mampostería no estructural, antepechos y divisiones interiores',
		created_at: new Date(Date.now() - 30 * 86400000).toISOString()
	},
	{
		id: 'cat_04',
		code: 'M-04',
		name: 'Placa Drywall Yeso Gyplac 1/2 pulgada (1.22x2.44m)',
		category: 'material',
		unit: 'un',
		unit_cost: 48900,
		suggested_supplier: 'Drywall Medellín SAS',
		notes: 'Placa estándar para cielo rasos suspendidos y muros divisorios',
		created_at: new Date(Date.now() - 30 * 86400000).toISOString()
	},
	{
		id: 'cat_05',
		code: 'M-05',
		name: 'Perfil Omega galvanizado Calibre 26 (2.44m)',
		category: 'material',
		unit: 'un',
		unit_cost: 9800,
		suggested_supplier: 'Almapac / Acesco',
		notes: 'Estructuración metálica para fijación de placas de yeso',
		created_at: new Date(Date.now() - 30 * 86400000).toISOString()
	},
	{
		id: 'cat_06',
		code: 'M-06',
		name: 'Pintura Vinilo Tipo 1 Blanco Superlavable (cuñete 5 gal)',
		category: 'material',
		unit: 'gl',
		unit_cost: 68000,
		suggested_supplier: 'Pintuco / Corona',
		notes: 'Máximo cubrimiento y lavabilidad en muros y cielos interiores',
		created_at: new Date(Date.now() - 30 * 86400000).toISOString()
	},
	{
		id: 'cat_07',
		code: 'M-07',
		name: 'Cerámica Corona 30x60cm tráfico medio',
		category: 'material',
		unit: 'm²',
		unit_cost: 46500,
		suggested_supplier: 'Almacenes Corona',
		notes: 'Enchape para pisos y muros de baño y cocina, acabado satinado',
		created_at: new Date(Date.now() - 30 * 86400000).toISOString()
	},
	{
		id: 'cat_08',
		code: 'M-08',
		name: 'Pegacor Blanco Corona (bulto 25kg)',
		category: 'material',
		unit: 'un',
		unit_cost: 29800,
		suggested_supplier: 'Corona',
		notes: 'Mortero adhesivo modificado con polímeros para cerámica y porcelanato',
		created_at: new Date(Date.now() - 30 * 86400000).toISOString()
	},
	{
		id: 'cat_09',
		code: 'M-09',
		name: 'Tubo PVC Sanitario 3 pulgadas Pavco (3m)',
		category: 'material',
		unit: 'ml',
		unit_cost: 14200,
		suggested_supplier: 'Pavco Wavin',
		notes: 'Desagües de aguas servidas, sifones y bajantes de aguas negras',
		created_at: new Date(Date.now() - 30 * 86400000).toISOString()
	},
	{
		id: 'cat_10',
		code: 'M-10',
		name: 'Cable de cobre THHN Calibre 12 AWG',
		category: 'material',
		unit: 'ml',
		unit_cost: 3200,
		suggested_supplier: 'Centelsa / Procables',
		notes: 'Conductor de cobre para circuitos ramales de iluminación y tomacorrientes',
		created_at: new Date(Date.now() - 30 * 86400000).toISOString()
	},
	{
		id: 'cat_11',
		code: 'L-01',
		name: 'Cuadrilla Oficial + Ayudante (jornal día)',
		category: 'labor',
		unit: 'día',
		unit_cost: 175000,
		suggested_supplier: 'Cuadrilla Directa',
		notes: 'Jornal diario con prestaciones y seguridad social al día',
		created_at: new Date(Date.now() - 30 * 86400000).toISOString()
	},
	{
		id: 'cat_12',
		code: 'L-02',
		name: 'Mano de obra mampostería en ladrillo tolete',
		category: 'labor',
		unit: 'm²',
		unit_cost: 28000,
		suggested_supplier: 'Maestro de Obra',
		notes: 'Incluye plomada, nivelación y preparación de mortero',
		created_at: new Date(Date.now() - 30 * 86400000).toISOString()
	},
	{
		id: 'cat_13',
		code: 'L-03',
		name: 'Mano de obra pañete / revoque liso en muros',
		category: 'labor',
		unit: 'm²',
		unit_cost: 16500,
		suggested_supplier: 'Cuadrilla Acabados',
		notes: 'Espesor 1.5 cm incluye filos, dilataciones y codaleado',
		created_at: new Date(Date.now() - 30 * 86400000).toISOString()
	},
	{
		id: 'cat_14',
		code: 'L-04',
		name: 'Mano de obra pintura vinilo 2 manos en muros',
		category: 'labor',
		unit: 'm²',
		unit_cost: 7500,
		suggested_supplier: 'Pintores Especializados',
		notes: 'Incluye lijado, limpieza de superficie y protección de zócalos',
		created_at: new Date(Date.now() - 30 * 86400000).toISOString()
	},
	{
		id: 'cat_15',
		code: 'L-05',
		name: 'Mano de obra instalación piso o muro cerámico',
		category: 'labor',
		unit: 'm²',
		unit_cost: 26000,
		suggested_supplier: 'Enchapador Calificado',
		notes: 'Incluye colocación con separadores, cortes inglete y emboquillado',
		created_at: new Date(Date.now() - 30 * 86400000).toISOString()
	},
	{
		id: 'cat_16',
		code: 'L-06',
		name: 'Mano de obra instalación punto eléctrico tomas/luz',
		category: 'labor',
		unit: 'pto',
		unit_cost: 38000,
		suggested_supplier: 'Electricista Matriculado',
		notes: 'Incluye regata, tubería conduit, cableado y montaje de mecanismo',
		created_at: new Date(Date.now() - 30 * 86400000).toISOString()
	},
	{
		id: 'cat_17',
		code: 'S-01',
		name: 'Suministro e instalación cocina integral granito San Gabriel',
		category: 'subcontract',
		unit: 'ml',
		unit_cost: 1450000,
		suggested_supplier: 'Mármoles & Cocinas del Valle',
		notes: 'Mueble superior e inferior en aglomerado RH de 15mm y mesón en granito natural',
		created_at: new Date(Date.now() - 30 * 86400000).toISOString()
	},
	{
		id: 'cat_18',
		code: 'S-02',
		name: 'División de baño en vidrio templado 8mm con acero',
		category: 'subcontract',
		unit: 'un',
		unit_cost: 680000,
		suggested_supplier: 'Vidrios & Diseños Andina',
		notes: 'Vidrio templado incoloro con accesorios y riel superior en acero inoxidable 304',
		created_at: new Date(Date.now() - 30 * 86400000).toISOString()
	},
	{
		id: 'cat_19',
		code: 'S-03',
		name: 'Retiro y disposición final de escombros en botadero',
		category: 'subcontract',
		unit: 'viaje',
		unit_cost: 240000,
		suggested_supplier: 'Transportes Volqueta SAS',
		notes: 'Volqueta sencilla de 6 m³ con certificado de disposición en escombrera legal',
		created_at: new Date(Date.now() - 30 * 86400000).toISOString()
	},
	{
		id: 'cat_20',
		code: 'E-01',
		name: 'Alquiler taladro demoledor SDS Max 11kg (por día)',
		category: 'equipment',
		unit: 'día',
		unit_cost: 65000,
		suggested_supplier: 'Alquiequipos de Colombia',
		notes: 'Equipo eléctrico de alto impacto con cincel y punta incluidos',
		created_at: new Date(Date.now() - 30 * 86400000).toISOString()
	},
	{
		id: 'cat_21',
		code: 'E-02',
		name: 'Alquiler cuerpo de andamio tubular certificado (por día)',
		category: 'equipment',
		unit: 'día',
		unit_cost: 12000,
		suggested_supplier: 'Andamios Seguridad SAS',
		notes: 'Incluye 2 marcos de 1.5x2.0m, 2 crucetas y 2 plataformas metálicas antideslizantes',
		created_at: new Date(Date.now() - 30 * 86400000).toISOString()
	}
];

// Persistence Helpers
export function loadCatalog(): CatalogItem[] {
	try {
		const raw = localStorage.getItem('obraflow_catalog_items');
		if (raw) {
			const parsed = JSON.parse(raw);
			if (Array.isArray(parsed) && parsed.length > 0) {
				return parsed;
			}
		}
	} catch (_) {}
	// Automatically Seed Default Catalog
	saveCatalog(DEFAULT_CATALOG_ITEMS);
	return [...DEFAULT_CATALOG_ITEMS];
}

export function saveCatalog(items: CatalogItem[]) {
	try {
		localStorage.setItem('obraflow_catalog_items', JSON.stringify(items));
	} catch (_) {}
}
