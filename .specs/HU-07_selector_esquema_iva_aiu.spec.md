# SPECIFICATION: HU-07
# Selector de Esquema Fiscal Transparente (IVA vs AIU LATAM)

@modulo: Módulo 1 - Catálogo de Costos y Constructor de Presupuestos
@id: HU-07
@rol: Contratista / Administrador
@prioridad: Must Have (P0)
@estimacion: 5 Story Points
@estado: Ready for Implementation
@trazabilidad: PRD: RF-014 | SRS: 1.1 (BudgetEngine), 3.1 (budgets.tax_scheme)

--------------------------------------------------------------------------------
## 1. NARRATIVA DE USUARIO
--------------------------------------------------------------------------------
COMO: Contratista general en Colombia o Latinoamérica
QUIERO: Alternar con un selector entre el régimen tradicional de IVA o el régimen contractual AIU (Administración, Imprevistos, Utilidad)
PARA: Cotizar legalmente obras civiles donde el impuesto a las ventas se liquida única y exclusivamente sobre el componente de Utilidad.

--------------------------------------------------------------------------------
## 2. ESPECIFICACIÓN UX/UI
--------------------------------------------------------------------------------
2.1 Selector de Régimen (Segmented Control):
    - Selector visible en la barra lateral de configuración del presupuesto:
      [Régimen General IVA]  |  [Esquema AIU de Obra]

2.2 Controles Paramétricos del Esquema AIU:
    Al seleccionar AIU, se despliega una tarjeta con 4 inputs numéricos porcentuales:
    - Administración (% A): Predeterminado `10.00%`
    - Imprevistos (% I): Predeterminado `5.00%`
    - Utilidad (% U): Predeterminado `5.00%`
    - IVA sobre Utilidad (% IVA): Predeterminado `19.00%`

2.3 Tarjeta de Desglose Matemático Didáctico:
    Muestra en tiempo real la liquidación tributaria para evitar errores antes de emitir la oferta:
    - (+) Costo Directo Total (CD): Base de materiales, mano de obra y equipos
    - (+) Administración (A% sobre CD)
    - (+) Imprevistos (I% sobre CD)
    - (+) Utilidad (U% sobre CD)
    - (=) Subtotal AIU
    - (+) IVA (19% aplicado exclusivamente sobre el valor de la Utilidad)
    - (=) Total Contrato de Obra

--------------------------------------------------------------------------------
## 3. FÓRMULAS DE CÁLCULO Y CONTRATO
--------------------------------------------------------------------------------
Reglas Matemáticas AIU:
- `total_direct_cost = SUM(partidas.subtotal_direct_cost)`
- `admin_amount = total_direct_cost * (admin_percentage / 100)`
- `contingency_amount = total_direct_cost * (contingency_percentage / 100)`
- `utility_amount = total_direct_cost * (utility_percentage / 100)`
- `total_sale_price = total_direct_cost + admin_amount + contingency_amount + utility_amount`
- `total_tax = utility_amount * (vat_percentage / 100)`
- `grand_total = total_sale_price + total_tax`

Payload PATCH /api/v1/budgets/{id}/tax-scheme:
```json
{
  "tax_scheme": "AIU",
  "admin_percentage": 10.00,
  "contingency_percentage": 5.00,
  "utility_percentage": 5.00,
  "vat_percentage": 19.00
}
```

--------------------------------------------------------------------------------
## 4. CRITERIOS DE ACEPTACIÓN (GHERKIN SCENARIOS)
--------------------------------------------------------------------------------
```gherkin
Feature: Motor Tributario Dual IVA vs AIU

  Scenario: Liquidación exacta bajo esquema AIU de contrato civil
    Given un presupuesto con Costo Directo Total de $10,000.00
    When el usuario activa el esquema "AIU" con:
      | admin_percentage       | 10.00 |
      | contingency_percentage | 5.00  |
      | utility_percentage     | 5.00  |
      | vat_percentage         | 19.00 |
    Then la Administración se calcula exactamente en $1,000.00
    And los Imprevistos se calculan en $500.00
    And la Utilidad se calcula en $500.00
    And el IVA sobre la Utilidad se calcula en $95.00 ($500 * 19%)
    And el Gran Total del contrato se liquida en $12,095.00.

  Scenario: Cambio a régimen de IVA general
    Given un presupuesto configurado en AIU
    When el usuario cambia el selector a "Régimen General IVA" con IVA=19%
    Then el IVA se calcula sobre el Subtotal completo de venta
    And la tarjeta descriptiva de AIU se oculta de la interfaz.
```
