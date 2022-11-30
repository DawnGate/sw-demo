const dataUrl = "https://api.github.com/events";
// get document element
var cacheDelayInput = document.getElementById("cache-delay");
var cacheFailInput = document.getElementById("cache-fail");
var networkDelayInput = document.getElementById("network-delay");
var networkFailInput = document.getElementById("network-fail");
var data = document.getElementById("data");
var cacheStatus = document.getElementById("cache-statur");
var networkStatus = document.getElementById("network-status");
var getNewDataBtn = document.getElementById("data");

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
