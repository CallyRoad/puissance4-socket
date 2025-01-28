import express from "express";
import {createServer} from "http";
import {Server} from "socket.io";
import uuid4 from "uuid4";
import {
    EmptyUsernameError,
    GameFullError,
    GameNotFoundError, InvalidUsernameError,
    NotEnoughPlayerError,
    UsernameAlreadyUsedError
} from "./errors.js";

const app = express();
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
    }
});

const games = new Map();
const playerSessions = new Map();

io.on("connection", socket => {

    // Initiate session
    socket.on("initSession", (sessionId) => {
       if (sessionId) {
            playerSessions.set(socket.id, sessionId);
       } else {
           const newSessionId = uuid4();
           playerSessions.set(socket.id, newSessionId);
           socket.emit("sessionCreated", newSessionId);
       }
    });

    // Create a game
    socket.on("createGame", ({playerName}) => {
        try {
            if (!playerName.trim()) {
                throw new EmptyUsernameError();
            }

            if (playerName.length < 3 || playerName.length > 20) {
                throw new InvalidUsernameError();
            }

            const gameId = uuid4().slice(0, 8);
            const sessionId = playerSessions.get(socket.id);

            games.set(gameId, {
                players: [{
                    sessionId,
                    socketId : socket.id,
                    name: playerName
                }],
                currentPlayer: null,
                gameState: "waiting"
            });

            socket.join(gameId);
            socket.emit("gameCreated",
                {gameId,
                    playerId: 1,
                    playerName
                });
        } catch (error) {
            socket.emit("gameError", error.message);
        }
    });

    // Join a game
    socket.on("joinGame", async ({gameId, playerName}) => {
        try {
            const game = games.get(gameId);

            const sessionId = playerSessions.get(socket.id);


            if (!game) {
                throw new GameNotFoundError(gameId);
            }

            if (game.players.length >= 2) {
                throw new GameFullError();
            }

            if (game.players.length < 1 ) {
                throw new NotEnoughPlayerError();
            }

            if (!playerName.trim()) {
                throw new EmptyUsernameError();
            }

            if (playerName.length < 3 || playerName.length > 20) {
                throw new InvalidUsernameError();
            }

            if (game.players.some(player => player.name.toLowerCase() === playerName.toLowerCase())) {
                throw new UsernameAlreadyUsedError();
            }

            game.players.push({sessionId, socketId : socket.id, name: playerName});

            socket.join(gameId);

            const playerPromises = game.players.map(player => new Promise(resolve => {
                io.to(player.socketId).emit("prepareGame", {
                    gameId: gameId,
                    playerId: player === game.players[0] ? 1 : 2,
                    playerName: player.name,
                    opponentName: player === game.players[0] ? playerName : game.players[0].name
                }, resolve)
            }))

            await Promise.all(playerPromises);

            game.currentPlayer = Math.random() < 0.5 ? 1 : 2;

            io.to(gameId).emit("gameStarted", {
                startingPlayer: game.currentPlayer,
                players: {
                    1: game.players[0].name,
                    2: game.players[1].name
                }
            });
        } catch (error) {
            socket.emit("gameError", error.message);
        }
    });



    // Synchronize a played move
    socket.on("movePlayed", ({ gameId, columnIndex}) => {
        const game = games.get(gameId);

        if (!game) {
            throw new GameNotFoundError(gameId);
        }

        const playerIndex = game.players.findIndex(player => player.socketId === socket.id);

        if (playerIndex === -1) {
            console.log("Player not found in game");
            return;
        }

        const currentPlayerNumber = playerIndex +1;

        if (game.currentPlayer !== currentPlayerNumber) {
            console.log("Not your turn");
            return;
        }

        const nextPlayer = currentPlayerNumber === 1 ? 2 : 1;

        game.currentPlayer = nextPlayer;

       io.to(gameId).emit("opponentPlayed", {
           columnIndex,
           playedBy: currentPlayerNumber,
           nextPlayer: nextPlayer,
        });
    });

    // Reset board and scores
    socket.on("requestResetBoard", ({ gameId }) => {
        const game = games.get(gameId);
        if (game) {
            const otherPlayer = game.players.find(player => player.socketId !== socket.id);
            if (otherPlayer) {
                io.to(otherPlayer.socketId).emit("resetBoardRequested", {
                    requestedBy: game.players.find(player => player.socketId === socket.id).name
                });
            }
        }
    });

    socket.on("confirmResetBoard", ({ gameId }) => {
        const game = games.get(gameId);
        if (game) {
            game.currentPlayer = Math.random() < 0.5 ? 1 : 2;
            game.gameState = "playing";

            game.grid = Array(6).fill(null).map(() => Array(7).fill(0));

            io.to(gameId).emit("boardReset", {
                startingPlayer: game.currentPlayer,
                grid: game.grid
            });
        }
    });

    socket.on("resetBoard", ({ gameId }) => {
        const game = games.get(gameId);
        if (game) {
            game.currentPlayer = 1;
            game.gameState = "playing";

            io.to(gameId).emit("boardReset");
        }
    });

    socket.on("requestResetScores", ({ gameId }) => {
        const game = games.get(gameId);
        if (game) {
            socket.to(gameId).emit("resetScoresRequested", {
                requestedBy: game.players.find(player => player.socketId === socket.id).name
            });
        }
    });

    socket.on("confirmResetScores", ({ gameId }) => {
        const game = games.get(gameId);
        if (game) {
            io.to(gameId).emit("resetScores");
        }
    });

    socket.on("resetScores", ({ gameId }) => {
        const game = games.get(gameId);
        if (game) {
            io.to(gameId).emit("scoresReset");
        }
    });

    socket.on("rejectReset", ({ gameId }) => {
        const game = games.get(gameId);
        if (game) {
            const requestingPlayer = game.players.find(player => player.socketId === socket.id);
            io.to(gameId).emit("resetRejected", {
                rejectedBy: requestingPlayer.name
            });
        }
    });


    // Delete/disconnect the game
    socket.on("disconnect", () => {
        games.forEach((game, gameId) => {
            const playerIndex = game.players.findIndex(player => player.socketId === socket.id);
            if (playerIndex !== -1) {
                if (playerIndex === 0) {
                    io.to(gameId).emit("hostLeft");
                } else {
                    io.to(game.players[0].socketId).emit("playerLeft", {
                        playerName: game.players[playerIndex].name
                    });
                }
                games.delete(gameId);

                game.players.forEach(player => {
                    if (player.socketId !== socket.id) {
                        io.sockets.sockets.get(player.socketId)?.leave(gameId);
                    }
                })
            }
        });
    });
});
server.listen(4000, () => {
    console.log("Server listening on port 4000");
});

