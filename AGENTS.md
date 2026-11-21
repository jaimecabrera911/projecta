# Guía de Agentes y Arquitectura de Trabajo (AGENTS.md)
## ObraFlow — Plataforma SaaS de Gestión de Obras y Presupuestos

---

## 1. Equipo de Agentes Especializados (.agents)

El proyecto cuenta con un equipo de subagentes especializados organizados bajo el directorio [`.agents/`](file:///C:/Users/Usuario/Documents/Proyectos/projecta/.agents/README.md):

- **[developer-agent](file:///C:/Users/Usuario/Documents/Proyectos/projecta/.agents/developer-agent.md):** Desarrollador Fullstack Senior enfocado en Astro, TypeScript, Canvas API y estilos locales sin dependencias CDN.
- **[qa-tester-agent](file:///C:/Users/Usuario/Documents/Proyectos/projecta/.agents/qa-tester-agent.md):** Ingeniero de Calidad y Pruebas que audita los criterios de aceptación Gherkin (`specs/*.spec.md`), edge cases y protecciones de seguridad.
- **[ux-ui-reviewer-agent](file:///C:/Users/Usuario/Documents/Proyectos/projecta/.agents/ux-ui-reviewer-agent.md):** Auditor de Diseño y Ergonomía de Obra, responsable de velar por el cumplimiento de la directiva *Operate Mode* y los estándares de la skill `impeccable`.

Para coordinar desarrollos complejos, se sigue el ciclo de **Implementación (Developer) → Validación Funcional (QA) → Auditoría Visual & Ergonómica (UX/UI)**.

---

## 2. Directiva Obligatoria de Diseño: Skill `impeccable`

Todo el diseño y construcción de interfaces en ObraFlow se rige de manera obligatoria bajo la skill **`impeccable`** (consulta la guía completa de comandos en [`IMPECCABLE.md`](file:///C:/Users/Usuario/Documents/Proyectos/projecta/IMPECCABLE.md)) y los principios definidos en [`PRODUCT.md`](file:///C:/Users/Usuario/Documents/Proyectos/projecta/PRODUCT.md):

1. **Operate Mode (Ergonomía de Campo):**
   - Los usuarios principales interactúan desde obras con luz solar directa, polvo o manos enguantadas.
   - **Áreas táctiles mínimas:** $48 \times 48\text{ px}$ en cualquier botón o control táctil en dispositivos móviles.
   - **Zona del pulgar:** Elementos de acción frecuente (FAB, botones principales, selectores de chips) en la zona inferior de la pantalla.
   - **Alto contraste:** Contraste mínimo WCAG AA (4.5:1 en texto normal, 3:1 en títulos grandes).

2. **Cero Dependencias CDN Externas:**
   - Todo el CSS debe ser local y autocontenido (`src/styles/global.css` y bloques `<style>` encapsulados en cada componente Astro).
   - Prohibido depender de scripts o estilos cargados vía CDN en tiempo de ejecución.

3. **Tokens de Diseño de Marca:**
   - **Fondo / Estructura:** Slate 900 (`#0F172A`), Slate 800 (`#1E293B`), Slate 50 (`#F8FAFC`).
   - **Acento / Seguridad:** Naranja Seguridad (`#F97316`, `#EA580C`).
   - **Éxito / Presupuesto Aprobado:** Verde Esmeralda (`#10B981`, `#059669`).
   - **Tipografía:** *Plus Jakarta Sans* para interfaz y *JetBrains Mono* para cifras, teléfonos y valores monetarios.

4. **Interacciones Nativas Prohibidas:**
   - Nunca usar `alert()`, `confirm()` o `prompt()` nativos del navegador. Toda interacción debe resolverse mediante modales personalizados, bottom-sheets táctiles o notificaciones toast.

---

## 3. Arquitectura Basada en Componentes e Identificación

### 1. Arquitectura basada en componentes
- Todo elemento de interfaz, funcionalidad, sección, vista o módulo **DEBE** estar implementado mediante componentes.
- Evitar archivos monolíticos, componentes demasiado grandes y código duplicado.
- Construir las interfaces complejas mediante la composición de componentes pequeños y reutilizables.
- Mantener una arquitectura modular, escalable y fácil de mantener.

### 2. Identificación única de componentes (ID)
- **TODOS** los componentes **DEBEN** tener un `id` único, descriptivo y estable.
- Los identificadores deben permitir reconocer, localizar, rastrear, probar y mantener cada componente.
- Los IDs deben ser semánticos y representar claramente el propósito del componente.
- No generar IDs aleatorios en cada renderizado.
- Mantener los mismos IDs durante modificaciones, actualizaciones y refactorizaciones, siempre que la identidad del componente no cambie.
- Evitar componentes sin identificación.

### 3. Responsabilidad y reutilización
- Cada componente **DEBE** tener una única responsabilidad claramente definida.
- Si un componente realiza varias tareas independientes, dividirlo en componentes más pequeños.
- Antes de crear un componente nuevo, verificar si existe uno que pueda reutilizarse o extenderse.
- Evitar duplicar estructuras visuales, lógica o funcionalidades.
- Mantener los componentes independientes y reutilizables siempre que sea posible.

### 4. Composición y organización
- Toda funcionalidad nueva **DEBE** integrarse siguiendo la arquitectura de componentes existente.
- Separar la lógica, la presentación y las responsabilidades cuando corresponda.
- Mantener una estructura de archivos y carpetas coherente.
- Evitar concentrar múltiples funcionalidades en un solo componente.
- Los componentes principales deben estar formados por componentes secundarios identificables.

### 5. Mantenimiento y trazabilidad
- Todo componente debe poder identificarse de manera inequívoca mediante su ID.
- Cualquier modificación debe conservar los identificadores existentes cuando corresponda.
- Los cambios deben respetar la estructura y las relaciones entre componentes.
- Los componentes deben facilitar las pruebas automatizadas, la depuración y el seguimiento de errores.

### Reglas obligatorias
- Todo elemento de interfaz o unidad funcional **DEBE** pertenecer a un componente.
- Todo componente **DEBE** tener un ID único, descriptivo y estable.
- No se permiten componentes anónimos o sin identificación.
- Se **DEBE** priorizar la reutilización frente a la duplicación.
- Se **DEBE** aplicar el principio de responsabilidad única.
- Se **DEBE** utilizar composición para construir interfaces complejas.
- Se **DEBEN** conservar los IDs durante las refactorizaciones cuando la identidad del componente no cambie.

> [!IMPORTANT]
> Estas reglas aplican a todo el proyecto: código nuevo, funcionalidades existentes, correcciones y refactorizaciones.
> Estas directrices son obligatorias y deben respetarse en todas las implementaciones, sin excepciones, salvo que exista una justificación técnica documentada.

---

## 4. Entorno de Desarrollo (Dev Server)

Al iniciar el servidor de desarrollo, utilizar el modo en segundo plano (background):

```bash
astro dev --background
```

Administrar el servidor en segundo plano con:
- `astro dev stop`
- `astro dev status`
- `astro dev logs`

---

## 5. Documentación Oficial y Referencias

- Documentación general de Astro: https://docs.astro.build
- [Rutas, páginas dinámicas y middleware](https://docs.astro.build/en/guides/routing/)
- [Componentes Astro](https://docs.astro.build/en/basics/astro-components/)
- [Estilos y diseño](https://docs.astro.build/en/guides/styling/)
- [Colecciones de contenido](https://docs.astro.build/en/guides/content-collections/)
