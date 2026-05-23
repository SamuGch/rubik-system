import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function Historial() {
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEvento, setSelectedEvento] = useState(null);
  const [backendUrl] = useState('http://134.122.24.115:3000');

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

  const handleSelectEvento = (evento) => {
    setSelectedEvento(evento);
  };

  const getEventoDetails = (evento) => {
    const orderedKeys = [
      'estado_inicial_procesado',
      'estado inicial procesado',
      'estado_inicial',
      'estado inicial',
      'orden',
      'secuencia',
      'movimientos',
    ];

    return Object.entries(evento)
      .filter(([key]) => key !== '_id')
      .sort(([a], [b]) => {
        const indexA = orderedKeys.findIndex((item) => item === a.toLowerCase());
        const indexB = orderedKeys.findIndex((item) => item === b.toLowerCase());

        if (indexA !== -1 || indexB !== -1) {
          if (indexA === -1) return 1;
          if (indexB === -1) return -1;
          return indexA - indexB;
        }

        return a.localeCompare(b);
      });
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
          className="text-blue-400 hover:text-blue-300 flex items-center gap-2"
        >
          <span>←</span> Volver
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
                      <button
                        type="button"
                        onClick={() => handleSelectEvento(evento)}
                        title={evento.detalles || 'Sin detalles'}
                        className="w-full text-left text-[#7f8c8d] text-[13px] max-w-[150px] md:max-w-[250px] whitespace-normal hover:text-[#2c3e50] hover:underline"
                      >
                        {evento.detalles || 'Sin detalles'}
                      </button>
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

        {selectedEvento && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-6 py-5 border-b border-slate-200 bg-slate-50">
                <div>
                  <h3 className="text-2xl font-bold text-slate-900">Detalles completos del evento</h3>
                  <p className="text-sm text-slate-600 mt-1">Visualiza el estado inicial y toda la información de la solicitud aquí.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedEvento(null)}
                  className="inline-flex items-center justify-center rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
                >
                  Cerrar
                </button>
              </div>

              <div className="max-h-[80vh] overflow-y-auto p-6 space-y-5">
                <div className="grid gap-4 md:grid-cols-2">
                  {getEventoDetails(selectedEvento).map(([key, value]) => {
                    const content = typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value);
                    const isPrimary = /estado_inicial_procesado|estado inicial procesado/i.test(key);
                    const shouldSpanFull = isPrimary || /estado|orden|secuencia|procesado/i.test(key) || content.length > 120;
                    console.log(selectedEvento.detalles);

                    return (
                      <div
                        key={key}
                        className={`rounded-2xl border ${isPrimary ? 'border-amber-300 bg-amber-50 shadow-lg' : 'border-slate-200 bg-slate-50'} p-4 ${shouldSpanFull ? 'md:col-span-2' : ''}`}
                      >
                        <p className="text-xs uppercase tracking-[0.16em] text-slate-500 mb-2">{key.replace(/_/g, ' ')}</p>
                        <div className="overflow-x-auto">
                          <pre className="whitespace-pre-wrap break-words text-sm text-slate-800">{content}</pre>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}