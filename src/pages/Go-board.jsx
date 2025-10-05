"use client";
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import axios from "axios";
import "../index.css";
import { placeStone } from "./gogame-logic";
import { getComputerMove } from "./computerlogic";

const API_URL = "http://localhost:5000";
const BOARD_SIZE = 9;
const BOARD_PIXELS = 700;

function GoBoard() {
  const navigate = useNavigate();
  const location = useLocation();
  const game = location.state?.game;

  const [stones, setStones] = useState([]);
  const [currentColor, setCurrentColor] = useState("black");
  const [playerColor, setPlayerColor] = useState(null);
  const [computerColor, setComputerColor] = useState(null);
  const [captures, setCaptures] = useState({ black: 0, white: 0 });
  const [gameOver, setGameOver] = useState(false);
  const [lastPlayerMove, setLastPlayerMove] = useState(null);
  const [message, setMessage] = useState(null);

  const computerThinkingRef = useRef(false);
  const cellSize = BOARD_PIXELS / (BOARD_SIZE - 1);

  // Save active game ID so we can use it for moves
  useEffect(() => {
  if (!game) return;

  if (game.id) {
    localStorage.setItem("active_game_id", game.id);
  }

  // Restore stones first
  if (Array.isArray(game.board) && game.board.length > 0) {
    setStones(game.board);
  } else if (game.history && game.history.length > 0) {
    let replayStones = [];
    let replayCaptures = { black: 0, white: 0 };

    game.history.forEach((move) => {
      replayStones = placeStone(
        move.x,
        move.y,
        move.player,
        replayStones,
        (newCaps) => {
          replayCaptures = newCaps;
        }
      );
    });

    setStones(replayStones);
    setCaptures(replayCaptures);
  }

  if (game.captured_black !== undefined && game.captured_white !== undefined) {
    setCaptures({
      black: game.captured_black,
      white: game.captured_white,
    });
  }

  if (game.scores) {
    const { black, white } = game.scores;
    console.log(`Resuming scores: Black ${black}, White ${white}`);
  }

  setCurrentColor(game.turn || "black");
  setPlayerColor(game.player_color || "black");
  setComputerColor(game.computer_color || "white");
}, [game]);



  // Save move to backend
  const saveMove = async (player, x, y, updatedStones, updatedCaptures, nextTurn) => {
    const token = localStorage.getItem("access_token");
    const gameId = localStorage.getItem("active_game_id");
    if (!token || !gameId) return;

    // Count scores before sending
    const blackScore = updatedStones.filter((s) => s.color === "black").length + updatedCaptures.black;
    const whiteScore = updatedStones.filter((s) => s.color === "white").length + updatedCaptures.white;

    try {
      await axios.post(
        `${API_URL}/game/${gameId}/move`,
        {
          player,
          x,
          y,
          board: updatedStones,
          turn: nextTurn,
          scores: { black: blackScore, white: whiteScore },
          captured_white: updatedCaptures.white,
          captured_black: updatedCaptures.black,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.error("Failed to save move:", err.response?.data || err.message);
    }
};


  // Handle Player Click
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

    saveMove(playerColor, snapX, snapY, newStones, captures, computerColor);

  };

  // Computer Move
  useEffect(() => {
    if (gameOver || !computerColor || currentColor !== computerColor) return;
    if (computerThinkingRef.current) return;

    computerThinkingRef.current = true;

    const timer = setTimeout(() => {
      getComputerMove(stones, computerColor, lastPlayerMove, (x, y, color) => {
        const newStones = placeStone(x, y, color, stones, setCaptures);
        if (newStones) {
          setStones(newStones);
          saveMove(computerColor, x, y, newStones, captures, playerColor);
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

  // Pass Turn calls backend /pass
  const passTurn = async () => {
  if (gameOver) return;

  const token = localStorage.getItem("access_token");
  const gameId = localStorage.getItem("active_game_id");
  if (!token || !gameId) return;

  const nextTurn = currentColor === "black" ? "white" : "black";

  try {
    const res = await axios.post(
      `${API_URL}/game/pass`,
      {
        board: stones,
        turn: nextTurn,
        state: "ongoing",
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setCurrentColor(res.data.turn);
    setMessage("Turn passed successfully.");

    setTimeout(() => setMessage(""), 2000);

  } catch (err) {
    console.error("Pass failed:", err.response?.data || err.message);
    setMessage("Error passing turn.");

    setTimeout(() => setMessage(""), 2000);
  }
};


  //  End Game calls backend /finish
  const endGame = async () => {
    setGameOver(true);

    const blackScore =
      stones.filter((s) => s.color === "black").length + captures.black;
    const whiteScore =
      stones.filter((s) => s.color === "white").length + captures.white;

    const winner =
      blackScore > whiteScore ? "black" : whiteScore > blackScore ? "white" : "draw";

    const token = localStorage.getItem("access_token");
    const gameId = localStorage.getItem("active_game_id");
    if (!token || !gameId) return;

    try {
      await axios.post(
        `${API_URL}/game/finish`,
        {
          scores: { black: blackScore, white: whiteScore },
          won_by: winner,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage(`Game finished! Winner: ${winner}`);
      setTimeout(() => {
        navigate("/gamemenu");
      }, 5000);

    } catch (err) {
      console.error("Failed to finish game:", err.response?.data || err.message);
      setMessage("Error finishing game.");
    }
  };

  const restartGame = () => {
    setStones([]);
    setPlayerColor(null);
    setComputerColor(null);
    setCurrentColor("black");
    setCaptures({ black: 0, white: 0 });
    setGameOver(false);
    setLastPlayerMove(null);
    setMessage(null);
    computerThinkingRef.current = false;
    localStorage.removeItem("active_game_id");
  };

  const leaveGame = async () => {
  const token = localStorage.getItem("access_token");
  const gameId = localStorage.getItem("active_game_id");
  if (!token || !gameId) return;

  try {
    await axios.post(`${API_URL}/game/pause`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setMessage("Game saved successfully.");

    computerThinkingRef.current = false;

    navigate("/gamemenu");
  } catch (err) {
    console.error("Failed to pause game:", err.response?.data || err.message);
    setMessage("Error saving game.");
  }
};


  const blackScore =
    stones.filter((s) => s.color === "black").length + captures.black;
  const whiteScore =
    stones.filter((s) => s.color === "white").length + captures.white;

  // --- JSX ---
  return (
    <div className="board-container">
      {!playerColor && !game?.history?.length ? (
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
            <button onClick={leaveGame} style={{ marginTop: "1rem" }}>
              Save & Exit
            </button>

            {gameOver && (
              <p style={{ marginTop: "1rem", fontWeight: "bold" }}>
                Game Over! Final Score — Black: {blackScore}, White: {whiteScore}
              </p>
            )}
            {message && (
              <p style={{ marginTop: "1rem", color: "green" }}>{message}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default GoBoard;