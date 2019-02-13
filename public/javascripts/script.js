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
  document.querySelector("#call-queue .list-group").innerHTML += `
  <div id="${data.id}" class="alert alert-warning alert-dismissible fade show" role="alert">${
    data.firstName
  }<a href="/classroom/queue-tick/${data.id}" class="close"><span>&times;</span></a></div>`;
});

socket.on("dequeueStudent", () => {
  let list = document.getElementById("call-list");
  list.children[0].remove()
});
socket.on("sudoDequeueStudent", data => {
  document.getElementById(data.id).remove();
});

// BOOTSTRAP
// show filename, when selected for upload
$("#exampleInputFile").on("change", function() {
  //get the file name
  var fileName = $(this).val();
  var cleanFileName = fileName.replace("C:\\fakepath\\", " ");
  //replace the "Choose a file" label
  $(this)
    .next(".custom-file-label")
    .html(cleanFileName);
});
