# Test Vocacional

Web estática con un test vocacional de opción múltiple. Según las respuestas, muestra las áreas de interés más fuertes y carreras/ocupaciones recomendadas.

## Cómo usarla

Abrí `index.html` en el navegador. No necesita instalación ni servidor.

## Cómo funciona

- Está basado en el modelo **RIASEC** (Holland): Realista, Investigador, Artístico, Social, Emprendedor y Convencional.
- Cada opción de cada pregunta suma un punto a una de esas áreas.
- Al final se muestra el área principal (y una segunda si está cerca), con su descripción, carreras sugeridas y un gráfico del perfil completo.

## Personalizar

Todo el contenido está en `app.js`:

- `QUESTIONS`: las preguntas y, para cada opción, a qué área suma.
- `AREAS`: nombre, descripción, color y carreras de cada área.
