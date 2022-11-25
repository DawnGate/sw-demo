if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js", {
    // scope is important
    scope: ".",
  });
} else {
  console.error("Not support service worker");
}
