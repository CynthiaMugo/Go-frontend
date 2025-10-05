"use client";
import React, { useState, useEffect, useRef } from "react";
import "../index.css";
import axios from "axios";
import { placeStone } from "./gogame-logic";
import { getComputerMove } from "./computerlogic";
import { useLocation } from "react-router-dom";


const API_URL = "http://localhost:5000";

function getAuthHeaders() {
  const token = localStorage.getItem("access_token");
  return { headers: { Authorization: `Bearer ${token}` } };
}

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
  const [gameState, setGameState] = useState(""); 
  const [boardSize, setBoardSize] = useState(BOARD_SIZE);

  const computerThinkingRef = useRef(false);
  const cellSize = BOARD_PIXELS / (boardSize - 1);

  // --- Fetch Active Game (Resume Game) ---
  const location = useLocation();
  const { gameId, gameData } = location.state || {};

  if (!gameId && !gameData) {
    console.warn("No game data provided in route state");
  }



  const resumeGame = async () => {
    try {
      const res = await axios.get(`${API_URL}/game/active`, getAuthHeaders());
      const game = res.data;
      setStones(game.board || []);
      setCaptures({
        black: game.captured_black || 0,
        white: game.captured_white || 0,
      });
      setCurrentColor(game.turn || "black");
      setGameState(game.state || "ongoing");
      setBoardSize(game.board_size || BOARD_SIZE);
      setGameOver(game.state === "finished");
    } catch {
      console.log("No active game found to resume.");
    }
  };

  useEffect(() => {
    if (gameData && Object.keys(gameData).length > 0) {
      console.log("Resuming game from GameMenu:", gameData);
      setStones(gameData.board || []);
      setCaptures({
        black: gameData.captured_black || 0,
        white: gameData.captured_white || 0,
      });
      setCurrentColor(gameData.turn || "black");
      setGameState(gameData.state || "ongoing");
      setBoardSize(gameData.board_size || BOARD_SIZE);
      setGameOver(gameData.state === "finished");
    } else if (gameId) {
      console.log("Fetching active game with ID:", gameId);
      resumeGame();
    } else {
      console.log(" No gameId or gameData found. Showing selection screen.");
    }

  }, []);




  // --- Start New Game ---
  const startNewGame = async () => {
    try {
      const res = await axios.post(`${API_URL}/game/new`, {}, getAuthHeaders());
      const game = res.data;

      setStones(game.board || []);
      setCaptures({
        black: game.captured_black || 0,
        white: game.captured_white || 0,
      });
      setCurrentColor(game.turn || "black");
      setGameState(game.state || "ongoing");
      setBoardSize(game.board_size || BOARD_SIZE);
      setGameOver(false);
      setLastPlayerMove(null);
      computerThinkingRef.current = false;
    } catch (err) {
      console.error("Error starting new game:", err);
    }
  };

  // --- Handle Player Click ---
  const handleCellClick = async (clientX, clientY) => {
    if (gameOver || !playerColor || currentColor !== playerColor) return;

    const rect = document.querySelector(".go-board").getBoundingClientRect();
    const snapX = Math.round((clientX - rect.left) / cellSize);
    const snapY = Math.round((clientY - rect.top) / cellSize);

    const newStones = placeStone(snapX, snapY, playerColor, stones, setCaptures);
    if (!newStones) return;

    setStones(newStones);
    setLastPlayerMove({ x: snapX, y: snapY });
    setCurrentColor(computerColor);

    // Save move to backend
    await axios.post(
      `${API_URL}/game/move`,
      {
        x: snapX,
        y: snapY,
        color: playerColor,
        move_type: "move",
        board: newStones,
        turn: computerColor,
        captured_black: captures.black,
        captured_white: captures.white,
      },
      getAuthHeaders()
    );

  };

  // --- Computer Move ---
  useEffect(() => {
    if (gameOver || !computerColor || currentColor !== computerColor) return;
    if (computerThinkingRef.current) return;

    computerThinkingRef.current = true;

    const timer = setTimeout(async () => {
      getComputerMove(stones, computerColor, lastPlayerMove, (x, y, color) => {
        const newStones = placeStone(x, y, color, stones, setCaptures);
        if (newStones) {
          setStones(newStones);
          setCurrentColor(playerColor);
          return true;
        }
        return false;
      });
      computerThinkingRef.current = false;
    }, 500);

    return () => {
      clearTimeout(timer);
      computerThinkingRef.current = false;
    };
  }, [currentColor, computerColor, playerColor, gameOver, lastPlayerMove, stones]);

  // --- Restart (local only) ---
  const restartLocal = () => {
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
  const passTurn = async () => {
    if (gameOver) return;
    const nextTurn = currentColor === "black" ? "white" : "black";
    setCurrentColor(nextTurn);
    await axios.post(
      `${API_URL}/game/pass`,
      {
        move_type: "pass",
        color: currentColor,
        turn: nextTurn,
        captured_black: captures.black,
        captured_white: captures.white,
      },
      getAuthHeaders()
    );

  };

  // --- End Game ---
  const endGame = async () => {
    setGameOver(true);
    setGameState("finished");
    await axios.post(
      `${API_URL}/game/finish`,
      {
        scores: {
          black: stones.filter((s) => s.color === "black").length + captures.black,
          white: stones.filter((s) => s.color === "white").length + captures.white,
        },
        captured_black: captures.black,
        captured_white: captures.white,
        won_by: currentColor === "black" ? "white" : "black",
      },
      getAuthHeaders()
    );

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

          {/* Backend-connected buttons */}
          {/* <div style={{ marginTop: "1rem", display: "flex", gap: 10 }}>
            <button onClick={startNewGame}>Start New Game</button>
            <button onClick={resumeGame}>Resume Game</button>
          </div> */}
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
            <button onClick={restartLocal} style={{ marginTop: "1rem" }}>
              Restart (Local)
            </button>
            <button onClick={passTurn} style={{ marginTop: "1rem" }}>
              Pass Turn
            </button>
            <button onClick={endGame} style={{ marginTop: "1rem" }}>
              End Game
            </button>
            {gameOver && (
              <p style={{ marginTop: "1rem", fontWeight: "bold" }}>
                Game Over! Final Score — Black: {blackScore}, White:{" "}
                {whiteScore}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default GoBoard;
