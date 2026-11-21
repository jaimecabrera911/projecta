# SPECIFICATION: HU-05
# Catálogo Maestro de Insumos con Búsqueda Predictiva

@modulo: Módulo 1 - Catálogo de Costos y Constructor de Presupuestos
@id: HU-05
@rol: Administrador / Estimador de Costos
@prioridad: Must Have (P0)
@estimacion: 5 Story Points
@estado: Ready for Implementation
@trazabilidad: PRD: RF-011 | SRS: 2.2, 3.1 (catalog_items)

--------------------------------------------------------------------------------
## 1. NARRATIVA DE USUARIO
--------------------------------------------------------------------------------
COMO: Administrador o estimador de costos de la empresa constructora
QUIERO: Un catálogo reutilizable de materiales, mano de obra, equipos y subcontratos con sus costos unitarios base
PARA: No escribir desde cero cada actividad ni tener que recordar los precios unitarios de mercado en cada presupuesto.

--------------------------------------------------------------------------------
## 2. ESPECIFICACIÓN UX/UI
--------------------------------------------------------------------------------
2.1 Segmentación y Filtros:
    - Filtros por categoría en pestañas superiores tipo chips:
      [Todos] [Materiales] [Mano de Obra] [Subcontratos] [Equipos]
    - Indicador de total de registros por categoría.

2.2 Búsqueda Instantánea Predictiva (Fuzzy Search):
    - Campo de búsqueda en cabecera con debounce de 150ms.
    - Filtra en memoria / backend en menos de 100ms.
    - Ejemplo: escribir "tubo" muestra "Tubo PVC sanitario 3 pulgadas", "Tubo conduit eléctrico 1/2".

2.3 Tabla de Datos y Edición Inline:
    - Columnas: Código, Descripción del Ítem, Categoría, Unidad (`m2`, `ml`, `und`, `glb`, `dia`), Costo Unitario Interno Base, Acciones.
    - Edición inline: Al hacer clic sobre el Costo Unitario se transforma en un input numérico editable sin abrir modales. Al pulsar `Enter` o perder el foco (`blur`), guarda el nuevo precio con micro-toast de confirmación.

2.4 Plantilla de Carga Inicial (Empty State):
    - Si la organización es nueva y no tiene ítems, se muestra un banner de bienvenida:
      "Tu catálogo está vacío. ¿Deseas cargar la plantilla base de remodelaciones estándar para Colombia/LATAM?"
      con botón: [Cargar 80 partidas sugeridas].

--------------------------------------------------------------------------------
## 3. CONTRATO DE DATOS Y ENDPOINT API
--------------------------------------------------------------------------------
Endpoint: GET /api/v1/catalog-items?category={category}&search={query}
Auth: Bearer JWT ('owner')
Restricción: Residente de obra (`resident`) recibe HTTP 403 Forbidden al consultar este endpoint.

Respuesta Exitosa (200 OK):
```json
[
  {
    "id": "cat_item_918237",
    "code": "AC-01",
    "name": "Enchape cerámico muro baño",
    "description": "Suministro e instalación de cerámica incluye pegamento y boquilla",
    "category": "subcontract",
    "unit": "m2",
    "base_unit_cost": 18.50,
    "created_at": "2026-11-20T21:00:00Z"
  }
]
```

Endpoint Crear: POST /api/v1/catalog-items
Payload:
```json
{
  "code": "PIN-02",
  "name": "Pintura vinilo tipo 1 en muros interiores (2 manos)",
  "category": "labor",
  "unit": "m2",
  "base_unit_cost": 4.20
}
```

--------------------------------------------------------------------------------
## 4. CRITERIOS DE ACEPTACIÓN (GHERKIN SCENARIOS)
--------------------------------------------------------------------------------
```gherkin
Feature: Catálogo Maestro de Insumos

  Scenario: Búsqueda rápida y edición inline de costo unitario
    Given que el estimador está en la vista del Catálogo Maestro
    When digita "pintura" en la barra de búsqueda
    Then los resultados se filtran en menos de 100ms
    When hace clic sobre el costo unitario de "$4.20"
    And cambia el valor a "$4.80" y presiona la tecla Enter
    Then la API actualiza el registro con código 200
    And el costo queda fijado en "$4.80" sin recargar la página.

  Scenario: Bloqueo de seguridad para rol de residente de obra
    Given un usuario autenticado con rol "resident"
    When intenta invocar el endpoint GET /api/v1/catalog-items
    Then la API rechaza la solicitud con HTTP 403 Forbidden
    And ningún costo unitario interno es revelado.
```
