self.addEventListener("message", function (event) {
  console.log(event);

  // match all connected client and forward the message
  var promise = self.clients.matchAll().then(function (clientList) {
    console.log(clientList);
    // event.source.id contains the ID of the sender of the message.
    var senderId = event.source.id;

    clientList.forEach(function (client) {
      // skip sending the message to the client that sent it
      if (client.id === senderId) {
        return;
      }

      client.postMessage({
        client: senderId,
        message: event.data,
      });
    });
  });

  // lifetime of the Service Worker
  if (event.waitUntil) {
    event.waitUntil(promise);
  }
});

// immediately clain may new clients.
self.addEventListener("activate", function (event) {
  console.log(self.clients);
  event.waitUntil(self.clients.claim());
});
