# Guía de Comandos y Estándares de Diseño — Skill Impeccable
## ObraFlow SaaS — Plataforma de Gestión de Obras y Presupuestos

---

## 1. Filosofía y Estándar de Calidad Impeccable

La skill **`impeccable`** establece la barra de excelencia en diseño, código de interfaz de grado producción y ergonomía para ObraFlow. Se orienta bajo el principio de **cero atajos, código limpio y robusto** y un lenguaje visual adaptado a la realidad del sector de la construcción.

### Reglas Obligatorias en ObraFlow:
1. **Operate Mode (Ergonomía de Campo):**
   - Interacción optimizada para luz solar directa, polvo y uso con una sola mano.
   - **Áreas táctiles mínimas:** $\ge 48 \times 48\text{ px}$ en cualquier botón o control móvil.
   - **Zona del pulgar:** Elementos de acción frecuente y botones primarios en la zona inferior/accesible.
   - **Alto contraste:** Contraste mínimo WCAG AA (4.5:1 en texto normal, 3:1 en títulos grandes).
2. **Cero Dependencias CDN Externas:**
   - Estilos 100% locales en `src/styles/global.css` y bloques `<style>` encapsulados en componentes Astro.
3. **Cero Emojis Unicode:**
   - 100% iconos vectoriales SVG limpios (Feather / Lucide).
4. **Cero Diálogos Nativos:**
   - Prohibido el uso de `alert()`, `confirm()` o `prompt()`. Toda interacción se resuelve mediante modales accesibles con backdrop blur, bottom sheets táctiles o notificaciones toast.
5. **Tipografía Oficial:**
   - *Plus Jakarta Sans* para interfaz y contenido.
   - *JetBrains Mono* estricto para valores monetarios, teléfonos, fechas y códigos numéricos.

---

## 2. Modos de Diseño

El modo define cómo se evalúa el éxito del usuario en cada pantalla:

| Modo | Aplicación en ObraFlow | Enfoque Principal |
| :--- | :--- | :--- |
| **Operate** | Tablero Kanban, Ficha de Visita, Constructor de Presupuestos, Bitácora, Gastos. | Escaneabilidad inmediata, consistencia, ergonomía de campo y ejecución ágil de tareas. |
| **Persuade** | Páginas públicas de captura (`/f/[slug]`), landing page y vista de cotización para cliente. | Transmitir rigor técnico, confianza comercial, claridad de valor y llamada a la acción. |
| **Read** | Reportes de obra, matriz presupuesto vs real, bitácoras históricas y exportables. | Jerarquía de lectura, claridad de datos, tablas legibles y contraste óptimo. |
| **Experience** | Vista previa comercial en PDF y portal táctil interactivo de aprobación. | La propuesta técnica y el render del proyecto son protagonistas; la interfaz se repliega. |

---

## 3. Menú Completo de Comandos (`/impeccable`)

### 🛠️ Construir y Documentar (Build)
| Comando | Sintaxis | Descripción |
| :--- | :--- | :--- |
| **`init`** | `/impeccable init` | Captura el contexto estratégico del producto, usuario y restricciones en `PRODUCT.md`. |
| **`document`** | `/impeccable document` | Analiza el código existente y genera/actualiza el sistema de diseño en `DESIGN.md`. |
| **`shape`** | `/impeccable shape [funcionalidad]` | Planifica la experiencia de usuario y arquitectura de interfaz antes de codificar. |
| **`extract`** | `/impeccable extract [archivo]` | Extrae tokens de color, tipografía y componentes hacia el sistema de diseño compartido. |

---

### 🔍 Evaluar y Auditar (Evaluate)
| Comando | Sintaxis | Descripción |
| :--- | :--- | :--- |
| **`critique`** | `/impeccable critique [archivo]` | Revisión heurística profunda de UX/UI con puntuación (0-100), hallazgos P0/P1/P2 y sugerencias. |
| **`audit`** | `/impeccable audit [archivo]` | Chequeos técnicos rigurosos: accesibilidad WCAG AA, contraste, áreas táctiles $\ge 48\text{ px}$ y responsive. |

---

### ✨ Refinar y Pulir (Refine)
| Comando | Sintaxis | Descripción |
| :--- | :--- | :--- |
| **`polish`** | `/impeccable polish [archivo]` | Pase de calidad final: alinea micro-espaciados, bordes, estados hover/focus y estados activos. |
| **`bolder`** | `/impeccable bolder [archivo]` | Da mayor peso visual, jerarquía y contraste a interfaces que lucen tímidas o excesivamente planas. |
| **`quieter`** | `/impeccable quieter [archivo]` | Reduce la sobrecarga visual, atenúa sombras o colores saturados en vistas congestionadas. |
| **`distill`** | `/impeccable distill [archivo]` | Simplifica una pantalla a su esencia, eliminando pasos redundantes y fricción cognitiva. |
| **`harden`** | `/impeccable harden [archivo]` | Prepara para producción: estados de error de red, textos largos, timeouts y edge cases. |
| **`onboard`** | `/impeccable onboard [archivo]` | Diseña pantallas de primer uso, placeholders vacíos instructivos (empty states) y activación. |

---

### 🎨 Mejorar y Elevar (Enhance)
| Comando | Sintaxis | Descripción |
| :--- | :--- | :--- |
| **`animate`** | `/impeccable animate [archivo]` | Agrega micro-animaciones funcionales (ej. ecualizador de voz, transiciones entre etapas). |
| **`colorize`** | `/impeccable colorize [archivo]` | Aplica color de acento intencional (Naranja Seguridad `#EA580C`, Verde Esmeralda `#059669`). |
| **`typeset`** | `/impeccable typeset [archivo]` | Perfecciona la escala tipográfica, espaciado entre letras (*tracking*) y legibilidad de números mono. |
| **`layout`** | `/impeccable layout [archivo]` | Corrige el flujo de información, balance en rejilla y proporción de columnas. |
| **`delight`** | `/impeccable delight [archivo]` | Añade detalles que transmiten oficio y profesionalismo sin ralentizar al usuario. |
| **`overdrive`** | `/impeccable overdrive [archivo]` | Empuja un componente más allá de lo convencional hacia una experiencia fuera de serie. |

---

### 🔧 Corregir y Adaptar (Fix)
| Comando | Sintaxis | Descripción |
| :--- | :--- | :--- |
| **`clarify`** | `/impeccable clarify [archivo]` | Perfecciona microcopys de interfaz, etiquetas de formulario y mensajes de ayuda en obra. |
| **`adapt`** | `/impeccable adapt [archivo]` | Adapta y valida la interfaz para pantallas móviles compactas, tablets y orientación horizontal. |
| **`optimize`** | `/impeccable optimize [archivo]` | Diagnostica cuellos de botella de renderizado, peso de imágenes y fluidez visual (60 FPS). |

---

### ⚡ Iterar en Vivo (Iterate)
| Comando | Sintaxis | Descripción |
| :--- | :--- | :--- |
| **`live`** | `/impeccable live` | Inicia el servidor de variantes interactivas en vivo. Permite seleccionar elementos directamente en el navegador (`localhost:4321`) y generar alternativas estilísticas en caliente. |

---

## 4. Diagnóstico y Mantenimiento

- **`/impeccable doctor`**: Audita la coherencia entre `PRODUCT.md`, `DESIGN.md` y los componentes de la aplicación para reportar desvíos de tokens o tokens huérfanos.
- **`/impeccable hooks <on|off|status>`**: Activa o desactiva el hook que verifica automáticamente que ningún archivo Astro nuevo introduzca estilos fuera de la guía de diseño.

---

## 5. Integración con el Flujo de Trabajo (.agents)

Para cada nueva funcionalidad, se sigue la cadena de trabajo:
1. **Implementación (`developer-agent`):** Construye la vista o componente con arquitectura modular e IDs únicos.
2. **Validación Funcional (`qa-tester-agent`):** Verifica criterios de aceptación, 0 emojis, 0 alertas nativas y manejo de errores.
3. **Auditoría de Diseño (`ux-ui-reviewer-agent`):** Ejecuta `/impeccable audit` o `/impeccable critique` para certificar el cumplimiento de **Operate Mode** y calidad visual Impeccable.
