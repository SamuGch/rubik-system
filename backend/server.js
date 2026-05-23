const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const Cube = require('cubejs');

// Importamos el controlador del robot que acabamos de crear
const { inicializarRobot, enviarSecuenciaAlRobot, actualizarPuerto} = require('./controllers/arduinoController');

const app = express();
const PORT = 3000;

// ==========================================
// 1. INICIALIZACIÓN DE SERVICIOS
// ==========================================

// Arrancar el servicio del hardware (Arduino/Bluetooth)
inicializarRobot();

// Conectar a MongoDB
const MONGO_URI = 'mongodb://localhost:27017/rubik_system'; // Ajusta a 27018 si usaste ese puerto en Docker
mongoose.connect(MONGO_URI)
    .then(() => console.log('🍃 Conectado exitosamente a MongoDB'))
    .catch(err => console.error('❌ Error crítico al conectar a MongoDB:', err));

// Inicializar el Motor Matemático
console.log("🧠 Inicializando el motor de búsqueda del cubo...");
Cube.initSolver();
console.log("✅ Motor matemático listo.");

// ==========================================
// 2. MIDDLEWARES Y MODELOS
// ==========================================
app.use(cors());
app.use(express.json());

const EventoSchema = new mongoose.Schema({
    timestamp: { type: Date, default: Date.now },
    tipo_accion: { type: String, required: true },
    movimientos: { type: String, default: '' },
    tiempo_segundos: { type: Number, default: 0 },
    detalles: { type: String, default: '' }
});

const Evento = mongoose.model('Evento', EventoSchema);

// ==========================================
// 3. RUTAS Y ENDPOINTS
// ==========================================

app.get('/', (req, res) => {
    res.send('Servidor del Cubo Rubik funcionando correctamente 🚀');
});

// Endpoint: Resolver el cubo y guardar historial
app.post('/api/solve', async (req, res) => {
    const { estado } = req.body;
    const inicioTiempo = Date.now(); 

    if (!estado || estado.length !== 54) {
        return res.status(400).json({ exito: false, error: "Estado de cubo inválido." });
    }

    try {
        const cubo = Cube.fromString(estado);
        let solucionReal = "";
        
        if (!cubo.isSolved()) {
            solucionReal = cubo.solve();
        }

        const tiempoProcesamiento = (Date.now() - inicioTiempo) / 1000; 

        const nuevoEvento = new Evento({
            tipo_accion: 'resolucion_completada',
            movimientos: solucionReal || 'El cubo ya está resuelto.',
            tiempo_segundos: tiempoProcesamiento,
            detalles: `Estado procesado: ${estado}`
        });
        await nuevoEvento.save(); 

        res.json({
            exito: true,
            mensaje: "Solución calculada y registrada",
            solucion: solucionReal
        });

    } catch (error) {
        res.status(400).json({ exito: false, error: "Configuración matemáticamente imposible." });
    }
});

// Endpoint: Leer Historial
app.get('/api/eventos', async (req, res) => {
    try {
        const historial = await Evento.find().sort({ timestamp: -1 });
        res.json(historial);
    } catch (error) {
        res.status(500).json({ error: "Error al leer la base de datos" });
    }
});

// Endpoint: Limpiar Historial
app.delete('/api/eventos', async (req, res) => {
    try {
        await Evento.deleteMany({});
        res.json({ exito: true, mensaje: "Historial eliminado" });
    } catch (error) {
        res.status(500).json({ error: "Error al limpiar la base de datos" });
    }
});

// Endpoint: Enviar secuencia al Arduino
app.post('/api/robot/send', async (req, res) => {
    const { secuencia } = req.body;

    if (!secuencia || secuencia === 'El cubo ya está resuelto.') {
        return res.status(400).json({ exito: false, error: "No hay secuencia para enviar" });
    }

    try {
        // Usamos la función del archivo arduinoController.js
        const mensajeExito = await enviarSecuenciaAlRobot(secuencia);
        res.json({ exito: true, mensaje: mensajeExito });
    } catch (error) {
        console.error("❌ Fallo al intentar enviar al robot:", error.message);

        res.status(500).json({ exito: false, error: error.message });
    }
});

// Endpoint: Actualizar configuración del puerto
app.post('/api/robot/config', async (req, res) => {
    const { puerto } = req.body;

    if (!puerto) {
        return res.status(400).json({ exito: false, error: "Debes especificar un puerto COM." });
    }

    try {
        const mensaje = await actualizarPuerto(puerto);
        res.json({ exito: true, mensaje: mensaje });
    } catch (error) {
        res.status(500).json({ exito: false, error: "Error al cambiar el puerto." });
    }
});

// ==========================================
// 4. INICIO DEL SERVIDOR (¡La línea que faltaba!)
// ==========================================
app.listen(PORT, () => {
    console.log(`Servidor de Express escuchando en http://localhost:${PORT}`);
});