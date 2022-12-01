const dataUrl = "https://api.github.com/events";
// get document element
var cacheDelayInput = document.getElementById("cache-delay");
var cacheFailInput = document.getElementById("cache-fail");
var networkDelayInput = document.getElementById("network-delay");
var networkFailInput = document.getElementById("network-fail");
var dataElement = document.getElementById("data");
var cacheStatus = document.getElementById("cache-status");
var networkStatus = document.getElementById("network-status");
var getNewDataBtn = document.getElementById("get-new-data");

// caches are per-origin, so we need to pick a name that no
// other page on this origin is going to try to use
const cacheName = "cache-then-network";

// If network data was received, we don't want an in-flight cache fetch to complete
// and overwrite the data that we just got from
// the network. We use this flag to let the cache fetch callbacks
// know whehther a network fetch has already completed
var gotNetworkData = false;

// For shownig elapsed times
var networkFetchStartTime;
var cacheFetchStartTime;

// UI functions

function resetUI() {
  dataElement.textContent = "";
  cacheStatus.textContent = "";
  networkStatus.textContent = "";
  gotNetworkData = false;
}

function enableUI() {
  cacheDelayInput.disabled = false;
  cacheFailInput.disabled = false;
  networkDelayInput.disabled = false;
  networkFailInput.disabled = false;
  getNewDataBtn.disabled = false;
}

function disableUI() {
  cacheDelayInput.disabled = true;
  cacheFailInput.disabled = true;
  networkDelayInput.disabled = true;
  networkFailInput.disabled = true;
  getNewDataBtn.disabled = true;
  resetUI();
}

function displayData(data) {
  dataElement.textContent =
    "User " + data[0].actor.login + " modified repo" + data[0].repo.name;
}

// handle network and cache call data

function handleFetchCacheCompleted(res) {
  const shouldCacheError = cacheFailInput.checked;

  if (shouldCacheError || !res) {
    throw Error("Cache miss");
  }

  // read the json response
  res.json().then((data) => {
    console.log(gotNetworkData);
    if (!gotNetworkData) {
      // only update display data when not receive new data from network
      displayData(data);
    }
  });
}

function handleFetchNetworkCompleted(res) {
  const shouldNetworkError = networkFailInput.checked;

  if (shouldNetworkError) {
    throw Error("Network miss");
  }

  // cache the data return from network
  // we clone the res because the response body only read once
  const resClone = res.clone();
  caches.open(cacheName).then((cache) => {
    cache.put(dataUrl, resClone);
  });
  // display data and make sure cache not overide it again
  // read the json response
  res.json().then((data) => {
    displayData(data);
    gotNetworkData = true;
  });
}

// this our heat of this demo
// this stimulate(or nearly stimulate) requests
getNewDataBtn.addEventListener("click", (event) => {
  event.preventDefault();

  disableUI();

  // initial network fetching
  networkStatus.textContent = "Fetching...";
  networkFetchStartTime = Date.now();

  // use fetch API to actualy request data
  var cacherBuster = Date.now();
  var networkFetch = fetch(dataUrl + "?cacheBuster=" + cacherBuster, {
    mode: "cors",
    cache: "no-cache",
  })
    .then((res) => {
      var networkDelay = networkDelayInput.value || 0;
      return new Promise(function (resolve, reject) {
        setTimeout(function () {
          try {
            handleFetchNetworkCompleted(res);
            resolve();
          } catch (err) {
            reject(err);
          }
        }, networkDelay);
      });
    })
    .then(function () {
      var now = Date.now();
      var elapsed = now - networkFetchStartTime;
      networkStatus.textContent = "Success after " + elapsed + "ms";
    })
    .catch(function (err) {
      var now = Date.now();
      var elapsed = now - networkFetchStartTime;
      networkStatus.textContent = err + " Error after " + elapsed + "ms";
    });
  // cache initing
  cacheStatus.textContent = "Fetching...";
  cacheFetchStartTime = Date.now();

  var cacheFetch = caches.open(cacheName).then(function (cache) {
    return cache
      .match(dataUrl)
      .then(function (res) {
        const cacheDelay = cacheDelayInput.value || 0;
        return new Promise(function (resolve, reject) {
          setTimeout(function () {
            try {
              handleFetchCacheCompleted(res);
              resolve();
            } catch (err) {
              reject(err);
            }
          }, cacheDelay);
        });
      })
      .then(function () {
        var now = Date.now();
        var elapsed = now - cacheFetchStartTime;
        cacheStatus.textContent = "Success after " + elapsed + "ms";
      })
      .catch(function (err) {
        var now = Date.now();
        var elapsed = now - cacheFetchStartTime;
        cacheStatus.textContent = err + " Error after " + elapsed + "ms";
      });
  });

  Promise.all([networkFetch, cacheFetch]).then(enableUI);
});
