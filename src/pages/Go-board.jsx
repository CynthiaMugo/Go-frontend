"use client";

import React, { useState, useEffect, useRef } from "react";
import "../index.css";

const BOARD_SIZE = 9;
const BOARD_PIXELS = 700;

function GoBoard() {
  const [stones, setStones] = useState([]);
  const [currentColor, setCurrentColor] = useState("black");
  const [playerColor, setPlayerColor] = useState(null);
  const [computerColor, setComputerColor] = useState(null);
  const [captures, setCaptures] = useState({ black: 0, white: 0 });
  const [gameOver, setGameOver] = useState(false);
  const [lastPlayerMove, setLastPlayerMove] = useState(null);

  const computerThinkingRef = useRef(false);
  const cellSize = BOARD_PIXELS / (BOARD_SIZE - 1);

  const isOccupied = (x, y, board = stones) =>
    board.some((s) => s.x === x && s.y === y);

  const getStoneAt = (x, y, board = stones) =>
    board.find((s) => s.x === x && s.y === y);

  // --- Find connected group and liberties ---
  const getGroup = (x, y, color, board = stones) => {
    const visited = new Set();
    const group = [];
    const liberties = new Set();
    const stack = [[x, y]];

    while (stack.length) {
      const [cx, cy] = stack.pop();
      const key = `${cx},${cy}`;
      if (visited.has(key)) continue;
      visited.add(key);

      const stone = getStoneAt(cx, cy, board);
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
        const neighborStone = getStoneAt(nx, ny, board);
        if (!neighborStone) {
          liberties.add(`${nx},${ny}`);
        } else if (neighborStone.color === color) {
          stack.push([nx, ny]);
        }
      });
    }

    return { group, liberties };
  };

  // --- Place a stone and handle captures ---
  const placeStone = (x, y, color) => {
    if (isOccupied(x, y)) return false;

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

    setStones(newStones);
    return true;
  };

  // --- Handle player click ---
  const handleCellClick = (clientX, clientY) => {
    if (gameOver) return;
    if (!playerColor || currentColor !== playerColor) return;

    const rect = document.querySelector(".go-board").getBoundingClientRect();
    const boardX = clientX - rect.left;
    const boardY = clientY - rect.top;

    const snapX = Math.round(boardX / cellSize);
    const snapY = Math.round(boardY / cellSize);

    if (snapX < 0 || snapX >= BOARD_SIZE || snapY < 0 || snapY >= BOARD_SIZE) return;

    if (!placeStone(snapX, snapY, playerColor)) return;

    setLastPlayerMove({ x: snapX, y: snapY });
    setCurrentColor(computerColor);
  };

  // --- Computer Logic ---
  useEffect(() => {
    if (gameOver) return;
    if (!computerColor || currentColor !== computerColor) return;
    if (computerThinkingRef.current) return;

    computerThinkingRef.current = true;

    const computerMove = () => {
      const validMoves = [];
      for (let x = 0; x < BOARD_SIZE; x++) {
        for (let y = 0; y < BOARD_SIZE; y++) {
          if (!isOccupied(x, y)) validMoves.push({ x, y });
        }
      }
      if (validMoves.length === 0) return null;

      // 1. Try capturing moves first
      for (let move of validMoves) {
        const testBoard = [...stones, { x: move.x, y: move.y, color: computerColor }];
        const opponent = computerColor === "black" ? "white" : "black";

        const { group, liberties } = getGroup(move.x, move.y, computerColor, testBoard);
        if (liberties.size === 0) continue; // avoid suicide

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
              if (placeStone(move.x, move.y, computerColor)) return move;
            }
          }
        }
      }

      // 2. If no captures, try near player's last move
      if (lastPlayerMove) {
        const nearMoves = validMoves.filter(
          (m) =>
            Math.abs(m.x - lastPlayerMove.x) <= 1 &&
            Math.abs(m.y - lastPlayerMove.y) <= 1
        );
        while (nearMoves.length > 0) {
          const idx = Math.floor(Math.random() * nearMoves.length);
          const { x, y } = nearMoves[idx];
          if (placeStone(x, y, computerColor)) return { x, y };
          nearMoves.splice(idx, 1);
        }
      }

      // 3. Fallback random
      while (validMoves.length > 0) {
        const idx = Math.floor(Math.random() * validMoves.length);
        const { x, y } = validMoves[idx];
        if (placeStone(x, y, computerColor)) return { x, y };
        validMoves.splice(idx, 1);
      }

      return null;
    };

    const timer = setTimeout(() => {
      computerMove();
      setCurrentColor(playerColor);
      computerThinkingRef.current = false;
    }, 500);

    return () => {
      clearTimeout(timer);
      computerThinkingRef.current = false;
    };
  }, [currentColor, computerColor, playerColor, gameOver, lastPlayerMove]);

  // --- Restart ---
  const restartGame = () => {
    setStones([]);
    setPlayerColor(null);
    setComputerColor(null);
    setCurrentColor("black");
    setCaptures({ black: 0, white: 0 });
    setGameOver(false);
    setLastPlayerMove(null);
    computerThinkingRef.current = false;
  };

  // --- Pass Turn ---
  const passTurn = () => {
    if (gameOver) return;
    setCurrentColor((prev) => (prev === "black" ? "white" : "black"));
  };

  // --- End Game ---
  const endGame = () => {
    setGameOver(true);
  };

  // --- Scores ---
  const blackScore =
    stones.filter((s) => s.color === "black").length + captures.black;
  const whiteScore =
    stones.filter((s) => s.color === "white").length + captures.white;

  return (
    <div className="board-container">
      {!playerColor ? (
        <div className="centered">
          <h2>Choose Your Stone</h2>
          <div style={{ display: "flex", gap: 12 }}>
            <button
              onClick={() => {
                setPlayerColor("black");
                setComputerColor("white");
                setCurrentColor("black");
              }}
            >
              Play as Black (First)
            </button>
            <button
              onClick={() => {
                setPlayerColor("white");
                setComputerColor("black");
                setCurrentColor("black");
              }}
            >
              Play as White (Second)
            </button>
          </div>
        </div>
      ) : (
        <div className="go-board-wrapper">
          <div
            className="go-board"
            onClick={(e) => handleCellClick(e.clientX, e.clientY)}
          >
            {stones.map((stone, idx) => (
              <div
                key={idx}
                className={`stone ${stone.color}`}
                style={{
                  left: `${stone.x * cellSize}px`,
                  top: `${stone.y * cellSize}px`,
                  width: `${cellSize * 0.6}px`,
                  height: `${cellSize * 0.6}px`,
                }}
              />
            ))}
          </div>

          <div className="sidebar">
            <div className="score-box">
              <span>Black</span>
              <span>
                {blackScore} (captures: {captures.black})
              </span>
            </div>
            <div className="score-box">
              <span>White</span>
              <span>
                {whiteScore} (captures: {captures.white})
              </span>
            </div>
            <p>
              You are playing as <b>{playerColor}</b>
            </p>
            <button onClick={restartGame} style={{ marginTop: "1rem" }}>
              Restart Game
            </button>
            <button onClick={passTurn} style={{ marginTop: "1rem" }}>
              Pass Turn
            </button>
            <button onClick={endGame} style={{ marginTop: "1rem" }}>
              End Game
            </button>
            {gameOver && (
              <p style={{ marginTop: "1rem", fontWeight: "bold" }}>
                Game Over! Final Score — Black: {blackScore}, White: {whiteScore}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default GoBoard;
