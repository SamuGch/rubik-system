// VALID_EDGES
const VALID_EDGES = [
  ['white', 'green'],
  ['white', 'red'],
  ['white', 'blue'],
  ['white', 'orange'],
  ['yellow', 'green'],
  ['yellow', 'red'],
  ['yellow', 'blue'],
  ['yellow', 'orange'],
  ['green', 'red'],
  ['red', 'blue'],
  ['blue', 'orange'],
  ['orange', 'green']
];

// VALID_CORNERS
const VALID_CORNERS = [
  ['white', 'green', 'red'],
  ['white', 'red', 'blue'],
  ['white', 'blue', 'orange'],
  ['white', 'orange', 'green'],
  ['yellow', 'green', 'red'],
  ['yellow', 'red', 'blue'],
  ['yellow', 'blue', 'orange'],
  ['yellow', 'orange', 'green']
];

const EDGE_COORDS = [
  [{ face: 'U', index: 1 }, { face: 'B', index: 1 }],
  [{ face: 'U', index: 5 }, { face: 'R', index: 1 }],
  [{ face: 'U', index: 7 }, { face: 'F', index: 1 }],
  [{ face: 'U', index: 3 }, { face: 'L', index: 1 }],

  [{ face: 'D', index: 1 }, { face: 'F', index: 7 }],
  [{ face: 'D', index: 5 }, { face: 'R', index: 7 }],
  [{ face: 'D', index: 7 }, { face: 'B', index: 7 }],
  [{ face: 'D', index: 3 }, { face: 'L', index: 7 }],

  [{ face: 'F', index: 5 }, { face: 'R', index: 3 }],
  [{ face: 'R', index: 5 }, { face: 'B', index: 3 }],
  [{ face: 'B', index: 5 }, { face: 'L', index: 3 }],
  [{ face: 'L', index: 5 }, { face: 'F', index: 3 }]
];

const getEdges = (cube) =>
  EDGE_COORDS.map((edge) => [
    cube[edge[0].face][edge[0].index],
    cube[edge[1].face][edge[1].index]
  ]);

const getEdgesWithPositions = (cube) =>
  EDGE_COORDS.map((edge) => ({
    colors: [
      cube[edge[0].face][edge[0].index],
      cube[edge[1].face][edge[1].index]
    ],
    positions: edge
  }));

const getCorners = (cube) => [
  [cube.U[0], cube.L[0], cube.B[2]],
  [cube.U[2], cube.B[0], cube.R[2]],
  [cube.U[8], cube.R[0], cube.F[2]],
  [cube.U[6], cube.F[0], cube.L[2]],

  [cube.D[0], cube.L[8], cube.F[6]],
  [cube.D[2], cube.F[8], cube.R[6]],
  [cube.D[8], cube.R[8], cube.B[6]],
  [cube.D[6], cube.B[8], cube.L[6]]
];

// normalizePiece
const normalizePiece = (piece) =>
  [...piece].sort().join('-');

// validateEdges
const validateEdges = (edges) => {
  const seen = new Set();

  for (const edge of edges) {
    const { colors, positions } = edge;

    // No puede tener colores repetidos
    if (new Set(colors).size !== 2) {
      return {
        valid: false,
        error: `Arista inválida: ${colors.join('-')}`,
        invalidEdges: positions
      };
    }

    const normalized = normalizePiece(colors);

    const exists = VALID_EDGES.some(
      (valid) =>
        normalizePiece(valid) === normalized
    );

    if (!exists) {
      return {
        valid: false,
        error: `Arista imposible: ${normalized}`,
        invalidEdges: positions
      };
    }

    if (seen.has(normalized)) {
      return {
        valid: false,
        error: `Arista duplicada: ${normalized}`,
        invalidEdges: positions
      };
    }

    seen.add(normalized);
  }

  return { valid: true, invalidEdges: [] };
};

// validateCorners
const validateCorners = (corners) => {
  const seen = new Set();

  for (const corner of corners) {

    // No puede repetir colores
    if (new Set(corner).size !== 3) {
      return {
        valid: false,
        error: `Esquina inválida: ${corner.join('-')}`
      };
    }

    const normalized = normalizePiece(corner);

    const exists = VALID_CORNERS.some(
      valid =>
        normalizePiece(valid) === normalized
    );

    if (!exists) {
      return {
        valid: false,
        error: `Esquina imposible: ${normalized}`
      };
    }

    if (seen.has(normalized)) {
      return {
        valid: false,
        error: `Esquina duplicada: ${normalized}`
      };
    }

    seen.add(normalized);
  }

  return { valid: true };
};
// validateCubeParity
export const validateCubeParity = (cubeState) => {

  // 1. Contar colores
  const counts = {
    white: 0,
    yellow: 0,
    green: 0,
    blue: 0,
    orange: 0,
    red: 0
  };

  for (const face in cubeState) {
    for (const color of cubeState[face]) {

      if (!color) {
        return {
          valid: false,
          error: 'Faltan colores.'
        };
      }

      counts[color]++;
    }
  }

  // 2. Verificar 9 colores
  for (const color in counts) {
    if (counts[color] !== 9) {
      return {
        valid: false,
        error: `El color ${color} debe aparecer 9 veces`
      };
    }
  }

  // 3. Validar centros únicos
  const centers = [
    cubeState.U[4],
    cubeState.D[4],
    cubeState.F[4],
    cubeState.B[4],
    cubeState.L[4],
    cubeState.R[4]
  ];

  if (new Set(centers).size !== 6) {
    return {
      valid: false,
      error: 'Los centros son inválidos'
    };
  }

  // 4. Validar aristas
  const edges = getEdgesWithPositions(cubeState);

  const edgeValidation = validateEdges(edges);

  if (!edgeValidation.valid) {
    return edgeValidation;
  }

  // 5. Validar esquinas
  const corners = getCorners(cubeState);

  const cornerValidation =
    validateCorners(corners);

  if (!cornerValidation.valid) {
    return cornerValidation;
  }

  return {
    valid: true,
    error: null
  };
};