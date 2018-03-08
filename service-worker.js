var cacheName = "weatherPWA_1";
var dataCacheName = 'climaData-V1';
var fileToCache = [
    '/',
    '/manifest.json',
    '/index.html',
    '/scripts/app.js',
    '/styles/inline.css',
    '/images/clear.png',
    '/images/cloudy-scattered-showers.png',
    '/images/cloudy.png',
    '/images/fog.png',
    '/images/ic_add_white_24px.svg',
    '/images/ic_refresh_white_24px.svg',
    '/images/partly-cloudy.png',
    '/images/rain.png',
    '/images/scattered-showers.png',
    '/images/sleet.png',
    '/images/snow.png',
    '/images/thunderstorm.png',
    '/images/wind.png'
];

self.addEventListener('install', function(e){
    console.log('Instalar Service Worker');
    e.waitUntil(
        caches.open(cacheName)
        .then( function(cache){
            console.log("Guardando el Shell de la app en el cache");
            return cache.addAll(fileToCache);
        })
        .catch( (e) => console.log(e)  )
    );
});

self.addEventListener('activate', function(e){
    console.log('Activar ServiceWorker');
    e.waitUntil(
        caches.keys()
            .then( function(keyList){
                return Promise.all(keyList.map( function(key){
                    if (key != cacheName && key != dataCacheName) {
                        console.log('Service Worker Eliminado del cache' , key);
                        return caches.delete(key);
                    }
                }));
            })
            .catch( (error) => console.log("Error ", error) )
    );
    return self.clients.claim();
});

self.addEventListener('fetch', function(e){
    console.log('Service Worker - Busqueda ', e.request.url);
    var dataUrl = 'https://query.yahooapis.com/v1/public/yql';
    if (e.request.url.indexOf(dataUrl) > -1) {
        e.respondWith(
            caches.open(dataCacheName)
                .then( (cache) => {
                    return fetch(e.request)
                        .then(response =>{
                            cache.put(e.request.url, response.clone());
                            return response;
                        })
                })
                .catch( (error ) => console.error("Error al buscar " + e.request, error ) )
        ) 
    }else{
        e.respondWith(
            caches.match(e.request)
                .then( (response) => {
                    return response || fetch(e.request);
                })
                .catch( (error ) => console.error("Error al buscar " + e.request, error ) )
        )
    }

});