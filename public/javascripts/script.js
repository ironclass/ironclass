console.log("Hello from the script.js");

// SOCKET.IO
const socket = io();

// // send event "testerEvent" from server to client
// socket.on("testerEvent", data => {
//   document.write(data.description);
// });

// // emit event "clientEvent" from client to server
// socket.emit("clientEvent", "Sent an event from the client");

socket.on("sendMessage", data => {
  let ul = document.getElementById("socket-list");
  let li = document.createElement("pre");
  li.setAttribute("class", "list-group-item");
  li.innerHTML = data.msg;
  ul.appendChild(li);
});

socket.on("queueStudent", data => {
  document.querySelector(".call-queue .list-group").innerHTML += `
    <li id="${data.fullName}" class="list-group-item">${data.fullName}</li>
  `;
});

socket.on("dequeueStudent", () => {
  console.log("DEBUG");
  let ul = document.getElementById("call-list");
  ul.children[0].remove()
});

// set current date as max value for all date input forms

var today = new Date();
var dd = today.getDate();
var mm = today.getMonth() + 1; //January is 0!
var yyyy = today.getFullYear();
if (dd < 10) {
  dd = "0" + dd;
}
if (mm < 10) {
  mm = "0" + mm;
}

today = yyyy + "-" + mm + "-" + dd;
document.getElementById("datefield").setAttribute("max", today);
