# SPECIFICATION: HU-09
# Vista Previa y PDF Comercial con Protección de Márgenes

@modulo: Módulo 2 - Propuestas Comerciales, Tracking y Firma Electrónica
@id: HU-09
@rol: Contratista / Cliente Final
@prioridad: Must Have (P0)
@estimacion: 5 Story Points
@estado: Ready for Implementation
@trazabilidad: PRD: RF-016, RF-019, RN-001 | SRS: 1.2, 2.2, 3.1

--------------------------------------------------------------------------------
## 1. NARRATIVA DE USUARIO
--------------------------------------------------------------------------------
COMO: Contratista general
QUIERO: Generar una propuesta comercial web interactiva y en PDF exportable que oculte completamente mis costos internos y márgenes
PARA: Que el cliente final reciba un documento formal y elegante sin conocer mis costos de compra ni el porcentaje de utilidad de mi empresa.

--------------------------------------------------------------------------------
## 2. ESPECIFICACIÓN UX/UI
--------------------------------------------------------------------------------
2.1 Vista Previa WYSIWYG en Pantalla:
    - La vista previa replica con fidelidad milimétrica el diseño del PDF comercial en tamaño Carta/A4.
    - Cabecera: Logo de la empresa contratista, datos fiscales (NIT/RFC), teléfono de contacto y fecha de vigencia de la oferta (ej. "Válido por 15 días calendario").
    - Portada ejecutiva con nombre del proyecto, dirección y datos del cliente.

2.2 Tabla de Partidas Presentada al Cliente:
    - Únicamente incluye las columnas:
      [Ítem #] | [Descripción del Alcance Técnico] | [Unidad] | [Cantidad] | [Precio Unitario Venta] | [Subtotal Venta]
    - Los capítulos agrupan sus partidas con subtotales parciales visibles.

2.3 Blindaje de Seguridad y Privacidad Absoluta:
    - En ningún lugar del código HTML, atributos `data-*`, estado de React ni en los metadatos del PDF existen rastros de `unit_cost_internal` ni `margin_percentage`.
    - La consulta del cliente (`/proposals/{uuid}`) utiliza una proyección SQL filtrada que no selecciona dichas columnas.

2.4 Términos Comerciales y Forma de Pago:
    - Desglose de hitos de desembolso (ej. *Anticipo 50% al firmar*, *Avance 40% a mitad de cronograma*, *Saldo 10% a entrega final*).
    - Sección de "Exclusiones de Obra" explícitas para evitar falsas expectativas.

--------------------------------------------------------------------------------
## 3. CONTRATO DE DATOS Y GENERACIÓN PDF
--------------------------------------------------------------------------------
Endpoint: GET /api/v1/proposals/{proposal_uuid}/pdf
Auth: Acceso público mediante Token UUIDv4 (Magic Link)
Motor de Renderizado: Worker Chromium Serverless / Puppeteer-core determinista con CSS Paged Media.

Cabeceras de Respuesta:
- Content-Type: application/pdf
- Content-Disposition: inline; filename="Propuesta_Comercial_Obra_102.pdf"

--------------------------------------------------------------------------------
## 4. CRITERIOS DE ACEPTACIÓN (GHERKIN SCENARIOS)
--------------------------------------------------------------------------------
```gherkin
Feature: Vista Previa y PDF Comercial con Protección de Márgenes

  Scenario: Renderizado comercial sin exposición de costos internos
    Given que el contratista genera la vista previa o descarga el PDF comercial de una propuesta
    When se inspecciona la tabla de partidas del documento
    Then únicamente son visibles: Cantidad, Unidad, Precio Unitario de Venta y Subtotal
    And los costos directos de insumos y los porcentajes de margen están completamente ausentes
    And no existen en el código fuente ni en el DOM.

  Scenario: Descarga de documento PDF firmado
    Given una propuesta comercial firmada por el cliente
    When el usuario pulsa "Descargar PDF Contractual"
    Then el sistema entrega un archivo PDF de alta resolución con la firma digital estampada al pie de página.
```
