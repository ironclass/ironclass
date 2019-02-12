const socketIO = require("socket.io");
const io = socketIO();
const socketAPI = {};

socketAPI.io = io;

let clients = 0;
io.on("connection", socket => {
  clients++;
  console.log("a user connected");

  socket.on("disconnect", () => {
    clients--;
    console.log("a user disconnected");
  });
});

socketAPI.queueStudent = function(fullName) {
  io.sockets.emit("queueStudent", { fullName });
};

socketAPI.dequeueStudent = function() {
  io.sockets.emit("dequeueStudent", { });
};

socketAPI.sendMessage = function(msg) {
  io.sockets.emit("sendMessage", { msg });
};

module.exports = socketAPI;
