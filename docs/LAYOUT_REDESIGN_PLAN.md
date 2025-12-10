# GamePlayPage 布局重构方案

## 问题总结

### 移动端问题
1. Map与Grid有间隙（padding/margin计算问题）
2. ContextualActionBar不吸底
3. 信息重复（GameStatusBar + GameStatusPanel）
4. 整体高度溢出需要滚动

### 桌面端问题
1. 右侧面板信息冗余
2. TurnHistory位置不固定
3. 面板高度约束不一致

---

## 新布局方案

### 移动端布局 (Mobile-First)

```
┌─────────────────────────────────┐
│  Mini Status Bar (固定顶部)      │  <- 极简: 只显示 🏰 0/3 vs 0/3
├─────────────────────────────────┤
│                                 │
│                                 │
│         Game Map                │  <- 占满剩余空间，无额外padding
│         (3x3 Grid)              │
│                                 │
│                                 │
├─────────────────────────────────┤
│  Action Bar (固定底部)           │  <- 吸底: 状态指引 + 操作按钮
│  "Tap your army (10 units)"     │
│  [🏰 3 more to win]             │
└─────────────────────────────────┘
```

**关键CSS**:
```tsx
// 移动端容器
<div className="h-[100dvh] flex flex-col">
  {/* 顶部状态栏 - 固定高度 */}
  <MiniStatusBar className="h-12 flex-shrink-0" />

  {/* 地图区域 - 填满剩余空间 */}
  <div className="flex-1 min-h-0 flex items-center justify-center">
    <GameMap />
  </div>

  {/* 底部操作栏 - 固定底部 */}
  <ContextualActionBar className="flex-shrink-0 safe-area-inset-bottom" />
</div>
```

### 桌面端布局 (Desktop)

```
┌──────────────────────────────────────────────────────────┐
│  Header / Navigation                                      │
├────────────────────────────────┬─────────────────────────┤
│                                │  Game Status            │
│                                │  ├─ Castle Progress     │
│       Game Map                 │  ├─ Unit Count          │
│       (3x3 Grid)               │  └─ Turn Status         │
│                                ├─────────────────────────┤
│                                │  Operation Panel        │
│                                │  (Army Details/Move)    │
│                                ├─────────────────────────┤
│                                │  Turn History           │
│                                │  (Collapsible)          │
├────────────────────────────────┴─────────────────────────┤
│  Contextual Action Bar (Optional on desktop)              │
└──────────────────────────────────────────────────────────┘
```

---

## 实施步骤

### Phase 1: 修复移动端吸底 (Critical)

**文件**: `components/gamePlay/GamePlayPage.tsx`

```tsx
// 移动端专用布局
function MobileGameLayout({ gameAddressParam }: GamePlayPageProps) {
  return (
    <div className="h-[100dvh] flex flex-col bg-background">
      {/* 极简顶部状态 */}
      <MiniStatusBar />

      {/* 地图容器 - 居中显示 */}
      <div className="flex-1 min-h-0 flex items-center justify-center p-2">
        <GameMap gameAddress={gameAddressParam} isMobile={true} />
      </div>

      {/* 固定底部操作栏 */}
      <div className="flex-shrink-0 pb-safe">
        <ContextualActionBar />
      </div>

      {/* 操作Drawer (按需弹出) */}
      <MobileOperationDrawer />
    </div>
  )
}
```

### Phase 2: 创建极简状态栏

**新组件**: `components/gamePlay/MiniStatusBar.tsx`

```tsx
export function MiniStatusBar() {
  const { castleStats } = useCastleStats()

  return (
    <div className="h-12 px-4 flex items-center justify-between bg-surface-1 border-b border-border">
      {/* 城堡进度 - 核心信息 */}
      <div className="flex items-center gap-3">
        <Crown className="w-5 h-5 text-game-castle" />
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-game-player">{castleStats.player}</span>
          <span className="text-text-muted">/3</span>
          <div className="w-12 h-1.5 bg-surface-3 rounded-full mx-2">
            <div
              className="h-full bg-game-player rounded-full"
              style={{ width: `${(castleStats.player / 3) * 100}%` }}
            />
          </div>
          <span className="text-text-muted">vs</span>
          <div className="w-12 h-1.5 bg-surface-3 rounded-full mx-2">
            <div
              className="h-full bg-game-enemy rounded-full"
              style={{ width: `${(castleStats.enemy / 3) * 100}%` }}
            />
          </div>
          <span className="text-lg font-bold text-game-enemy">{castleStats.enemy}</span>
          <span className="text-text-muted">/3</span>
        </div>
      </div>

      {/* 回合状态 */}
      <TurnStatusBadge />
    </div>
  )
}
```

### Phase 3: 重构 ContextualActionBar (吸底)

**修改**: `components/gamePlay/GameMap/ContextualActionBar.tsx`

```tsx
export const ContextualActionBar = memo(() => {
  // ... existing logic ...

  return (
    <div className="bg-surface-1 border-t border-border px-4 py-3 pb-safe">
      <div className="flex items-center justify-between">
        {/* 左侧: 状态指引 */}
        <div className="flex items-center gap-3">
          {renderStatusIcon()}
          <div>
            <p className="text-sm font-medium">{statusText}</p>
            <p className="text-xs text-text-secondary">{hintText}</p>
          </div>
        </div>

        {/* 右侧: 胜利条件提示 */}
        <div className="flex items-center gap-1 text-xs text-game-castle bg-game-castle/10 px-2 py-1 rounded">
          <Crown className="w-3 h-3" />
          <span>{castlesNeeded} more to win</span>
        </div>
      </div>
    </div>
  )
})
```

### Phase 4: 简化 GameMap

**修改**: `components/gamePlay/GameMap/index.tsx`

移除 GameMap 内部的 GameStatusBar 和 ContextualActionBar，让父组件控制布局:

```tsx
export default function GameMap({ gameAddress, isMobile }: GameMapProps) {
  return (
    <div className="aspect-square w-full max-w-[600px] relative">
      {/* 地图核心内容 */}
      <TerritoryGrid ... />

      {/* ✅ 动画层 - 保留 */}
      <AnimationLayer
        armies={armies}
        animatingArmies={animatingArmies}
        armyPositions={armyPositions}
      />

      {/* ✅ 移动路径高亮 - 保留 */}
      <MovementOverlay
        showMovementPaths={showMovementPaths}
        movementMode={movementMode}
        validMovementCells={validMovementCells}
        ...
      />

      {/* ✅ 战斗特效覆盖层 - 保留 */}
      {battleEffects.length > 0 && (
        <BattleEffectOverlay battleEffects={battleEffects} />
      )}

      {/* 取消按钮 (浮动) */}
      {movementMode && <CancelButton />}

      {/* 迷你地图 (仅桌面) */}
      {!isMobile && <MiniMapPanel />}
    </div>
  )
}
```

### 关于动画和特效的说明

**保留的动画组件**:

| 组件 | 用途 | 位置 |
|------|------|------|
| `AnimationLayer` | 军队移动动画 | GameMap 内部 (absolute) |
| `MovementOverlay` | 可移动格子高亮 | GameMap 内部 (absolute) |
| `BattleEffectOverlay` | 战斗爆炸/伤害特效 | GameMap 内部 (absolute) |

**动画层级 (z-index)**:
```
z-10: TerritoryGrid (基础格子)
z-20: MovementOverlay (移动高亮)
z-25: AnimationLayer (移动动画)
z-30: BattleEffectOverlay (战斗特效)
z-40: CancelButton / MiniMap (UI控件)
```

**注意**: BattleEffectOverlay 之前在 GamePlayPage 层级，建议移到 GameMap 内部，这样:
1. 特效位置与地图坐标一致
2. 不会被固定的 ActionBar 遮挡
3. 动画层级更清晰
```

---

## 设计决策说明

### 1. 为什么移除 GameStatusBar?

**之前**: GameStatusBar 在 GameMap 内部，占用地图空间
**之后**: 状态信息移到顶部 MiniStatusBar，地图可以更大

### 2. 为什么 ContextualActionBar 要吸底?

- **Fitts's Law**: 屏幕边缘是最容易触达的位置
- **一致性**: 符合移动端底部导航的用户习惯
- **可达性**: 单手操作时拇指容易触达

### 3. 为什么要简化信息层级?

**之前**:
- GameStatusBar: 城堡、兵力、领土
- GameStatusPanel: 领土列表
- ContextualActionBar: 操作提示

**之后**:
- MiniStatusBar: 城堡进度 (核心胜利条件)
- ContextualActionBar: 操作指引 + 胜利提示

**原则**: 用户在游戏中只关心两件事:
1. 我离赢还差多少? (城堡进度)
2. 我现在该做什么? (操作指引)

---

## 视觉参考

### 移动端理想效果

```
┌─────────────────────────┐
│ 🏰 2/3 ━━━━ vs ━━ 1/3  │  <- 极简顶栏 (40px)
├─────────────────────────┤
│ ┌─────┬─────┬─────┐    │
│ │     │ 🏰  │     │    │
│ │     │     │     │    │
│ ├─────┼─────┼─────┤    │  <- 地图占满 (flex-1)
│ │     │     │ 🏰  │    │
│ │ 👥10│     │     │    │
│ ├─────┼─────┼─────┤    │
│ │ 🏰  │     │     │    │
│ │     │     │👥10 │    │
│ └─────┴─────┴─────┘    │
├─────────────────────────┤
│ 👥 Tap army to move    │  <- 固定底栏 (56px)
│    Select on map  [🏰1]│
└─────────────────────────┘
```

---

## 实施优先级

1. **P0 (立即)**: ContextualActionBar 吸底
2. **P0 (立即)**: 移除地图与屏幕之间的间隙
3. **P1 (本周)**: 创建 MiniStatusBar，移除 GameStatusBar
4. **P2 (下周)**: 桌面端侧边栏优化
