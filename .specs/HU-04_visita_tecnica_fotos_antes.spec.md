# SPECIFICATION: HU-04
# Ficha de Visita Técnica y Galería de Fotos del Antes

@modulo: Módulo 0 - CRM Comercial y Pre-Venta
@id: HU-04
@rol: Contratista / Tasador Técnico / Residente
@prioridad: Must Have (P0)
@estimacion: 3 Story Points
@estado: Ready for Implementation
@trazabilidad: PRD: RF-009, RF-010 | SRS: 2.2, 3.1 (site_visits)

--------------------------------------------------------------------------------
## 1. NARRATIVA DE USUARIO
--------------------------------------------------------------------------------
COMO: Contratista general o tasador técnico
QUIERO: Abrir la oportunidad en mi celular durante la visita al inmueble, registrar notas de inspección y tomar fotos del estado inicial
PARA: Disponer de toda la información técnica y visual centralizada al momento de elaborar el presupuesto en oficina.

--------------------------------------------------------------------------------
## 2. ESPECIFICACIÓN UX/UI
--------------------------------------------------------------------------------
2.1 Acceso:
    - Pestaña "Visita Técnica" en la ficha de detalle de la oportunidad (`/leads/{id}/visit`).

2.2 Agenda y Datos de Acceso:
    - Selector de fecha y hora programada (`scheduled_for`).
    - Campo de texto libre para notas de acceso: Códigos de portería, nombre del conserje, restricciones de horario de ruido de la copropiedad.

2.3 Registro de Notas Técnicas en Sitio:
    - Textarea multilínea con autosave cada 3 segundos tras pausa de escritura.
    - Soporte de dictado por voz (Voice-to-Text nativo del teclado del smartphone) para no digitar con guantes o polvo en obra.

2.4 Galería de Fotos del Antes:
    - Botón prominente: "Añadir Fotos del Antes" con selector nativo [Cámara Directa] / [Galería].
    - Compresión instantánea en cliente a < 800 KB por imagen.
    - Galería tipo Grid 3x3 responsiva con vista en lightbox deslizable a pantalla completa.
    - Etiquetado opcional por zona: [Baño Principal] [Cocina] [Sala / Balcón] [Fachada].

--------------------------------------------------------------------------------
## 3. CONTRATO DE DATOS Y ENDPOINT API
--------------------------------------------------------------------------------
Endpoint 1: POST /api/v1/leads/{lead_id}/visits
```json
{
  "scheduled_for": "2026-11-22T14:00:00Z",
  "technical_notes": "Presión de agua adecuada. Tablero eléctrico requiere actualización a breakers de 20A."
}
```

Endpoint 2: POST /api/v1/leads/{lead_id}/visits/{visit_id}/attachments
Payload: multipart/form-data (archivo comprimido en cliente)

Respuesta Exitosa (201 Created):
```json
{
  "id": "att_88c7f1a2-5b12",
  "site_visit_id": "vis_12345",
  "file_url": "https://storage.obraflow.co/org_1/leads/lead_1/before_photo_1.webp",
  "file_name": "before_photo_1.webp",
  "file_size_kb": 420
}
```

--------------------------------------------------------------------------------
## 4. CRITERIOS DE ACEPTACIÓN (GHERKIN SCENARIOS)
--------------------------------------------------------------------------------
```gherkin
Feature: Ficha de Visita Técnica y Fotos del Antes

  Scenario: Registro de visita técnica y carga fotográfica en campo
    Given que el contratista se encuentra en la vivienda del cliente
    When abre la ficha del lead y accede a la sección "Visita Técnica"
    And escribe o dicta notas técnicas sobre el estado de muros y cañerías
    And toma 4 fotografías del estado actual usando la cámara de su teléfono
    Then las notas se guardan automáticamente sin necesidad de pulsar un botón de guardar
    And las 4 fotografías se comprimen en cliente y se muestran en la cuadrícula
    And cada foto cuenta con botón para ampliar o eliminar si salió borrosa.
```
