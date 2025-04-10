// Configuración del juego
export const CONFIG = {
    TIEMPO_RONDA: 30,
    PUNTOS_VICTORIA: 50,
    NIVELES: {
        facil: 'Fácil',
        medio: 'Medio',
        dificil: 'Difícil'
    },
    API: {
        DICTIONARY: 'https://api.datamuse.com/words?sp=',
        PALABRAS: 'https://api.datamuse.com/words?ml=',
        WIKTIONARY: 'https://es.wiktionary.org/api/rest_v1/page/definition/',
        CACHE_TIME: 3600, // 1 hora en segundos
        MAX_RETRIES: 3,
        HEADERS: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    },
    CATEGORIAS: {
        facil: ['common', 'basic', 'simple'],
        medio: ['medium', 'standard', 'regular'],
        dificil: ['hard', 'complex', 'advanced']
    }
};

// Configuración de estilos
export const STYLES = {
    COLORES: {
        primario: '#3498db',
        secundario: '#2c3e50',
        fondo: '#f4f9fc',
        texto: '#555',
        exito: '#2ecc71',
        error: '#e74c3c'
    },
    ANIMACIONES: {
        duracion: '0.3s',
        tipo: 'ease-in-out'
    }
}; 