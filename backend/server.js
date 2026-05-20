const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json()); // Permite recibir datos en formato JSON

// Conexión a MongoDB (Usa la variable de entorno de Docker o localhost por defecto)
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/rubikbot_logs';

mongoose.connect(mongoURI)
  .then(() => console.log('✅ Conectado a MongoDB exitosamente'))
  .catch(err => console.error('❌ Error conectando a MongoDB:', err));

// Definir el Esquema (Estructura) del Log de Eventos
const eventoSchema = new mongoose.Schema({
  tipo_accion: { type: String, required: true }, // Ej: 'RESOLUCION_COMPLETADA', 'ERROR_MOTOR', 'ESCANEO'
  timestamp: { type: Date, default: Date.now },
  tiempo_segundos: { type: Number, default: 0 },
  movimientos: { type: String, default: 'N/A' },
  detalles: { type: String, default: '' }
});

const Evento = mongoose.model('Evento', eventoSchema);

// ==========================================
// ENDPOINTS (Rutas HTTP)
// ==========================================

// 1. Endpoint para RECIBIR eventos desde el Robot (POST)
app.post('/api/eventos', async (req, res) => {
  try {
    const { tipo_accion, tiempo_segundos, movimientos, detalles } = req.body;
    
    // Crear un nuevo registro
    const nuevoEvento = new Evento({
      tipo_accion,
      tiempo_segundos,
      movimientos,
      detalles
    });

    // Guardar en MongoDB
    await nuevoEvento.save();
    
    res.status(201).json({ mensaje: 'Evento registrado con éxito', evento: nuevoEvento });
  } catch (error) {
    res.status(500).json({ error: 'Error al registrar el evento', detalles: error.message });
  }
});

// 2. Endpoint para ENVIAR eventos al Frontend/Dashboard (GET)
app.get('/api/eventos', async (req, res) => {
  try {
    // Busca todos los eventos y los ordena del más reciente al más antiguo
    const eventos = await Evento.find().sort({ timestamp: -1 });
    res.status(200).json(eventos);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener el historial', detalles: error.message });
  }
});

// Iniciar el servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor Backend corriendo en el puerto ${PORT}`);
});