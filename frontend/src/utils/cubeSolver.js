// Mapeo de colores a la notación de caras de Kociemba
const colorToFace = {
  'white': 'U',
  'red': 'R',
  'green': 'F',
  'yellow': 'D',
  'orange': 'L',
  'blue': 'B'
};

// Convierte tu objeto de React a un string de 54 caracteres (U-R-F-D-L-B)
const formatForMin2Phase = (cubeObject) => {
  // El orden ESTRICTO que requiere min2phase es: U, R, F, D, L, B
  const faceOrder = ['U', 'R', 'F', 'D', 'L', 'B'];
  let cubeString = '';

  faceOrder.forEach(faceKey => {
    // Para cada cara en el orden correcto, tomamos los 9 colores
    cubeObject[faceKey].forEach(colorName => {
      // Traducimos el nombre del color (ej. 'white') a su letra (ej. 'U')
      cubeString += colorToFace[colorName];
    });
  });

  return cubeString;
};

export const solveRubik = async (estadoCubo) => {
  try {
    // 1. Traducir el objeto al string de 54 letras
    const formattedString = formatForMin2Phase(estadoCubo);
    console.log("String enviado a Express:", formattedString);

    // 2. Enviar al backend
    const response = await fetch('http://134.122.24.115:5000/api/solve', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ estado: formattedString }),
    });

    // 3. Procesar respuesta
    const data = await response.json();
    
    if (!response.ok) {
      // Si Express responde con un 400, lanzamos el error del backend
      throw new Error(data.error || `Error HTTP: ${response.status}`);
    }

    return data;

  } catch (error) {
    console.error("Error al conectar con el backend:", error);
    return { exito: false, error: error.message };
  }
};