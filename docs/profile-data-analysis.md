# Profile Page 数据分析和建议方案

## 📊 当前 Mock 数据 vs 可用链上数据

### 当前展示的Mock数据
```typescript
PlayerProfile {
  // 玩家基础信息
  level: 15
  experience: 2350 / 3000
  rank: "Knight"

  // 全局统计（跨多个游戏）
  stats {
    totalGames: 47          ❌ 需要GameFactory或后端
    wins: 32                ❌ 需要多游戏历史
    losses: 15              ❌ 需要多游戏历史
    winRate: 68%            ❌ 需要多游戏历史
    currentStreak: 3        ❌ 需要多游戏历史
    bestStreak: 8           ❌ 需要多游戏历史
    averageGameTime: "12:34" ❌ 需要多游戏历史

    // 单游戏数据（可以从当前游戏获取）
    favoriteStrategy: "..."  ⚠️ 可以分析moves推断
    totalTroopsLost: 245     ✅ 可以从grid变化计算
    totalTroopsKilled: 387   ✅ 可以从grid变化计算
    castlesCaptured: 12      ✅ 可以从moveHistory分析
    siegesWon: 8             ✅ 可以从moveHistory分析
  }
}
```

---

## ✅ 可从单个游戏合约获取的数据

### 1. **当前游戏状态**
```typescript
// 从 get2dGrid() 获取
interface CurrentGameState {
  // 领土控制
  territoriesControlled: number        // 统计grid中player拥有的cells
  castlesControlled: number            // 统计isCastle=true的cells
  totalUnitsOwned: number              // 统计所有cells中的units

  // 地图控制率
  territoryControlPercentage: number   // territoriesControlled / 9 * 100

  // 军队分布
  armyLocations: Array<{
    position: {x, y}
    units: number
    isCastle: boolean
  }>
}
```

### 2. **历史行动统计**
```typescript
// 从 getPlayerMoves(address) 获取
interface PlayerActionStats {
  totalMoves: number                   // moves.length
  totalUnitsMoved: bigint              // sum(moves.units)
  averageUnitsPerMove: number          // totalUnitsMoved / totalMoves

  // 移动模式
  aggressiveMoves: number              // 移动到敌方领土的次数
  defensiveMoves: number               // 移动到己方领土的次数
  longestMove: {                       // 最远距离移动
    distance: number
    from: {x, y}
    to: {x, y}
  }

  // 回合参与度
  roundsParticipated: number           // 参与的回合数
  missedRounds: number                 // 未提交move的回合数
}
```

### 3. **战斗统计**
```typescript
// 通过分析grid变化推断
interface CombatStats {
  territoriesCaptured: number          // 领土易手次数
  castlesCaptured: number              // 城堡占领次数
  unitsLost: number                    // 估算损失单位数
  unitsDestroyed: number               // 估算消灭敌方单位数

  // 战斗胜率（通过领土变化推断）
  successfulAttacks: number
  failedAttacks: number
  attackSuccessRate: number
}
```

### 4. **游戏进度**
```typescript
interface GameProgress {
  currentRound: number                 // roundNumber()
  gameStatus: "Not Started" | "Ongoing" | "Finished"  // gameStatus()
  hasWon: boolean                      // getWinner() === playerAddress
  gameStartTime: number                // 从第一个move的timestamp
  gameDuration: number                 // 当前时间 - 开始时间
}
```

---

## 🎯 建议的修改方案

### 方案 A：分离显示（推荐）
**保留两个独立视图**：
1. **"Overview" Tab** - 全局统计（保留Mock数据，标注"Coming Soon"）
2. **"Current Game Stats" Tab** - 当前游戏的实时数据（用真实链上数据）
3. **"Round History" Tab** - 已实现的历史回放

**优点**：
- 清晰区分全局 vs 单局数据
- 用户不会混淆
- 为未来添加全局统计留空间

### 方案 B：替换为单游戏数据
**完全替换为当前游戏数据**：
- 移除跨游戏的Mock统计
- 只显示当前游戏的真实数据
- 重新设计UI适配单游戏数据

**优点**：
- 所有数据都是真实的
- 更简洁

**缺点**：
- 失去"玩家画像"的概念
- 数据较少

---

## 📋 具体实施方案（推荐方案A）

### Step 1: 创建数据获取Hook
```typescript
// lib/hooks/usePlayerGameStats.ts
export function usePlayerGameStats(
  gameAddress: `0x${string}`,
  playerAddress: `0x${string}`
) {
  // 获取当前游戏状态
  // 获取玩家历史moves
  // 计算统计数据

  return {
    currentState: {...},
    actionStats: {...},
    combatStats: {...},
    gameProgress: {...},
    isLoading: boolean,
    error: string | null
  }
}
```

### Step 2: 创建新的Stats组件
```typescript
// components/profile/CurrentGameStats.tsx
export function CurrentGameStats({
  gameAddress,
  playerAddress
}) {
  const stats = usePlayerGameStats(gameAddress, playerAddress)

  return (
    <div>
      {/* 领土控制 */}
      <StatCard
        title="Territories Controlled"
        value={stats.currentState.territoriesControlled}
        total={9}
      />

      {/* 移动统计 */}
      <StatCard
        title="Total Moves"
        value={stats.actionStats.totalMoves}
      />

      {/* 战斗统计 */}
      ...
    </div>
  )
}
```

### Step 3: 修改InGameProfile
```typescript
export default function GameProfile() {
  const [selectedView, setSelectedView] = useState<
    "overview" | "gameStats" | "history"
  >("gameStats")  // 默认显示真实数据

  return (
    <div>
      <Tabs>
        <Tab id="overview">
          {/* 全局统计（Mock + Coming Soon标识） */}
          <GlobalStatsView />
        </Tab>

        <Tab id="gameStats">
          {/* 当前游戏实时数据 */}
          <CurrentGameStats
            gameAddress={gameAddress}
            playerAddress={player1Address}
          />
        </Tab>

        <Tab id="history">
          {/* 回合历史 */}
          <GameHistoryView />
        </Tab>
      </Tabs>
    </div>
  )
}
```

---

## 🎨 新UI设计建议

### Current Game Stats Tab 布局
```
┌─────────────────────────────────────────────────┐
│ 🎮 Current Game Statistics                      │
│ Game Status: Ongoing | Round 5 | Duration: 1h  │
├─────────────────────────────────────────────────┤
│                                                  │
│ 🏰 Territory Control                            │
│ ┌─────────────┬─────────────┐                   │
│ │ Player 1    │ Player 2    │                   │
│ │   5/9       │   4/9       │                   │
│ │  🟦🟦🟦🟦🟦  │  🟥🟥🟥🟥    │                   │
│ │  56%        │  44%        │                   │
│ └─────────────┴─────────────┘                   │
│                                                  │
│ ⚔️ Combat Stats                                 │
│ ┌────────────────┬────────────────┐             │
│ │ Territories    │ Units Lost     │             │
│ │ Captured: 3    │ P1: 45  P2: 67 │             │
│ │ Castles: 1     │ K/D: 1.49      │             │
│ └────────────────┴────────────────┘             │
│                                                  │
│ 📊 Movement Stats                               │
│ ┌──────────────────────────────────┐            │
│ │ Total Moves: 8 vs 7              │            │
│ │ Units Moved: 250 vs 180          │            │
│ │ Avg per Move: 31 vs 26           │            │
│ │ Longest Move: 2 cells            │            │
│ └──────────────────────────────────┘            │
│                                                  │
│ 🎯 Performance                                  │
│ ┌──────────────────────────────────┐            │
│ │ Attack Success: 75% (3/4)        │            │
│ │ Defense Success: 100% (2/2)      │            │
│ │ Round Participation: 100%        │            │
│ └──────────────────────────────────┘            │
└─────────────────────────────────────────────────┘
```

---

## 🔧 需要实现的功能

### 高优先级 (P0)
1. ✅ `usePlayerGameStats` hook - 获取实时数据
2. ✅ `CurrentGameStats` 组件 - 展示当前游戏统计
3. ✅ 领土控制可视化
4. ✅ 对战双方数据对比

### 中优先级 (P1)
5. ⭐ 战斗统计计算逻辑
6. ⭐ 移动模式分析（aggressive vs defensive）
7. ⭐ 性能评分系统

### 低优先级 (P2)
8. 💡 小地图可视化领土控制
9. 💡 趋势图表（单位数量变化）
10. 💡 策略分析和建议

---

## 📝 数据计算示例

### 领土控制计算
```typescript
function calculateTerritoryControl(grid: Cell[][], playerAddress: string) {
  let controlled = 0
  let castles = 0
  let totalUnits = 0

  for (let x = 0; x < 3; x++) {
    for (let y = 0; y < 3; y++) {
      const cell = grid[x][y]
      if (cell.player.toLowerCase() === playerAddress.toLowerCase()) {
        controlled++
        if (cell.isCastle) castles++
        totalUnits += Number(cell.units[playerId])
      }
    }
  }

  return { controlled, castles, totalUnits, percentage: (controlled / 9) * 100 }
}
```

### 战斗统计计算
```typescript
function calculateCombatStats(moves: MoveRecord[], grid: Cell[][]) {
  let captured = 0
  let castlesCaptured = 0

  // 通过比较每个move前后的grid状态
  // 如果目标cell的owner在move后改变，则captured++

  return { captured, castlesCaptured }
}
```

---

## 🎯 我的建议

采用 **方案A**，原因：
1. ✅ 保留了"玩家档案"的概念（即使是Mock数据）
2. ✅ 清晰区分全局统计 vs 单局统计
3. ✅ 为未来扩展预留空间（接入GameFactory）
4. ✅ 用户体验更好（三个独立视图）

实施顺序：
1. 创建 `usePlayerGameStats` hook
2. 创建 `CurrentGameStats` 组件
3. 添加新Tab到 InGameProfile
4. 在Overview标注"Cross-game stats coming soon"

---

需要我开始实施吗？
