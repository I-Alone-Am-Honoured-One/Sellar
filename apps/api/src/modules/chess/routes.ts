import { FastifyInstance } from "fastify";
import { Chess } from "chess.js";

const games = new Map<string, { chess: Chess; players: string[] }>();

export async function chessRoutes(app: FastifyInstance) {
  app.post("/chess/matchmaking", { preHandler: (app as any).authenticate }, async (request: any) => {
    const id = `game_${Date.now()}`;
    games.set(id, { chess: new Chess(), players: [request.authUser.sub] });
    return { id, fen: games.get(id)?.chess.fen() };
  });

  app.post("/chess/:id/move", { preHandler: (app as any).authenticate }, async (request: any, reply) => {
    const game = games.get(request.params.id);
    if (!game) return reply.code(404).send({ message: "Game not found" });
    const move = game.chess.move((request.body as any).move);
    if (!move) return reply.code(400).send({ message: "Invalid move" });
    return { fen: game.chess.fen(), history: game.chess.history() };
  });
}
