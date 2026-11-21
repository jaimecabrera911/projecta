# Historias de Usuario (HUs) con Enfoque UX/UI & Ergonomía de Obra
## Plataforma SaaS Integral de Ventas, Presupuestos y Gestión de Obra (MVP v2.0)
**Estado:** Listo para Desarrollo y Diseño de Interfaces (Sprint Ready)  
**Principios de Diseño Rectores:**  
1. **Operate Mode (Usabilidad de Campo):** Botones grandes (mínimo $48\times 48$ px) diseñados para operar con una sola mano en pantallas móviles con reflejo solar.
2. **Cero Fricción Tecnológica:** Formularios de $<4$ campos, autoguardado, búsqueda predictiva y lenguaje sin tecnicismos de software.
3. **Seguridad Psicológica & Visibilidad:** Estados claros (vacío, carga esquelética, éxito háptico/visual) y aislamiento estricto de costos internos ante terceros y personal de campo.

---

## Índice de Módulos
- [Módulo 0: CRM Comercial y Embudo de Ventas](#módulo-0-crm-comercial-y-embudo-de-ventas-pre-sales)
- [Módulo 1: Catálogo de Costos y Constructor de Presupuestos](#módulo-1-catálogo-de-costos-y-constructor-de-presupuestos)
- [Módulo 2: Propuestas Comerciales, Tracking y Firma Electrónica](#módulo-2-propuestas-comerciales-tracking-y-firma-electrónica)
- [Módulo 3: Control de Costos (Job Costing) y Órdenes de Cambio](#módulo-3-control-de-costos-job-costing-y-órdenes-de-cambio)
- [Módulo 4: Cronograma Ligero y Bitácora Diaria (Daily Logs)](#módulo-4-cronograma-ligero-y-bitácora-diaria-daily-logs)
- [Módulo 5: Portal del Cliente y Control de Cobros](#módulo-5-portal-del-cliente-y-control-de-cobros)

---

## Módulo 0: CRM Comercial y Embudo de Ventas (Pre-Sales)

### HU-01: Captura Rápida de Lead en Campo (< 15 Segundos)
* **Como:** Contratista general o dueño de empresa.  
* **Quiero:** Un botón flotante accesible con el pulgar para registrar un prospecto entrante ingresando únicamente 4 datos básicos.  
* **Para:** No perder llamadas o mensajes de WhatsApp mientras estoy conduciendo o supervisando una obra.

#### Especificaciones de UX/UI & Usabilidad:
- **Disparador:** Botón de Acción Flotante (FAB) fijo en la esquina inferior derecha con icono `+` de alto contraste.
- **Formulario Modal Bottom-Sheet:** En móvil se desliza desde abajo cubriendo el 70% de la pantalla, facilitando el alcance del pulgar sin estirar la mano.
- **Campos Estrictos (4):**
  1. `Nombre del Cliente` (Autocapitalización de palabras).
  2. `Teléfono / WhatsApp` (Teclado numérico automático `type="tel"` con selector de país prefijado).
  3. `Dirección / Zona` (Input con autocompletado o texto libre rápido).
  4. `Tipo de Proyecto` (Selector de chips táctiles rápidos: *Cocina*, *Baño*, *Pintura*, *Remodelación Total*, *Otro*).
- **Microinteracción:** Al presionar "Guardar Prospecto", botón muestra spinner micro, retroalimentación táctil y toast discreto superior: *"Prospecto guardado en Nuevo Lead"*.

#### Criterios de Aceptación (Gherkin):
```gherkin
Dado que el contratista está en cualquier pantalla del CRM
Cuando presiona el botón "+" de captura rápida
Entonces se abre el modal bottom-sheet enfocando automáticamente el campo "Nombre"
Y tras completar los 4 campos y presionar "Guardar"
Entonces el registro se crea en menos de 1 segundo en la columna "Nuevo Lead"
Y el modal se cierra sin recargar la página completa.
```
* **Prioridad:** Must Have | **Estimación:** 3 SP

---

### HU-02: Formulario Web Público Embebible para Clientes
* **Como:** Dueño de empresa constructora.  
* **Quiero:** Un enlace público y código iframe para insertar en mi Instagram, WhatsApp Business o sitio web.  
* **Para:** Que los clientes potenciales ingresen directamente su solicitud y carguen fotos de su espacio actual sin intermediarios.

#### Especificaciones de UX/UI & Usabilidad:
- **Experiencia de Usuario:** Diseño limpio, tipografía legible sin distracciones y logo de la empresa contratista en cabecera.
- **Carga Fotográfica Drag-and-Drop:** Botón grande *"Toca aquí o arrastra fotos de tu espacio"* con icono de cámara.
- **Feedback de Compresión en Vivo:** Barra de progreso que indica *"Optimizando foto 1 de 3..."* sin bloquear la interacción.
- **Protección Antispam Invisible:** Honeypot transparente sin CAPTCHAs invasivos que degraden la tasa de conversión.

#### Criterios de Aceptación (Gherkin):
```gherkin
Dado que un cliente potencial accede al enlace público del contratista
Cuando completa sus datos de contacto y adjunta 3 fotografías de su baño
Entonces el navegador comprime las imágenes a menos de 800 KB antes de enviarlas
Y al enviar, visualiza una pantalla de confirmación: "¡Gracias! Te contactaremos en menos de 24 horas"
Y en el CRM del contratista aparece una nueva tarjeta con la etiqueta "Origen: Web" y badge con el número de fotos.
```
* **Prioridad:** Should Have | **Estimación:** 5 SP

---

### HU-03: Tablero Kanban Visual y Táctil de Oportunidades
* **Como:** Administrador / Dueño.  
* **Quiero:** Visualizar el embudo de ventas en columnas por etapa con la suma monetaria de cada una y mover tarjetas con arrastre táctil.  
* **Para:** Saber al instante cuántas cotizaciones tengo pendientes y proyectar los ingresos del mes.

#### Especificaciones de UX/UI & Usabilidad:
- **Organización de Columnas:** *Nuevo Lead* ➔ *Visita Agendada* ➔ *En Cotización* ➔ *Propuesta Enviada* ➔ *Negociación* ➔ *Ganado / Perdido*.
- **Cabecera de Columna:** Contador de prospectos y monto acumulado (ej. *"Propuesta Enviada (4) • $ 38,500 USD"*).
- **Diseño de Tarjeta (Card):**
  - Nombre del cliente en negrita (16px).
  - Badge de días transcurridos sin contacto (destacado en rojo si supera 3 días sin interacción).
  - Botón de acceso directo a WhatsApp (`tel:` y `https://wa.me/`) con 1 toque.
- **Arrastre Táctil (Drag & Drop):** En pantallas táctiles, soporte para *swipe* lateral suave o selector de etapa en menú rápido de 3 puntos.
- **Diálogo Defensivo en "Perdido":** Al soltar en *Perdido*, se despliega un pop-up amigable que solicita motivo: *[Precio elevado] [Tiempo de entrega] [Sin respuesta del cliente] [Otro]*.

#### Criterios de Aceptación (Gherkin):
```gherkin
Dado que tengo 3 oportunidades en la columna "Propuesta Enviada" con valor de $10,000 c/u
Cuando arrastro una tarjeta hacia la columna "Ganado"
Entonces la sumatoria de "Propuesta Enviada" se actualiza a $20,000 en tiempo real
Y la sumatoria de "Ganado" se incrementa en $10,000
Y se despliega una microanimación de confeti celebratorio en la tarjeta ganada.
```
* **Prioridad:** Must Have | **Estimación:** 5 SP

---

### HU-04: Ficha de Visita Técnica y Galería de Fotos del "Antes"
* **Como:** Contratista o tasador técnico.  
* **Quiero:** Abrir la oportunidad en mi celular durante la visita al inmueble, anotar medidas clave y tomar fotos del estado inicial.  
* **Para:** Tener toda la información técnica reunida en un solo lugar al momento de cotizar en la oficina.

#### Especificaciones de UX/UI & Usabilidad:
- **Acceso Inmediato:** Pestaña "Visita Técnica" en la ficha del lead.
- **Sección de Notas de Voz a Texto:** Soporte para dictado del teclado nativo para no escribir con las manos sucias en obra.
- **Cámara Directa:** Botón con selector *"Tomar Foto con Cámara"* o *"Elegir de Galería"*.
- **Galería en Cuadrícula 3x3:** Visualización de miniaturas cuadradas con preview en lightbox deslizable a pantalla completa.

#### Criterios de Aceptación (Gherkin):
```gherkin
Dado que el contratista está realizando una visita técnica
Cuando toma 5 fotografías desde el navegador de su teléfono
Entonces las imágenes se muestran en la galería con indicador de carga individual
Y las notas técnicas quedan guardadas automáticamente al salir del campo (Autosave cada 3 segundos).
```
* **Prioridad:** Must Have | **Estimación:** 3 SP

---

## Módulo 1: Catálogo de Costos y Constructor de Presupuestos

### HU-05: Catálogo Maestro de Insumos con Búsqueda Predictiva
* **Como:** Administrador / Estimador de costos.  
* **Quiero:** Un repositorio reutilizable de materiales, mano de obra, equipos y subcontratos con sus costos unitarios base.  
* **Para:** No escribir desde cero cada actividad ni tener que recordar los precios unitarios de mercado.

#### Especificaciones de UX/UI & Usabilidad:
- **Segmentación por Chips:** Filtros visuales superiores: *[Todos] [Materiales] [Mano de Obra] [Subcontratos] [Equipos]*.
- **Barra de Búsqueda Instantánea:** Búsqueda difusa (*fuzzy search*) mientras se escribe (ej. escribir "pvc" muestra de inmediato "Tubo PVC 1/2 sanitario", "Codo PVC 90°").
- **Edición Rápida Inline:** Capacidad de editar el costo unitario directamente en la tabla sin abrir modales pesados.
- **Empty State Educativo:** Si el catálogo está vacío, ilustración clara con botón *"Cargar plantilla sugerida de construcción ligera"* o *"Crear primer ítem"*.

#### Criterios de Aceptación (Gherkin):
```gherkin
Dado que el usuario accede al Catálogo de Costos
Cuando escribe "enchape" en el buscador
Entonces la tabla filtra en menos de 100ms los ítems coincidentes
Y al hacer clic sobre el precio de "$15.00", se convierte en un campo editable
Y al presionar Enter se guarda el nuevo valor con notificación toast de confirmación.
```
* **Prioridad:** Must Have | **Estimación:** 5 SP

---

### HU-06: Constructor Jerárquico de Presupuestos por Capítulos
* **Como:** Dueño de constructora.  
* **Quiero:** Armar un presupuesto estructurado en Capítulos/Fases (ej. 01 Preliminares, 02 Obra Gris) e insertar ítems con cantidades.  
* **Para:** Presentar una propuesta ordenada profesionalmente al cliente y facilitar la posterior compra de insumos.

#### Especificaciones de UX/UI & Usabilidad:
- **Estructura Tipo Acordeón Colapsable:** Cada capítulo puede contraerse para reducir el ruido visual en presupuestos de más de 50 ítems.
- **Adición con 1 Clic:** Botón *"Añadir Ítem desde Catálogo"* abre un buscador desplegable inteligente.
- **Doble Visibilidad de Columnas (Modo Editor):**
  - Columna A: Cantidad x Costo Unitario Interno = **Costo Directo**.
  - Columna B: % Margen = **Precio Venta Unitario**.
  - Columna C: **Subtotal al Cliente**.
- **Totales Flotantes en Barra Inferior (Sticky Footer):** El pie de página muestra permanentemente:
  - *Costo Directo Total* (Gris neutro)
  - *Utilidad Estimada* (Verde suave)
  - *Total al Cliente* (Azul oscuro / Tipografía destacada 20px).

#### Criterios de Aceptación (Gherkin):
```gherkin
Dado un presupuesto con el capítulo "01. Demoliciones"
Cuando el usuario añade el ítem "Demolición de muro", cantidad 20 m2 a costo $10 y margen 30%
Entonces el subtotal de costo directo se calcula automáticamente en $200.00
Y el precio de venta unitario al cliente se calcula en $13.00
Y el subtotal para el cliente se fija en $260.00
Y la barra inferior actualiza instantáneamente el Costo, Ganancia y Total sin recargar.
```
* **Prioridad:** Must Have | **Estimación:** 8 SP

---

### HU-07: Selector de Esquema Fiscal Transparente (IVA vs AIU LATAM)
* **Como:** Contratista en Latinoamérica.  
* **Quiero:** Alternar con un selector de dos posiciones entre régimen de IVA estándar o régimen AIU (Administración, Imprevistos, Utilidad).  
* **Para:** Cotizar legalmente contratos civiles de obra donde el impuesto a las ventas aplica únicamente sobre la porción de utilidad.

#### Especificaciones de UX/UI & Usabilidad:
- **Interruptor de Esquema (Segmented Control):**
  - Opción 1: *IVA Estándar (Subtotal + IVA %)*
  - Opción 2: *Esquema AIU de Obra (A% + I% + U% + IVA sobre Utilidad)*
- **Sliders o Inputs de Porcentaje Limpios:**
  - Administración: `10%`
  - Imprevistos: `5%`
  - Utilidad: `5%`
  - IVA sobre Utilidad: `19%`
- **Caja de Desglose Didáctica:** Una tarjeta explicativa con bordes redondeados desglosa la matemática para que el contratista no cometa errores contables antes de emitir la propuesta.

#### Criterios de Aceptación (Gherkin):
```gherkin
Dado un presupuesto con Costo Directo de $10,000.00
Cuando el contratista selecciona el esquema "AIU" con A=10%, I=5%, U=5% e IVA=19%
Entonces la Administración se calcula en $1,000.00
Y los Imprevistos en $500.00
Y la Utilidad en $500.00
Y el IVA sobre Utilidad se calcula en $95.00
Y el valor total del contrato se liquida exactamente en $12,095.00.
```
* **Prioridad:** Must Have | **Estimación:** 5 SP

---

### HU-08: Duplicar Presupuesto como Plantilla
* **Como:** Contratista general.  
* **Quiero:** Duplicar cualquier presupuesto anterior con un solo clic.  
* **Para:** Ahorrar el 80% del tiempo al cotizar proyectos recurrentes (ej. baños estándar o pintura de departamentos).

#### Especificaciones de UX/UI & Usabilidad:
- **Ubicación:** Menú contextual de opciones rápidas (tres puntos verticales) en cada presupuesto: *"Duplicar como plantilla"*.
- **Modal de Confirmación Simple:**
  - Campo: *"Nuevo nombre del proyecto"* (Prefijado: *Copia de [Proyecto Anterior]*).
  - Selector: *¿Vincular a un nuevo prospecto del CRM?* (Dropdown con búsqueda).
- **Redirección Inmediata:** Al confirmar, abre el editor del nuevo presupuesto en modo borrador listo para ajustar medidas.

#### Criterios de Aceptación (Gherkin):
```gherkin
Dado un presupuesto existente con 3 capítulos y 15 ítems
Cuando el usuario presiona "Duplicar como plantilla" y asigna un nuevo cliente
Entonces se crea un nuevo presupuesto con estado "draft"
Y se copian todos los capítulos, descripciones, unidades y costos base
Y los totales coinciden exactamente con el original.
```
* **Prioridad:** Should Have | **Estimación:** 3 SP

---

## Módulo 2: Propuestas Comerciales, Tracking y Firma Electrónica

### HU-09: Vista Previa y PDF Comercial con Protección de Márgenes
* **Como:** Contratista.  
* **Quiero:** Generar una propuesta comercial web y en PDF que oculte completamente mis costos internos y márgenes.  
* **Para:** Que mi cliente reciba un documento elegante y transparente sin enterarse de mis costos de compra ni de mi porcentaje de beneficio.

#### Especificaciones de UX/UI & Usabilidad:
- **Vista Previa de Impresión WYSWYG:** La pantalla reproduce el PDF final en formato carta/A4 con márgenes ejecutivos.
- **Personalización Visual:**
  - Logo de la empresa en alta resolución.
  - Paleta de color acento configurable para cabeceras de tabla.
  - Términos y condiciones de pago predeterminados (ej. *Anticipo 50%, Avance 40%, Entrega 10%*).
- **Ocultamiento Blindado:** En ningún lugar del DOM o del archivo PDF existe rastro de `unit_cost_internal` ni `margin_pct`.

#### Criterios de Aceptación (Gherkin):
```gherkin
Dado que el contratista hace clic en "Vista Previa de Propuesta al Cliente"
Cuando se renderiza el documento en pantalla o se descarga el PDF
Entonces solo son visibles las columnas: "Ítem", "Descripción", "Cantidad", "Unidad", "Precio Unitario" y "Subtotal"
Y los costos directos internos y márgenes de ganancia están completamente ausentes.
```
* **Prioridad:** Must Have | **Estimación:** 5 SP

---

### HU-10: Tracking de Lectura de la Propuesta en Tiempo Real
* **Como:** Dueño del negocio o vendedor.  
* **Quiero:** Recibir una notificación inmediata cuando el cliente abra el enlace de la propuesta cotizada.  
* **Para:** Llamar al cliente en el momento exacto en que está revisando la oferta y aumentar mi probabilidad de cierre.

#### Especificaciones de UX/UI & Usabilidad:
- **Tarjeta de Notificación Flotante / Badge en CRM:**
  - Etiqueta en la tarjeta del Kanban: *"Visto hace 5 min (3 aperturas)"* con icono de ojo verde.
- **Historial de Actividad en Oportunidad:** Lista cronológica:
  - *"Propuesta enviada por WhatsApp (20 Nov, 10:30 AM)"*
  - *"El cliente abrió la propuesta (20 Nov, 11:15 AM - Dispositivo móvil)"*
  - *"El cliente revisó la propuesta por 2da vez (20 Nov, 04:40 PM)"*.

#### Criterios de Aceptación (Gherkin):
```gherkin
Dado que se envió una propuesta con token único al cliente
Cuando el cliente abre el enlace en su navegador móvil
Entonces el backend registra fecha, hora y dispositivo sin solicitar credenciales
Y el estado de la propuesta en el CRM cambia de "sent" a "opened"
Y en la interfaz del contratista se muestra el aviso visual de lectura.
```
* **Prioridad:** Should Have | **Estimación:** 3 SP

---

### HU-11: Firma Electrónica Táctil sin Contraseña para el Cliente
* **Como:** Cliente final del proyecto.  
* **Quiero:** Abrir el enlace de la propuesta en mi celular, revisar el alcance y firmar con mi dedo en pantalla.  
* **Para:** Aprobar el inicio de la obra sin imprimir papeles, sin escanear documentos y sin crear contraseñas.

#### Especificaciones de UX/UI & Usabilidad:
- **Cero Barreras de Acceso:** Acceso directo por enlace único cifrado UUIDv4 (*Magic Link*).
- **Lienzo de Firma Táctil (Canvas Smooth):**
  - Área amplia de firma con línea de guía punteada.
  - Trazado suave con curvas Bezier que simula tinta real.
  - Botón táctil claro: *"Borrar y volver a firmar"*.
- **Alternativa Teclada:** Pestaña alternativa: *"Escribir mi nombre como firma legal"*.
- **Casilla de Aceptación Obligatoria:** *"He leído y acepto los términos de alcance y condiciones de pago"*.
- **Botón de Acción Principal:** Botón verde grande: *"Aprobar y Firmar Contrato"*.

#### Criterios de Aceptación (Gherkin):
```gherkin
Dado que el cliente está visualizando su propuesta en su teléfono
Cuando dibuja su firma en el canvas, escribe su nombre legal y presiona "Aprobar y Firmar Contrato"
Entonces el botón entra en estado de carga con spinner y mensaje "Sellando contrato..."
Y el sistema almacena la firma junto con la estampa de tiempo, dirección IP y hash de integridad
Y el cliente visualiza un comprobante de confirmación con opción de descargar su copia en PDF.
```
* **Prioridad:** Must Have | **Estimación:** 5 SP

---

### HU-12: Transición Automática de Propuesta a Obra en Ejecución
* **Como:** Administrador / Dueño.  
* **Quiero:** Que el sistema congele automáticamente el presupuesto y cree el proyecto activo en cuanto el cliente firme.  
* **Para:** Garantizar que nadie altere la cotización acordada y arrancar de inmediato el control de costos de la obra.

#### Especificaciones de UX/UI & Usabilidad:
- **Automatización Silenciosa:** Ninguna acción manual requerida.
- **Feedback en el CRM:**
  - La tarjeta salta automáticamente de la columna *Propuesta Enviada* a *Ganado*.
  - Aparece un banner informativo en el proyecto: *"Presupuesto congelado como Línea Base el 20 Nov 2026. Los cambios requerirán Órdenes de Cambio"*.
- **Navegación Fluida:** Un botón directo: *"Ir a la Obra en Ejecución"* lleva al panel de control de costos recién creado.

#### Criterios de Aceptación (Gherkin):
```gherkin
Dado que una propuesta recibe la firma válida del cliente
Cuando la API procesa la firma
Entonces el estado del presupuesto cambia a "frozen"
Y se crea un nuevo registro en la tabla de Proyectos con el nombre del cliente y dirección
Y la oportunidad en el CRM se marca como "won"
Y cualquier intento posterior de editar ítems en el presupuesto base es bloqueado con mensaje explicativo.
```
* **Prioridad:** Must Have | **Estimación:** 5 SP

---

## Módulo 3: Control de Costos (Job Costing) y Órdenes de Cambio

### HU-13: Matriz Financiera en Vivo de Presupuesto vs Real
* **Como:** Dueño / Administrador de la constructora.  
* **Quiero:** Un tablero visual que compare por capítulo el presupuesto inicial, las órdenes de cambio aprobadas, los gastos reales y el saldo disponible.  
* **Para:** Detectar fugas de dinero y sobrecostos antes de que se consuma la utilidad de la obra.

#### Especificaciones de UX/UI & Usabilidad:
- **Semáforo Financiero Visual:**
  - Indicador global de salud del proyecto en cabecera:
    - 🟢 *Bajo presupuesto (Consumo < 85%)*
    - 🟡 *Alerta preventiva (Consumo 85% - 100%)*
    - 🔴 *Sobrecosto / Pérdida (Consumo > 100%)*
- **Tabla Responsiva con Modo Tarjeta en Móvil:** En pantallas pequeñas, cada capítulo se presenta como una tarjeta compacta con barra de progreso lineal bicolor.
- **Desglose Desplegable:** Al tocar un capítulo, se expande la lista de facturas y recibos que componen el gasto real ejecutado.

#### Criterios de Aceptación (Gherkin):
```gherkin
Dado un proyecto con un presupuesto vigente de $5,000 en "Obra Gris"
Y gastos acumulados de $4,200
Cuando se registra una factura adicional de $900
Entonces el gasto real ejecutado pasa a $5,100
Y el saldo del capítulo muestra -$100.00 en tipografía roja con icono de alerta
Y la barra de avance presupuestario se pinta de color rojo.
```
* **Prioridad:** Must Have | **Estimación:** 8 SP

---

### HU-14: Registro Rápido de Gastos de Obra en 3 Toques (Mobile-First)
* **Como:** Residente de obra o maestro de obra en campo.  
* **Quiero:** Registrar una compra en ferretería desde mi celular tomándole foto a la factura física y digitando el monto.  
* **Para:** No acumular recibos de papel arrugados en la camioneta y mantener los costos al día sin esfuerzo.

#### Especificaciones de UX/UI & Usabilidad:
- **Flujo en 3 Pasos (Thumb Zone):**
  1. Pulsar botón flotante de cámara *"Registrar Gasto"*.
  2. Tomar foto del recibo (compresión automática en < 1 segundo).
  3. Ingresar `Monto`, seleccionar `Capítulo` en selector de botones grandes y pulsar `Guardar`.
- **Modo Offline Resiliente:** Si no hay cobertura de internet en el sótano de la obra:
  - El gasto se guarda en el teléfono (IndexedDB local).
  - Se muestra un icono de nube ámbar con mensaje: *"1 gasto guardado en el teléfono. Se subirá al recuperar señal"*.
- **Restricción de Seguridad:** El residente NO ve márgenes de ganancia ni precios al cliente; solo ve los nombres de los capítulos técnicos para imputar el gasto.

#### Criterios de Aceptación (Gherkin):
```gherkin
Dado que el residente está en la ferretería sin señal de datos
Cuando toma la foto del recibo, digita $180.00 e imputa al capítulo "Pintura"
Entonces el gasto se almacena localmente en el dispositivo
Y cuando el dispositivo detecta conexión a internet
Entonces el recibo se sincroniza automáticamente con el servidor y notifica con un check verde.
```
* **Prioridad:** Must Have | **Estimación:** 5 SP

---

### HU-15: Cotización y Firma de Órdenes de Cambio (Adicionales)
* **Como:** Contratista.  
* **Quiero:** Cotizar un trabajo adicional solicitado por el cliente en obra y enviarle un enlace para que lo firme antes de iniciar la labor.  
* **Para:** Garantizar el cobro de todos los extras y evitar discusiones al finalizar el proyecto.

#### Especificaciones de UX/UI & Usabilidad:
- **Creación en 2 Minutos:** Modal simple: *"Nueva Orden de Cambio # [Auto-incremental]"*.
- **Definición Clara:**
  - Descripción del trabajo adicional (ej. *"Instalación de 4 tomas de corriente adicionales en cocina"*).
  - Costo directo interno + Margen comercial = Precio de venta al cliente.
- **Acción Rápida de Envío:** Botón *"Enviar por WhatsApp para aprobación"*.
- **Aprobación del Cliente:** El cliente abre un enlace simplificado, ve el costo adicional y firma con su dedo.
- **Impacto Automático:** Al firmarse, se suma automáticamente al presupuesto vigente de obra y al saldo por cobrar en el portal del cliente.

#### Criterios de Aceptación (Gherkin):
```gherkin
Dado un proyecto en ejecución con contrato base de $20,000
Cuando el contratista crea la Orden de Cambio #1 por $850 y el cliente la firma digitalmente
Entonces el valor total del contrato en el portal del cliente sube a $20,850
Y el presupuesto vigente de costos se incrementa por el costo directo del adicional
Y la orden de cambio queda archivada en el histórico de documentos aprobados.
```
* **Prioridad:** Must Have | **Estimación:** 5 SP

---

## Módulo 4: Cronograma Ligero y Bitácora Diaria (Daily Logs)

### HU-16: Cronograma Táctil de Tareas de Obra (Lista / Calendario)
* **Como:** Residente de obra y contratista.  
* **Quiero:** Una lista sencilla de tareas vinculadas a los capítulos del presupuesto con fechas de inicio y fin y estados de avance.  
* **Para:** Coordinar el trabajo del personal sin la complejidad excesiva de diagramas de Gantt tradicionales de escritorio.

#### Especificaciones de UX/UI & Usabilidad:
- **Selector de Vista:** Toggle rápido entre vista *[Lista de Tareas]* y vista *[Calendario Semanal / Mensual]*.
- **Interacción por Toques:**
  - Tocar la casilla circular de una tarea la marca como completada con animación de tachado suave y sonido/vibración de satisfacción.
  - Fechas seleccionables con selector nativo de calendario móvil.
- **Filtro por Responsable:** Chips táctiles con avatares del personal asignado para ver las tareas de cada quien en 1 segundo.

#### Criterios de Aceptación (Gherkin):
```gherkin
Dado un cronograma con la tarea "Enchape de piso baño" en estado "En progreso"
Cuando el residente pulsa sobre el círculo de estado
Entonces la tarea pasa a "Completada"
Y se actualiza la barra porcentual de avance del capítulo "Acabados".
```
* **Prioridad:** Should Have | **Estimación:** 3 SP

---

### HU-17: Bitácora Diaria de Obra con Fotos y Clima
* **Como:** Residente de obra en campo.  
* **Quiero:** Publicar una entrada diaria con fotos del avance, selección del estado del clima y notas de incidentes.  
* **Para:** Mantener un registro histórico irrefutable de lo acontecido en la obra cada día.

#### Especificaciones de UX/UI & Usabilidad:
- **Selector de Clima en 1 Toque:** Tres iconos grandes: ☀️ *Soleado*, 🌧️ *Lluvia*, ☁️ *Nublado*.
- **Subida Múltiple de Fotos de Obra:**
  - Capacidad de seleccionar hasta 10 fotos a la vez.
  - Las fotos se comprimen en segundo plano en el navegador en formato WebP (< 800 KB).
  - Previsualización en carrusel horizontal con opción de eliminar fotos individuales antes de publicar.
- **Muro Social Estilo Feed:** Las entradas se ordenan cronológicamente en orden inverso (la más reciente arriba) con fecha y hora clara.

#### Criterios de Aceptación (Gherkin):
```gherkin
Dado que el residente está en la obra al final de la jornada
Cuando selecciona el clima "Soleado", escribe "Se colaron 15 columnas" y adjunta 4 fotos
Entonces el sistema procesa la entrada y la publica en el muro del proyecto
Y las imágenes se almacenan optimizadas sin consumir el plan de datos móvil del usuario.
```
* **Prioridad:** Must Have | **Estimación:** 5 SP

---

### HU-18: Selector de Privacidad en Bitácora (Visible para el Cliente: Sí/No)
* **Como:** Contratista / Dueño de la constructora.  
* **Quiero:** Marcar individualmente qué notas y fotos de la bitácora son visibles para el cliente final y cuáles son solo internas del equipo.  
* **Para:** Compartir avances profesionales con el cliente sin exponer problemas internos con proveedores, atrasos de cuadrilla o discusiones técnicas.

#### Especificaciones de UX/UI & Usabilidad:
- **Interruptor de Privacidad Prominente:**
  - Toggle Switch con icono claro: 👁️ *"Visible para el Cliente"* vs 🔒 *"Solo Equipo Interno"*.
- **Indicador Visual en el Muro:**
  - Entradas públicas: Badge verde sutil *"Compartido con el cliente"*.
  - Entradas privadas: Fondo ligeramente sombreado con badge ámbar *"Nota interna confidencial"*.
- **Diseño a Prueba de Errores:** Por defecto, las notas con palabras de alerta o incidentes graves sugieren mantener el estado privado antes de confirmar.

#### Criterios de Aceptación (Gherkin):
```gherkin
Dado que el residente crea una entrada de bitácora sobre una tubería rota accidentalmente
Cuando desmarca el interruptor "Visible para el cliente" y guarda la entrada
Entonces la publicación queda guardada en el muro interno de la empresa
Y cuando el cliente abre su portal web mediante su enlace único
Entonces dicha publicación está completamente oculta de su vista.
```
* **Prioridad:** Must Have | **Estimación:** 2 SP

---

## Módulo 5: Portal del Cliente y Control de Cobros

### HU-19: Portal Web Consolidado del Cliente sin Contraseña
* **Como:** Cliente final de la obra.  
* **Quiero:** Acceder desde un enlace que me envían por WhatsApp a un portal privado donde pueda ver mi saldo, firmar cambios y ver fotos del avance.  
* **Para:** Sentirme tranquilo e informado del avance de mi inversión sin tener que llamar al contratista a cada momento.

#### Especificaciones de UX/UI & Usabilidad:
- **Arquitectura de 3 Pestañas Claras (Bottom Navigation en Móvil):**
  1. 💳 **Finanzas:** Estado de cuenta claro (Total Contrato, Total Pagado, Saldo Restante).
  2. 📝 **Documentos:** Contrato firmado y Órdenes de Cambio pendientes de firma o históricas.
  3. 📸 **Avance:** Galería visual con fotos de la bitácora autorizadas, ordenadas por fecha.
- **Tarjeta de Saldo en Lenguaje Humano:**
  - Caja destacada superior:
    - *Total del Proyecto:* $ 20,850.00
    - *Total Pagado hasta la fecha:* $ 12,000.00
    - **Saldo Pendiente por Pagar:** **$ 8,850.00** (Destacado con botón opcional *"Ver cuenta de cobro"*).
- **Banner de Alerta si hay Cambios por Firmar:** Al tope del portal aparece un aviso azul: *"Tienes 1 trabajo adicional pendiente de aprobación. Toca aquí para revisar"*.

#### Criterios de Aceptación (Gherkin):
```gherkin
Dado que un cliente hace clic en el enlace de su portal desde WhatsApp
Cuando la página carga en su teléfono
Entonces no se solicita ningún usuario ni contraseña
Y se muestra el estado financiero real con las 3 pestañas de navegación
Y solo puede visualizar fotos de bitácora marcadas como públicas.
```
* **Prioridad:** Must Have | **Estimación:** 5 SP

---

### HU-20: Registro de Anticipos y Emisión de Estado de Cuenta PDF
* **Como:** Administrador / Dueño.  
* **Quiero:** Registrar abonos bancarios o en efectivo recibidos del cliente y generar un estado de cuenta en PDF para enviárselo al instante.  
* **Para:** Mantener las cuentas claras, evitar malos entendidos sobre saldos pendientes y cobrar oportunamente los hitos de obra.

#### Especificaciones de UX/UI & Usabilidad:
- **Modal de Registro de Pago:**
  - `Monto Recibido` (Input monetario grande con formato automático de miles).
  - `Fecha del Pago` (Por defecto hoy).
  - `Método de Pago` (Chips: *Transferencia*, *Efectivo*, *Cheque*, *Tarjeta*).
  - `Número de Referencia / Comprobante` (Opcional).
- **Generador de Estado de Cuenta en 1 Clic:** Botón *"Descargar Estado de Cuenta PDF"* o *"Compartir por WhatsApp"*.
- **Diseño del PDF:** Certificado limpio y sobrio con tabla de aportes históricos, saldo restante y datos bancarios para el siguiente desembolso.

#### Criterios de Aceptación (Gherkin):
```gherkin
Dado un proyecto con un saldo pendiente de $8,850.00
Cuando el contratista registra un abono por transferencia de $4,000.00
Entonces el saldo pendiente se reduce inmediatamente a $4,850.00 en el portal del cliente y en el sistema
Y se habilita la descarga instantánea del comprobante de estado de cuenta actualizado en formato PDF.
```
* **Prioridad:** Must Have | **Estimación:** 3 SP

---

## Matriz Resumen de Historias de Usuario (Backlog MVP)

| ID | Título de la Historia de Usuario | Módulo | Rol Primario | Prioridad | SP |
| :--- | :--- | :--- | :--- | :---: | :---: |
| **HU-01** | Captura Rápida de Lead en < 15 Segundos | Módulo 0 (CRM) | Administrador / Dueño | **Must** | 3 |
| **HU-02** | Formulario Web Público Embebible para Clientes | Módulo 0 (CRM) | Dueño / Cliente Web | **Should** | 5 |
| **HU-03** | Tablero Kanban Visual y Táctil de Oportunidades | Módulo 0 (CRM) | Administrador / Dueño | **Must** | 5 |
| **HU-04** | Ficha de Visita Técnica y Galería de Fotos del Antes | Módulo 0 (CRM) | Contratista / Tasador | **Must** | 3 |
| **HU-05** | Catálogo Maestro de Insumos con Búsqueda Predictiva | Módulo 1 (Presupuestos) | Estimador / Dueño | **Must** | 5 |
| **HU-06** | Constructor Jerárquico de Presupuestos por Capítulos | Módulo 1 (Presupuestos) | Dueño de Empresa | **Must** | 8 |
| **HU-07** | Selector de Esquema Fiscal Transparente (IVA vs AIU) | Módulo 1 (Presupuestos) | Contratista | **Must** | 5 |
| **HU-08** | Duplicar Presupuesto como Plantilla en 1 Clic | Módulo 1 (Presupuestos) | Contratista | **Should** | 3 |
| **HU-09** | Vista Previa y PDF Comercial con Protección de Márgenes | Módulo 2 (Propuestas) | Contratista / Cliente | **Must** | 5 |
| **HU-10** | Tracking de Lectura de la Propuesta en Tiempo Real | Módulo 2 (Propuestas) | Dueño / Ventas | **Should** | 3 |
| **HU-11** | Firma Electrónica Táctil sin Contraseña para el Cliente | Módulo 2 (Propuestas) | Cliente Final | **Must** | 5 |
| **HU-12** | Transición Automática de Propuesta a Obra en Ejecución | Módulo 2 (Propuestas) | Sistema / Dueño | **Must** | 5 |
| **HU-13** | Matriz Financiera en Vivo de Presupuesto vs Real | Módulo 3 (Costos) | Administrador / Dueño | **Must** | 8 |
| **HU-14** | Registro Rápido de Gastos de Obra en 3 Toques (PWA) | Módulo 3 (Costos) | Residente de Obra | **Must** | 5 |
| **HU-15** | Cotización y Firma de Órdenes de Cambio (Adicionales) | Módulo 3 (Costos) | Contratista / Cliente | **Must** | 5 |
| **HU-16** | Cronograma Táctil de Tareas de Obra (Lista / Calendario)| Módulo 4 (Ejecución) | Residente / Dueño | **Should** | 3 |
| **HU-17** | Bitácora Diaria de Obra con Fotos y Clima | Módulo 4 (Ejecución) | Residente de Obra | **Must** | 5 |
| **HU-18** | Selector de Privacidad en Bitácora (Visible: Sí/No) | Módulo 4 (Ejecución) | Contratista / Residente | **Must** | 2 |
| **HU-19** | Portal Web Consolidado del Cliente sin Contraseña | Módulo 5 (Portal Cliente)| Cliente Final | **Must** | 5 |
| **HU-20** | Registro de Anticipos y Emisión de Estado de Cuenta PDF| Módulo 5 (Portal Cliente)| Administrador / Dueño | **Must** | 3 |
| **TOTAL**| **20 Historias de Usuario MVP** | | | | **91 SP** |
