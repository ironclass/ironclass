console.log("Hello from the script.js");

// SOCKET.IO
const socket = io();

socket.on("updateCourse", data => {
  let wrapperDiv = document.getElementById("currentCourse");
  wrapperDiv.innerHTML = `
    <div class="alert alert-warning alert-dismissible fade show alert--no-margin alert--bg-opacity" role="alert">
      <h2 class="h2--no-margin">${data.currentCourse}</h2>
    </div>`;
});

socket.on("queueStudent", data => {
  // console.log() //TODO: Only notfiy, when user is TA?
  let ul = document.querySelector("#call-queue .list-group");
  ul.innerHTML += `
  <div id="${
    data.id
  }" class="alert alert-warning alert-dismissible fade show alert--little-margin" role="alert">${
    data.firstName
  }
  <a href="/classroom/queue-tick/${data.id}" class="close"><span>&times;</span></a></div>`;
  ul.children[0].className += " next-student";
});

socket.on("waved", data => {
  axios.get("/users/ista")
  .then(res => {
    if (res.data.result === true) sendDesktopNotification(data.firstName + " waved!")  
  }).catch(err => console.log(err))
  
});

socket.on("dequeueStudent", () => {
  let list = document.getElementById("call-list");
  list.children[0].remove();
  let ul = document.querySelector("#call-queue .list-group");
  ul.children[0].className += " next-student";
});

socket.on("sudoDequeueStudent", data => {
  document.getElementById(data.id).remove();
});

socket.on("usersOnline", data => {
  document.getElementById("people-online").innerHTML = `People online: ${data.clients}`;
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

function requestPermission() {
  return new Promise(function(resolve, reject) {
    const permissionResult = Notification.requestPermission(function(result) {
      // Handling deprecated version with callback.
      resolve(result);
    });

    if (permissionResult) {
      permissionResult.then(resolve, reject);
    }
  })
  .then(function(permissionResult) {
    if (permissionResult !== 'granted') {
      throw new Error('Permission not granted.');
    }
  });
}

Notification.requestPermission();

sendDesktopNotification = function(text) {
  let notification = new Notification('IronClass', {
    icon: 'https://res.cloudinary.com/djyjdargg/image/upload/v1555355805/Ironclass/favicon.png',
    body: text,
    tag: 'soManyNotification'
  });
  //'tag' handles muti tab scenario i.e when multiple tabs are 
  // open then only one notification is sent
//3. handle notification events and set timeout 
notification.onclick = function() {
    parent.focus();
    window.focus(); //just in case, older browsers
    this.close();
  };
  // setTimeout(notification.close.bind(notification), 5000);
}

