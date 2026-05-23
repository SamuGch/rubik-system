import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Configuracion() {
  const [puerto, setPuerto] = useState('COM3');
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });
  const [loading, setLoading] = useState(false);

  const guardarConfiguracion = async () => {
    if (!puerto.trim()) return;

    setLoading(true);
    setMensaje({ texto: '', tipo: '' });

    try {
      // Ajusta localhost:5000 si tu backend usa otro puerto
      const response = await fetch('http://134.122.24.115:3000/api/robot/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ puerto: puerto.trim().toUpperCase() }), // Forzamos mayúsculas (ej. com3 -> COM3)
      });

      const data = await response.json();

      if (data.exito) {
        setMensaje({ texto: `✅ ${data.mensaje}`, tipo: 'exito' });
      } else {
        setMensaje({ texto: `❌ Error: ${data.error}`, tipo: 'error' });
      }
    } catch (error) {
      setMensaje({ texto: '❌ No se pudo conectar con el servidor Express.', tipo: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8 flex flex-col items-center">
      <div className="w-full max-w-2xl">
        
        <Link to="/" className="text-blue-400 hover:text-blue-300 flex items-center gap-2 mb-8 w-fit">
          <span>←</span> Volver
        </Link>

        <h1 className="text-4xl font-bold text-white mb-6">⚙️ Configuración del Robot</h1>

        <div className="bg-gray-800 border border-gray-700 rounded-2xl p-8 shadow-lg">
          <h2 className="text-xl font-bold mb-4 text-blue-400">Conexión Serial</h2>
          
          <div className="flex flex-col gap-2 mb-6">
            <label className="text-gray-400 text-sm">Puerto COM (USB o Bluetooth)</label>
            <input 
              type="text" 
              value={puerto}
              onChange={(e) => setPuerto(e.target.value)}
              placeholder="Ej. COM3, COM5, /dev/ttyUSB0"
              className="bg-gray-900 border border-gray-600 rounded-lg p-3 text-white font-mono focus:border-blue-500 focus:outline-none transition-colors"
            />
            <p className="text-xs text-gray-500 mt-1">Revisa el Administrador de Dispositivos para conocer tu puerto actual.</p>
          </div>

          <button 
            onClick={guardarConfiguracion}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 text-white font-bold py-3 rounded-lg transition-colors shadow-md"
          >
            {loading ? 'Aplicando cambios...' : 'Guardar y Conectar'}
          </button>

          {mensaje.texto && (
            <div className={`mt-4 p-4 rounded-lg font-medium text-sm ${
              mensaje.tipo === 'exito' ? 'bg-green-900/50 text-green-300 border border-green-800' : 'bg-red-900/50 text-red-300 border border-red-800'
            }`}>
              {mensaje.texto}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}