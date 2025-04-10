import { CONFIG, STYLES } from './config.js';
import { diccionarioAPI } from './api.js';

class JuegoConexionMental {
    constructor() {
        this.nivelActual = 'medio';
        this.palabraActual = null;
        this.tiempo = CONFIG.TIEMPO_RONDA;
        this.temporizadorID = null;
        this.rondaActiva = false;
        this.equipos = [];
        this.palabrasUsadas = new Set();

        this.initializeEventListeners();
    }

    initializeEventListeners() {
        document.getElementById('nivel').addEventListener('change', () => this.cambiarNivel());
        document.getElementById('nuevaPalabraBtn').addEventListener('click', () => this.nuevaPalabra());
        document.getElementById('verDefBtn').addEventListener('click', () => this.verDefinicion());
    }

    async cambiarNivel() {
        this.nivelActual = document.getElementById('nivel').value;
        this.palabrasUsadas.clear();
        this.actualizarInterfaz('palabra', 'Selecciona "Nueva Palabra"');
        this.actualizarInterfaz('definicion', '');
    }

    async nuevaPalabra() {
        try {
            // Limpiar antes de empezar
            this.actualizarInterfaz('definicion', '');
            document.getElementById('definicion').style.display = 'none';
            
            // Obtener nueva palabra
            const palabraData = await diccionarioAPI.obtenerPalabra(this.nivelActual);
            console.log("Palabra obtenida:", palabraData);
            
            // Verificar si la palabra ya fue usada
            if (this.palabrasUsadas.has(palabraData.palabra)) {
                // Intentar obtener una palabra diferente
                let intentos = 0;
                let nuevaPalabra = palabraData;
                
                while (intentos < 3) {
                    nuevaPalabra = await diccionarioAPI.obtenerPalabra(this.nivelActual);
                    if (!this.palabrasUsadas.has(nuevaPalabra.palabra)) {
                        break;
                    }
                    intentos++;
                }
                
                // Si después de 3 intentos no encontramos una palabra nueva
                if (intentos >= 3) {
                    this.mostrarError('¡Se han agotado las palabras disponibles para este nivel!');
                    this.finalizarRonda();
                    return;
                }
                
                palabraData = nuevaPalabra;
            }

            // Guardar la palabra actual
            this.palabraActual = palabraData;
            this.palabrasUsadas.add(palabraData.palabra);
            
            // Actualizar la interfaz
            this.actualizarInterfaz('palabra', palabraData.palabra);
            
            // Iniciar temporizador
            this.iniciarTemporizador();
        } catch (error) {
            console.error("Error en nuevaPalabra:", error);
            this.mostrarError('Error al obtener nueva palabra. Intenta de nuevo.');
        }
    }

    async verDefinicion() {
        if (!this.palabraActual) {
            this.mostrarError('No hay ninguna palabra activa. Presiona "Nueva Palabra" primero.');
            return;
        }
        
        try {
            const definicion = await diccionarioAPI.buscarDefinicion(this.palabraActual.palabra);
            
            // Verificar si tenemos una definición
            if (definicion && definicion.definicion) {
                this.actualizarInterfaz('definicion', definicion.definicion);
            } else {
                this.actualizarInterfaz('definicion', 'No se encontró definición para esta palabra.');
            }
            
            // Hacer visible el contenedor de definición
            document.getElementById('definicion').style.display = 'block';
            
        } catch (error) {
            console.error('Error en verDefinicion:', error);
            this.actualizarInterfaz('definicion', 'No se pudo obtener la definición. Inténtalo de nuevo.');
        }
    }

    iniciarTemporizador() {
        clearInterval(this.temporizadorID);
        this.tiempo = CONFIG.TIEMPO_RONDA;
        this.rondaActiva = true;
        
        this.actualizarInterfaz('temporizador', this.tiempo);
        
        this.temporizadorID = setInterval(() => {
            this.tiempo--;
            this.actualizarInterfaz('temporizador', this.tiempo);
            
            if (this.tiempo <= 0) {
                this.finalizarRonda();
            }
        }, 1000);
    }

    finalizarRonda() {
        clearInterval(this.temporizadorID);
        this.rondaActiva = false;
        this.actualizarInterfaz('temporizador', '¡Tiempo!');
    }

    crearEquipos(numEquipos) {
        const container = document.getElementById('equiposContainer');
        container.innerHTML = '';
        this.equipos = [];
        
        for (let i = 0; i < numEquipos; i++) {
            const nombre = prompt(`Nombre del equipo ${i + 1}`) || `Equipo ${i + 1}`;
            const color = `hsl(${i * 360 / numEquipos}, 70%, 50%)`;
            
            this.equipos.push({ 
                puntos: 0, 
                nombre: nombre 
            });

            this.crearElementosEquipo(i, nombre, color);
        }
    }

    crearElementosEquipo(index, nombre, color) {
        const container = document.getElementById('equiposContainer');
        
        const btn = document.createElement('button');
        btn.textContent = nombre;
        btn.className = 'equipo-btn';
        btn.style.backgroundColor = color;
        btn.onclick = () => this.asignarPunto(index);

        const marcador = document.createElement('div');
        marcador.className = 'score';
        marcador.id = `puntosEquipo${index}`;
        marcador.textContent = `Puntos ${nombre}: 0`;

        container.appendChild(btn);
        container.appendChild(marcador);
    }

    asignarPunto(index) {
        if (!this.rondaActiva) return;
        
        this.finalizarRonda();
        const puntos = Math.ceil((this.tiempo / CONFIG.TIEMPO_RONDA) * 10);
        this.equipos[index].puntos += puntos;
        
        this.actualizarPuntuacion(index);
        
        if (this.equipos[index].puntos >= CONFIG.PUNTOS_VICTORIA) {
            this.finalizarJuego(this.equipos[index].nombre);
        }
    }

    empate() {
        if (!this.rondaActiva) return;
        
        this.finalizarRonda();
        const puntos = Math.ceil((this.tiempo / CONFIG.TIEMPO_RONDA) * 10);
        
        if (this.equipos.length === 2) {
            // Si solo hay dos equipos, sumar puntos a ambos automáticamente
            this.equipos.forEach((equipo, index) => {
                equipo.puntos += puntos;
                this.actualizarPuntuacion(index);
            });
        } else {
            // Si hay más de dos equipos, preguntar cuáles empataron
            const equiposEmpate = [];
            this.equipos.forEach((equipo, index) => {
                if (confirm(`¿El ${equipo.nombre} empató?`)) {
                    equiposEmpate.push(index);
                }
            });
            
            // Sumar puntos solo a los equipos que empataron
            equiposEmpate.forEach(index => {
                this.equipos[index].puntos += puntos;
                this.actualizarPuntuacion(index);
            });
        }
        
        this.actualizarInterfaz('temporizador', 'Empate');
    }

    actualizarPuntuacion(index) {
        const equipo = this.equipos[index];
        this.actualizarInterfaz(
            `puntosEquipo${index}`, 
            `Puntos ${equipo.nombre}: ${equipo.puntos}`
        );
    }

    finalizarJuego(nombreGanador) {
        alert(`¡Partida terminada! Ganador: ${nombreGanador}`);
        this.reiniciarJuego();
    }

    reiniciarJuego() {
        this.finalizarRonda();
        this.tiempo = CONFIG.TIEMPO_RONDA;
        this.palabraActual = null;
        this.palabrasUsadas.clear();
        
        this.actualizarInterfaz('temporizador', this.tiempo);
        this.actualizarInterfaz('palabra', 'Presiona "Nueva Palabra"');
        this.actualizarInterfaz('definicion', '');
        
        this.equipos.forEach((e, i) => {
            e.puntos = 0;
            this.actualizarPuntuacion(i);
        });
    }

    actualizarInterfaz(elementId, contenido) {
        const elemento = document.getElementById(elementId);
        if (elemento) {
            elemento.textContent = contenido;
        }
    }

    mostrarError(mensaje) {
        const palabraElement = document.getElementById('palabra');
        palabraElement.textContent = mensaje;
        palabraElement.style.color = STYLES.COLORES.error;
        
        // Restaurar el color después de 3 segundos
        setTimeout(() => {
            palabraElement.style.color = STYLES.COLORES.texto;
        }, 3000);
    }
}

// Inicializar el juego
const juego = new JuegoConexionMental();

// Exponer el juego globalmente para acceso desde HTML
window.juego = juego; 