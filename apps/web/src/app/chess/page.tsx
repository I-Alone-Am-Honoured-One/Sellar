"use client";
import { Chessboard } from "react-chessboard";
import { Chess } from "chess.js";
import { useState } from "react";

export default function ChessPage() {
  const [game, setGame] = useState(new Chess());
  return (
    <div className="space-y-3">
      <h2 className="text-2xl">Chess Arena</h2>
      <div className="max-w-xl">
        <Chessboard
          position={game.fen()}
          onPieceDrop={(sourceSquare, targetSquare) => {
            const next = new Chess(game.fen());
            const move = next.move({ from: sourceSquare, to: targetSquare, promotion: "q" });
            if (!move) return false;
            setGame(next);
            return true;
          }}
        />
      </div>
      <pre>{game.pgn()}</pre>
    </div>
  );
}
