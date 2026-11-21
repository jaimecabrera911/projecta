# SPECIFICATION: HU-13
# Matriz Financiera en Vivo de Presupuesto vs Real (Job Costing)

@modulo: Módulo 3 - Control de Costos (Job Costing) y Órdenes de Cambio
@id: HU-13
@rol: Administrador / Dueño de Empresa
@prioridad: Must Have (P0)
@estimacion: 8 Story Points
@estado: Ready for Implementation
@trazabilidad: PRD: RF-025, RF-034 | SRS: 1.1 (JobCostingEngine), 2.2, 3.1

--------------------------------------------------------------------------------
## 1. NARRATIVA DE USUARIO
--------------------------------------------------------------------------------
COMO: Dueño de la constructora o director financiero
QUIERO: Un tablero visual que compare en tiempo real por capítulo el presupuesto inicial, los adicionales aprobados, los gastos reales ejecutados y el saldo restante
PARA: Detectar fugas de dinero y sobrecostos antes de que se consuma el margen de utilidad de la obra.

--------------------------------------------------------------------------------
## 2. ESPECIFICACIÓN UX/UI
--------------------------------------------------------------------------------
2.1 Semáforo Financiero Global en Cabecera:
    - Indicador porcentual de consumo presupuestario:
      - 🟢 Verde: Consumo < 85% del costo proyectado.
      - 🟡 Ámbar: Consumo entre 85% y 99.9% (Alerta preventiva de riesgo).
      - 🔴 Rojo: Consumo >= 100% (Sobrecosto directo que deteriora la utilidad).
    - Tarjeta de Margen en Vivo:
      - Margen Proyectado Inicial: `28.5%` ($ 4,200)
      - Margen Real Actual: `24.1%` ($ 3,550)

2.2 Matriz Comparativa por Capítulos:
    Tabla con vista expandible por filas:
    | Capítulo | Presupuesto Base | Adicionales | Presupuesto Vigente | Gasto Real Ejecutado | Saldo Disponible | % Ejecutado |
    | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
    | 01. Demoliciones | $ 1,200 | $ 0 | $ 1,200 | $ 1,050 | $ 150 | 87.5% 🟡 |
    | 02. Hidráulica | $ 2,400 | $ 350 | $ 2,750 | $ 2,900 | -$ 150 | 105.4% 🔴 |

2.3 Drill-Down a Recibos de Campo:
    - Al tocar cualquier capítulo, se despliega una sub-tabla con cada gasto registrado desde la PWA móvil en campo:
      [Fecha] | [Concepto] | [Registrado Por] | [Monto] | [Miniatura de Foto Recibo]
    - Al hacer clic en la miniatura, se abre la foto del recibo en alta definición para auditoría contable.

--------------------------------------------------------------------------------
## 3. CONTRATO DE DATOS Y CÁLCULO EN TIEMPO REAL
--------------------------------------------------------------------------------
Endpoint: GET /api/v1/projects/{project_id}/job-costing
Auth: Bearer JWT ('owner')
Restricción: Rol `resident` no tiene acceso a esta ruta (HTTP 403 Forbidden).

Respuesta Exitosa (200 OK):
```json
{
  "project_id": "proj_12345",
  "total_budget_direct_cost": 15000.00,
  "approved_change_orders_cost": 1200.00,
  "current_budget_cost": 16200.00,
  "actual_spent_cost": 11450.00,
  "remaining_balance": 4750.00,
  "budget_utilization_pct": 70.68,
  "projected_margin_pct": 25.00,
  "actual_current_margin_pct": 27.20,
  "chapters": [
    {
      "chapter_id": "chap_01",
      "name": "01. Demoliciones",
      "base_cost": 1200.00,
      "change_orders_cost": 0.00,
      "current_budget": 1200.00,
      "actual_spent": 1050.00,
      "variance": 150.00,
      "utilization_pct": 87.50,
      "status": "warning"
    }
  ]
}
```

--------------------------------------------------------------------------------
## 4. CRITERIOS DE ACEPTACIÓN (GHERKIN SCENARIOS)
--------------------------------------------------------------------------------
```gherkin
Feature: Matriz Financiera Presupuesto vs Real (Job Costing)

  Scenario: Detección automática de sobrecosto por registro de factura en campo
    Given un capítulo con Presupuesto Vigente de $2,000 y gastos acumulados de $1,800
    When se aprueba un nuevo gasto de campo de $350 imputado a ese capítulo
    Then el gasto real ejecutado sube a $2,150
    And el saldo disponible muestra -$150.00 con tipografía destacada en rojo
    And el indicador del capítulo cambia a estado "danger" (rojo) con icono de alerta
    And el margen real del proyecto se recalcula instantáneamente.
```
