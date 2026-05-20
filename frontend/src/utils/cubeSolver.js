const COLOR_TO_FACE = {
  white: 'U',
  yellow: 'D',
  green: 'F',
  blue: 'B',
  orange: 'L',
  red: 'R'
};

// Convertir estado visual -> string cubejs
export const convertCubeStateToString = (
  cubeState
) => {

  const order = ['U', 'R', 'F', 'D', 'L', 'B'];

  let result = '';

  for (const face of order) {

    for (const color of cubeState[face]) {

      result += COLOR_TO_FACE[color];
    }
  }

  return result;
};

// Resolver cubo
export const solveRubik = async (
  cubeState
) => {

  try {

    // IMPORT DINÁMICO
    const CubeModule =
      await import('cubejs');

    const Cube =
      CubeModule.default || CubeModule;

    // Inicializar solver
    Cube.initSolver();

    // Convertir cubo
    const cubeString =
      convertCubeStateToString(cubeState);

    console.log(
      'Cube String:',
      cubeString
    );

    // Crear cubo
    const cube =
      Cube.fromString(cubeString);

    // Si ya está resuelto
    if (cube.isSolved()) {
      return '';
    }

    // Resolver
    const solution =
      cube.solve();

    console.log(
      'Solution:',
      solution
    );

    return solution;

  } catch (error) {

    console.error(
      'Error solving cube:',
      error
    );

    return null;
  }
};