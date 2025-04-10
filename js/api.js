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
        this.palabrasBase = palabrasBase;
        this.cache = new Map();
    }

    async obtenerPalabra(nivel) {
        try {
            // Primero intentar obtener una palabra del DRAE
            const palabra = await this.obtenerPalabraDRAE();
            if (palabra && !this.palabrasUsadas.has(palabra.palabra)) {
                this.palabrasUsadas.add(palabra.palabra);
                return palabra;
            }

            // Si no funciona, usar palabras base
            const palabrasNivel = this.palabrasBase[nivel];
            const palabrasDisponibles = palabrasNivel.filter(p => !this.palabrasUsadas.has(p.palabra));

            if (palabrasDisponibles.length === 0) {
                this.palabrasUsadas.clear();
                return null;
            }

            const indice = Math.floor(Math.random() * palabrasDisponibles.length);
            const palabraSeleccionada = palabrasDisponibles[indice];
            this.palabrasUsadas.add(palabraSeleccionada.palabra);

            return palabraSeleccionada;
        } catch (error) {
            console.error('Error al obtener palabra:', error);
            return this.obtenerPalabraLocal(nivel);
        }
    }

    async obtenerPalabraDRAE() {
        try {
            // Obtener una palabra aleatoria usando el proxy
            const response = await fetch(`${CONFIG.API.PROXY}${encodeURIComponent(CONFIG.API.DRAE + 'random')}`, {
                headers: CONFIG.API.HEADERS
            });

            if (!response.ok) {
                throw new Error('Error al obtener palabra del DRAE');
            }

            const data = await response.json();
            
            // Obtener la definición usando el proxy
            const definicionResponse = await fetch(`${CONFIG.API.PROXY}${encodeURIComponent(CONFIG.API.DRAE + data.id)}`, {
                headers: CONFIG.API.HEADERS
            });

            if (!definicionResponse.ok) {
                throw new Error('Error al obtener definición del DRAE');
            }

            const definicionData = await definicionResponse.json();
            
            return {
                palabra: data.header,
                definicion: this.formatearDefinicionDRAE(definicionData),
                categoria: 'DRAE'
            };
        } catch (error) {
            console.error('Error en DRAE API:', error);
            return null;
        }
    }

    formatearDefinicionDRAE(data) {
        try {
            if (data && data.definiciones && data.definiciones.length > 0) {
                return data.definiciones[0].definicion;
            }
            return "No se encontró definición";
        } catch (error) {
            console.error('Error al formatear definición:', error);
            return "Error al obtener definición";
        }
    }

    obtenerPalabraLocal(nivel) {
        const palabras = this.palabrasBase[nivel];
        const palabrasDisponibles = palabras.filter(p => !this.palabrasUsadas.has(p.palabra));
        
        if (palabrasDisponibles.length === 0) {
            this.palabrasUsadas.clear();
            return palabras[Math.floor(Math.random() * palabras.length)];
        }

        const indice = Math.floor(Math.random() * palabrasDisponibles.length);
        const palabraSeleccionada = palabrasDisponibles[indice];
        this.palabrasUsadas.add(palabraSeleccionada.palabra);
        return palabraSeleccionada;
    }

    async buscarDefinicion(palabra) {
        // Verificar caché
        if (this.cache.has(palabra)) {
            const cached = this.cache.get(palabra);
            if (Date.now() - cached.timestamp < CONFIG.API.CACHE_TIME * 1000) {
                return cached.data;
            }
        }

        try {
            // Intentar obtener del DRAE usando el proxy
            const response = await fetch(`${CONFIG.API.PROXY}${encodeURIComponent(CONFIG.API.DRAE + encodeURIComponent(palabra))}`, {
                headers: CONFIG.API.HEADERS
            });

            if (response.ok) {
                const data = await response.json();
                const definicion = {
                    palabra: palabra,
                    definicion: this.formatearDefinicionDRAE(data)
                };

                // Guardar en caché
                this.cache.set(palabra, {
                    data: definicion,
                    timestamp: Date.now()
                });

                return definicion;
            }
        } catch (error) {
            console.error('Error al buscar definición en DRAE:', error);
        }

        // Si falla, buscar en palabras base
        return this.buscarDefinicionLocal(palabra);
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

    reiniciarPalabras() {
        this.palabrasUsadas.clear();
        this.cache.clear();
    }
}

export const diccionarioAPI = new DiccionarioAPI(); 