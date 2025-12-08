# Game Map UX Improvement Plan

## Executive Summary

This plan outlines comprehensive UX improvements for the Chain of Throne game map to create a smooth, intuitive, and engaging gaming experience. The improvements are organized into phases, prioritized by impact and implementation complexity.

---

## Game Rules (V1)

### Win Condition
**🏆 CAPTURE 3 CASTLES TO WIN**

This is the PRIMARY goal - not destroying enemies, but controlling castles!

### Core Mechanics
| Rule | Detail |
|------|--------|
| **Win Condition** | First to control 3 castles wins |
| **Starting Units** | 10 units per player (fixed, no reinforcements) |
| **Army Splitting** | Yes - choose how many units (1-10) to send |
| **Combat** | Deterministic - higher unit count wins (no RNG) |
| **Survivors** | Winner keeps difference (6 vs 4 → 2 survive) |
| **Tie** | ☠️ **BOTH armies destroyed!** (very bad) |

### Combat Resolution
```
Attacker: 6 units  vs  Defender: 4 units  →  Attacker WINS (2 survive)
Attacker: 4 units  vs  Defender: 6 units  →  Defender WINS (2 survive)
Attacker: 5 units  vs  Defender: 5 units  →  TIE - BOTH DESTROYED! ☠️
```

### UX Implications

**Primary Focus - Castle Control (Win Condition!):**
- 🏰 Castle count must be VERY prominent
- Show "X/3 castles" for each player at all times
- Highlight castles visually on the map (golden border, larger)
- Show "1 more castle to win!" warnings
- Uncontrolled castles should pulse/glow to attract attention

**Secondary Focus - Combat Decisions:**
- Need unit slider (how many to send)
- Show EXACT outcome before confirming (deterministic = no surprises)
- **Strongly warn about ties** (both armies die!)
- Display remaining units at source after move
- Show "send X units to win" suggestions

---

## Current Pain Points

### 1. Status Analysis Difficulty
- **Castle count not visible** - Win condition is hidden!
- Hard to quickly understand "who's winning"
- Territory ownership requires examining each cell
- No visual summary of game state

### 2. Information Overload
- Too much data crammed into small territory cells
- Units display (X/Y format) is confusing
- Castles don't stand out from regular territories
- Mobile experience suffers most

### 3. Interaction Clarity
- Unclear what's clickable vs informational
- Movement flow requires multiple mental steps
- No preview of battle outcome before committing
- Ties are not warned about (catastrophic mistake)

### 4. Visual Feedback
- Color-only ownership indicators (accessibility issue)
- No tooltips or explanations
- Castles look same as regular territories
- Turn/round status not prominent

---

## Phase 1: Quick Wins (1-2 days)

### 1.1 Game Status Header Bar
**Location:** Top of game map
**Purpose:** At-a-glance game state - **CASTLE COUNT IS PRIMARY!**

```
┌────────────────────────────────────────────────────────────────────┐
│                                                                    │
│   🏰 CASTLES: You 2/3  vs  Enemy 1/3        Round 5 │ Your Turn   │
│   ████████░░░░       ████░░░░░░░░                                  │
│                                                                    │
│   ⚔️ Units: You 7     vs  Enemy 4           🏴 Territories: 5 vs 3 │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

**Warning States:**
```
When enemy is close to winning:
┌────────────────────────────────────────────────────────────────────┐
│  ⚠️ DANGER: ENEMY NEEDS 1 MORE CASTLE TO WIN!                      │
│   🏰 CASTLES: You 1/3  vs  Enemy 2/3        Round 8 │ Enemy Turn  │
└────────────────────────────────────────────────────────────────────┘

When you're close to winning:
┌────────────────────────────────────────────────────────────────────┐
│  🎯 CAPTURE 1 MORE CASTLE TO WIN!                                  │
│   🏰 CASTLES: You 2/3  vs  Enemy 1/3        Round 6 │ Your Turn   │
└────────────────────────────────────────────────────────────────────┘
```

**Components (Priority Order):**
1. **Castle count** - Most prominent (it's the win condition!)
2. **Warning banner** - When either player is 1 castle away from winning
3. **Unit count** - Secondary info (total units each player has)
4. **Territory count** - Tertiary info
5. **Round & Turn** - Context

**Implementation:**
- Create `GameStatusBar.tsx` component
- Pull data from `useGameStateContext`
- Position fixed at top of map area
- Add pulsing animation when close to win/lose

---

### 1.2 Improved Territory Cell Design
**Key Change:** Castles must visually STAND OUT as the win condition!

**Castle vs Regular Territory:**
```
CASTLE (Key objective!):                 REGULAR TERRITORY:
┌═══════════════════════┐               ┌───────────────────┐
║🏰│ WINTERFELL        ║               │█│ The Riverlands  │
║  │                   ║               │█│                 │
║  │   👤 8 units      ║               │█│  👤 6 units     │
║  │                   ║               │█│                 │
╚═══════════════════════╝               └───────────────────┘
  ↑ Golden/special border                 ↑ Colored border (owner)
  ↑ Larger size
  ↑ Crown icon prominent
```

**Unit Count Display (exact numbers matter for combat!):**
```
Your territory with army:        Enemy territory with army:
┌───────────────────┐            ┌───────────────────┐
│🔵│ Territory Name │            │🔴│ Territory Name │
│  │                │            │  │                │
│  │  💚 6 units    │            │  │  ❤️ 4 units    │
│  │                │            │  │                │
└───────────────────┘            └───────────────────┘

Contested (both have units - rare):
┌───────────────────┐
│⚔️│ Territory Name │
│  │                │
│  │ 💚 6  vs  ❤️ 4 │
│  │                │
└───────────────────┘
```

**Visual Hierarchy:**
1. 🏰 **Castles** - Golden border, larger, crown icon, subtle glow (WIN CONDITION!)
2. 🔵 **Your territories** - Blue left border
3. 🔴 **Enemy territories** - Red left border
4. ⚪ **Neutral/Unowned** - Gray border

**Castle States:**
- 🏰 Uncontrolled castle - Gray + gold border, pulsing glow (capture me!)
- 🏰 Your castle - Blue + gold border
- 🏰 Enemy castle - Red + gold border (target!)

---

### 1.3 Territory Tooltips
**Trigger:** Hover on territory (desktop) / Long-press (mobile)

```
Your territory with army:
┌─────────────────────────┐
│ 🏰 Winterfell           │
│ ─────────────────────── │
│ Owner: You              │
│ Type: Castle ⭐          │
│ ─────────────────────── │
│ 💚 Your Army: 8 units   │
│ ─────────────────────── │
│ 👆 Tap to select army   │
└─────────────────────────┘

Enemy castle (target!):
┌─────────────────────────┐
│ 🏰 King's Landing       │
│ ─────────────────────── │
│ Owner: Enemy            │
│ Type: Castle ⭐          │
│ ─────────────────────── │
│ ❤️ Enemy Army: 4 units  │
│ ─────────────────────── │
│ ⚔️ Capture to win!      │
└─────────────────────────┘
```

**Implementation:**
- Use Radix UI Tooltip or custom component
- Show on hover with 300ms delay
- Mobile: show on long-press (500ms)

---

### 1.4 Selection State Improvements
**Current:** Yellow border only
**Improved:**
- Pulsing glow effect for selected territory
- Valid move destinations highlighted (green for move, red for attack)
- Dimming of non-interactive territories
- Clear visual path from source to valid destinations

---

## Phase 2: Core UX Overhaul (3-5 days)

### 2.1 Movement/Attack Panel (with Unit Selection)
**Trigger:** When army selected and destination chosen
**Key Feature:** Unit slider with real-time outcome preview

**For Movement (to empty/friendly territory):**
```
┌─────────────────────────────────────────────────┐
│  📍 Move to [Territory Name]                    │
│  ───────────────────────────────────────────    │
│                                                 │
│  How many units to send?                        │
│                                                 │
│  [1] ──────────●────────── [8]                 │
│                ↑                                │
│             6 units                             │
│                                                 │
│  Quick: [1] [Half] [All]                        │
│                                                 │
│  ───────────────────────────────────────────    │
│  📊 After move:                                 │
│  • Source: 2 units remain                       │
│  • Destination: 6 units                         │
│  ───────────────────────────────────────────    │
│                                                 │
│  [✓ Confirm Move]              [Cancel]         │
└─────────────────────────────────────────────────┘
```

**For Attack (DETERMINISTIC outcome display):**
```
┌─────────────────────────────────────────────────┐
│  ⚔️ Attack [Territory Name]                     │
│  ───────────────────────────────────────────    │
│                                                 │
│  How many units to send?                        │
│                                                 │
│  [1] ──────────●────────── [8]                 │
│                ↑                                │
│             6 units                             │
│                                                 │
│  Quick: [Min to Win] [Half] [All]               │
│                                                 │
│  ───────────────────────────────────────────    │
│  ⚔️ BATTLE OUTCOME:                             │
│  ┌─────────────────────────────────────────┐   │
│  │  YOU: 6 units    vs    ENEMY: 4 units   │   │
│  │  ██████░░░░            ████░░░░░░       │   │
│  │                                         │   │
│  │       ✅ YOU WILL WIN                   │   │
│  │       2 units survive                   │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  📊 After battle:                               │
│  • Source: 2 units remain                       │
│  • Captured territory: 2 units                  │
│  ───────────────────────────────────────────    │
│                                                 │
│  [⚔️ Attack!]                  [Cancel]         │
└─────────────────────────────────────────────────┘
```

**Battle Outcome States:**
```
✅ YOU WILL WIN
   "Victory! X units will survive"
   (Green, encouraging)

❌ YOU WILL LOSE
   "Defeat! Enemy will have X units left"
   (Red, discouraging but allowed)

☠️ TIE = BOTH DIE
   "⚠️ WARNING: BOTH ARMIES DESTROYED!"
   "This is a bad trade - send 1 more to win!"
   (Red/Orange, strong warning, pulsing)
```

**Tie Warning Example:**
```
┌─────────────────────────────────────────────────┐
│  ⚔️ Attack [Territory Name]                     │
│  ───────────────────────────────────────────    │
│                                                 │
│  [1] ──────────●────────── [8]                 │
│                ↑                                │
│             4 units                             │
│                                                 │
│  ───────────────────────────────────────────    │
│  ⚔️ BATTLE OUTCOME:                             │
│  ┌─────────────────────────────────────────┐   │
│  │  YOU: 4 units    vs    ENEMY: 4 units   │   │
│  │  ████░░░░░░            ████░░░░░░       │   │
│  │                                         │   │
│  │    ☠️ TIE - BOTH ARMIES DESTROYED!      │   │
│  │    ⚠️ This is a terrible trade!         │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  💡 Send 5+ units to WIN instead               │
│  ───────────────────────────────────────────    │
│                                                 │
│  [☠️ Attack Anyway]            [Cancel]         │
└─────────────────────────────────────────────────┘
```

---

### 2.2 Contextual Action Bar
**Location:** Bottom of screen (mobile) / Side panel (desktop)
**Purpose:** Clear guidance based on current state

**States:**

1. **Nothing selected:**
```
┌─────────────────────────────────────┐
│  👆 Tap your army to move or attack │
│                                     │
│  🏰 Goal: Capture 3 castles to win! │
└─────────────────────────────────────┘
```

2. **Own army selected:**
```
┌─────────────────────────────────────┐
│  💚 Your Army at [Territory]        │
│  8 units available                  │
│                                     │
│  👆 Tap adjacent territory to:      │
│  • 🟢 Move (to empty/friendly)      │
│  • 🔴 Attack (enemy territory)      │
│                                     │
│  [Cancel Selection]                 │
└─────────────────────────────────────┘
```

3. **Enemy territory selected (showing info):**
```
┌─────────────────────────────────────┐
│  🔴 Enemy Territory: [Name]         │
│  ❤️ 4 enemy units                   │
│  🏰 This is a CASTLE                │
│                                     │
│  💡 Move your army adjacent to      │
│     attack this territory!          │
└─────────────────────────────────────┘
```

---

### 2.3 Mini-Map / Overview Panel (Optional)
**Location:** Corner overlay or collapsible sidebar
**Purpose:** Quick strategic overview

```
┌─────────────────────┐
│  🏰 CASTLE STATUS   │
├─────────────────────┤
│  You: 2/3 castles   │
│  ██████████░░░░░    │
│                     │
│  Enemy: 1/3 castles │
│  █████░░░░░░░░░░    │
├─────────────────────┤
│  ⚔️ ARMY STRENGTH   │
│  You: 7 units       │
│  Enemy: 4 units     │
├─────────────────────┤
│  📍 Map Overview    │
│  ┌───┬───┬───┐      │
│  │🔵🏰│🔵 │⚪🏰│      │
│  ├───┼───┼───┤      │
│  │🔴 │⚪🏰│🔵 │      │
│  ├───┼───┼───┤      │
│  │🔴🏰│🔴 │⚪ │      │
│  └───┴───┴───┘      │
└─────────────────────┘
```

---

## Phase 3: Polish & Advanced (1-2 weeks)

### 3.1 Animated Turn Transitions
**When round ends:**
1. Dim the map slightly
2. Show "Round X Complete" banner
3. Animate all moves sequentially
4. Show battle results with effects
5. Update ownership with color transitions
6. Flash warning if someone is 1 castle from winning
7. Show "Round X+1" banner

### 3.2 Turn History Panel
**Expandable panel showing what happened:**
```
┌──────────────────────────────────────────────────────────────┐
│ ROUND 5 HISTORY                                    [Replay ▶]│
├──────────────────────────────────────────────────────────────┤
│ → You moved 6 units: Winterfell → King's Landing             │
│ → Battle: You (6) vs Enemy (4) → You WIN (+2 survive)        │
│ → 🏰 You captured King's Landing! (Castle 2/3)               │
│ → Enemy moved 3 units: Dorne → Highgarden                    │
└──────────────────────────────────────────────────────────────┘
```

### 3.3 Accessibility Improvements
- **Color-blind mode:** Add patterns/shapes to ownership (not just colors)
- **Screen reader:** Announce game state changes
- **Keyboard navigation:** Full game playable with keyboard
- **Reduced motion:** Option to disable animations

### 3.4 Sound Design (Optional)
- Territory selection: subtle click
- Army selection: marching sound
- Movement: whoosh
- Battle: clash of swords
- Victory: fanfare
- Defeat: somber tone
- Castle captured: triumphant horn
- Warning (enemy close to win): alert sound

---

## Implementation Priority Matrix

| Feature | Impact | Effort | Priority |
|---------|--------|--------|----------|
| Game Status Header (Castle Count!) | **Critical** | Low | **P0** |
| Castle Visual Distinction | **Critical** | Medium | **P0** |
| Unit Count Display (exact numbers) | High | Low | **P0** |
| Battle Outcome Preview | **Critical** | Medium | **P0** |
| Tie Warning System | **Critical** | Low | **P0** |
| Territory Tooltips | High | Low | P1 |
| Unit Slider with Preview | High | Medium | P1 |
| Selection State Improvements | Medium | Low | P1 |
| Contextual Action Bar | Medium | Medium | P1 |
| Mini-Map Overview | Medium | Medium | P2 |
| Turn History | Low | Medium | P2 |
| Animated Transitions | Low | Medium | P2 |
| Accessibility | High | High | P2 |
| Sound Design | Low | Medium | P3 |

---

## Component Structure

```
components/gamePlay/GameMap/
├── index.tsx (main container)
├── GameStatusBar.tsx (NEW - P0)
├── layers/
│   ├── TerritoryGrid.tsx (MODIFY - castle styling)
│   ├── MovementOverlay.tsx (existing)
│   └── AnimationLayer.tsx (existing)
├── panels/
│   ├── BattlePreviewPanel.tsx (NEW - with outcome display)
│   ├── MovementPanel.tsx (NEW - with unit slider)
│   └── MiniMapPanel.tsx (NEW - P2)
├── tooltips/
│   └── TerritoryTooltip.tsx (NEW)
└── GameOperationPanel/
    └── (existing, to be enhanced)
```

---

## Success Metrics

1. **Castle awareness:** Player can state castle count within 2 seconds
2. **Battle confidence:** Player knows outcome before every attack (no surprises)
3. **Tie avoidance:** < 5% of battles result in unintentional ties
4. **Time to move:** ≤ 4 taps/clicks to complete a move
5. **New player success:** > 80% understand win condition without tutorial

---

## Next Steps

1. ✅ Document finalized
2. Implement Phase 1 (P0 items):
   - GameStatusBar with castle count
   - Castle visual distinction in TerritoryGrid
   - Battle outcome preview panel
   - Tie warning system
3. Test with users
4. Iterate and proceed to Phase 2
