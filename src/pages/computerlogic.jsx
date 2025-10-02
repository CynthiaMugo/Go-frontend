// computerAI.js
import { getGroup, getStoneAt, isOccupied, placeStone } from "./gogame-logic";

const BOARD_SIZE = 9;

export const getComputerMove = (
  stones,
  computerColor,
  lastPlayerMove,
  placeStoneFn
) => {
  const validMoves = [];
  for (let x = 0; x < BOARD_SIZE; x++) {
    for (let y = 0; y < BOARD_SIZE; y++) {
      if (!isOccupied(x, y, stones)) validMoves.push({ x, y });
    }
  }
  if (validMoves.length === 0) return null;

  const opponent = computerColor === "black" ? "white" : "black";

  // 1. Try capturing moves first
  for (let move of validMoves) {
    const testBoard = [...stones, { x: move.x, y: move.y, color: computerColor }];
    const { liberties } = getGroup(move.x, move.y, computerColor, testBoard);
    if (liberties.size === 0) continue; // suicide

    const neighbors = [
      [move.x + 1, move.y],
      [move.x - 1, move.y],
      [move.x, move.y + 1],
      [move.x, move.y - 1],
    ];

    for (let [nx, ny] of neighbors) {
      const stone = getStoneAt(nx, ny, testBoard);
      if (stone && stone.color === opponent) {
        const { liberties: oppLibs } = getGroup(nx, ny, opponent, testBoard);
        if (oppLibs.size === 0) {
          if (placeStoneFn(move.x, move.y, computerColor)) return move;
        }
      }
    }
  }

  // 2. Try near player's last move
  if (lastPlayerMove) {
    const nearMoves = validMoves.filter(
      (m) =>
        Math.abs(m.x - lastPlayerMove.x) <= 1 &&
        Math.abs(m.y - lastPlayerMove.y) <= 1
    );
    while (nearMoves.length > 0) {
      const idx = Math.floor(Math.random() * nearMoves.length);
      const { x, y } = nearMoves[idx];
      if (placeStoneFn(x, y, computerColor)) return { x, y };
      nearMoves.splice(idx, 1);
    }
  }

  // 3. Fallback random
  while (validMoves.length > 0) {
    const idx = Math.floor(Math.random() * validMoves.length);
    const { x, y } = validMoves[idx];
    if (placeStoneFn(x, y, computerColor)) return { x, y };
    validMoves.splice(idx, 1);
  }

  return null;
};
