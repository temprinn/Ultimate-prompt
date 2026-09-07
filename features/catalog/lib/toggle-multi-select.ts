export function toggleMultiSelect<T extends string>(
  selected: T[],
  next: T,
  allValue: T
): T[] {
  if (next === allValue) {
    return [allValue];
  }

  const withoutAll = selected.filter((id) => id !== allValue);
  const isSelected = withoutAll.includes(next);
  const nextSelected = isSelected
    ? withoutAll.filter((id) => id !== next)
    : [...withoutAll, next];

  return nextSelected.length === 0 ? [allValue] : nextSelected;
}

/** Pick exactly one value (radio-style). Clicking the active item returns to all. */
export function selectSingle<T extends string>(
  selected: T[],
  next: T,
  allValue: T
): T[] {
  if (next === allValue) {
    return [allValue];
  }

  if (selected.length === 1 && selected[0] === next) {
    return [allValue];
  }

  return [next];
}

export function hasAllSelected<T extends string>(selected: T[], allValue: T) {
  return selected.includes(allValue) || selected.length === 0;
}
