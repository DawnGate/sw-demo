console.log("Hello");

if (navigator.serviceWorker) {
  // if support service worker

  var message = document.getElementById("message");
  var received = document.getElementById("received");
  var swStatus = document.getElementById("status");

  // store node for show message
  var inbox = {};

  // change sw status
  swStatus.textContent = "supported";

  navigator.serviceWorker.register("sw.js");

  navigator.serviceWorker.addEventListener("message", function (event) {
    console.log(event);
    // receive message > show message to the page
    var clientId = event.data.client;
    var node;
    // setup a place to show its messages
    if (!inbox[clientId]) {
      // create new div when client hasn't been received before
      node = document.createElement("div");
      received.appendChild(node);
      inbox[clientId] = node;
    }

    // show the message
    node = inbox[clientId];
    node.textContent = "Client" + clientId + " says: " + event.data.message;
  });

  message.addEventListener("input", function () {
    // when page force reload
    if (!navigator.serviceWorker.controller) {
      swStatus.textContent = "error: no controller";
      return;
    }

    // send the message to the sw
    console.log(message.value);
    navigator.serviceWorker.controller.postMessage(message.value);
  });
}
