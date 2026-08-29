const CACHE_NAME = "neo-weather-v1";

const APP_FILES = [
    "./",
    "./index.html",
    "./manifest.json"
];

self.addEventListener("install", event => {

    event.waitUntil(

        caches.open(CACHE_NAME)
            .then(cache => {

                return cache.addAll(APP_FILES);

            })

    );

    self.skipWaiting();

});


self.addEventListener("activate", event => {

    event.waitUntil(

        caches.keys()
            .then(keys => {

                return Promise.all(

                    keys
                        .filter(key => key !== CACHE_NAME)
                        .map(key => caches.delete(key))

                );

            })

    );

    self.clients.claim();

});


self.addEventListener("fetch", event => {

    /*
        Para las APIs meteorológicas usamos siempre
        la información más reciente.
    */

    if (
        event.request.url.includes("open-meteo.com")
    ) {

        event.respondWith(

            fetch(event.request)
                .catch(() => {

                    return caches.match(event.request);

                })

        );

        return;

    }


    /*
        Para archivos de la aplicación:

        Primero intenta Internet.
        Si no hay Internet, utiliza la copia almacenada.
    */

    event.respondWith(

        fetch(event.request)
            .then(response => {

                if (
                    response &&
                    response.status === 200 &&
                    response.type === "basic"
                ) {

                    const responseClone =
                        response.clone();

                    caches.open(CACHE_NAME)
                        .then(cache => {

                            cache.put(
                                event.request,
                                responseClone
                            );

                        });

                }

                return response;

            })
            .catch(() => {

                return caches.match(
                    event.request
                );

            })

    );

});