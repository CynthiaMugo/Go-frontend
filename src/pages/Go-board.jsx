"use client";
import React, { useState, useEffect, useRef } from "react";
import "../index.css";
import { placeStone } from "./gogame-logic";
import { getComputerMove } from "./computerlogic";

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

  // --- Handle Player Click ---
  const handleCellClick = (clientX, clientY) => {
    if (gameOver || !playerColor || currentColor !== playerColor) return;

    const rect = document.querySelector(".go-board").getBoundingClientRect();
    const snapX = Math.round((clientX - rect.left) / cellSize);
    const snapY = Math.round((clientY - rect.top) / cellSize);

    const newStones = placeStone(snapX, snapY, playerColor, stones, setCaptures);
    if (!newStones) return;

    setStones(newStones);
    setLastPlayerMove({ x: snapX, y: snapY });
    setCurrentColor(computerColor);
  };

  // --- Computer Move ---
  useEffect(() => {
    if (gameOver || !computerColor || currentColor !== computerColor) return;
    if (computerThinkingRef.current) return;

    computerThinkingRef.current = true;

    const timer = setTimeout(() => {
      getComputerMove(stones, computerColor, lastPlayerMove, (x, y, color) => {
        const newStones = placeStone(x, y, color, stones, setCaptures);
        if (newStones) {
          setStones(newStones);
          return true;
        }
        return false;
      });
      setCurrentColor(playerColor);
      computerThinkingRef.current = false;
    }, 500);

    return () => {
      clearTimeout(timer);
      computerThinkingRef.current = false;
    };
  }, [currentColor, computerColor, playerColor, gameOver, lastPlayerMove, stones]);

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

  // --- JSX ---
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
