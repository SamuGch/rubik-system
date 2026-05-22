const express = require('express');
const cors = require('cors');
const Cube = require('cubejs'); // Regresamos a cubejs en su entorno correcto

const app = express();
const PORT = 3000;

// Inicializamos el motor en Express (carga las tablas en la RAM de tu compu)
console.log("🧠 Inicializando el motor de búsqueda del cubo...");
Cube.initSolver();
console.log("✅ Motor matemático listo.");

app.use(cors());
app.use(express.json());

// Ruta de prueba
app.get('/', (req, res) => {
    res.send('Servidor del Cubo Rubik funcionando correctamente 🚀');
});

// Endpoint principal
app.post('/api/solve', (req, res) => {
    const { estado } = req.body;

    // Kociemba y cubejs exigen exactamente 54 letras
    if (!estado || estado.length !== 54) {
        return res.status(400).json({ 
            exito: false, 
            error: `El estado debe tener exactamente 54 caracteres. Recibido: ${estado ? estado.length : 0}` 
        });
    }

    try {
        console.log("Calculando solución para el estado:", estado);

        // 1. Cargamos tu string perfecto de 54 letras
        const cubo = Cube.fromString(estado);
        
        // ✨ LA CORRECCIÓN: Interceptamos si el cubo ya está armado
        if (cubo.isSolved()) {
            console.log("✅ El cubo ya está perfectamente armado. Ignorando cálculo.");
            return res.json({
                exito: true,
                mensaje: "El cubo ya está resuelto",
                solucion: "" // Retornamos vacío para que React muestre el texto por defecto
            });
        }

        // 2. Si NO está resuelto, entonces sí forzamos al motor a calcular
        const solucionReal = cubo.solve();

        console.log("✅ Solución encontrada:", solucionReal || "El cubo ya está resuelto");

        res.json({
            exito: true,
            mensaje: "Solución calculada exitosamente en el servidor",
            solucion: solucionReal
        });

    } catch (error) {
        console.error("Error al calcular:", error.message);
        // cubejs lanza un error por defecto si el cubo tiene colores físicamente imposibles
        res.status(400).json({ 
            exito: false, 
            error: "Configuración matemáticamente imposible. Revisa los colores del cubo." 
        });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor de Express escuchando en http://localhost:${PORT}`);
});