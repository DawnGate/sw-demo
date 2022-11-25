const currentVersionCache = 'v1';
const addResourcesToCache = async (resources) => {
  // using cache with key like version
  console.log(resources);
  const cache = await caches.open(currentVersionCache);
  await cache.addAll(resources);
};

const putInCache = async (request, response) => {
  const cache = await caches.open(currentVersionCache);
  await cache.put(request, response);
};

const cacheFirst = async ({ request, preloadResponsePromise, fallbackUrl }) => {
  // First try to get the resource from the cache
  const responseFromCache = await caches.match(request);
  console.log('match cache', responseFromCache);
  if (responseFromCache) {
    return responseFromCache;
  }

  // Next try to use the preloaded response, if it's there
  const preloadResponse = await preloadResponsePromise;
  if (preloadResponse) {
    console.info('using preload response', preloadResponse);
    putInCache(request, preloadResponse.clone());
    return preloadResponse;
  }

  // Next try to get the resource from the network
  try {
    const responseFromNetwork = await fetch(request);
    // response may be used only once
    // we need to save clone to put one copy in cache
    // and serve second one
    console.log('put in cache', request);
    putInCache(request, responseFromNetwork.clone());
    return responseFromNetwork;
  } catch (error) {
    const fallbackResponse = await caches.match(fallbackUrl);
    console.log('fall back fail');
    if (fallbackResponse) {
      return fallbackResponse;
    }
    // when even the fallback response is not available,
    // there is nothing we can do, but we must always
    // return a Response object
    return new Response('Network error happened', {
      status: 408,
      headers: { 'Content-Type': 'text/plain' },
    });
  }
};

const enableNavigationPreload = async () => {
  if (self.registration.navigationPreload) {
    // Enable navigation preloads!
    await self.registration.navigationPreload.enable();
  }
};

// clear old cache
const deleteCache = async (key) => {
  await caches.delete(key);
};

const deleteOldCaches = async () => {
  const cacheKeepList = [currentVersionCache];
  const keyList = await caches.keys();
  console.log('Clear current version cache', keyList);
  const cachesToDelete = keyList.filter((key) => !cacheKeepList.includes(key));
  await Promise.all(cachesToDelete.map(deleteCache));
};

// start service worker

self.addEventListener('activate', (event) => {
  console.log('service worker active after');
  event.waitUntil(enableNavigationPreload());
  event.waitUntil(deleteOldCaches());
});

self.addEventListener('install', (event) => {
  console.log('service worker install first');
  event.waitUntil(
    // when installing some thing need to do, and wait it done before change sw to active
    addResourcesToCache([
      '/',
      '/index.html',
      '/style.css',
      '/app.js',
      '/image-list.js',
      '/star-wars-logo.jpg',
      '/gallery/bountyHunters.jpg',
      '/gallery/myLittleVader.jpg',
      '/gallery/snowTroopers.jpg',
    ])
  );
});

// service worker listener

self.addEventListener('fetch', (event) => {
  event.respondWith(
    cacheFirst({
      request: event.request,
      preloadResponsePromise: event.preloadResponse,
      fallbackUrl: '/gallery/myLittleVader.jpg',
    })
  );
});
