const { SerialPort } = require('serialport');

let PUERTO_COM = 'COM7'; 
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
            console.log('motivo: ', err.message);
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

        const secuenciaConComas = secuencia.replace(/ /g, ',');
        const paqueteFinal = `[${secuenciaConComas}]`;

        if (modoSimulacion) {
            console.log(`[SIMULACIÓN] 📡 Transmitiendo al aire: ${paqueteFinal}`);
            // Simulamos un retraso de 3 segundos para que veas el "cargando" en la web
            setTimeout(() => {
                resolve({ estado: "simulacion", tiempo: "0.00" });
            }, 3000);
            return;
        }

        console.log(`Transmisión Serial: Enviando ${paqueteFinal}`);
        
        arduinoPort.write(paqueteFinal, (err) => {
            if (err) {
                console.error('Error Serial:', err.message);
                return reject(new Error("Falló la transmisión de datos por el cable."));
            }
            
            console.log("⏳ Instrucciones enviadas. Esperando a que el robot termine físicamente...");

            // --- MAGIA: Escuchar la respuesta del Arduino ---
            let bufferRespuestas = "";
            
            const esperarDone = (data) => {
                bufferRespuestas += data.toString();
                
                // Si el Arduino ya imprimió DONE:...
                if (bufferRespuestas.includes("DONE:")) {
                    // Extraemos el tiempo limpiando espacios extras
                    const tiempoExtraido = bufferRespuestas.split("DONE:")[1].trim();
                    
                    console.log(`⏱️ ¡El robot reporta un tiempo de ${tiempoExtraido} segundos!`);
                    
                    // 1. Dejamos de escuchar para no duplicar eventos en el futuro
                    arduinoPort.removeListener('data', esperarDone);
                    
                    // 2. Liberamos la petición web enviando el tiempo a React
                    resolve({ estado: "real", tiempo: tiempoExtraido });
                }
            };

            // Agregamos el escuchador temporal al puerto
            arduinoPort.on('data', esperarDone);
        });
    });
};

module.exports = { inicializarRobot, enviarSecuenciaAlRobot, actualizarPuerto };