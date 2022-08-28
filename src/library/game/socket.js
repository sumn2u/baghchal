import io from "socket.io-client";
import { Dispatcher } from "../eventDispatchers/Dispatcher";
import { TIGER, GOAT } from "../constants";
export class Socket {
  constructor(userName) {
    this.player = null;
    this.friend = null;
    this.dispatcher = new Dispatcher();
    this.socket = io.connect("https://bagchal-socket.vercel.app", {
      reconnection: false
    });
    this.socket.emit("joinGame", { name: userName });
    this.socket.on("setUserInfo", (data) => {
      this.player = data;
      this.dispatcher.dispatch("setUserInfo", data);
    });
    this.socket.on("updateOnlineUsers", (data) => {
      this.dispatcher.dispatch("updateOnlineUsers", data);
    });
    this.socket.on("friendSendsRequest", (data) => {
      this.friend = data;
      this.dispatcher.dispatch("friendSendsRequest", data);
    });
    this.socket.on("requestAccepted", (friend) => {
      this.friend = friend;
      this.dispatcher.dispatch("requestAccepted", friend);
    });
    this.socket.on("friendChoseItem", (data) => {
      this.myItem = data.item;
      this.dispatcher.dispatch("friendChoseItem", data.item);
    });
    this.socket.on("friendMovedItem", (data) => {
      this.dispatcher.dispatch("friendMovedItem", data);
    });
    this.socket.on("closeGame", (data) => {
      this.dispatcher.dispatch("closeGame", data);
    });
  }
  requestForOnlineUsers() {
    this.socket.emit("requestForOnlineUsers");
  }
  sendRequestToFriend(socketId) {
    this.socket.emit("sendRequestToFriend", { socketId });
  }
  acceptFriendRequest() {
    this.socket.emit("acceptFriendRequest", {
      player: this.player,
      friend: this.friend,
    });
  }
  friendChoseTigerGoat(item) {
    this.socket.emit("friendChoseItem", {
      item,
      friend: this.friend,
      player: this.player,
      friendItem: item == TIGER ? GOAT : TIGER,
    });
  }
  sendMoveDataToFriend(data, movedItem) {
    this.socket.emit("friendMovedItem", {
      player: this.player,
      friend: this.friend,
      data: data,
      movedItem,
    });
  }
}
