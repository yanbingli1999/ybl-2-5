import { MapData, CampusGate, CampusZone, Position, GateAccessLevel } from './types';
import { GRID_SIZE, COLS, ROWS } from './constants';

const ACCESS_LEVEL_ORDER: Record<GateAccessLevel, number> = {
  public: 0,
  student: 1,
  staff: 2,
};

export function canPassGate(gate: CampusGate, playerLevel: GateAccessLevel, isNight: boolean): boolean {
  if (isNight && !gate.nightOpen) return false;
  return ACCESS_LEVEL_ORDER[playerLevel] >= ACCESS_LEVEL_ORDER[gate.accessLevel];
}

export function generateMapData(): MapData {
  const roads = generateRoads();
  const buildings = generateBuildings();
  const chargingStations = generateChargingStations();
  const repairShops = generateRepairShops();
  const campusGates = generateCampusGates();
  const campusZones = generateCampusZones(campusGates);

  return {
    width: COLS * GRID_SIZE,
    height: ROWS * GRID_SIZE,
    gridSize: GRID_SIZE,
    roads,
    buildings,
    chargingStations,
    repairShops,
    campusZones,
    campusGates,
  };
}

function generateRoads(): MapData['roads'] {
  const roads: MapData['roads'] = [];
  let id = 0;

  for (let row = 0; row < ROWS; row++) {
    if (row % 3 === 0 || row === ROWS - 1) {
      roads.push({
        id: `h-${id++}`,
        type: 'horizontal',
        x: 0,
        y: row * GRID_SIZE,
        width: COLS * GRID_SIZE,
        height: GRID_SIZE,
      });
    }
  }

  for (let col = 0; col < COLS; col++) {
    if (col % 4 === 0 || col === COLS - 1) {
      roads.push({
        id: `v-${id++}`,
        type: 'vertical',
        x: col * GRID_SIZE,
        y: 0,
        width: GRID_SIZE,
        height: ROWS * GRID_SIZE,
      });
    }
  }

  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      if ((row % 3 === 0 || row === ROWS - 1) && (col % 4 === 0 || col === COLS - 1)) {
        roads.push({
          id: `i-${id++}`,
          type: 'intersection',
          x: col * GRID_SIZE,
          y: row * GRID_SIZE,
          width: GRID_SIZE,
          height: GRID_SIZE,
        });
      }
    }
  }

  return roads;
}

function generateBuildings(): MapData['buildings'] {
  const buildings: MapData['buildings'] = [];
  const roadPositions = new Set<string>();

  for (let row = 0; row < ROWS; row++) {
    if (row % 3 === 0 || row === ROWS - 1) {
      for (let col = 0; col < COLS; col++) {
        roadPositions.add(`${col},${row}`);
      }
    }
  }
  for (let col = 0; col < COLS; col++) {
    if (col % 4 === 0 || col === COLS - 1) {
      for (let row = 0; row < ROWS; row++) {
        roadPositions.add(`${col},${row}`);
      }
    }
  }

  const colors = {
    residential: ['#5c5c8a', '#6b6b9a', '#7a7aaa'],
    commercial: ['#4a6fa5', '#5a7fb5', '#6a8fc5'],
    industrial: ['#636e72', '#737e82', '#838e92'],
  };

  const types: Array<'residential' | 'commercial' | 'industrial'> = ['residential', 'commercial', 'industrial'];
  let id = 0;

  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      if (!roadPositions.has(`${col},${row}`) && Math.random() > 0.3) {
        const type = types[Math.floor(Math.random() * types.length)];
        const colorSet = colors[type];
        const color = colorSet[Math.floor(Math.random() * colorSet.length)];

        let width = GRID_SIZE;
        let height = GRID_SIZE;

        if (col + 1 < COLS && !roadPositions.has(`${col + 1},${row}`) && Math.random() > 0.5) {
          width = GRID_SIZE * 2;
          roadPositions.add(`${col + 1},${row}`);
        }
        if (row + 1 < ROWS && !roadPositions.has(`${col},${row + 1}`) && Math.random() > 0.5) {
          height = GRID_SIZE * 2;
          roadPositions.add(`${col},${row + 1}`);
        }

        buildings.push({
          id: `b-${id++}`,
          name: `${type}-${id}`,
          type,
          x: col * GRID_SIZE,
          y: row * GRID_SIZE,
          width,
          height,
          color,
        });
      }
    }
  }

  return buildings;
}

function generateChargingStations(): MapData['chargingStations'] {
  return [
    { id: 'cs-1', name: '快充站 A', type: 'charging', x: GRID_SIZE * 4, y: GRID_SIZE * 3 },
    { id: 'cs-2', name: '快充站 B', type: 'charging', x: GRID_SIZE * 16, y: GRID_SIZE * 6 },
    { id: 'cs-3', name: '快充站 C', type: 'charging', x: GRID_SIZE * 12, y: GRID_SIZE * 12 },
    { id: 'cs-4', name: '快充站 D', type: 'charging', x: GRID_SIZE * 24, y: GRID_SIZE * 9 },
  ];
}

function generateRepairShops(): MapData['repairShops'] {
  return [
    { id: 'rs-1', name: '修车铺 A', type: 'repair', x: GRID_SIZE * 8, y: GRID_SIZE * 9 },
    { id: 'rs-2', name: '修车铺 B', type: 'repair', x: GRID_SIZE * 20, y: GRID_SIZE * 3 },
    { id: 'rs-3', name: '修车铺 C', type: 'repair', x: GRID_SIZE * 28, y: GRID_SIZE * 12 },
  ];
}

function generateCampusGates(): CampusGate[] {
  return [
    { id: 'gate-east', name: '东校门', x: GRID_SIZE * 20, y: GRID_SIZE * 6, accessLevel: 'public', nightOpen: true },
    { id: 'gate-west', name: '西校门', x: GRID_SIZE * 8, y: GRID_SIZE * 6, accessLevel: 'public', nightOpen: false },
    { id: 'gate-south', name: '南校门', x: GRID_SIZE * 12, y: GRID_SIZE * 12, accessLevel: 'student', nightOpen: true },
    { id: 'gate-north', name: '北校门', x: GRID_SIZE * 16, y: GRID_SIZE * 3, accessLevel: 'staff', nightOpen: false },
    { id: 'gate-side', name: '侧门', x: GRID_SIZE * 20, y: GRID_SIZE * 9, accessLevel: 'student', nightOpen: true },
  ];
}

function generateCampusZones(gates: CampusGate[]): CampusZone[] {
  return [
    {
      id: 'campus-main',
      name: '中心大学',
      x: GRID_SIZE * 8,
      y: GRID_SIZE * 3,
      width: GRID_SIZE * 12,
      height: GRID_SIZE * 9,
      gateIds: gates.map((g) => g.id),
    },
  ];
}

export function isPositionInCampusZone(x: number, y: number, zones: CampusZone[]): CampusZone | null {
  for (const zone of zones) {
    if (x >= zone.x && x < zone.x + zone.width && y >= zone.y && y < zone.y + zone.height) {
      return zone;
    }
  }
  return null;
}

export function isPositionNearGate(x: number, y: number, gates: CampusGate[], threshold: number = GRID_SIZE): CampusGate | null {
  for (const gate of gates) {
    if (Math.hypot(x - gate.x, y - gate.y) < threshold) {
      return gate;
    }
  }
  return null;
}

export function getOpenGates(gates: CampusGate[], playerLevel: GateAccessLevel, isNight: boolean): CampusGate[] {
  return gates.filter((g) => canPassGate(g, playerLevel, isNight));
}

export function getClosedGates(gates: CampusGate[], playerLevel: GateAccessLevel, isNight: boolean): CampusGate[] {
  return gates.filter((g) => !canPassGate(g, playerLevel, isNight));
}

export function isGateOpen(gate: CampusGate, isNight: boolean): boolean {
  if (!isNight) return true;
  return gate.nightOpen;
}

export function isEnteringCampus(
  prevX: number,
  prevY: number,
  newX: number,
  newY: number,
  zones: CampusZone[]
): boolean {
  const wasInCampus = isPositionInCampusZone(prevX, prevY, zones) !== null;
  const nowInCampus = isPositionInCampusZone(newX, newY, zones) !== null;
  return !wasInCampus && nowInCampus;
}

export function getNearestOpenGate(
  x: number,
  y: number,
  gates: CampusGate[],
  playerLevel: GateAccessLevel,
  isNight: boolean
): CampusGate | null {
  const openGates = getOpenGates(gates, playerLevel, isNight);
  if (openGates.length === 0) return null;

  let nearest: CampusGate | null = null;
  let minDist = Infinity;

  for (const gate of openGates) {
    const dist = Math.hypot(x - gate.x, y - gate.y);
    if (dist < minDist) {
      minDist = dist;
      nearest = gate;
    }
  }

  return nearest;
}

export function isOnRoad(x: number, y: number, roads: Array<{ x: number; y: number; width: number; height: number }>): boolean {
  for (const road of roads) {
    if (
      x >= road.x &&
      x < road.x + road.width &&
      y >= road.y &&
      y < road.y + road.height
    ) {
      return true;
    }
  }
  return false;
}

export function getNearestRoadPosition(x: number, y: number, roads: MapData['roads']): { x: number; y: number } {
  let nearest = { x, y };
  let minDist = Infinity;

  for (const road of roads) {
    const centerX = road.x + road.width / 2;
    const centerY = road.y + road.height / 2;
    const dist = Math.hypot(centerX - x, centerY - y);

    if (dist < minDist) {
      minDist = dist;
      nearest = { x: centerX, y: centerY };
    }
  }

  return nearest;
}

export function findPath(
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  roads: MapData['roads'],
  gridSize: number,
  campusZones?: CampusZone[],
  campusGates?: CampusGate[],
  isNight?: boolean,
  playerLevel?: GateAccessLevel
): Array<{ x: number; y: number }> {
  const startCol = Math.floor(startX / gridSize);
  const startRow = Math.floor(startY / gridSize);
  const endCol = Math.floor(endX / gridSize);
  const endRow = Math.floor(endY / gridSize);

  const roadGrid = new Set<string>();
  for (const road of roads) {
    const col1 = Math.floor(road.x / gridSize);
    const row1 = Math.floor(road.y / gridSize);
    const col2 = Math.floor((road.x + road.width - 1) / gridSize);
    const row2 = Math.floor((road.y + road.height - 1) / gridSize);

    for (let r = row1; r <= row2; r++) {
      for (let c = col1; c <= col2; c++) {
        roadGrid.add(`${c},${r}`);
      }
    }
  }

  if (!roadGrid.has(`${endCol},${endRow}`)) {
    return [];
  }

  const campusCellSet = new Set<string>();
  const gateCellSet = new Set<string>();
  if (campusZones && campusGates && isNight) {
    for (const zone of campusZones) {
      const c1 = Math.floor(zone.x / gridSize);
      const r1 = Math.floor(zone.y / gridSize);
      const c2 = Math.floor((zone.x + zone.width - 1) / gridSize);
      const r2 = Math.floor((zone.y + zone.height - 1) / gridSize);
      for (let r = r1; r <= r2; r++) {
        for (let c = c1; c <= c2; c++) {
          campusCellSet.add(`${c},${r}`);
        }
      }
    }
    const level = playerLevel || 'public';
    for (const gate of campusGates) {
      if (canPassGate(gate, level, isNight)) {
        const gc = Math.floor(gate.x / gridSize);
        const gr = Math.floor(gate.y / gridSize);
        gateCellSet.add(`${gc},${gr}`);
      }
    }
  }

  const startInCampus = campusCellSet.has(`${startCol},${startRow}`);

  interface Node {
    col: number;
    row: number;
    g: number;
    h: number;
    f: number;
    parent: Node | null;
  }

  const openSet: Node[] = [];
  const closedSet = new Set<string>();
  const startNode: Node = {
    col: startCol,
    row: startRow,
    g: 0,
    h: Math.abs(endCol - startCol) + Math.abs(endRow - startRow),
    f: 0,
    parent: null,
  };
  startNode.f = startNode.g + startNode.h;
  openSet.push(startNode);

  const directions = [
    { dc: 0, dr: -1 },
    { dc: 0, dr: 1 },
    { dc: -1, dr: 0 },
    { dc: 1, dr: 0 },
  ];

  while (openSet.length > 0) {
    let currentIndex = 0;
    for (let i = 1; i < openSet.length; i++) {
      if (openSet[i].f < openSet[currentIndex].f) {
        currentIndex = i;
      }
    }

    const current = openSet[currentIndex];

    if (current.col === endCol && current.row === endRow) {
      const path: Array<{ x: number; y: number }> = [];
      let node: Node | null = current;
      while (node) {
        path.unshift({
          x: node.col * gridSize + gridSize / 2,
          y: node.row * gridSize + gridSize / 2,
        });
        node = node.parent;
      }
      return path;
    }

    openSet.splice(currentIndex, 1);
    closedSet.add(`${current.col},${current.row}`);

    for (const dir of directions) {
      const newCol = current.col + dir.dc;
      const newRow = current.row + dir.dr;
      const key = `${newCol},${newRow}`;

      if (!roadGrid.has(key) || closedSet.has(key)) {
        continue;
      }

      if (isNight && campusCellSet.size > 0) {
        const newInCampus = campusCellSet.has(key);
        const currentInCampus = campusCellSet.has(`${current.col},${current.row}`);

        if (newInCampus && !currentInCampus && !startInCampus) {
          if (!gateCellSet.has(key)) {
            continue;
          }
        }
      }

      const g = current.g + 1;
      const existing = openSet.find((n) => n.col === newCol && n.row === newRow);

      if (!existing) {
        const h = Math.abs(endCol - newCol) + Math.abs(endRow - newRow);
        openSet.push({
          col: newCol,
          row: newRow,
          g,
          h,
          f: g + h,
          parent: current,
        });
      } else if (g < existing.g) {
        existing.g = g;
        existing.f = g + existing.h;
        existing.parent = current;
      }
    }
  }

  return [];
}
