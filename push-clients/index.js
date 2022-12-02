const HOST_URL = "http://localhost:3003/push-clients/";
// register a service worker
navigator.serviceWorker.register("sw.js");

// worker ready
navigator.serviceWorker.ready
  .then(function (registration) {
    // use pushManager to get the user subscription to the push service
    return registration.pushManager
      .getSubscription()
      .then(async function (subscription) {
        // if subscription was found, return it
        if (subscription) {
          return subscription;
        }

        // get the server's public key
        const response = await fetch(HOST_URL + "vapidPublicKey");
        console.log(response);
        const vapidPublicKey = await response.text();
        // chrome doesn't accept the base64-encode vapidPublicKey
        const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);
        console.log(convertedVapidKey);

        return registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: convertedVapidKey,
        });
      });
  })
  .then(function (subscription) {
    console.log(subscription);
    fetch(HOST_URL + "register", {
      method: "post",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify({
        subscription: subscription,
      }),
    });

    document.getElementById("send-notification").onclick = function () {
      fetch(HOST_URL + "sendNotification", {
        method: "post",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify({
          subscription: subscription,
        }),
      });
    };
  });
