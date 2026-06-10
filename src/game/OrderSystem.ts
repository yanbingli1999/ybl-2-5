import { Order, MapData, Position, CampusZone, CampusGate } from './types';
import {
  MIN_ORDER_REWARD,
  MAX_ORDER_REWARD,
  MIN_ORDER_DISTANCE,
  MAX_ORDER_DISTANCE,
  LOCATION_NAMES,
  CAMPUS_LOCATION_NAMES,
  GRID_SIZE,
  isNightTime,
} from './constants';
import { getNearestRoadPosition, isPositionInCampusZone, getOpenGates, isGateOpen } from './mapData';

export function generateOrder(
  map: MapData,
  playerPos: Position,
  gameTime: number,
  existingOrders: Order[]
): Order | null {
  const isCampus = Math.random() < 0.35;

  const availablePickupPoints = map.chargingStations.concat(map.repairShops);
  
  if (availablePickupPoints.length < 2) return null;

  const usedNames = new Set(existingOrders.flatMap((o) => [
    o.pickupLocation.name,
    o.deliveryLocation.name,
  ]));

  const isNight = isNightTime(gameTime);

  if (isCampus && map.campusZones.length > 0 && map.campusGates.length > 0) {
    const campusOrder = generateCampusOrder(map, gameTime, usedNames, isNight);
    if (campusOrder) return campusOrder;
  }

  const availableNames = LOCATION_NAMES.filter((n) => !usedNames.has(n));
  if (availableNames.length < 2) return null;

  const getRandomRoadPosition = (): Position & { name: string } => {
    const roads = map.roads.filter((r) => r.type === 'intersection');
    const road = roads[Math.floor(Math.random() * roads.length)];
    const name = availableNames[Math.floor(Math.random() * availableNames.length)];
    return {
      x: road.x + GRID_SIZE / 2,
      y: road.y + GRID_SIZE / 2,
      name,
    };
  };

  const pickupLocation = getRandomRoadPosition();
  let deliveryLocation = getRandomRoadPosition();

  const distance = Math.floor(
    Math.hypot(deliveryLocation.x - pickupLocation.x, deliveryLocation.y - pickupLocation.y) / GRID_SIZE
  );

  const clampedDistance = Math.max(MIN_ORDER_DISTANCE, Math.min(MAX_ORDER_DISTANCE, distance));
  const baseReward = Math.floor(MIN_ORDER_REWARD + (clampedDistance / MAX_ORDER_DISTANCE) * (MAX_ORDER_REWARD - MIN_ORDER_REWARD));
  const reward = baseReward + Math.floor(Math.random() * 20 - 10);

  const estimatedTime = clampedDistance * 1.5;
  const deadline = estimatedTime + 30;
  const customerUrgency = Math.floor(Math.random() * 5) + 1;

  return {
    id: `order-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    pickupLocation,
    deliveryLocation,
    reward: Math.max(MIN_ORDER_REWARD, reward),
    deadline,
    maxDeadline: deadline,
    status: 'available',
    customerUrgency,
    distance: clampedDistance,
    createdAt: gameTime,
  };
}

function generateCampusOrder(
  map: MapData,
  gameTime: number,
  usedNames: Set<string>,
  isNight: boolean
): Order | null {
  const zone = map.campusZones[Math.floor(Math.random() * map.campusZones.length)];
  const campusNames = CAMPUS_LOCATION_NAMES.filter((n) => !usedNames.has(n));
  if (campusNames.length < 1) return null;

  const availableNames = LOCATION_NAMES.filter((n) => !usedNames.has(n));
  if (availableNames.length < 1) return null;

  const roads = map.roads.filter((r) => r.type === 'intersection');
  const outsideRoads = roads.filter((r) =>
    !isPositionInCampusZone(r.x + GRID_SIZE / 2, r.y + GRID_SIZE / 2, map.campusZones)
  );
  const insideRoads = roads.filter((r) =>
    isPositionInCampusZone(r.x + GRID_SIZE / 2, r.y + GRID_SIZE / 2, map.campusZones)
  );

  if (outsideRoads.length === 0 || insideRoads.length === 0) return null;

  const outsideRoad = outsideRoads[Math.floor(Math.random() * outsideRoads.length)];
  const insideRoad = insideRoads[Math.floor(Math.random() * insideRoads.length)];

  const pickupLocation: Position & { name: string } = {
    x: outsideRoad.x + GRID_SIZE / 2,
    y: outsideRoad.y + GRID_SIZE / 2,
    name: availableNames[Math.floor(Math.random() * availableNames.length)],
  };
  const deliveryLocation: Position & { name: string } = {
    x: insideRoad.x + GRID_SIZE / 2,
    y: insideRoad.y + GRID_SIZE / 2,
    name: campusNames[Math.floor(Math.random() * campusNames.length)],
  };

  const openGates = getOpenGates(map.campusGates, gameTime, isNight);
  let gateAccessHint = '';
  if (isNight) {
    const gateNames = openGates.map((g) => g.name).join('、');
    gateAccessHint = `🌙夜间仅 ${gateNames} 可通行`;
  } else {
    gateAccessHint = '☀️所有校门均可通行';
  }

  const distance = Math.floor(
    Math.hypot(deliveryLocation.x - pickupLocation.x, deliveryLocation.y - pickupLocation.y) / GRID_SIZE
  );

  const clampedDistance = Math.max(MIN_ORDER_DISTANCE, Math.min(MAX_ORDER_DISTANCE, distance));
  const nightBonus = isNight ? 30 : 0;
  const baseReward = Math.floor(MIN_ORDER_REWARD + (clampedDistance / MAX_ORDER_DISTANCE) * (MAX_ORDER_REWARD - MIN_ORDER_REWARD));
  const reward = baseReward + Math.floor(Math.random() * 20 - 10) + nightBonus;

  const estimatedTime = clampedDistance * 1.5;
  const deadline = estimatedTime + 30;
  const customerUrgency = isNight
    ? Math.min(5, Math.floor(Math.random() * 3) + 3)
    : Math.floor(Math.random() * 5) + 1;

  return {
    id: `order-campus-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    pickupLocation,
    deliveryLocation,
    reward: Math.max(MIN_ORDER_REWARD, reward),
    deadline,
    maxDeadline: deadline,
    status: 'available',
    customerUrgency,
    distance: clampedDistance,
    createdAt: gameTime,
    isCampus: true,
    campusZoneId: zone.id,
    gateAccessHint,
  };
}

export function canAcceptOrder(order: Order, player: { currentOrderId: string | null }): boolean {
  return order.status === 'available' && player.currentOrderId === null;
}

export function isAtLocation(
  playerPos: Position,
  targetPos: Position,
  threshold: number = GRID_SIZE
): boolean {
  const dist = Math.hypot(playerPos.x - targetPos.x, playerPos.y - targetPos.y);
  return dist <= threshold;
}

export function updateOrderDeadlines(orders: Order[], deltaTime: number): Order[] {
  return orders.map((order) => {
    if (order.status === 'accepted' || order.status === 'pickedup' || order.status === 'delivering') {
      const newDeadline = order.deadline - deltaTime;
      if (newDeadline <= 0) {
        return { ...order, deadline: 0, status: 'failed' as const };
      }
      return { ...order, deadline: newDeadline };
    }
    return order;
  });
}

export function getOrderStatusText(status: Order['status']): string {
  const statusMap: Record<Order['status'], string> = {
    available: '可接单',
    accepted: '已接单',
    pickedup: '已取货',
    delivering: '配送中',
    completed: '已完成',
    failed: '已失败',
  };
  return statusMap[status];
}

export function getUrgencyText(urgency: number): string {
  const levels = ['', '不急', '正常', '稍急', '紧急', '非常急'];
  return levels[urgency] || '正常';
}
