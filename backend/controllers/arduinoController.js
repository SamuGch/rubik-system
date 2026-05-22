const { SerialPort } = require('serialport');

let PUERTO_COM = 'COM3'; 
const BAUD_RATE = 9600;

let arduinoPort;
let isConnected = false;
let modoSimulacion = false; // ✨ La bandera mágica

const inicializarRobot = () => {
    if (arduinoPort && arduinoPort.isConnected) {
        arduinoPort.close();
    }
    arduinoPort = new SerialPort({
        path: PUERTO_COM,
        baudRate: BAUD_RATE,
        autoOpen: false
    });

    arduinoPort.open((err) => {
        if (err) {
            console.log(`⚠️ No se detectó hardware en ${PUERTO_COM}. Entrando en MODO SIMULACIÓN 👻`);
            // Fingimos que estamos conectados para engañar al sistema
            isConnected = true; 
            modoSimulacion = true;
        } else {
            console.log(`🤖 Hardware conectado exitosamente al robot en ${PUERTO_COM}`);
            isConnected = true;
            modoSimulacion = false;
        }
    });
};

// ✨ NUEVA FUNCIÓN: Actualizar puerto desde React
const actualizarPuerto = (nuevoPuerto) => {
    return new Promise((resolve) => {
        PUERTO_COM = nuevoPuerto;
        console.log(`🔄 React solicitó cambio de puerto a: ${PUERTO_COM}`);
        
        // Reiniciamos la conexión con el nuevo puerto
        inicializarRobot();
        
        resolve(`Puerto actualizado a ${PUERTO_COM}. Revisando conexión...`);
    });
};

const enviarSecuenciaAlRobot = (secuencia) => {
    return new Promise((resolve, reject) => {
        if (!isConnected) {
            return reject(new Error("Error crítico del sistema serial."));
        }

        // Formateamos la cadena para que le guste a tu código .ino
        const secuenciaConComas = secuencia.replace(/ /g, ',');
        const paqueteFinal = `[${secuenciaConComas}]`;

        // ✨ Si no hay robot, imprimimos en consola y mandamos éxito a React
        if (modoSimulacion) {
            console.log(`[SIMULACIÓN] 📡 Transmitiendo al aire: ${paqueteFinal}`);
            return resolve("Simulación: Instrucciones generadas correctamente (Hardware desconectado).");
        }

        // Si el robot SÍ está conectado, enviamos por el cable
        console.log(`Transmisión Serial: Enviando ${paqueteFinal}`);
        arduinoPort.write(paqueteFinal, (err) => {
            if (err) {
                console.error('Error Serial:', err.message);
                return reject(new Error("Falló la transmisión de datos por el cable."));
            }
            resolve("Instrucciones enviadas exitosamente al brazo robótico.");
        });
    });
};

module.exports = { inicializarRobot, enviarSecuenciaAlRobot, actualizarPuerto };