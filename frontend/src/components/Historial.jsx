import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function Historial() {
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [backendUrl] = useState('http://localhost:5000');

  useEffect(() => {
    fetchEventos();
  }, []);

  const fetchEventos = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Intentando conectar a:', `${backendUrl}/api/eventos`);
      
      const response = await fetch(`${backendUrl}/api/eventos`);
      
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      setEventos(data);
      console.log('Datos cargados:', data);
    } catch (err) {
      console.error('Error completo:', err);
      setError(`❌ Error: ${err.message}. Verifica que el backend esté corriendo en ${backendUrl}`);
    } finally {
      setLoading(false);
    }
  };

  const formatearFecha = (timestamp) => {
    return new Date(timestamp).toLocaleString('es-ES');
  };

  const limpiarHistorial = async () => {
    if (window.confirm('¿Estás seguro de que deseas eliminar todo el historial?')) {
      try {
        const response = await fetch(`${backendUrl}/api/eventos`, {
          method: 'DELETE'
        });
        
        if (response.ok) {
          setEventos([]);
          alert('Historial eliminado');
        }
      } catch (err) {
        alert('Error al limpiar historial: ' + err.message);
      }
    }
  };

  // Función para determinar los colores de los badges según el tipo de acción
  const getBadgeStyles = (tipo_accion) => {
    const tipo = tipo_accion?.toLowerCase() || '';
    if (tipo === 'resolucion_completada') return 'bg-[#d4edda] text-[#155724]';
    if (tipo === 'error_motor') return 'bg-[#f8d7da] text-[#721c24]';
    if (tipo === 'escaneo') return 'bg-[#d1ecf1] text-[#0c5460]';
    return 'bg-gray-200 text-gray-800'; // Default
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1a2e] to-[#16213e] p-5">
      <Link 
        to="/" 
        className="inline-block mb-5 px-5 py-3 bg-[#3498db] text-white no-underline rounded-lg font-semibold transition-all duration-300 border-2 border-[#3498db] hover:bg-[#2980b9] hover:border-[#2980b9] hover:-translate-x-1.5"
      >
        ← Volver a Inicio
      </Link>
      
      <div className="max-w-[1200px] mx-auto p-[15px] md:p-5 bg-gradient-to-br from-[#f5f7fa] to-[#c3cfe2] rounded-xl shadow-md min-h-[400px]">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-5 pb-[15px] border-b-2 border-[#ff6b6b] gap-[10px] md:gap-0">
          <h2 className="m-0 text-[#2c3e50] text-2xl font-bold">📋 Historial de Movimientos</h2>
          <div className="flex gap-[10px] w-full md:w-auto justify-start">
            <button 
              onClick={fetchEventos} 
              className="bg-transparent border-2 border-[#3498db] px-3 py-2 rounded-lg text-lg cursor-pointer transition-all duration-300 hover:bg-[#3498db] hover:text-white hover:rotate-180" 
              title="Refrescar datos"
            >
              🔄
            </button>
            <button 
              onClick={limpiarHistorial} 
              className="bg-transparent border-2 border-[#e74c3c] px-3 py-2 rounded-lg text-lg cursor-pointer transition-all duration-300 hover:bg-[#e74c3c] hover:text-white" 
              title="Limpiar historial"
            >
              🗑️
            </button>
          </div>
        </div>

        {loading && <div className="text-center p-10 text-[#3498db] text-lg font-bold">⏳ Cargando historial...</div>}
        
        {error && (
          <div className="bg-[#fee] border-l-4 border-[#e74c3c] p-[15px] rounded text-[#c0392b] mb-5">
            <strong>⚠️ Error de conexión:</strong>
            <p>{error}</p>
            <p className="mt-[10px] text-xs">
              🔧 Asegúrate de que:
            </p>
            <ul className="mt-[5px] text-xs list-disc pl-5">
              <li>MongoDB esté corriendo</li>
              <li>El backend esté en puerto 5000</li>
              <li>Ejecuta: <code>npm start</code> en la carpeta backend/</li>
            </ul>
          </div>
        )}

        {!loading && !error && eventos.length === 0 && (
          <div className="text-center py-[60px] px-5 text-[#7f8c8d] text-base">
            <p>📭 No hay registros en el historial aún.</p>
            <p className="text-sm mt-[10px]">
              Los datos aparecerán aquí cuando el robot comience a resolver cubos.
            </p>
          </div>
        )}

        {!loading && eventos.length > 0 && (
          <div className="overflow-x-auto bg-white rounded-lg shadow-[0_2px_4px_rgba(0,0,0,0.1)]">
            <table className="w-full border-collapse text-[12px] md:text-[14px]">
              <thead className="bg-[#34495e] text-white sticky top-0">
                <tr>
                  <th className="p-[10px_8px] md:p-[15px] text-left font-semibold border-b-2 border-[#2c3e50]">Fecha y Hora</th>
                  <th className="p-[10px_8px] md:p-[15px] text-left font-semibold border-b-2 border-[#2c3e50]">Tipo de Acción</th>
                  <th className="p-[10px_8px] md:p-[15px] text-left font-semibold border-b-2 border-[#2c3e50]">Movimientos</th>
                  <th className="p-[10px_8px] md:p-[15px] text-left font-semibold border-b-2 border-[#2c3e50]">Tiempo (s)</th>
                  <th className="p-[10px_8px] md:p-[15px] text-left font-semibold border-b-2 border-[#2c3e50]">Detalles</th>
                </tr>
              </thead>
              <tbody>
                {eventos.map((evento) => (
                  <tr key={evento._id} className="border-b border-[#ecf0f1] transition-colors duration-200 hover:bg-[#f8f9fa]">
                    <td className="p-[10px_8px] md:p-[12px_15px] break-words max-w-[300px] text-[#3498db] font-medium text-[13px]">
                      {formatearFecha(evento.timestamp)}
                    </td>
                    <td className="p-[10px_8px] md:p-[12px_15px] break-words max-w-[300px] text-center">
                      <span className={`px-3 py-1.5 rounded-full font-semibold text-xs inline-block uppercase ${getBadgeStyles(evento.tipo_accion)}`}>
                        {evento.tipo_accion}
                      </span>
                    </td>
                    <td className="p-[10px_8px] md:p-[12px_15px] break-words">
                      <div className="font-mono bg-[#f8f9fa] p-[8px_12px] rounded text-[#2c3e50] font-medium max-w-[150px] md:max-w-none">
                        {evento.movimientos}
                      </div>
                    </td>
                    <td className="p-[10px_8px] md:p-[12px_15px] break-words max-w-[300px] text-center font-semibold text-[#27ae60]">
                      {Number(evento.tiempo_segundos).toFixed(2)}
                    </td>
                    <td className="p-[10px_8px] md:p-[12px_15px] break-words">
                      <div className="text-[#7f8c8d] text-[13px] max-w-[150px] md:max-w-[250px] overflow-hidden text-ellipsis whitespace-nowrap">
                        {evento.detalles || '-'}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="p-[15px] bg-[#f8f9fa] border-t border-[#ecf0f1] text-right text-[#7f8c8d] text-sm">
              <p>Total de registros: <strong className="text-gray-700">{eventos.length}</strong></p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}