# Test Vocacional

Web estática con un test vocacional de opción múltiple. Según las respuestas, recomienda carreras concretas y arma un plan de acción para decidir.

## Cómo usarla

Abrí `index.html` en el navegador. No necesita instalación ni servidor. Para tener un link y compartirla, activá GitHub Pages en **Settings → Pages**, con la rama `main`.

## Qué incluye

- **36 preguntas** en 4 partes: intereses, temas que atraen, habilidades y preferencias (duración, matemática, sangre/hospitales, contacto con gente, lugar de trabajo y prioridades). También pregunta el país (Uruguay, Argentina u otro).
- **Perfil vocacional** según el modelo RIASEC (Holland), con fortalezas y temas de interés.
- **70 carreras y formaciones**, de cada una: compatibilidad en %, por qué se recomienda, advertencias, duración, tipo de formación, cómo es un día de trabajo, materias, salida laboral y dónde estudiarla en Uruguay o Argentina.
- **Opciones cortas** (2 años o menos) para empezar a trabajar rápido.
- **Favoritas**: se marcan con ☆ y se comparan en una tabla.
- **Plan de acción** paso a paso, adaptado al perfil y al país.
- Guardar en PDF o imprimir, compartir por WhatsApp y copiar un resumen.
- Las respuestas se guardan en el navegador, así que se puede cortar el test y seguir después.

## Cómo funciona la recomendación

Cada carrera tiene un código RIASEC, temas, habilidades y características (duración, nivel de matemática, contacto con gente, sangre, lugar de trabajo y salida laboral). La compatibilidad combina:

- 40 %: parecido con el perfil RIASEC
- 35 %: temas que le interesan
- 25 %: habilidades

Después el puntaje se ajusta según las preferencias. Por ejemplo, una carrera más larga de lo que la persona quiere estudiar, o con mucha matemática si no le gusta, baja su puntaje y muestra un aviso.

## Personalizar

- `data.js`: preguntas, carreras, textos del plan de acción e información por país.
- `app.js`: lógica del test y del cálculo.
- `styles.css`: estilos (incluye modo oscuro y estilos de impresión).

Las duraciones e instituciones son aproximadas: conviene confirmarlas en la web oficial de cada lugar.
