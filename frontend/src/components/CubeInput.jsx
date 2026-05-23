import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { validateCubeParity } from '../utils/cubeValidator';
import { solveRubik } from '../utils/cubeSolver';

const COLORS = {
  white: { hex: '#FFFFFF', name: 'Blanco' },
  yellow: { hex: '#FFD500', name: 'Amarillo' },
  green: { hex: '#009E60', name: 'Verde' },
  blue: { hex: '#0051BA', name: 'Azul' },
  orange: { hex: '#FF5800', name: 'Naranja' },
  red: { hex: '#C41E3A', name: 'Rojo' },
};

// Orden exacto de la imagen (Blanco/Amarillo, Verde/Azul, Naranja/Rojo)
const PALETTE_ORDER = ['white', 'yellow', 'green', 'blue', 'orange', 'red'];

const initialCube = {
  U: Array(9).fill(null).map((_, i) => (i === 4 ? 'white' : null)),
  L: Array(9).fill(null).map((_, i) => (i === 4 ? 'orange' : null)),
  F: Array(9).fill(null).map((_, i) => (i === 4 ? 'green' : null)),
  R: Array(9).fill(null).map((_, i) => (i === 4 ? 'red' : null)),
  B: Array(9).fill(null).map((_, i) => (i === 4 ? 'blue' : null)),
  D: Array(9).fill(null).map((_, i) => (i === 4 ? 'yellow' : null)),
};

export default function CubeInput() {
  const [cube, setCube] = useState(initialCube);
  const [activeColor, setActiveColor] = useState('white');
  const [error, setError] = useState('');
  const [isValidated, setIsValidated] = useState(false);
  const [movesList, setMovesList] = useState('');
  const [sendingRobot, setSendingRobot] = useState(false);
  const [invalidEdges, setInvalidEdges] = useState([]);

  // --- Estados para el Modal ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [faceBeingEdited, setFaceBeingEdited] = useState(null);
  const [modalFaceState, setModalFaceState] = useState([]);
  const [modalError, setModalError] = useState('');

  const getCounts = (cube) => {
    const counts = {
      white: 0,
      yellow: 0,
      green: 0,
      blue: 0,
      orange: 0,
      red: 0
    };

    Object.values(cube).forEach((face) => {
      face.forEach((color) => {
        if (color && counts[color] !== undefined) {
          counts[color]++;
        }
      });
    });

    return counts;
  };

  const currentCounts = getCounts(cube);

  const hypotheticalCounts = useMemo(() => {
    if (!isModalOpen || !faceBeingEdited) return currentCounts;
    const tempCube = { ...cube, [faceBeingEdited]: modalFaceState };
    return getCounts(tempCube);
  }, [cube, isModalOpen, faceBeingEdited, modalFaceState, currentCounts]);

  const handleSquareClick = (faceKey, index) => {
    setError('');
    setIsValidated(false);
    setMovesList('');
    setFaceBeingEdited(faceKey);
    setModalFaceState([...cube[faceKey]]);
    setModalError('');
    setIsModalOpen(true);
  };

  // --- Lógica del Modal Actualizada ---
  const handleModalColorSelect = (index, selectedColor) => {
    if (index === 4) {
      setModalError('El centro es fijo y no se puede cambiar.');
      return;
    }

    setModalError('');
    const newFaceState = [...modalFaceState];
    // Permitir deseleccionar (borrar) si se hace clic en el color que ya estaba activo
    newFaceState[index] = newFaceState[index] === selectedColor ? null : selectedColor;
    setModalFaceState(newFaceState);
  };

  const validateFaceCounts = (faceState, fullCube) => {
    const tempCube = { ...fullCube, [faceBeingEdited]: faceState };
    const counts = getCounts(tempCube);
    
    for (const color in counts) {
      if (counts[color] > 9) {
        return `Excederás el límite de 9 cuadros de color ${COLORS[color].name}. Actualmente hay ${currentCounts[color]} en todo el cubo, y la cara que editas añadiría ${faceState.filter(c => c === color).length} más.`;
      }
    }
    return null;
  };

  const handleSaveModal = () => {
    const errorMsg = validateFaceCounts(modalFaceState, cube);
    if (errorMsg) {
      setModalError(errorMsg);
      return;
    }

    setCube({ ...cube, [faceBeingEdited]: modalFaceState });
    setError('');
    setIsModalOpen(false);
    setFaceBeingEdited(null);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFaceBeingEdited(null);
    setModalError('');
  };

  // --- Lógica Principal ---
  const handleVerifyStructure = async () => {
    const result = validateCubeParity(cube);

    if (!result.valid) {
      setError(result.error);
      setIsValidated(false);
      setInvalidEdges(result.invalidEdges || []);
      setMovesList('');
      return;
    }

    try {
      const respuestaBackend = await solveRubik(cube);

      if (respuestaBackend && respuestaBackend.exito) {
        setError('');
        setIsValidated(true);
        setInvalidEdges([]);
        setMovesList(respuestaBackend.solucion || 'El cubo ya está resuelto.');
      } else {
        setError(respuestaBackend.error || 'Error al calcular la solución en el servidor.');
        setIsValidated(false);
        setInvalidEdges([]);
        setMovesList('');
      }
    } catch (error) {
      console.error("Error en la conexión:", error);
      setError('No se pudo conectar con el servidor. Verifica que Express esté corriendo.');
      setIsValidated(false);
      setInvalidEdges([]);
      setMovesList('');
    }
  };

  const canSendToRobot = isValidated && movesList && movesList !== 'El cubo ya está resuelto.';

  const handleSendToRobot = async () => {
    if (!canSendToRobot) {
      setError('No hay una secuencia válida para enviar. Verifica el cubo y vuelve a calcular.');
      return;
    }

    setSendingRobot(true);
    setError('');

    try {
      const resp = await fetch('http://134.122.24.115:3000/api/robot/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secuencia: movesList })
      });

      const data = await resp.json();

      if (resp.ok && data.exito) {
        alert('✅ ' + (data.mensaje || 'Secuencia enviada al robot.'));
      } else {
        setError(data.error || 'Error al enviar la secuencia al robot.');
      }
    } catch (err) {
      console.error('Error enviando al robot:', err);
      setError('No se pudo conectar con el servidor para enviar al robot.');
    } finally {
      setSendingRobot(false);
    }
  };

  const handleResetCube = () => {
    setCube(initialCube);
    setActiveColor('white');
    setError('');
    setIsValidated(false);
    setMovesList('');
    setInvalidEdges([]);
  };

  const Face = ({ faceKey }) => (
    <div className="grid grid-cols-3 gap-1 bg-gray-800 p-1 rounded transition-opacity" style={{ opacity: isModalOpen ? 0.5 : 1 }}>
      {cube[faceKey].map((color, index) => {
        const isHighlighted = invalidEdges.some(item => item.face === faceKey && item.index === index);

        return (
          <div
            key={`${faceKey}-${index}`}
            onClick={() => handleSquareClick(faceKey, index)}
            className={`w-10 h-10 border border-gray-600 rounded-sm cursor-pointer transition-transform hover:scale-105 ${
              index === 4 ? 'ring-2 ring-gray-200' : ''
            } ${isHighlighted ? 'ring-2 ring-amber-300 shadow-[0_0_16px_rgba(245,158,11,0.75)]' : ''}`}
            style={{ backgroundColor: color ? COLORS[color].hex : '#374151' }}
          >
            {index === 4 && <span className="flex justify-center items-center h-full text-xs text-black/30 font-bold">•</span>}
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center py-10 relative">

      {/* Modal para editar cara */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 transition-opacity">
          <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl border border-gray-700 w-full max-w-xl">
            <h3 className="text-2xl font-bold mb-6 text-center">
              Editando Cara {faceBeingEdited && COLORS[cube[faceBeingEdited][4]].name}
            </h3>

            {modalError && (
              <div className="px-4 py-2 bg-red-950 border border-red-600 text-red-200 rounded-lg text-sm font-semibold mb-4 text-center">
                {modalError}
              </div>
            )}

            <div className="grid grid-cols-3 gap-2 bg-gray-900 p-3 rounded-xl border border-gray-700 mx-auto w-fit mb-6 shadow-inner">
              {modalFaceState.map((colorValue, index) => (
                <div
                  key={`modal-${index}`}
                  className={`w-28 h-28 border-[3px] border-black rounded-sm overflow-hidden relative bg-gray-800 ${
                    index === 4 ? 'ring-2 ring-white z-10 scale-105' : ''
                  }`}
                >
                  {index === 4 ? (
                    // El centro es fijo, mostramos un solo bloque de color
                    <div 
                      className="w-full h-full flex justify-center items-center" 
                      style={{ backgroundColor: COLORS[colorValue].hex }}
                    >
                      <span className="text-4xl text-black/30 font-bold drop-shadow-sm">•</span>
                    </div>
                  ) : (
                    // Las otras 8 piezas muestran la cuadrícula de 6 colores
                    <div className="w-full h-full grid grid-cols-2 grid-rows-3">
                      {PALETTE_ORDER.map((paletaColor) => {
                        const isSelected = colorValue === paletaColor;
                        return (
                          <div
                            key={paletaColor}
                            onClick={() => handleModalColorSelect(index, paletaColor)}
                            className={`cursor-pointer transition-all border border-black/20 flex justify-center items-center ${
                              isSelected 
                                ? 'opacity-100 z-10 shadow-[inset_0_0_0_2px_rgba(255,255,255,0.8)]' 
                                : 'opacity-40 hover:opacity-80 hover:scale-105'
                            }`}
                            style={{ backgroundColor: COLORS[paletaColor].hex }}
                          >
                            {isSelected && (
                              <span className="text-black/60 font-black text-sm drop-shadow-md">✓</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-2 mb-6">
              <h4 className="text-sm font-bold text-gray-400">Estado del cubo (Máx. 9 por color):</h4>
              <div className="grid grid-cols-3 gap-x-4 gap-y-1 text-sm text-gray-300">
                {Object.entries(COLORS).map(([key, { name }]) => (
                  <div key={key} className="flex justify-between items-center bg-gray-900/50 p-1 px-2 rounded">
                    <span>{name}:</span>
                    <span className={hypotheticalCounts[key] > 9 ? 'text-red-400 font-bold' : ''}>
                      {hypotheticalCounts[key]}/9
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-4 justify-center">
              <button onClick={handleSaveModal} className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-8 rounded-lg transition-colors shadow-lg">
                Confirmar Cara
              </button>
              <button onClick={handleCloseModal} className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-8 rounded-lg transition-colors shadow-lg">
                Descartar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="w-full max-w-4xl flex justify-between px-6 mb-6">
        <Link to="/" className="text-blue-400 hover:text-blue-300 flex items-center gap-2">
          <span>←</span> Volver
        </Link>
        <h2 className="text-2xl font-bold">Ingreso Visual de Cubo</h2>
      </div>

      <div className="h-16 mb-4 w-full max-w-xl text-center px-4 relative z-10">
        {error && <div className="px-4 py-2 bg-red-950 border border-red-600 text-red-200 rounded-lg text-sm font-semibold">{error}</div>}
        {isValidated && <div className="px-4 py-2 bg-green-950 border border-green-600 text-green-200 rounded-lg text-sm font-semibold">✓ ¡Paridad Correcta! Listo para resolver.</div>}
      </div>

      <div className="flex flex-col md:flex-row gap-12 items-start relative z-10">
        <div className="grid grid-cols-4 gap-2 p-4 bg-gray-800/50 rounded-xl shadow-inner relative">
          <div className="col-start-2"><Face faceKey="U" /></div>
          <div className="col-start-1 col-span-4 grid grid-cols-4 gap-2">
            <Face faceKey="L" />
            <Face faceKey="F" />
            <Face faceKey="R" />
            <Face faceKey="B" />
          </div>
          <div className="col-start-2"><Face faceKey="D" /></div>
        </div>

        <div className="bg-gray-800 p-6 rounded-xl flex flex-col gap-4 w-64 border border-gray-700">
          <h3 className="text-xl font-bold mb-2">Controles</h3>
          <p className="text-sm text-gray-400 mb-4">Haz clic en cualquier cara del cubo para abrir el editor visual.</p>
          <hr className="border-gray-700 my-2" />
          <button onClick={handleVerifyStructure} className="bg-amber-600 hover:bg-amber-500 text-white font-bold py-2 rounded-lg transition-colors text-sm shadow-md">Verificar Paridad</button>
          <button onClick={handleResetCube} className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 rounded-lg transition-colors text-sm shadow-md">Reiniciar Cubo</button>
          <button onClick={handleSendToRobot} disabled={!canSendToRobot || sendingRobot} className={`font-bold py-2 rounded-lg transition-all text-sm shadow-lg ${canSendToRobot && !sendingRobot ? 'bg-blue-600 hover:bg-blue-500 text-white cursor-pointer opacity-100' : 'bg-gray-700 text-gray-500 cursor-not-allowed opacity-50'}`}>
            {sendingRobot ? 'Enviando...' : 'Enviar al Robot 🤖'}
          </button>
        </div>
      </div>

      {isValidated && (
        <div className="mt-8 bg-gray-800 border border-gray-700 rounded-xl p-4 w-full max-w-2xl relative z-10">
          <h4 className="text-sm font-bold text-blue-400 mb-1">Secuencia Generada:</h4>
          <p className="font-mono bg-gray-900 p-3 rounded border border-gray-700 text-emerald-400 tracking-wider break-words text-sm">{movesList || 'El cubo ya está resuelto.'}</p>
        </div>
      )}
    </div>
  );
}