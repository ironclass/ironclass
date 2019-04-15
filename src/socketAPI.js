const socketIO = require("socket.io");

const io = socketIO();
const socketAPI = {};

socketAPI.io = io;

let clients = 0;

io.on("connection", socket => {
  clients++;
  console.log("a user connected");
  io.sockets.emit("usersOnline", { clients });

  socket.on("disconnect", () => {
    clients--;
    console.log("a user disconnected");
    io.sockets.emit("usersOnline", { clients });
  });
  console.log("TCL: API -> clients", clients);
});

socketAPI.queueStudent = (firstName, id) => {
  io.sockets.emit("queueStudent", { firstName, id });
};

socketAPI.dequeueStudent = () => {
  io.sockets.emit("dequeueStudent", {});
};

socketAPI.sudoDequeueStudent = id => {
  io.sockets.emit("sudoDequeueStudent", { id });
};

socketAPI.updateCourse = currentCourse => {
  io.sockets.emit("updateCourse", { currentCourse });
};

socketAPI.wave = firstName => {
  io.sockets.emit("waved", { firstName });
};

module.exports = socketAPI;
