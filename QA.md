# Verificación · 16 noviembre 2026

## Funciones verificadas en el navegador

- PASS: alta de una entrada aislada, edición, nivel completado y eliminación de esa entrada de prueba.
- PASS: estado en curso con fecha y duración; completar un paso limpia su fecha y actualiza el nivel actual.
- PASS: recarga conserva la entrada y el paso registrado.
- PASS: autoguardado de campos válidos con 500 ms de espera; prueba sin pulsar Guardar y posterior recarga. Los borradores se guardan en una clave local independiente y se recuperan al abrir.
- PASS: exportación descarga JSON; importación de esa copia restaura el cuaderno tras confirmar.
- PASS: JSON inválido muestra error; alternar Formulario / JSON conserva valores y claves desconocidas.
- PASS: Copiar JSON, cerrar editor sin cambios y Escape. Se corrigió la normalización de la URL de imagen vacía para no marcar cambios inexistentes.
- PASS: búsqueda, categorías, filtros de estado, orden, solo nuevas y limpiar filtros; estado vacío visible.
- PASS: visor real a 320, 390, 800 y anchura normal. scrollWidth menor o igual a innerWidth; controles sin desbordamiento. Selector de categorías compacto en móvil.
- PASS: las imágenes de construcciones visibles cargan en el navegador. Los enlaces de todos los edificios y trampas se resolvieron mediante imageinfo de la wiki. Son referencias máximas, las tropas usan ilustraciones generales.
- PASS: consola sin errores de aplicación al terminar las pruebas.
- PASS: sintaxis de app.js y data.js con node --check.
- PASS: contraste medido por contrast-check.py: Moss Ink sobre Pistachio 15.42:1; sobre Lime 8.09:1; sobre blanco 16.72:1. Bordes y foco usan Moss Ink.

Los muros están excluidos del catálogo y del progreso. El catálogo inicial tiene 84 entradas y 232 pasos, no representa la aldea real hasta que el usuario ajuste sus niveles. La duración y el coste no se han inventado. La API del juego no está conectada. Las imágenes se sirven desde la wiki y pueden depender de su disponibilidad.

## Antislop Delivery Gate

Cada resultado corresponde al código y las pruebas anteriores. ENERGY 2 / RHYTHM 2 / MOTION 1; dirección en DESIGN.md.

| Ítem | Estado | Evidencia |
|---|---|---|
| R-02 | PASS | Texto de interfaz sin raya larga ni copy comercial. |
| R-03 | PASS | 320, 390 y 800 px sin desbordamiento. |
| R-17 | PASS | Contadores derivados del catálogo y progreso personal. |
| R-18 | PASS | Sin testimonios. |
| R-23 | PASS | Imágenes web solicitadas por el usuario, sin logos creados. |
| R-24 | PASS | Sin navegación a páginas inexistentes. |
| R-25 | PASS | Contraste calculado 8.09:1 o superior en texto y controles. |
| R-26 | PASS | Botones y campos ejercitados; alta, edición, copia y restauración reales. |
| R-27 | PASS | Carga inicial, aviso de error y estado sin resultados implementados. |
| R-28 | PASS | Sin FAQ. |
| R-32 | PASS | Elementos nativos, foco visible y cierre por Escape verificado. |
| R-33 | PASS | Archivos editados directamente con apply_patch. |
| R-34 | PASS | Un único tema Cropi solicitado. |
| R-35 | PASS | App servida y comprobada en navegador; recorrido de controles registrado arriba. |
| R-36 | PASS | Sin afirmaciones de seguridad, rendimiento o clientes. |
| R-37 | PASS | Dirección Cropi y diales explícitos previos a la generación. |
| R-38 | PASS | Datos de captura y fuentes enlazadas; incertidumbres visibles. |
| R-01 | PASS | Sin degradados ni brillos. |
| R-04 | PASS | Renders del juego identifican las mejoras; sin iconos genéricos. |
| R-06 | PASS | Arial para densidad y legibilidad según Cropi. |
| R-07 | PASS | Sin textura ni cuadrícula decorativa. |
| R-08 | PASS | Solo flecha entre niveles de un plan, con significado. |
| R-09 | PASS | Sin badges decorativos. |
| R-10 | PASS | Sin glassmorphism. |
| R-12 | PASS | Sin sombras decorativas. |
| R-13 | PASS | Sin glow. |
| R-14 | PASS | Filas uniformes para comparar mejoras de la misma naturaleza. |
| R-19 | PASS | Sin animaciones continuas, movimiento limitado a estado del botón. |
| R-22 | PASS | Ilustraciones relacionadas con tropas y construcciones. |
| Liveliness | PASS | Progreso primero, filas de edificio/nivel, acento de selección; diales 2/2/1. |
| C-1 | PASS | Decisiones justificadas en DESIGN.md. |
| C-2 | PASS | Acciones verificadas en la app. |
| C-3 | PASS | Secciones orientadas a registrar, filtrar y respaldar mejoras. |
| C-4 | PASS | Reflujo, controles nativos, diálogo y estado vacío verificados. |
| C-5 | PASS | Sin datos de progreso ni costes ficticios. |
| R-05 | PASS | Panel de trabajo, sin estructura de landing. |
| R-11 | PASS | Radios de 3–5 px de Cropi. |
| R-15 | PASS | Acciones concretas: Añadir, Guardar, Completar, Importar y Exportar. |
| R-16 | PASS | Sin vocabulario promocional. |
| R-20 | PASS | Identidad de catálogo de mejoras con renders y niveles del juego. |
| R-21 | PASS | Tema claro definido por la skill Cropi. |
| R-29 | PASS | Moss Ink, Lime, Pistachio y blanco auxiliar. |
| R-30 | PASS | Estilo personal Cropi, sin clonar productos. |
| R-31 | PASS | Jerarquía, bordes y tipografía documentados en DESIGN.md. |
