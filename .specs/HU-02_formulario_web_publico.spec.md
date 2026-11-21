# SPECIFICATION: HU-02
# Formulario Web Público Embebible para Clientes

@modulo: Módulo 0 - CRM Comercial y Pre-Venta
@id: HU-02
@rol: Dueño / Cliente Web Público
@prioridad: Should Have (P1)
@estimacion: 5 Story Points
@estado: Ready for Implementation
@trazabilidad: PRD: RF-006, RN-006 | SRS: 1.1 (PublicForm), 3.1

--------------------------------------------------------------------------------
## 1. NARRATIVA DE USUARIO
--------------------------------------------------------------------------------
COMO: Dueño de empresa constructora o de remodelación
QUIERO: Un enlace público y un código iframe para insertar en mi Instagram, WhatsApp Business o sitio web
PARA: Que los clientes potenciales ingresen directamente su solicitud y carguen fotos de su espacio actual sin intermediarios.

--------------------------------------------------------------------------------
## 2. ESPECIFICACIÓN UX/UI
--------------------------------------------------------------------------------
2.1 Acceso Público:
    - URL pública limpia: `https://app.obraflow.co/f/{organization_slug}` o `/quote-request/{public_token}`.
    - Cabecera: Logo de la constructora en alta resolución, nombre comercial y badge "Solicitud de Cotización".

2.2 Campos del Formulario:
    - `client_name`: Nombre completo (requerido).
    - `client_phone`: WhatsApp de contacto con máscara de teléfono (requerido).
    - `client_email`: Correo electrónico (opcional, con validación de sintaxis RFC 5322).
    - `project_address`: Dirección aproximada / Barrio / Ciudad (requerido).
    - `project_type`: Selector visual (Cocina, Baño, Remodelación Completa, Pintura, Local Comercial).
    - `notes`: Descripción breve de las expectativas o necesidades del cliente.
    - `attachments`: Zona Drag & Drop para subir hasta 5 fotografías del espacio actual.

2.3 Optimización y Compresión de Fotos en el Navegador:
    - Utiliza Canvas API (`browser-image-compression`) en el navegador del cliente antes de transmitir.
    - Límite estricto: Imagen original reducida a resolución máxima 1920x1080px, calidad 0.8, peso máximo < 800 KB en formato WebP/JPEG.
    - Barra de progreso que indica: "Optimizando foto 1 de 3..." sin congelar la interfaz.

2.4 Seguridad y Protección Antispam:
    - Campo Honeypot oculto `website_url` con CSS `display:none` y `tabindex="-1"`. Si viene diligenciado en el backend, se descarta silenciosamente con 200 OK falso.
    - Rate Limiting por IP: Máximo 5 envíos por hora por dirección IP pública.

--------------------------------------------------------------------------------
## 3. CONTRATO DE DATOS Y ENDPOINT API
--------------------------------------------------------------------------------
Endpoint: POST /api/v1/public/forms/{organization_slug}/submit
Auth: Ninguna (Endpoint Público sin autenticación)

Payload Request (multipart/form-data):
- client_name: "Andrés Delgado"
- client_phone: "+573155554321"
- client_email: "andres@gmail.com"
- project_address: "Envigado, Antioquia - Loma del Chocho"
- project_type: "Cocina"
- notes: "Quiero tumbar un muro y cambiar muebles y mesón"
- photos: [File, File, File] (Max 5 archivos, cada uno < 800 KB)
- website_url: "" (Honeypot)

Respuesta Exitosa (200 OK):
```json
{
  "success": true,
  "message": "¡Solicitud recibida! Te contactaremos en menos de 24 horas hábiles.",
  "tracking_id": "lead_pub_99a8b7"
}
```

--------------------------------------------------------------------------------
## 4. CRITERIOS DE ACEPTACIÓN (GHERKIN SCENARIOS)
--------------------------------------------------------------------------------
```gherkin
Feature: Formulario Web Público Embebible

  Scenario: Envío exitoso de lead web con compresión de imágenes
    Given que un cliente potencial ingresa al formulario web público de la constructora
    When completa sus datos de contacto y adjunta 3 fotografías de su cocina
    Then el navegador comprime las imágenes a menos de 800 KB antes de enviarlas
    And al enviar, visualiza una pantalla de confirmación: "¡Gracias! Te contactaremos en menos de 24 horas"
    And en el CRM del contratista aparece una nueva tarjeta con la etiqueta "Origen: Web" y badge con el número de fotos.

  Scenario: Detección y descarte de bot de spam vía honeypot
    Given un bot automatizado que rellena todos los campos incluyendo el campo oculto "website_url"
    When envía la petición POST
    Then el backend no inserta el registro en la base de datos
    And responde con HTTP 200 simulando éxito para no alertar al bot.
```
