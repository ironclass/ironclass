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

socketAPI.queueStudent = function(firstName, id) {
  io.sockets.emit("queueStudent", { firstName, id });
};

socketAPI.dequeueStudent = function() {
  io.sockets.emit("dequeueStudent", {});
};
socketAPI.sudoDequeueStudent = function(id) {
  io.sockets.emit("sudoDequeueStudent", { id });
};

socketAPI.updateCourse = function(currentCourse) {
  io.sockets.emit("updateCourse", { currentCourse });
};

module.exports = socketAPI;
