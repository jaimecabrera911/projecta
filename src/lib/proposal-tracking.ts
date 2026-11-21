// src/lib/proposal-tracking.ts
// HU-10: tracking de lectura de propuestas comerciales (Magic Link + auditoría local).

export const PROPOSAL_VIEWS_KEY = 'obraflow_proposal_views';
export const PROPOSAL_TOKENS_KEY = 'obraflow_proposal_tokens';

export interface ProposalViewEvent {
	id: string;
	proposal_token: string;
	budget_id: string;
	lead_id?: string;
	viewed_at: string;
	user_agent?: string;
	screen_resolution?: string;
	referrer?: string;
	device_label?: string;
}

export interface ProposalTokenRecord {
	token: string;
	budget_id: string;
	lead_id?: string;
	created_at: string;
}

function safeParse<T>(raw: string | null, fallback: T): T {
	if (!raw) return fallback;
	try {
		return JSON.parse(raw) as T;
	} catch (_) {
		return fallback;
	}
}

function uid(prefix: string): string {
	if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
		return `${prefix}_${crypto.randomUUID()}`;
	}
	return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

export function loadProposalTokens(): ProposalTokenRecord[] {
	const parsed = safeParse<unknown>(localStorage.getItem(PROPOSAL_TOKENS_KEY), []);
	return Array.isArray(parsed) ? (parsed as ProposalTokenRecord[]) : [];
}

export function saveProposalTokens(records: ProposalTokenRecord[]) {
	localStorage.setItem(PROPOSAL_TOKENS_KEY, JSON.stringify(records));
}

export function getOrCreateProposalToken(budgetId: string, leadId?: string): ProposalTokenRecord {
	const tokens = loadProposalTokens();
	const existing = tokens.find((t) => t.budget_id === budgetId);
	if (existing) {
		if (leadId && !existing.lead_id) {
			existing.lead_id = leadId;
			saveProposalTokens(tokens);
		}
		return existing;
	}
	const record: ProposalTokenRecord = {
		token: uid('ptk'),
		budget_id: budgetId,
		lead_id: leadId,
		created_at: new Date().toISOString()
	};
	tokens.unshift(record);
	saveProposalTokens(tokens);
	return record;
}

export function findProposalToken(token: string | null | undefined): ProposalTokenRecord | null {
	if (!token) return null;
	return loadProposalTokens().find((t) => t.token === token) ?? null;
}

export function loadProposalViews(): ProposalViewEvent[] {
	const parsed = safeParse<unknown>(localStorage.getItem(PROPOSAL_VIEWS_KEY), []);
	return Array.isArray(parsed) ? (parsed as ProposalViewEvent[]) : [];
}

export function saveProposalViews(events: ProposalViewEvent[]) {
	localStorage.setItem(PROPOSAL_VIEWS_KEY, JSON.stringify(events));
}

export function detectDeviceLabel(userAgent?: string): string {
	const ua = (userAgent || '').toLowerCase();
	if (!ua) return 'Dispositivo desconocido';
	const isIphone = ua.includes('iphone');
	const isIpad = ua.includes('ipad') || (ua.includes('macintosh') && ua.includes('mobile'));
	const isAndroid = ua.includes('android');
	const isMobile = isIphone || isIpad || isAndroid || ua.includes('mobile');

	let os = 'Dispositivo';
	if (isIphone) os = 'iPhone';
	else if (isIpad) os = 'iPad';
	else if (isAndroid) os = 'Android';
	else if (ua.includes('mac os x') || ua.includes('macintosh')) os = 'Mac';
	else if (ua.includes('windows')) os = 'Windows';
	else if (ua.includes('linux')) os = 'Linux';

	let browser = 'Navegador';
	if (ua.includes('edg/')) browser = 'Edge';
	else if (ua.includes('opr/') || ua.includes('opera')) browser = 'Opera';
	else if (ua.includes('chrome/') && !ua.includes('edg/')) browser = 'Chrome';
	else if (ua.includes('safari/') && !ua.includes('chrome/')) browser = 'Safari';
	else if (ua.includes('firefox/')) browser = 'Firefox';

	if (isMobile && (os === 'iPhone' || os === 'iPad') && browser === 'Safari') return `${os} / iOS Safari`;
	if (isMobile && os === 'Android' && browser === 'Chrome') return 'Android / Chrome';
	if (!isMobile) return `${os} Desktop / ${browser}`;
	return `${os} / ${browser}`;
}

export interface TrackProposalViewInput {
	token: string;
	budget_id: string;
	lead_id?: string;
	screen_resolution?: string;
	referrer?: string;
	user_agent?: string;
}

export function recordProposalView(input: TrackProposalViewInput): ProposalViewEvent {
	const views = loadProposalViews();
	const event: ProposalViewEvent = {
		id: uid('pvw'),
		proposal_token: input.token,
		budget_id: input.budget_id,
		lead_id: input.lead_id,
		viewed_at: new Date().toISOString(),
		user_agent: input.user_agent || (typeof navigator !== 'undefined' ? navigator.userAgent : undefined),
		screen_resolution: input.screen_resolution || (typeof window !== 'undefined' ? `${window.screen.width}x${window.screen.height}` : undefined),
		referrer: input.referrer ?? (typeof document !== 'undefined' ? document.referrer : undefined),
		device_label: detectDeviceLabel(input.user_agent || (typeof navigator !== 'undefined' ? navigator.userAgent : undefined))
	};
	views.unshift(event);
	saveProposalViews(views);
	return event;
}

export function getProposalViewsForBudget(budgetId: string): ProposalViewEvent[] {
	return loadProposalViews().filter((v) => v.budget_id === budgetId);
}

export function getProposalViewsForLead(leadId: string): ProposalViewEvent[] {
	return loadProposalViews().filter((v) => v.lead_id === leadId);
}

export function getProposalViewSummary(budgetId: string) {
	const views = getProposalViewsForBudget(budgetId);
	const count = views.length;
	const last = views[0] ?? null;
	const first = views.length > 0 ? views[views.length - 1] : null;
	return { count, last, first, views };
}

export function formatRelativeShort(isoDate?: string): string {
	if (!isoDate) return 'hace un momento';
	const diffMs = Date.now() - new Date(isoDate).getTime();
	if (!Number.isFinite(diffMs) || diffMs < 0) return 'hace un momento';
	const min = Math.floor(diffMs / 60000);
	if (min < 1) return 'hace un momento';
	if (min < 60) return `hace ${min} min`;
	const hrs = Math.floor(min / 60);
	if (hrs < 24) return `hace ${hrs} h`;
	const days = Math.floor(hrs / 24);
	return `hace ${days} d`;
}

export function formatDateTimeEs(isoDate?: string): string {
	if (!isoDate) return '';
	const d = new Date(isoDate);
	if (Number.isNaN(d.getTime())) return isoDate;
	return d.toLocaleString('es-CO', {
		day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true
	});
}

export function buildProposalShareUrl(token: string, origin?: string): string {
	const base = origin || (typeof window !== 'undefined' ? window.location.origin : '');
	return `${base}/proposals/view?t=${encodeURIComponent(token)}`;
}
