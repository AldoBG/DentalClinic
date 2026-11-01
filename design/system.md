# Design System Master — Consultorio Dra. Laura (UI/UX Pro Max)

## 1. Filosofía y Dirección Visual
- **Categoría**: Healthcare Clinical Operations Dashboard + Orthodontics & Harmonic Cadence (Densidad 8/10, Varianza 4/10, Movimiento 5/10)
- **Perfil Profesional**: Dra. Laura — Especialista en Ortodoncia (alineación progresiva por etapas/arcos) con afinidad por la música (cadencia armónica, pulso rítmico de consultorio).
- **Tipografía**: `Atkinson Hyperlegible` (Google Fonts) — optimizada para lectura rápida clínica, distinción clara de caracteres y contraste WCAG AAA.
- **Iconografía**: SVG lineal (Lucide/Heroicons style, `stroke-width="2"`). **Cero emojis** en toda la interfaz.

## 2. Paleta de Colores (Tokens CSS)
| Token | Hex | Rol Clínico |
| :--- | :--- | :--- |
| `--color-bg` | `#F8FAFC` | Fondo general de aplicación (Slate 50) |
| `--color-surface` | `#FFFFFF` | Superficie de tarjetas, tablas y paneles |
| `--color-surface-muted` | `#F1F5F9` | Cabeceras de tabla, bloques secundarios |
| `--color-primary` | `#0891B2` | Cyan Clínico Principal (focos, enlaces activos, indicadores, onda acústica) |
| `--color-primary-dark` | `#164E63` | Navy/Cyan Oscuro (encabezados y navegación principal) |
| `--color-accent` | `#059669` | Verde Salud / WhatsApp CTA (confirmaciones y contacto directo) |
| `--color-warning` | `#D97706` | Ámbar (Tratamiento activo sin próxima cita) |
| `--color-danger` | `#DC2626` | Rojo Clínico (Inasistencia / No-show) |
| `--color-text` | `#0F172A` | Texto principal de alto contraste |
| `--color-text-muted` | `#475569` | Texto secundario / metadatos |
| `--color-border` | `#E2E8F0` | Bordes técnicos sutiles |

## 3. Reglas de UX, Animación e Interacción (UI/UX Pro Max)
1. **Regla de los 60 segundos**: El panel principal muestra KPIs operativos arriba, listado de excepciones filtrable a la izquierda y seguimiento de tratamientos multisesión (con énfasis en arcos de ortodoncia) a la derecha.
2. **Animación Armónica y Ortodóncica (Motion 5/10)**:
   - **Cadencia Acústica Interactiva**: Widget de ritmo clínico con ecualizador SVG animado (`transform: scaleY`) y visualización de arco ortodóncico sincronizado, con control de pausa/reproducción (`aria-pressed`) y selector de ambiente sonoro.
   - **Staggered Reveal**: Entrada escalonada de tarjetas (`cubic-bezier(0.22, 1, 0.36, 1)`) para guiar el escaneo visual sin fatiga.
   - **Accesibilidad Motora**: Respeto estricto a `@media (prefers-reduced-motion: reduce)`, desactivando animaciones continuas cuando el sistema lo solicita.
3. **Touch & Click Targets**: Altura mínima de `40px-44px` en botones interactivos, `cursor: pointer` obligatorio y estados `:hover` / `:focus-visible` con transiciones de `180ms`.
4. **Acciones Cero-Fricción**: Cada alerta permite enviar WhatsApp con mensaje prellenado o resolver la excepción (agendar próxima cita / confirmar asistencia) en un solo clic.
