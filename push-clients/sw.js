// quick handle old sw
addEventListener("install", function (event) {
  event.waitUntil(self.skipWaiting());
});

addEventListener("activate", function (event) {
  event.waitUntil(self.clients.claim());
});

// Register event listener for the 'push' event
self.addEventListener("push", function (event) {
  event.waitUntil(
    self.clients.matchAll().then(function (clientList) {
      // check if at least one client is focused
      var focused = clientList.some(function (client) {
        return client.focused;
      });

      console.log(clientList);

      // content for notification message
      var notificationMessage;
      if (focused) {
        notificationMessage = "You're still here, thanks!";
      } else if (clientList.length > 0) {
        notificationMessage =
          "You haven't closed the page, " + "click here to focus it!";
      } else {
        notificationMessage =
          "You have closed the page" + "click here to open it again!";
      }
      // show notification
      return self.registration.showNotification("Web push", {
        body: notificationMessage,
      });
    })
  );
});

// Register event listener for the 'notificationclick' event
self.addEventListener("notificationclick", function (event) {
  event.waitUntil(
    self.clients.matchAll().then(function (clientList) {
      if (clientList.length > 0) {
        console.log(clientList);
        return clientList[0].focus();
      }

      return self.clients.openWindow("../push-client__demo.html");
    })
  );
});
