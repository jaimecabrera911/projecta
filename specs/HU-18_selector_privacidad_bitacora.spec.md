# SPECIFICATION: HU-18
# Selector de Privacidad en Bitácora (Visible para el Cliente: Sí/No)

@modulo: Módulo 4 - Cronograma Ligero y Bitácora Diaria (Daily Logs)
@id: HU-18
@rol: Contratista / Dueño / Residente de Obra
@prioridad: Must Have (P0)
@estimacion: 2 Story Points
@estado: Ready for Implementation
@trazabilidad: PRD: RF-028, RN-007 | SRS: 2.2, 3.1

--------------------------------------------------------------------------------
## 1. NARRATIVA DE USUARIO
--------------------------------------------------------------------------------
COMO: Contratista general o dueño de la constructora
QUIERO: Decidir individualmente qué entradas y fotos de la bitácora son visibles para el cliente final y cuáles son de uso estrictamente interno
PARA: Compartir avances profesionales y transparentes con el cliente sin exponer incidentes menores con proveedores, retrasos de cuadrilla o debates técnicos de obra.

--------------------------------------------------------------------------------
## 2. ESPECIFICACIÓN UX/UI
--------------------------------------------------------------------------------
2.1 Interruptor de Privacidad (Toggle Switch):
    - Ubicado de forma destacada en el formulario de creación de bitácora:
      - 👁️ "Visible para el Cliente en su Portal" (Valor por defecto: `true` para fotos de avance estético).
      - 🔒 "Solo Uso Interno del Equipo de Obra" (Valor `false` para incidentes o notas técnicas confidenciales).

2.2 Distinción Visual en el Muro Interno:
    - Publicaciones públicas: Badge sutil verde con texto: "Compartido con el Cliente".
    - Publicaciones internas: Fondo ligeramente sombreado con badge ámbar y candado: "Nota Interna Confidencial".

2.3 Seguridad en la API Pública del Cliente:
    - La consulta del portal del cliente ejecuta siempre la cláusula estricta:
      `SELECT * FROM daily_logs WHERE project_id = $1 AND visible_to_client = TRUE;`
    - Ni los textos ni las URLs de las fotos de bitácoras marcadas como falsas son devueltos por el backend al cliente.

--------------------------------------------------------------------------------
## 3. CRITERIOS DE ACEPTACIÓN (GHERKIN SCENARIOS)
--------------------------------------------------------------------------------
```gherkin
Feature: Selector de Privacidad en Bitácora Diaria

  Scenario: Ocultamiento garantizado de nota interna en el portal del cliente
    Given que el residente registra una entrada de bitácora sobre una tubería rota accidentalmente
    When desmarca el interruptor "Visible para el Cliente" y publica la nota
    Then la entrada queda registrada en el sistema interno con badge "Nota Interna Confidencial"
    When el cliente final ingresa a su portal web mediante su enlace seguro Magic Link
    Then dicha entrada de bitácora y sus fotografías no aparecen en su muro de avance.

  Scenario: Publicación visible para el cliente
    Given una entrada de bitácora con fotos de enchape terminado con `visible_to_client = true`
    When el cliente ingresa a la pestaña "Avance" de su portal
    Then visualiza las fotos del enchape con la fecha y el clima del día.
```
