import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-900 text-white p-8 flex flex-col items-center">
      
      {/* Encabezado */}
      <header className="mb-12 text-center">
        <h1 className="text-7xl font-bold text-blue-500 mb-2">RubikBot Control Panel</h1>
        <p className="text-xl text-gray-400">Sistema de resolución robótica e historial</p>
      </header>

      {/* Indicador de Conexión a Base de Datos */}
      <div className="mb-8 flex items-center bg-gray-800 px-4 py-2 rounded-full border border-gray-700">
        <div className="w-3 h-3 rounded-full bg-green-500 mr-3 animate-pulse"></div>
        <span className="text-sm font-medium">Conexión a BD: Establecida</span>
      </div>

      {/* Menú Principal (Botones de navegación) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
        
        {/* Botón: Ingresar Colores */}
        <Link to="/input-cubo" 
              className="flex flex-col items-center justify-center bg-blue-600 hover:bg-blue-500 transition-colors rounded-2xl p-8 shadow-lg group">
          <span className="text-5xl mb-4 group-hover:scale-110 transition-transform">🎲</span>
          <h2 className="text-2xl font-bold">Ingresar Cubo</h2>
          <p className="text-blue-200 text-center mt-2 text-sm">Configura manualmente los colores de las caras</p>
        </Link>

        {/* Botón: Historial */}
        <Link to="/historial" 
              className="flex flex-col items-center justify-center bg-gray-800 hover:bg-gray-700 transition-colors border border-gray-700 rounded-2xl p-8 shadow-lg group">
          <span className="text-5xl mb-4 group-hover:scale-110 transition-transform">📋</span>
          <h2 className="text-2xl font-bold">Historial de Movimientos</h2>
          <p className="text-gray-400 text-center mt-2 text-sm">Revisa los tiempos y resoluciones pasadas</p>
        </Link>

        {/* Botón: Configuración del Robot */}
        <Link to="/configuracion" 
              className="flex flex-col items-center justify-center bg-gray-800 hover:bg-gray-700 transition-colors border border-gray-700 rounded-2xl p-8 shadow-lg group">
          <span className="text-5xl mb-4 group-hover:scale-110 transition-transform">⚙️</span>
          <h2 className="text-2xl font-bold">Configuración</h2>
          <p className="text-gray-400 text-center mt-2 text-sm">Ajustes del robot y motores</p>
        </Link>

        {/* Botón: Estado del Sistema */}
        <button className="/estado" 
              className="flex flex-col items-center justify-center bg-gray-800 hover:bg-gray-700 transition-colors border border-gray-700 rounded-2xl p-8 shadow-lg group">
          <span className="text-5xl mb-4 group-hover:scale-110 transition-transform">🔌</span>
          <h2 className="text-2xl font-bold">Revisar Conexiones</h2>
          <p className="text-gray-400 text-center mt-2 text-sm">Verificar Arduino y Base de Datos</p>
        </button>

      </div>
    </div>
  );
}