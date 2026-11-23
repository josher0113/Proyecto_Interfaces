# Conecta LSM

Conecta LSM es un proyecto educativo para empezar a aprender Lengua de Señas Mexicana (LSM). Propone una ruta de lecciones breves, práctica guiada y un espacio de consulta de expresiones. El objetivo es facilitar el estudio autónomo y ayudar a que cada persona pueda retomar su avance.

## Probar el prototipo

Para probar la versión actual, cambia a `Manuel`. Puedes abrir `index.html` directamente para recorrer el prototipo. Sirve esa misma carpeta mediante `localhost` o HTTPS para probar la cámara y el dictado. Los pasos están en el [manual](docs/MANUAL_USUARIO.md).

1. En la bienvenida, selecciona **Comenzar** para entrar al inicio.
2. En **Aprender**, selecciona **Explorar números** para practicar del 1 al 10 con cámara o abre **Abecedario** para practicar sus 27 letras. Selecciona **Explorar saludos**, **Explorar expresiones** o **Explorar frases** para practicar frente a la cámara en espejo.
3. En **Traductor**, escribe o dicta una expresión en español y selecciona **Traducir**. Puedes consultar seis expresiones escritas en SignWriting y abrir sus prácticas relacionadas dentro de la app.
4. En **Progreso**, consulta tu avance por letra y por número. Cada seña pasa a verde después de registrar un acierto en cada uno de tres días distintos.

## Métodos de trabajo

- **Prototipado por etapas.** La primera versión reúne siete pantallas enlazadas para revisar el recorrido, la claridad de los controles y la retroalimentación. El diseño usa navegación lateral en escritorio y navegación inferior en móvil.
- **Implementación web estática.** HTML define la entrada, CSS adapta el diseño a distintos tamaños y JavaScript organiza las vistas, reutiliza componentes y gestiona la navegación mediante el fragmento de URL.
- **Práctica por seña.** Números, Saludos básicos y Expresiones cotidianas usan fichas de referencia y práctica directa. Frases y comunicación básica reúne señas de apoyo para presentarse, pedir ayuda e invitar a participar. Los materiales se incluyen en la app para que cada actividad se complete dentro de Conecta LSM. Este será el formato de las próximas unidades.
- **Contenido educativo validado.** Las demostraciones se incorporan después de revisar sus fuentes. El traductor muestra grafías de LSM documentadas en SignPuddle Online. Las grafías se incluyen como imágenes locales y sus variantes se revisarán con personas usuarias de LSM.
- **Interacción por voz y gestos.** Traductor usa el servicio de voz del navegador para introducir texto en español de México. Práctica usa MediaPipe para seguir las manos en el navegador. Un clasificador experimental compara las posturas y los movimientos del abecedario y de Números, y el avance se registra por días. La validación con participantes y dispositivos físicos sigue pendiente.

## Archivos y seguimiento

| Archivo | Contenido |
| --- | --- |
| [index.html](index.html) | Entrada del prototipo |
| [styles.css](styles.css) | Identidad visual y diseño adaptable |
| [app.js](app.js) | Vistas, navegación y datos de ejemplo |
| [Bitácora](CHANGELOG.md) | Cambios registrados desde el prototipo inicial |
| [Pendientes](docs/PENDIENTES.md) | Trabajo por completar y criterios de revisión |
| [Manual de usuario](docs/MANUAL_USUARIO.md) | Recorrido del prototipo y comprobaciones de navegación |
| [Propuesta de solución](docs/PROPUESTA_SOLUCION.md) | Requisitos, arquitectura, infraestructura y fuentes del piloto |
