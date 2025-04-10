import { CONFIG } from './config.js';

// Palabras base para usar cuando la API no está disponible
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
        { palabra: 'comida', definicion: 'Lo que se come y bebe para nutrirse' }
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
        { palabra: 'enfático', definicion: 'Que se expresa con énfasis o da importancia a lo que se dice' }
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
        { palabra: 'meticuloso', definicion: 'Que se hace con gran cuidado, detalle y atención' }
    ]
};

class DiccionarioAPI {
    constructor() {
        this.cache = new Map();
        this.palabrasBase = palabrasBase;
        this.fuentes = [
            this.obtenerPalabraAPI.bind(this),
            this.obtenerPalabraRespaldo.bind(this),
            this.obtenerPalabraWiktionary.bind(this)
        ];
    }

    async obtenerPalabra(nivel) {
        let intentos = 0;
        while (intentos < CONFIG.API.MAX_RETRIES) {
            try {
                // Intentar obtener palabra de todas las fuentes en orden
                for (const fuente of this.fuentes) {
                    try {
                        const palabra = await fuente(nivel);
                        if (palabra) {
                            // Almacenar en caché
                            this.cache.set(palabra.palabra, {
                                data: palabra,
                                timestamp: Date.now()
                            });
                            return palabra;
                        }
                    } catch (error) {
                        console.warn(`Fuente fallida: ${error.message}`);
                        continue;
                    }
                }
                
                // Si todas las fuentes fallan, usar palabras locales
                return this.obtenerPalabraLocal(nivel);
            } catch (error) {
                console.error(`Intento ${intentos + 1} fallido:`, error);
                intentos++;
                if (intentos === CONFIG.API.MAX_RETRIES) {
                    return this.obtenerPalabraLocal(nivel);
                }
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
    }

    async obtenerPalabraAPI(nivel) {
        try {
            // Obtener una categoría aleatoria para el nivel
            const categorias = CONFIG.CATEGORIAS[nivel];
            const categoria = categorias[Math.floor(Math.random() * categorias.length)];
            
            // Intentar obtener una palabra de la API
            const response = await fetch(`${CONFIG.API.DICTIONARY}random?category=${categoria}`, {
                headers: CONFIG.API.HEADERS
            });
            if (!response.ok) return null;
            
            const data = await response.json();
            return {
                palabra: data.word,
                definicion: data.definition,
                categoria: categoria
            };
        } catch (error) {
            console.error('Error en obtenerPalabraAPI:', error);
            return null;
        }
    }

    async obtenerPalabraRespaldo(nivel) {
        try {
            const response = await fetch(`${CONFIG.API.PALABRAS}random?level=${nivel}`, {
                headers: CONFIG.API.HEADERS
            });
            if (!response.ok) return null;
            
            const data = await response.json();
            return {
                palabra: data.word,
                definicion: data.definition,
                categoria: 'general'
            };
        } catch (error) {
            console.error('Error en obtenerPalabraRespaldo:', error);
            return null;
        }
    }

    async obtenerPalabraWiktionary(nivel) {
        try {
            const response = await fetch(`${CONFIG.API.WIKTIONARY}?action=query&list=random&rnnamespace=0&rnlimit=1&format=json`, {
                headers: CONFIG.API.HEADERS
            });
            if (!response.ok) return null;
            
            const data = await response.json();
            const palabra = data.query.random[0].title;
            
            // Obtener definición
            const definicionResponse = await fetch(`${CONFIG.API.WIKTIONARY}?action=query&prop=extracts&exintro=1&explaintext=1&titles=${encodeURIComponent(palabra)}&format=json`);
            if (!definicionResponse.ok) return null;
            
            const definicionData = await definicionResponse.json();
            const page = Object.values(definicionData.query.pages)[0];
            
            return {
                palabra: palabra,
                definicion: page.extract || 'Definición no disponible',
                categoria: 'general'
            };
        } catch (error) {
            console.error('Error en obtenerPalabraWiktionary:', error);
            return null;
        }
    }

    obtenerPalabraLocal(nivel) {
        const palabras = this.palabrasBase[nivel];
        const indice = Math.floor(Math.random() * palabras.length);
        return palabras[indice];
    }

    async buscarDefinicion(palabra) {
        // Verificar cache
        if (this.cache.has(palabra)) {
            const cached = this.cache.get(palabra);
            if (Date.now() - cached.timestamp < CONFIG.API.CACHE_TIME * 1000) {
                return cached.data;
            }
        }

        try {
            // Intentar obtener definición de la API principal
            const definicion = await this.buscarDefinicionAPI(palabra);
            if (definicion) return definicion;

            // Si falla, intentar con la API de respaldo
            const definicionRespaldo = await this.buscarDefinicionRespaldo(palabra);
            if (definicionRespaldo) return definicionRespaldo;

            // Si todo falla, buscar en datos locales
            return this.buscarDefinicionLocal(palabra);
        } catch (error) {
            console.error('Error al buscar definición:', error);
            return this.buscarDefinicionLocal(palabra);
        }
    }

    async buscarDefinicionAPI(palabra) {
        try {
            const response = await fetch(`${CONFIG.API.DICTIONARY}${encodeURIComponent(palabra)}`);
            if (!response.ok) return null;

            const data = await response.json();
            return {
                palabra: data[0].word,
                definicion: data[0].meanings[0].definitions[0].definition
            };
        } catch (error) {
            console.error('Error en buscarDefinicionAPI:', error);
            return null;
        }
    }

    async buscarDefinicionRespaldo(palabra) {
        try {
            const response = await fetch(`${CONFIG.API.PALABRAS}${encodeURIComponent(palabra)}`);
            if (!response.ok) return null;

            const data = await response.json();
            return {
                palabra: data.word,
                definicion: data.definition
            };
        } catch (error) {
            console.error('Error en buscarDefinicionRespaldo:', error);
            return null;
        }
    }

    buscarDefinicionLocal(palabra) {
        for (const nivel in this.palabrasBase) {
            const encontrada = this.palabrasBase[nivel].find(item => 
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

export const diccionarioAPI = new DiccionarioAPI(); 