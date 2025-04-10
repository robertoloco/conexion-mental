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
        URL: 'https://api.dictionaryapi.dev/api/v2/entries/es/',
        CACHE_TIME: 3600, // 1 hora en segundos
        MAX_RETRIES: 3
    },
    CATEGORIAS: {
        facil: ['básico', 'simple', 'común'],
        medio: ['intermedio', 'estándar', 'regular'],
        dificil: ['avanzado', 'complejo', 'experto']
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