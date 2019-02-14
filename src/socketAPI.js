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

// socketAPI.getClientsCounter = () => {
//   let subCounter = clients;
// 	console.log('TCL: socketAPI.getClientsCounter -> subCounter', subCounter)
//   return subCounter;
// };

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

// socketAPI.usersOnline = counter => {
//   io.sockets.emit("usersOnline", { counter });
// };

module.exports = socketAPI;
