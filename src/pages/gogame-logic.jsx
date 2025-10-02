
const BOARD_SIZE = 9;

// Check if a cell is occupied
export const isOccupied = (x, y, stones) =>
  stones.some((s) => s.x === x && s.y === y);

export const getStoneAt = (x, y, stones) =>
  stones.find((s) => s.x === x && s.y === y);

// Find connected group and liberties
export const getGroup = (x, y, color, stones) => {
  const visited = new Set();
  const group = [];
  const liberties = new Set();
  const stack = [[x, y]];

  while (stack.length) {
    const [cx, cy] = stack.pop();
    const key = `${cx},${cy}`;
    if (visited.has(key)) continue;
    visited.add(key);

    const stone = getStoneAt(cx, cy, stones);
    if (!stone || stone.color !== color) continue;

    group.push(stone);

    const neighbors = [
      [cx + 1, cy],
      [cx - 1, cy],
      [cx, cy + 1],
      [cx, cy - 1],
    ];

    neighbors.forEach(([nx, ny]) => {
      if (nx < 0 || nx >= BOARD_SIZE || ny < 0 || ny >= BOARD_SIZE) return;
      const neighborStone = getStoneAt(nx, ny, stones);
      if (!neighborStone) {
        liberties.add(`${nx},${ny}`);
      } else if (neighborStone.color === color) {
        stack.push([nx, ny]);
      }
    });
  }

  return { group, liberties };
};

// Place a stone and handle captures
export const placeStone = (x, y, color, stones, setCaptures) => {
  if (isOccupied(x, y, stones)) return false;

  let newStones = [...stones, { x, y, color }];
  const opponent = color === "black" ? "white" : "black";
  let captured = [];

  // Check opponent groups around placed stone
  const neighbors = [
    [x + 1, y],
    [x - 1, y],
    [x, y + 1],
    [x, y - 1],
  ];

  neighbors.forEach(([nx, ny]) => {
    const stone = getStoneAt(nx, ny, newStones);
    if (stone && stone.color === opponent) {
      const { group, liberties } = getGroup(nx, ny, opponent, newStones);
      if (liberties.size === 0) {
        captured.push(...group);
      }
    }
  });

  // Remove captured stones
  if (captured.length > 0) {
    newStones = newStones.filter(
      (s) => !captured.some((c) => c.x === s.x && c.y === s.y)
    );
    setCaptures((prev) => ({
      ...prev,
      [color]: prev[color] + captured.length,
    }));
  }

  // Suicide check
  const { liberties } = getGroup(x, y, color, newStones);
  if (liberties.size === 0) return false;

  return newStones;
};
