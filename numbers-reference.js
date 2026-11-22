const numberReferences = {
  1: {
    page: 65, hands: 1, images: ['assets/numeros/1.jpg'],
    description: 'Extiende el índice hacia arriba y cierra los demás dedos. Orienta el dorso hacia el frente.',
    motion: null,
  },
  2: {
    page: 66, hands: 1, images: ['assets/numeros/2.jpg'],
    description: 'Separa el índice y el dedo medio hacia arriba y cierra los demás dedos. Orienta el dorso hacia el frente.',
    motion: null,
  },
  3: {
    page: 66, hands: 1, images: ['assets/numeros/3.jpg'],
    description: 'Extiende hacia arriba el índice, el medio y el anular. Sepáralos y orienta el dorso hacia el frente.',
    motion: null,
  },
  4: {
    page: 67, hands: 1, images: ['assets/numeros/4.jpg'],
    description: 'Dobla el pulgar y separa los otros dedos hacia arriba. Orienta el dorso hacia el frente.',
    motion: null,
  },
  5: {
    page: 67, hands: 1, images: ['assets/numeros/5.jpg'],
    description: 'Abre la mano y separa todos los dedos con el dorso hacia el frente.',
    motion: null,
  },
  6: {
    page: 68, hands: 1, images: ['assets/numeros/6.jpg'],
    description: 'Cierra el puño y levanta el pulgar. Orienta el dorso hacia el frente.',
    motion: null,
  },
  7: {
    page: 68, hands: 1, images: ['assets/numeros/7.jpg'],
    description: 'Levanta el pulgar y extiende el índice hacia un lado. Mantén cerrados los otros dedos y orienta el dorso hacia el frente.',
    motion: null,
  },
  8: {
    page: 69, hands: 1, images: ['assets/numeros/8.jpg'],
    description: 'Extiende el pulgar, el índice y el medio. Separa los dedos y apunta el medio hacia un lado con el dorso hacia afuera.',
    motion: null,
  },
  9: {
    page: 70, hands: 1, images: ['assets/numeros/9-1.jpg', 'assets/numeros/9-2.jpg'],
    description: 'Esconde el pulgar y mantén los demás dedos juntos hacia arriba, con el dorso hacia el frente.',
    motion: 'Dobla los cuatro dedos hacia abajo para cubrir el pulgar y repite el cierre una vez más.',
  },
  10: {
    page: 72, hands: 1, images: ['assets/numeros/10-1.jpg', 'assets/numeros/10-2.jpg'],
    description: 'Abre y separa los dedos. Empieza con la palma hacia arriba.',
    motion: 'Gira la mano una vez hasta que la palma quede hacia abajo.',
  },
  20: {
    page: 83, hands: 1, images: ['assets/numeros/20-1.jpg', 'assets/numeros/20-2.jpg'],
    description: 'Curva el pulgar y el índice dejando un hueco entre ambos. Orienta la palma hacia el frente.',
    motion: 'Cierra y vuelve a abrir el espacio entre el índice y el pulgar dos veces.',
  },
  30: {
    page: 85, hands: 1, images: ['assets/numeros/30-1.jpg', 'assets/numeros/30-2.jpg'],
    description: 'Mantén el índice hacia arriba y la palma hacia el frente. Curva el pulgar y el dedo medio.',
    motion: 'Cierra y vuelve a abrir el espacio entre el pulgar y el dedo medio dos veces.',
  },
  40: {
    page: 86, hands: 1, images: ['assets/numeros/40-1.jpg', 'assets/numeros/40-2.jpg'],
    description: 'Dobla el índice y junta el medio, el anular y el meñique extendidos, con la palma al frente.',
    motion: 'Toca el índice doblado con el pulgar dos veces.',
  },
  50: {
    page: 87, hands: 1, images: ['assets/numeros/50-1.jpg', 'assets/numeros/50-2.jpg'],
    description: 'Extiende y separa los dedos hacia arriba. Orienta el dorso hacia el frente.',
    motion: 'Alterna los dedos hacia adelante siguiendo la onda que muestra la primera foto.',
  },
  60: {
    page: 88, hands: 1, images: ['assets/numeros/60-1.jpg', 'assets/numeros/60-2.jpg'],
    description: 'Coloca el puño con la palma hacia el frente.',
    motion: 'Abre ligeramente el puño y vuelve a cerrarlo dos veces.',
  },
  70: {
    page: 89, hands: 1, images: ['assets/numeros/70-1.jpg', 'assets/numeros/70-2.jpg'],
    description: 'Extiende el índice y el pulgar y cierra los otros dedos. Orienta la palma hacia el frente.',
    motion: 'Junta las yemas del índice y el pulgar dos veces.',
  },
  80: {
    page: 90, hands: 1, images: ['assets/numeros/80-1.jpg', 'assets/numeros/80-2.jpg'],
    description: 'Extiende el pulgar y junta el índice y el medio extendidos, con la palma hacia el frente.',
    motion: 'Une las yemas del índice y el medio con la del pulgar dos veces.',
  },
  90: {
    page: 91, hands: 1, images: ['assets/numeros/90-1.jpg', 'assets/numeros/90-2.jpg'],
    description: 'Orienta la palma hacia el frente y extiende los dedos hacia adelante.',
    motion: 'Cierra y abre ligeramente la mano.',
  },
  100: {
    page: 92, hands: 1, images: ['assets/numeros/100-1.jpg', 'assets/numeros/100-2.jpg'],
    description: 'Extiende el índice hacia un lado con los otros dedos cerrados y el dorso al frente.',
    motion: 'Gira la muñeca hacia arriba mientras doblas el índice.',
  },
  200: {
    page: 93, hands: 1, images: ['assets/numeros/200-1.jpg', 'assets/numeros/200-2.jpg'],
    description: 'Extiende y separa el índice y el medio hacia un lado. Orienta el dorso hacia el frente.',
    motion: 'Gira la muñeca hacia arriba mientras doblas ambos dedos.',
  },
  300: {
    page: 94, hands: 1, images: ['assets/numeros/300-1.jpg', 'assets/numeros/300-2.jpg'],
    description: 'Extiende y separa hacia un lado el índice, el medio y el anular, con el dorso al frente.',
    motion: 'Gira la muñeca hacia arriba mientras doblas los tres dedos.',
  },
  400: {
    page: 95, hands: 1, images: ['assets/numeros/400-1.jpg', 'assets/numeros/400-2.jpg'],
    description: 'Dobla el pulgar y extiende los otros dedos separados hacia un lado. Orienta el dorso hacia el frente.',
    motion: 'Gira la muñeca hacia arriba mientras doblas los cuatro dedos.',
  },
  500: {
    page: 96, hands: 1, images: ['assets/numeros/500-1.jpg', 'assets/numeros/500-2.jpg'],
    description: 'Extiende y separa los dedos hacia un lado con el dorso al frente.',
    motion: 'Gira la muñeca hacia arriba mientras doblas los dedos.',
  },
  600: {
    page: 97, hands: 1, images: ['assets/numeros/600-1.jpg', 'assets/numeros/600-2.jpg'],
    description: 'Levanta el pulgar con el puño cerrado y el dorso hacia el frente.',
    motion: 'Gira la muñeca hacia arriba mientras doblas el pulgar.',
  },
  700: {
    page: 98, hands: 1, images: ['assets/numeros/700-1.jpg', 'assets/numeros/700-2.jpg'],
    description: 'Levanta el pulgar y extiende el índice hacia un lado con el dorso al frente.',
    motion: 'Gira la muñeca hacia arriba mientras doblas el pulgar y el índice.',
  },
  800: {
    page: 100, hands: 1, images: ['assets/numeros/800-1.jpg', 'assets/numeros/800-2.jpg'],
    description: 'Levanta el pulgar. Separa y extiende el índice y el medio hacia un lado con el dorso al frente.',
    motion: 'Gira la muñeca hacia arriba mientras doblas los tres dedos.',
  },
  900: {
    page: 101, hands: 1, images: ['assets/numeros/900-1.jpg', 'assets/numeros/900-2.jpg'],
    description: 'Junta y extiende los cuatro dedos hacia un lado con el pulgar doblado y el dorso al frente.',
    motion: 'Desplaza la mano hacia el lado de la muñeca. Gira la palma hacia el frente y dobla los dedos sobre el pulgar.',
  },
  1000: {
    page: 102, hands: 2, images: ['assets/numeros/1000-1.jpg', 'assets/numeros/1000-2.jpg'],
    description: 'Mantén una mano abierta en vertical con la palma hacia un lado. Con la otra mano forma el número 1.',
    motion: 'Gira la palma de la segunda mano hacia abajo y forma la letra M. Muévela de lado hasta tocar la palma de la primera mano.',
  },
};
