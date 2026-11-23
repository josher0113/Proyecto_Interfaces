const courtesyReference = typeof expressionReferences === 'undefined'
  ? null
  : expressionReferences.find(reference => reference.title === 'Por favor');

const phraseReferences = [
  {
    title: 'Presentarse',
    context: 'Acabas de conocer a alguien y quieren intercambiar nombres.',
    cue: 'Practica cómo preguntarle su nombre. Después cambia de papel y deletrea el tuyo con el alfabeto manual. Cierra el encuentro con «Mucho gusto».',
    usesAlphabet: true,
    signs: [
      {
        title: '¿Cómo te llamas?',
        description: 'Dirige el índice y la mirada hacia la otra persona para hacer «Tú». Cambia a la configuración N y gira la mano ligeramente de un lado a otro.',
        images: ['assets/frases/como-te-llamas-1.jpg', 'assets/frases/como-te-llamas-2.jpg', 'assets/frases/como-te-llamas-3.jpg'],
        page: 164,
      },
      {
        title: 'Mucho gusto',
        description: 'Empieza con la seña de «Mucho» que se muestra en la primera foto. Luego acerca la mano en G al pecho y muévela en círculos hacia el lado contrario de esa mano.',
        images: ['assets/frases/mucho-gusto-1.jpg', 'assets/frases/mucho-gusto-2.jpg', 'assets/frases/mucho-gusto-3.jpg'],
        page: 163,
      },
    ],
  },
  {
    title: 'Pedir ayuda',
    context: 'Necesitas el apoyo de otra persona para mover una caja.',
    cue: 'Practica «Por favor» y «Ayudar» por separado. Luego ensaya la petición mirando a quien tienes enfrente y espera su respuesta.',
    signs: [
      courtesyReference,
      {
        title: 'Ayudar',
        description: 'Abre una mano con la palma hacia arriba y apoya encima la otra en configuración A, con el pulgar arriba y el dorso al frente. Eleva las dos manos juntas.',
        images: ['assets/frases/ayudar-1.jpg', 'assets/frases/ayudar-2.jpg'],
        page: 213,
      },
    ].filter(Boolean),
  },
  {
    title: 'Invitar a participar',
    context: 'Tu grupo está por empezar una actividad y quieres que alguien se una.',
    cue: 'Practica «Querer» y «Actividad» por separado. Luego ensaya la invitación con la persona frente a ti y deja una pausa para que responda.',
    signs: [
      {
        title: 'Querer',
        description: 'Junta los cuatro dedos y deja fuera el pulgar. Desliza el dorso de los dedos por la mejilla de abajo hacia arriba y hacia fuera.',
        images: ['assets/frases/querer-1.jpg', 'assets/frases/querer-2.jpg'],
        page: 236,
      },
      {
        title: 'Actividad',
        description: 'Coloca ambas manos en configuración A a la altura de la cintura. Toca la cintura varias veces con los pulgares, alternando una mano y la otra.',
        images: ['assets/frases/actividad-1.jpg', 'assets/frases/actividad-2.jpg'],
        page: 278,
      },
    ],
  },
];
