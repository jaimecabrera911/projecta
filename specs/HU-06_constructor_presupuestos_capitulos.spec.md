# SPECIFICATION: HU-06
# Constructor Jerárquico de Presupuestos por Capítulos

@modulo: Módulo 1 - Catálogo de Costos y Constructor de Presupuestos
@id: HU-06
@rol: Dueño de Empresa / Contratista
@prioridad: Must Have (P0)
@estimacion: 8 Story Points
@estado: Ready for Implementation
@trazabilidad: PRD: RF-012, RF-013 | SRS: 2.2, 3.1 (budgets, budget_chapters, budget_items)

--------------------------------------------------------------------------------
## 1. NARRATIVA DE USUARIO
--------------------------------------------------------------------------------
COMO: Dueño de la empresa constructora o estimador senior
QUIERO: Armar un presupuesto estructurado en Capítulos/Fases (ej. 01 Preliminares, 02 Obra Gris, 03 Acabados) e insertar partidas con cantidades
PARA: Presentar una propuesta comercial ordenada y estructurar la compra y ejecución posterior de la obra.

--------------------------------------------------------------------------------
## 2. ESPECIFICACIÓN UX/UI
--------------------------------------------------------------------------------
2.1 Jerarquía en Árbol (Capítulo ➔ Partidas):
    - Estructura tipo acordeón colapsable por capítulo para manejar presupuestos de más de 60 partidas sin sobrecarga cognitiva.
    - Botón para reordenar capítulos arriba/abajo (Order Index).
    - Botón prominente en cada capítulo: "+ Añadir Partida desde Catálogo" y "+ Crear Partida Personalizada".

2.2 Doble Visibilidad en Editor (Modo Dueño):
    Cada fila de partida presenta dos dimensiones de cálculo:
    - Dimensión Interna (Costo): Cantidad x Costo Unitario Interno = Subtotal Costo Directo.
    - Dimensión Comercial (Venta): % Margen de Utilidad (o margen global heredado) = Precio Venta Unitario al Cliente = Subtotal Venta.
    - Ejemplo en fila:
      Partida: "Demolición de enchape muro" | Cant: 25 m2 | Costo Int: $8.00 ($200 directos) | Margen: 35% | Precio Cliente: $10.80 ($270 total).

2.3 Barra Flotante de Totales (Sticky Footer):
    - Se fija en la parte inferior de la pantalla sin tapar el scroll:
      [Costo Directo Total: $ 8,450.00] | [Utilidad Proyectada: $ 3,120.00 (26.9%)] | [Total Propuesta al Cliente: $ 11,570.00].
    - Actualización reactiva instantánea (< 50ms) en cada cambio de cantidad o margen.

--------------------------------------------------------------------------------
## 3. CONTRATO DE DATOS Y RELACIONES EN DB
--------------------------------------------------------------------------------
Tablas involucradas:
- `budgets`: id, lead_id, version, title, status, tax_scheme, global_margin_percentage, total_direct_cost, total_sale_price.
- `budget_chapters`: id, budget_id, order_index, name.
- `budget_items`: id, chapter_id, catalog_item_id, order_index, description, category, unit, quantity, unit_cost_internal, margin_percentage, unit_sale_price.

Endpoint: POST /api/v1/budgets/{budget_id}/chapters
Payload: `{ "name": "01. Demoliciones y Retiros", "order_index": 1 }`

Endpoint: POST /api/v1/budgets/{budget_id}/chapters/{chapter_id}/items
Payload:
```json
{
  "catalog_item_id": "cat_item_918237",
  "description": "Demolición de muro drywall",
  "category": "labor",
  "unit": "m2",
  "quantity": 18.5,
  "unit_cost_internal": 6.50,
  "margin_percentage": 30.00
}
```

Cálculo de Precio de Venta:
`unit_sale_price = unit_cost_internal / (1 - (margin_percentage / 100))`

--------------------------------------------------------------------------------
## 4. CRITERIOS DE ACEPTACIÓN (GHERKIN SCENARIOS)
--------------------------------------------------------------------------------
```gherkin
Feature: Constructor Jerárquico de Presupuestos

  Scenario: Creación de capítulo e inserción de ítems con recálculo dinámico
    Given un presupuesto nuevo en estado "draft"
    When el usuario crea el capítulo "02. Mampostería y Pañetes"
    And añade el ítem "Muro bloque 10cm", cantidad 40 m2 a costo unitario $12.00 y margen 25%
    Then el subtotal de costo directo se calcula en $480.00
    And el precio unitario al cliente se calcula en $15.00
    And el subtotal al cliente se fija en $600.00
    And la barra flotante inferior actualiza el Costo Directo Total, la Ganancia y el Total al Cliente.

  Scenario: Colapso de capítulos para reducir ruido visual
    Given un presupuesto con 4 capítulos y 30 partidas
    When el usuario hace clic en el encabezado del capítulo "01. Preliminares"
    Then el capítulo se contrae mostrando solo su nombre y el subtotal acumulado del capítulo.
```
