# SPECIFICATION: HU-01
# Captura Rápida de Lead en Campo (< 15 Segundos)

@modulo: Módulo 0 - CRM Comercial y Pre-Venta
@id: HU-01
@rol: Administrador / Dueño / Contratista General
@prioridad: Must Have (P0)
@estimacion: 3 Story Points
@estado: Ready for Implementation
@trazabilidad: PRD: RF-005 | SRS: 1.1, 2.2, 3.1 (leads)

--------------------------------------------------------------------------------
## 1. NARRATIVA DE USUARIO
--------------------------------------------------------------------------------
COMO: Contratista general o dueño de empresa de remodelación
QUIERO: Un botón flotante accesible con el pulgar para registrar un prospecto entrante ingresando únicamente 4 datos básicos
PARA: No perder llamadas ni mensajes de WhatsApp mientras estoy conduciendo o supervisando una obra.

--------------------------------------------------------------------------------
## 2. ESPECIFICACIÓN UX/UI Y ERGONOMÍA (OPERATE MODE)
--------------------------------------------------------------------------------
2.1 Disparador:
    - Botón de Acción Flotante (FAB) fijo en esquina inferior derecha (`bottom: 1.5rem; right: 1.5rem;`).
    - Dimensiones mínimas: 56x56 px (área táctil >= 48x48 px).
    - Icono: `Plus` (Lucide Icons), fondo Naranja Seguridad `#F97316`, icono Blanco.

2.2 Contenedor Modal:
    - En pantallas móviles (< 768px): Modal tipo Bottom-Sheet deslizable desde la parte inferior, ocupando 70% de altura de pantalla.
    - En escritorio (>= 768px): Modal dialog centrado de 480px de ancho.
    - Foco automático en el primer campo (`client_name`) tras terminar la animación de apertura (200ms ease-out).

2.3 Campos Estrictos del Formulario (4):
    1. `client_name`:
       - Etiqueta: "Nombre del Cliente *"
       - Tipo: Text con autocapitalización de palabras (`autocapitalize="words"`).
       - Validación: Requerido, mín 3 caracteres, máx 150 caracteres.
    2. `client_phone`:
       - Etiqueta: "WhatsApp / Teléfono *"
       - Tipo: `tel` con teclado numérico nativo en móvil.
       - Selector de código de país por defecto (+57 Colombia).
       - Validación: Requerido, 7-15 dígitos numéricos.
    3. `project_address`:
       - Etiqueta: "Dirección / Zona del Inmueble *"
       - Tipo: Text con texto predictivo rápido o texto libre.
       - Validación: Requerido, mín 4 caracteres.
    4. `project_type`:
       - Etiqueta: "Tipo de Obra *"
       - Componente: Selector de chips táctiles horizontales mono-selección:
         [Cocina] [Baño] [Pintura] [Remodelación Total] [Adecuación Comercial] [Otro]
       - Selección por defecto: "Remodelación Total".

2.4 Microinteracciones:
    - Al pulsar "Guardar Prospecto": el botón muestra spinner de 16px, desactiva interacción doble-tap y emite vibración háptica ligera (si está soportada en Web API).
    - Al guardarse: cierre de modal en 150ms, animación de inserción en la parte superior de la columna "Nuevo Lead" y toast superior verde: "Prospecto guardado exitosamente".

--------------------------------------------------------------------------------
## 3. CONTRATO DE DATOS Y ENDPOINT API
--------------------------------------------------------------------------------
Endpoint: POST /api/v1/leads
Auth: Bearer JWT (Roles permitidos: 'owner')
Header Context: X-Organization-Id inyectado automáticamente

Payload Request:
```json
{
  "client_name": "Carlos Rodríguez",
  "client_phone": "+573001234567",
  "project_address": "Calle 127 # 15-40 Apto 502",
  "project_type": "Remodelación Total",
  "source": "manual"
}
```

Respuesta Exitosa (201 Created):
```json
{
  "id": "7b6f685c-6e6c-48be-a6b1-3e4b7c62b0e1",
  "organization_id": "e3b0c442-98fc-1c14-9af3-4c76b92f44e1",
  "client_name": "Carlos Rodríguez",
  "client_phone": "+573001234567",
  "project_address": "Calle 127 # 15-40 Apto 502",
  "project_type": "Remodelación Total",
  "stage": "new_lead",
  "source": "manual",
  "estimated_budget": 0.00,
  "created_at": "2026-11-20T21:30:00Z"
}
```

--------------------------------------------------------------------------------
## 4. CRITERIOS DE ACEPTACIÓN (GHERKIN SCENARIOS)
--------------------------------------------------------------------------------
```gherkin
Feature: Captura Rápida de Lead en Campo

  Scenario: Creación exitosa de un prospecto en menos de 15 segundos
    Given que el contratista ha iniciado sesión con rol "owner"
    And se encuentra en el tablero CRM de oportunidades
    When presiona el botón flotante "+"
    Then se despliega el modal bottom-sheet en menos de 200 milisegundos
    And el cursor se sitúa automáticamente en el campo "Nombre del Cliente"
    When completa:
      | client_name     | Sandra Milena López         |
      | client_phone    | 3109876543                  |
      | project_address | Cra 7 # 116-20 Torre B      |
      | project_type    | Baño                        |
    And pulsa el botón "Guardar Prospecto"
    Then la petición POST responde con código 201 en menos de 300ms
    And la tarjeta aparece de inmediato al tope de la columna "Nuevo Lead"
    And el modal se cierra sin recargar la página.

  Scenario: Intento de guardar con campos obligatorios vacíos
    Given que el modal de captura rápida está abierto
    When el contratista borra el contenido de "Nombre del Cliente" y pulsa "Guardar Prospecto"
    Then el botón no envía la petición al servidor
    And se resalta el campo "Nombre del Cliente" con borde rojo `#EF4444`
    And se muestra el mensaje de ayuda: "Ingresa el nombre del cliente".
```
