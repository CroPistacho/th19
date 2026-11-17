# TH19 · Mejoras

Seguimiento de mejoras de Clash of Clans. Web estática con HTML, CSS y JavaScript, sin servidor de aplicación, cuentas ni dependencias de OpenAI.

## Uso

- Constructores, laboratorio y mascotas en listas separadas, con los filtros del juego y Cost Max inicial.
- Una tarjeta por unidad y nivel. Los niveles anteriores se completan al avanzar esa misma unidad.
- Constructor reversible y fondo oscuro mientras trabaja. El martillo termina la tarea; el icono Cancel la devuelve a pendiente.
- Arrastre, alternativa de teclado y prioridades independientes para NEW y mejoras.
- Guardado automático en localStorage. Exportación e importación separadas de orden y progreso.

Cada visitante conserva sus datos en su propio navegador. No se envían a GitHub ni se sincronizan entre dispositivos. Si cambias de dominio o navegador, exporta el orden y el progreso e impórtalos en la nueva dirección.

Los costes y tiempos no confirmados se omiten. Se pueden introducir pulsando el nombre de la tarea. El catálogo parte de TH18 máximo como referencia y no consulta la cuenta del juego. Los muros están excluidos.

## Probar en local

Desde esta carpeta, con Python 3:

```sh
python -m http.server 8000 --directory dist
```

Abre [localhost:8000](http://localhost:8000). Sirve la carpeta por HTTP; abrir index.html directamente puede bloquear la carga del catálogo de imágenes.

Para comprobar el modelo necesitas Node.js 18 o posterior:

```sh
npm test
```

No hay que instalar paquetes ni ejecutar una compilación. `dist/` contiene la web completa.

## Publicar el código en GitHub

1. Crea un repositorio vacío llamado, por ejemplo, `coc-th19-tracker`, con visibilidad **Public**.
2. Sube el contenido de esta carpeta, incluida `.github/`. Puedes usar GitHub Desktop, Git o la interfaz web.
3. Para que la web también sea pública, abre **Settings → Pages → Build and deployment → Source** y selecciona **GitHub Actions**.
4. Ejecuta el flujo **Publish website**, o sube un cambio a `main`. El enlace publicado aparece en la ejecución y en Settings → Pages.

El flujo comprueba la sintaxis, ejecuta las pruebas y publica únicamente `dist/`. Sigue el [flujo oficial de GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).

Con Git, después de crear el repositorio vacío:

```sh
git init -b main
git add .
git commit -m "Add TH19 upgrade tracker"
git remote add origin https://github.com/TU_USUARIO/coc-th19-tracker.git
git push -u origin main
```

Sustituye `TU_USUARIO` por tu cuenta. Si Git todavía no tiene configurados tu nombre y correo, configúralos antes del commit.

## Archivos

- `dist/data.js`: catálogo de referencia.
- `dist/model.js`: migración, niveles, clasificación, progreso y orden.
- `dist/app.js`: interfaz, filtros, estados y guardado local.
- `dist/images.json`: referencias de imágenes públicas.
- `test-model.cjs`: pruebas del modelo.
- `.github/workflows/pages.yml`: publicación en GitHub Pages.

## Imágenes

Los gráficos enlazados pertenecen a Supercell y se sirven desde Clash of Clans Wiki. Consulta [ASSETS.md](ASSETS.md) para las fuentes y atribuciones. Este repositorio no incluye una licencia para esos gráficos ni es un producto oficial de Supercell.
