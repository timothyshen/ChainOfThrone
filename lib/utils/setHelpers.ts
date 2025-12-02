/**
 * Set Helper Functions
 *
 * Optimized Set operations to avoid unnecessary array spread operations
 */

/**
 * Add an item to a Set immutably (returns new Set)
 * More efficient than `new Set([...prev, item])`
 */
export function setAdd<T>(set: Set<T>, item: T): Set<T> {
  if (set.has(item)) return set;
  const newSet = new Set(set);
  newSet.add(item);
  return newSet;
}

/**
 * Remove an item from a Set immutably (returns new Set)
 */
export function setDelete<T>(set: Set<T>, item: T): Set<T> {
  if (!set.has(item)) return set;
  const newSet = new Set(set);
  newSet.delete(item);
  return newSet;
}

/**
 * Add multiple items to a Set immutably
 */
export function setAddMultiple<T>(set: Set<T>, items: T[]): Set<T> {
  const hasNew = items.some((item) => !set.has(item));
  if (!hasNew) return set;
  const newSet = new Set(set);
  items.forEach((item) => newSet.add(item));
  return newSet;
}

/**
 * Remove multiple items from a Set immutably
 */
export function setDeleteMultiple<T>(set: Set<T>, items: T[]): Set<T> {
  const hasAny = items.some((item) => set.has(item));
  if (!hasAny) return set;
  const newSet = new Set(set);
  items.forEach((item) => newSet.delete(item));
  return newSet;
}

/**
 * Toggle an item in a Set (add if missing, remove if present)
 */
export function setToggle<T>(set: Set<T>, item: T): Set<T> {
  const newSet = new Set(set);
  if (newSet.has(item)) {
    newSet.delete(item);
  } else {
    newSet.add(item);
  }
  return newSet;
}
