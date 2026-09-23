export type BinarySide = "LEFT" | "RIGHT";

export interface BinaryPlacementMember {
  id: string;
  parentId: string;
  side: BinarySide;
  level: number;
  name: string;
}

export interface BinaryTreeSlot {
  person: { id: string; name: string; level: number } | null;
  parentId: string | null;
  side: BinarySide | null;
}

export interface BinaryDescendantCounts {
  direct: number;
  indirect: number;
}

export function countBinaryDescendants(
  rootId: string,
  members: BinaryPlacementMember[],
): Map<string, BinaryDescendantCounts> {
  const children = new Map<string, string[]>();
  for (const member of members) {
    const siblings = children.get(member.parentId) ?? [];
    siblings.push(member.id);
    children.set(member.parentId, siblings);
  }

  const counts = new Map<string, BinaryDescendantCounts>();
  const visiting = new Set<string>();
  const visit = (id: string): BinaryDescendantCounts => {
    const cached = counts.get(id);
    if (cached) return cached;
    if (visiting.has(id)) return { direct: 0, indirect: 0 };
    visiting.add(id);
    const childIds = children.get(id) ?? [];
    const result = {
      direct: childIds.length,
      indirect: childIds.reduce((total, childId) => {
        const child = visit(childId);
        return total + child.direct + child.indirect;
      }, 0),
    };
    visiting.delete(id);
    counts.set(id, result);
    return result;
  };

  visit(rootId);
  return counts;
}

export function buildBinaryLevels(
  focus: { id: string; name: string; level: number },
  members: BinaryPlacementMember[],
  maxDepth = 3,
): BinaryTreeSlot[][] {
  const children = new Map<string, Partial<Record<BinarySide, BinaryPlacementMember>>>();
  for (const member of members) {
    const pair = children.get(member.parentId) ?? {};
    pair[member.side] = member;
    children.set(member.parentId, pair);
  }

  const levels: BinaryTreeSlot[][] = [];
  let row: BinaryTreeSlot[] = [{ person: focus, parentId: null, side: null }];
  for (let depth = 0; depth <= maxDepth; depth++) {
    levels.push(row);
    row = row.flatMap((slot) =>
      (["LEFT", "RIGHT"] as const).map((side) => ({
        person: slot.person ? (children.get(slot.person.id)?.[side] ?? null) : null,
        parentId: slot.person?.id ?? null,
        side,
      })),
    );
  }
  return levels;
}

export function visibleBinaryDepth(levels: BinaryTreeSlot[][], maxDepth = 3) {
  const deepestFilled = levels.reduce(
    (last, row, depth) => (row.some((slot) => slot.person) ? depth : last),
    0,
  );
  return Math.min(maxDepth, deepestFilled);
}
