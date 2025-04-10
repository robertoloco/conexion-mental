// Configuración del juego
export const CONFIG = {
    TIEMPO_RONDA: 30,
    PUNTOS_VICTORIA: 50,
    NIVELES: {
        facil: 'Fácil',
        medio: 'Medio',
        dificil: 'Difícil'
    },
    CATEGORIAS: {
        facil: ['básico', 'simple', 'común'],
        medio: ['intermedio', 'estándar', 'regular'],
        dificil: ['avanzado', 'complejo', 'experto']
    },
    API: {
        URL: 'https://rae-api.herokuapp.com',
        PALABRAS_POR_NIVEL: 50,
        DELAY_ENTRE_LLAMADAS: 100, // milisegundos
        MAX_INTENTOS: 3
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