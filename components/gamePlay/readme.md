Integration Checklist
1. Fix Linter Errors in improvedGameMap.tsx
[ ] Fix SiegeEffect interface inheritance (type conflicts)
[ ] Add proper array bounds checking for nearbyEnemies[0] and nearbyTerritories[0]
[ ] Add undefined checks for endPos in animation keyframes
2. Interface Alignment
[ ] Reconcile Territory interface differences between improvedGameMap.tsx and current game types
[ ] Map blockchain data structure to improvedGameMap.tsx expected format
[ ] Add missing fields like gridX, gridY, owner, strength, resources, type
[ ] Handle the Army interface (not present in current system)
3. State Management Integration
[ ] Decide whether to move army/battle state to GamePlayPage.tsx or keep in improvedGameMap.tsx
[ ] Integrate territory selection state between parent and child components
[ ] Handle move submission state coordination
[ ] Sync blockchain data with improved map's expected data structure
4. Props Interface Updates
[ ] Update GamePlayPage.tsx to pass required props to improvedGameMap.tsx
[ ] Remove props that improvedGameMap.tsx doesn't need
[ ] Add new props for battle system, armies, and enhanced features
5. Data Transformation
[ ] Transform 2D territory array from blockchain to flat army/territory arrays
[ ] Convert player addresses to army ownership format
[ ] Map unit counts to army sizes
[ ] Handle territory ownership mapping
6. Feature Integration/Removal
[ ] Decide which advanced features to keep (battles, sieges, animations)
[ ] Integrate or remove army movement system with blockchain moves
[ ] Handle battle system integration with game rules
[ ] Manage mobile responsiveness and panel coordination
7. Event Handling Updates
[ ] Update onTerritoryClick to work with new territory format
[ ] Integrate army click handling with game actions
[ ] Coordinate movement mode with blockchain move submission
[ ] Handle battle initiation with game rules
8. Mobile UI Coordination
[ ] Ensure improvedGameMap.tsx mobile panels work with existing tab system
[ ] Coordinate bottom panel state between components
[ ] Handle responsive design conflicts
9. Blockchain Integration
[ ] Connect army movements to makeMove function
[ ] Integrate battle results with blockchain state
[ ] Handle real-time updates from contract events
[ ] Sync local state with blockchain state
10. Performance & Animation
[ ] Test animation performance on mobile devices
[ ] Ensure battle effects don't interfere with game state
[ ] Handle cleanup of animation states and effects
Would you like me to proceed with implementing these changes, starting with fixing the linter errors and then moving through the integration steps?