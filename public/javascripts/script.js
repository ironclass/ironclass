console.log("Hello from the script.js");

// SOCKET.IO
const socket = io();

socket.on("updateCourse", data => {
  let wrapperDiv = document.getElementById("currentCourse");
  wrapperDiv.innerHTML = `
    <div id="${currentCourse}" class="alert alert-warning alert-dismissible fade show alert--no-margin alert--bg-opacity" role="alert">
      <h2 class="h2--no-margin">${data.currentCourse}</h2>
    </div>`;
});

socket.on("queueStudent", data => {
  document.querySelector("#call-queue .list-group").innerHTML += `
  <div id="${data.id}" class="alert alert-warning alert-dismissible fade show alert--little-margin" role="alert">${data.firstName}
  <a href="/classroom/queue-tick/${data.id}" class="close"><span>&times;</span></a></div>`;
});

socket.on("dequeueStudent", () => {
  let list = document.getElementById("call-list");
  list.children[0].remove();
});

socket.on("sudoDequeueStudent", data => {
  document.getElementById(data.id).remove();
});

socket.on("usersOnline", data => {
  document.getElementById("people-online").innerHTML = `People online: ${data.clients}`
})

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
