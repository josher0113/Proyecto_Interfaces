# Vosk para el dictado local

- `vosk.js` es el archivo distribuido por [vosk-browser 0.0.8](https://registry.npmjs.org/vosk-browser/-/vosk-browser-0.0.8.tgz). Incluye el trabajador y WebAssembly de Vosk. SHA-256: `29504515526e974f4cb053cf08811c4de5fb2a74007c0a5a957db50eaa8d5d0c`.
- `model-es.tar.gz` contiene [vosk-model-small-es-0.42](https://alphacephei.com/vosk/models/vosk-model-small-es-0.42.zip). El modelo de español general se reempaquetó de ZIP a TAR.GZ para el lector web. El contenido del modelo conserva su README y el aviso de AC Technologies LLC. SHA-256: `2e26dcfeb4caded81d2b059bd3e524d7c67607de67c1a6c3f640c9b18db6e143`.

El motor y el modelo se distribuyen bajo [Apache 2.0](LICENSE). Se conservan los [avisos de terceros](NOTICE). El navegador toma ambos archivos del mismo origen cuando se activa Dictado. [Código del motor](https://github.com/lichess-org/vosk-browser) · [Catálogo de modelos](https://alphacephei.com/vosk/models)
