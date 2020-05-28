const cacheName ='v1'
self.addEventListener('install', event => {
    console.log('SW installed at: ', new Date().toLocaleTimeString());
    event.waitUntil(
        caches.open(cacheName).then((cache) => {
            return cache.addAll(['/',
                                'index.html',
                                'css/style.css',
                                'js/index.js',
                                'offline.html'])
        })
    );
    self.skipWaiting();
});

self.addEventListener('activate', event => {
        // remove unwanted caches
        event.waitUntil(
            caches.keys().then(cacheNames=>{
                return Promise.all(
                    cacheNames.map(cache=>{
                        if(cache !== cacheName){
                            console.log('Service worker:Clearing old Cache');
                            return caches.delete(cache)
                        }
                    })
                )
            })
        )
        console.log('SW activated at: ', new Date().toLocaleTimeString());

});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
        .then((response) => {
            if (!navigator.onLine) {
                if (response) { 
                    return response;
                } else {
                    return caches.match(new Request('offline.html'));
                }
            } else {
                return fetchAndUpdateCache(event.request);
            }
        })
    )
});

self.addEventListener('push',e =>{
    const date = e.data.json();
    console.log('push Recieved')
    self.registration.showNotification(date.title,{
        body:'Wow, You got one!',
        icon:'images/favicon32.png'

    })
})
async function fetchAndUpdateCache(request) {
    return fetch(request)
    .then((response) => {
        console.log(response);
        if(response) {
            if (request.method === "GET") {
                return caches.open(cacheName)
                .then((cache) => {
                    return cache.put(request, response.clone())
                    .then(() => {
                        return response;
                    })
                });
            } else {
                return response;
            }
            
        }
    })
}
