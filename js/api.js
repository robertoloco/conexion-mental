import { CONFIG } from './config.js';

// Palabras base en español
const palabrasBase = {
    facil: [
        { palabra: 'casa', definicion: 'Edificio destinado a vivienda' },
        { palabra: 'agua', definicion: 'Sustancia líquida sin color, olor ni sabor que se encuentra en la naturaleza' },
        { palabra: 'perro', definicion: 'Mamífero doméstico de la familia de los cánidos' },
        { palabra: 'juego', definicion: 'Actividad recreativa sometida a reglas' },
        { palabra: 'libro', definicion: 'Conjunto de hojas de papel unidas por un lado' },
        { palabra: 'amigo', definicion: 'Persona con quien se mantiene una relación de amistad' },
        { palabra: 'ciudad', definicion: 'Conjunto de edificios y calles regidos por un ayuntamiento' },
        { palabra: 'mesa', definicion: 'Mueble formado por una superficie plana sostenida por patas' },
        { palabra: 'sol', definicion: 'Estrella luminosa, centro de nuestro sistema planetario' },
        { palabra: 'comida', definicion: 'Lo que se come y bebe para nutrirse' },
        { palabra: 'pelota', definicion: 'Bola hecha de cuero, goma u otro material flexible' },
        { palabra: 'árbol', definicion: 'Planta de tronco leñoso que se ramifica a cierta altura' },
        { palabra: 'coche', definicion: 'Vehículo con motor para transportar personas' },
        { palabra: 'flor', definicion: 'Parte de la planta que contiene los órganos reproductores' },
        { palabra: 'playa', definicion: 'Ribera del mar formada por arena' }
    ],
    medio: [
        { palabra: 'conexión', definicion: 'Enlace, atadura, trabazón, concatenación de una cosa con otra' },
        { palabra: 'abstracto', definicion: 'Que significa alguna cualidad con exclusión del sujeto' },
        { palabra: 'empatía', definicion: 'Capacidad de identificarse con alguien y compartir sus sentimientos' },
        { palabra: 'paradigma', definicion: 'Ejemplo o modelo de algo' },
        { palabra: 'efímero', definicion: 'Que dura poco tiempo, pasajero, de corta duración' },
        { palabra: 'metáfora', definicion: 'Figura retórica de traslación del sentido de las palabras' },
        { palabra: 'sincronía', definicion: 'Coincidencia de hechos o fenómenos en el tiempo' },
        { palabra: 'analogía', definicion: 'Relación de semejanza entre cosas distintas' },
        { palabra: 'concepto', definicion: 'Idea que concibe o forma el entendimiento' },
        { palabra: 'enfático', definicion: 'Que se expresa con énfasis o da importancia a lo que se dice' },
        { palabra: 'intuición', definicion: 'Facultad de comprender las cosas instantáneamente sin razonamiento' },
        { palabra: 'paradoja', definicion: 'Idea extraña u opuesta a la común opinión y al sentir de las personas' },
        { palabra: 'sinergia', definicion: 'Acción conjunta de varios órganos en la realización de una función' },
        { palabra: 'armonía', definicion: 'Conveniente proporción y correspondencia de unas cosas con otras' }
    ],
    dificil: [
        { palabra: 'inefable', definicion: 'Que no se puede explicar con palabras' },
        { palabra: 'serendipia', definicion: 'Hallazgo valioso que se produce de manera accidental o casual' },
        { palabra: 'resiliente', definicion: 'Que tiene capacidad de adaptación frente a situaciones adversas' },
        { palabra: 'idiosincrasia', definicion: 'Rasgos y carácter propios de un individuo o colectividad' },
        { palabra: 'perspicaz', definicion: 'Que tiene agudeza mental y capacidad de observación' },
        { palabra: 'quimera', definicion: 'Lo que se propone a la imaginación como posible, pero no lo es' },
        { palabra: 'cacofónico', definicion: 'Que suena mal o tiene un efecto sonoro desagradable' },
        { palabra: 'epifanía', definicion: 'Manifestación o revelación de algo' },
        { palabra: 'ambivalencia', definicion: 'Estado de ánimo en que coexisten dos emociones o sentimientos opuestos' },
        { palabra: 'meticuloso', definicion: 'Que se hace con gran cuidado, detalle y atención' },
        { palabra: 'paradigma', definicion: 'Ejemplo o modelo de algo' },
        { palabra: 'sinécdoque', definicion: 'Figura retórica que consiste en extender o restringir el significado de las palabras' },
        { palabra: 'anacrónico', definicion: 'Que está en desacuerdo con la época presente' },
        { palabra: 'dialéctica', definicion: 'Arte de dialogar, argumentar y discutir' },
        { palabra: 'ontología', definicion: 'Parte de la metafísica que trata del ser en general y de sus propiedades' }
    ]
};

class DiccionarioAPI {
    constructor() {
        this.palabrasUsadas = new Set();
        this.palabrasCache = {
            facil: [],
            medio: [],
            dificil: []
        };
        // Inicializar con palabras base
        for (const nivel in palabrasBase) {
            this.palabrasCache[nivel] = [...palabrasBase[nivel]];
        }
    }

    async obtenerPalabraAleatoria() {
        try {
            const response = await fetch('https://rae-api.herokuapp.com/random');
            if (!response.ok) throw new Error('Error en la respuesta de la API');
            
            const data = await response.json();
            if (!data || !data.word) throw new Error('Formato de respuesta inválido');

            return {
                palabra: data.word,
                definicion: data.definition || 'Definición no disponible'
            };
        } catch (error) {
            console.warn('Error al obtener palabra aleatoria:', error);
            return null;
        }
    }

    determinarDificultad(palabra) {
        const longitud = palabra.length;
        const tieneCaracteresEspeciales = /[áéíóúñü]/i.test(palabra);
        const tieneGruposConsonantes = /(br|bl|pr|pl|dr|tr|gr|gl|cr|cl|fr|fl)/i.test(palabra);
        
        if (longitud <= 5 && !tieneCaracteresEspeciales && !tieneGruposConsonantes) {
            return 'facil';
        } else if (longitud <= 8 || (!tieneCaracteresEspeciales && !tieneGruposConsonantes)) {
            return 'medio';
        } else {
            return 'dificil';
        }
    }

    async obtenerPalabra(nivel) {
        // Primero intentar obtener una palabra del caché
        const palabrasNivel = this.palabrasCache[nivel];
        const palabrasDisponibles = palabrasNivel.filter(p => !this.palabrasUsadas.has(p.palabra));

        // Si hay palabras disponibles en caché, usar una de ellas
        if (palabrasDisponibles.length > 0) {
            const indice = Math.floor(Math.random() * palabrasDisponibles.length);
            const palabraSeleccionada = palabrasDisponibles[indice];
            this.palabrasUsadas.add(palabraSeleccionada.palabra);
            return palabraSeleccionada;
        }

        // Si no hay palabras disponibles, intentar obtener una nueva de la API
        try {
            // Intentar hasta 3 veces obtener una palabra del nivel correcto
            for (let intento = 0; intento < 3; intento++) {
                const nuevaPalabra = await this.obtenerPalabraAleatoria();
                if (nuevaPalabra && this.determinarDificultad(nuevaPalabra.palabra) === nivel) {
                    this.palabrasUsadas.add(nuevaPalabra.palabra);
                    this.palabrasCache[nivel].push(nuevaPalabra);
                    return nuevaPalabra;
                }
                // Pequeña pausa entre intentos
                await new Promise(resolve => setTimeout(resolve, CONFIG.API.DELAY_ENTRE_LLAMADAS));
            }
        } catch (error) {
            console.warn('Error al obtener nueva palabra:', error);
        }

        // Si todo falla, reiniciar palabras usadas y devolver una palabra base
        this.palabrasUsadas.clear();
        const palabraBase = palabrasBase[nivel][Math.floor(Math.random() * palabrasBase[nivel].length)];
        this.palabrasUsadas.add(palabraBase.palabra);
        return palabraBase;
    }

    async buscarDefinicion(palabra) {
        try {
            const response = await fetch(`https://rae-api.herokuapp.com/define?word=${encodeURIComponent(palabra)}`);
            if (!response.ok) throw new Error('Palabra no encontrada');
            
            const data = await response.json();
            return {
                palabra: palabra,
                definicion: data.definition || 'Definición no disponible'
            };
        } catch (error) {
            console.warn('Error al buscar definición:', error);
            // Buscar en caché local
            for (const nivel in this.palabrasCache) {
                const encontrada = this.palabrasCache[nivel].find(item => 
                    item.palabra.toLowerCase() === palabra.toLowerCase()
                );
                if (encontrada) return encontrada;
            }
            
            return {
                palabra: palabra,
                definicion: "No se encontró definición para esta palabra."
            };
        }
    }

    reiniciarPalabras() {
        this.palabrasUsadas.clear();
    }
}

export const diccionarioAPI = new DiccionarioAPI(); 