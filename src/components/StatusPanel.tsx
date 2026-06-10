import { useShallow } from 'zustand/react/shallow';
import { useGameStore } from '../store/gameStore';
import { WEATHER_NAMES, WEATHER_COLORS, isNightTime, getGameHour } from '../game/constants';
import { calculateTotalRating, formatMoney } from '../game/EconomySystem';
import { Zap, Heart, Wrench, DollarSign, Cloud, Clock, Star, Moon, Sun, Shield } from 'lucide-react';

export default function StatusPanel() {
  const player = useGameStore((state) => state.player);
  const vehicle = useGameStore((state) => state.vehicle);
  const weather = useGameStore((state) => state.weather);
  const gameTime = useGameStore((state) => state.gameTime);
  const incomeRecords = useGameStore(useShallow((state) => state.incomeRecords));
  const isCharging = useGameStore((state) => state.isCharging);
  const isRepairing = useGameStore((state) => state.isRepairing);
  const isResting = useGameStore((state) => state.isResting);

  const avgRating = calculateTotalRating(incomeRecords);
  const night = isNightTime(gameTime);
  const gameHour = getGameHour(gameTime);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatGameHour = (hour: number) => {
    return `${hour.toString().padStart(2, '0')}:00`;
  };

  const getProgressClass = (value: number) => {
    if (value < 20) return 'danger';
    if (value < 50) return 'warning';
    return '';
  };

  const weatherIcon = {
    sunny: '☀️',
    cloudy: '⛅',
    rainy: '🌧️',
    heavy_rain: '⛈️',
    storm: '🌪️',
  }[weather.type];

  return (
    <div className="game-card p-4 w-72 space-y-4">
      <h3 className="font-pixel text-sm text-game-neon glow-text">状态面板</h3>

      <div className="flex items-center gap-2">
        <DollarSign size={18} className="text-game-streetLight" />
        <span className="font-retro text-2xl text-game-streetLight">{formatMoney(player.money)}</span>
      </div>

      <div className="space-y-3">
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1">
              <Zap size={14} className="text-game-neon" />
              <span className="font-retro text-sm">电量</span>
            </div>
            <span className={`font-retro text-sm ${vehicle.battery < 20 ? 'text-game-danger animate-pulse' : ''}`}>
              {Math.floor(vehicle.battery)}%
              {isCharging && <span className="text-game-success ml-1">⚡充电中</span>}
            </span>
          </div>
          <div className="progress-bar">
            <div
              className={`progress-bar-fill ${getProgressClass(vehicle.battery)}`}
              style={{ width: `${vehicle.battery}%` }}
            />
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1">
              <Heart size={14} className="text-game-danger" />
              <span className="font-retro text-sm">体力</span>
            </div>
            <span className={`font-retro text-sm ${player.stamina < 20 ? 'text-game-danger animate-pulse' : ''}`}>
              {Math.floor(player.stamina)}%
              {isResting && <span className="text-game-success ml-1">💤休息中</span>}
            </span>
          </div>
          <div className="progress-bar">
            <div
              className={`progress-bar-fill ${getProgressClass(player.stamina)}`}
              style={{ width: `${player.stamina}%`, background: 'linear-gradient(90deg, #ff4757 0%, #ff6b81 100%)' }}
            />
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1">
              <Wrench size={14} className="text-game-streetLight" />
              <span className="font-retro text-sm">耐久度</span>
            </div>
            <span className={`font-retro text-sm ${vehicle.durability < 20 ? 'text-game-danger animate-pulse' : ''}`}>
              {Math.floor(vehicle.durability)}%
              {isRepairing && <span className="text-game-success ml-1">🔧维修中</span>}
            </span>
          </div>
          <div className="progress-bar">
            <div
              className={`progress-bar-fill ${getProgressClass(vehicle.durability)}`}
              style={{ width: `${vehicle.durability}%`, background: 'linear-gradient(90deg, #ffcc4d 0%, #ffda79 100%)' }}
            />
          </div>
        </div>
      </div>

      <div className="border-t border-game-neon/30 pt-3 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cloud size={16} style={{ color: WEATHER_COLORS[weather.type] }} />
            <span className="font-retro text-lg">{weatherIcon}</span>
          </div>
          <span className="font-retro text-sm" style={{ color: WEATHER_COLORS[weather.type] }}>
            {WEATHER_NAMES[weather.type]}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {night ? <Moon size={14} className="text-blue-400" /> : <Sun size={14} className="text-yellow-400" />}
            <span className={`font-retro text-sm ${night ? 'text-blue-400' : 'text-yellow-400'}`}>
              {formatGameHour(gameHour)} {night ? '夜间' : '白天'}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Clock size={14} className="text-gray-400" />
            <span className="font-retro text-xs text-gray-400">{formatTime(gameTime)}</span>
          </div>
        </div>

        {night && (
          <div className="bg-blue-500/10 border border-blue-500/30 rounded px-2 py-1">
            <span className="font-retro text-[10px] text-blue-300">
              🌙 夜间管制：部分校门已关闭，注意门禁提示
            </span>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Shield size={14} className="text-purple-400" />
            <span className="font-retro text-sm text-gray-400">门禁等级</span>
          </div>
          <span className={`font-retro text-sm ${
            player.gateAccessLevel === 'staff' ? 'text-red-400' :
            player.gateAccessLevel === 'student' ? 'text-yellow-400' :
            'text-green-400'
          }`}>
            {player.gateAccessLevel === 'public' ? '🟢 公共' :
             player.gateAccessLevel === 'student' ? '🟡 学生证' :
             '🔴 员工证'}
          </span>
        </div>

        {player.gateAccessLevel !== 'staff' && (
          <div className="bg-purple-500/10 border border-purple-500/20 rounded px-2 py-1">
            <span className="font-retro text-[10px] text-purple-300">
              {player.gateAccessLevel === 'public'
                ? '💡 完成校园单3次可升级为学生证'
                : '💡 完成校园单8次可升级为员工证'}
              ({player.completedOrders}单)
            </span>
          </div>
        )}

        <div className="flex items-center justify-between">
          <Star size={14} className="text-game-streetLight" />
          <span className="font-retro text-sm text-game-streetLight">
            评分: {avgRating > 0 ? avgRating.toFixed(1) : '-'}/5.0
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="font-retro text-sm text-gray-400">完成订单</span>
          <span className="font-retro text-sm text-game-success">{player.completedOrders}</span>
        </div>
      </div>

      {(isCharging || isRepairing || isResting) && (
        <div className="bg-game-neon/10 border border-game-neon/50 rounded p-2 text-center">
          <span className="font-retro text-xs text-game-neon">
            {isCharging && '正在充电中...'}
            {isRepairing && '正在维修中...'}
            {isResting && '正在休息中...'}
          </span>
        </div>
      )}
    </div>
  );
}
