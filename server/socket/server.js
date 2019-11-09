const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
let users = []; // {name,avatar}
app.use(express.static('.'));


io.on('connection', (socket) => {
    // Create a new game room and notify the creator of game.
    socket.on('joinGame', (data) => {
        const user = {
            name: data.name,
            avatar: data.avatar,
            socketId: socket.id,
            friendId: null,
            playingItem: null
        };
        users.push(user);
        socket.emit('setUserInfo', user);
    });
    // send users list to all users when new user enters on the game
    socket.on('requestForOnlineUsers', (data) => {
        io.emit('updateOnlineUsers', users);
    });
    // when user send request notify the friend
    socket.on('sendRequestToFriend', data => {
        io.to(data.socketId).emit('friendSendsRequest', users.find(u => u.socketId === socket.id));
    });

    // accept friend request
    socket.on('acceptFriendRequest', data => {

        const player = data.player;
        const friend = data.friend;
        const userPlayer = users.find(u => u.socketId === player.socketId);
        const userFriend = users.find(u => u.socketId === friend.socketId);
        userPlayer.friendId = userFriend.socketId;
        userFriend.friendId = userPlayer.socketId;
        io.to(friend.socketId).emit('requestAccepted', player);
    });
    // notify  friend that you  choose tiger or goat
    socket.on('friendChoseItem', data => {

        const player = data.player;
        const friend = data.friend;
        const chosenItem = data.item;
        const userPlayer = users.find(u => u.socketId === player.socketId);
        const userFriend = users.find(u => u.socketId === friend.socketId);
        userPlayer.item = chosenItem;
        userFriend.item = data.friendItem;
        io.to(friend.socketId).emit('friendChoseItem', {
            item: data.friendItem
        });
    });
    /**
     * Handle the turn played by either player and notify the other.
     */
    socket.on('friendMovedItem', data => {
        const friend = data.friend;
        const moveData = data.data;
        const movedItem = data.movedItem;
        io.to(friend.socketId).emit('friendMovedItem', {
            moveData,
            movedItem
        });
    });

    /**
     * Notify the players about the victor.
     */
    socket.on('gameEnded', (data) => {
        socket.broadcast.to(data.room).emit('gameEnd', data);
    });


    socket.on('disconnect', (reason) => {
        let person = users.find(user => user.socketId === socket.id);
        if (person) {
            users = users.filter(user => user.socketId !== socket.id);
            io.to(person.friendId).emit('closeGame', {
                person: person
            });
        }

    });
});

server.listen(process.env.PORT || 5000);
