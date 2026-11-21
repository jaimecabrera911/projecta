# SPECIFICATION: HU-17
# Bitácora Diaria de Obra con Fotos y Clima (Daily Logs)

@modulo: Módulo 4 - Cronograma Ligero y Bitácora Diaria (Daily Logs)
@id: HU-17
@rol: Residente de Obra en Campo
@prioridad: Must Have (P0)
@estimacion: 5 Story Points
@estado: Ready for Implementation
@trazabilidad: PRD: RF-027, RF-028, RN-006, RNF-002 | SRS: 1.1, 1.2, 2.2, 3.1

--------------------------------------------------------------------------------
## 1. NARRATIVA DE USUARIO
--------------------------------------------------------------------------------
COMO: Residente de obra o supervisor de campo
QUIERO: Publicar una entrada diaria de bitácora con registro de clima, cuadrillas activas, notas de avance y fotos del progreso
PARA: Mantener una memoria técnica y fotográfica irrefutable de lo sucedido cada día en la obra.

--------------------------------------------------------------------------------
## 2. ESPECIFICACIÓN UX/UI
--------------------------------------------------------------------------------
2.1 Selector de Clima en 1 Toque:
    - Tres botones grandes con iconos ilustrativos:
      [☀️ Soleado]  [🌧️ Lluvia]  [☁️ Nublado]

2.2 Registro de Cuadrilla y Personal:
    - Contador rápido tipo stepper (+ / -): "Oficiales: [ 3 ]" | "Ayudantes: [ 2 ]".

2.3 Galería y Carga Masiva de Fotografías de Avance:
    - Botón "Añadir Fotos de Hoy" permite seleccionar hasta 10 fotos directamente de la cámara o galería.
    - Compresión obligatoria en segundo plano en el navegador (< 800 KB en formato WebP).
    - Previsualización en carrusel horizontal con botón de papelera para descartar fotos movidas o desenfocadas.

2.4 Muro Social Estilo Feed:
    - Las publicaciones se visualizan como un feed cronológico inverso (la entrada de hoy al tope).
    - Muestra: Fecha y hora, badge de clima, personal presente, descripción técnica y galería de fotos navegable.

--------------------------------------------------------------------------------
## 3. CONTRATO DE DATOS Y ENDPOINT API
--------------------------------------------------------------------------------
Endpoint: POST /api/v1/projects/{project_id}/daily-logs
Auth: Bearer JWT ('owner', 'resident')

Payload (multipart/form-data):
- weather: "sunny" // 'sunny' | 'rainy' | 'cloudy'
- workers_count: 5
- notes: "Se finalizó pañete de muro norte. Se dejaron tuberías listas para prueba hidrostática."
- photos: [File, File, File] (Cada uno < 800 KB)
- visible_to_client: true

Respuesta Exitosa (201 Created):
```json
{
  "id": "log_991823",
  "project_id": "proj_12345",
  "weather": "sunny",
  "workers_count": 5,
  "notes": "Se finalizó pañete de muro norte...",
  "visible_to_client": true,
  "photos_count": 3,
  "created_at": "2026-11-20T21:45:00Z"
}
```

--------------------------------------------------------------------------------
## 4. CRITERIOS DE ACEPTACIÓN (GHERKIN SCENARIOS)
--------------------------------------------------------------------------------
```gherkin
Feature: Bitácora Diaria de Obra con Fotos y Clima

  Scenario: Publicación exitosa de bitácora al finalizar la jornada
    Given que el residente está en la obra al terminar el día
    When selecciona el clima "Soleado", registra 4 operarios y escribe "Se fundieron 12 m2 de contrapiso"
    And adjunta 3 fotografías de avance
    And presiona "Publicar Bitácora del Día"
    Then las imágenes se comprimen y suben en menos de 3 segundos
    And la entrada queda publicada en el muro del proyecto
    And se registra la estampa de tiempo y autor del reporte.
```
