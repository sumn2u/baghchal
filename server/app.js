const express = require('express');

const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);

app.use(express.static('.'));


io.on('connection', (socket) => {
    // Create a new game room and notify the creator of game.
    socket.on('createGame', (data) => {
        socket.join('room-1');
        socket.emit('newGame', {
            name: data.name,
            room: 'room-1',
            avatar: data.avatar
        });
    });

    // Connect the Player 2 to the room he requested. Show error if room full.
    socket.on('joinGame', (data) => {
        const room = io.nsps['/'].adapter.rooms[data.roomId];
        if (room && room.length === 1) {
            socket.join(data.roomId);
            socket.broadcast.to(data.roomId).emit('player1', {});
            socket.emit('player2', {
                name: data.name,
                room: data.roomId,
                avatar: data.avatar,
            });
        } else {
            socket.emit('err', {
                message: 'Sorry, The room is full!'
            });
        }
    });

    /**
     * Handle the turn played by either player and notify the other.
     */
    socket.on('playTurn', (data) => {
        socket.broadcast.to(data.room).emit('turnPlayed', {
            tile: data.tile,
            room: data.room,
        });
    });

    /**
     * Notify the players about the victor.
     */
    socket.on('gameEnded', (data) => {
        socket.broadcast.to(data.room).emit('gameEnd', data);
    });
});

server.listen(process.env.PORT || 5000);
