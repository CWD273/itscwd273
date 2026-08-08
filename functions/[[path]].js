export async function onRequest(context) {
    const { request, env } = context;

    const requestUrl = new URL(request.url);

    const hostname = requestUrl.hostname;
    const parts = hostname.split(".");

    const subdomain = parts.length > 2
        ? parts[0]
        : "";

    /*
        Ignore the incoming path completely.

        Example:

        https://mysite.pages.dev/anything/here?id=ch1

        becomes:

        https://destination/?id=ch1
    */

    const queryString = requestUrl.search;


    /*
        Cache key.

        Include the query string because different IDs
        may represent different streams.
    */

    const cacheKey =
        `${subdomain}:${queryString}`;


    /*
        Check KV cache.
    */

    if (env.REDIRECT_CACHE) {

        const cached =
            await env.REDIRECT_CACHE.get(cacheKey);

        if (cached) {

            const target =
                `https://${cached}${queryString}`;

            return Response.redirect(
                target,
                302
            );
        }
    }


    /*
        Destination servers.
    */

    const domains = [
        "ftv.itscwd273.workers.dev",
        "ftv.r5hmg295fg.workers.dev",
        "ftv.cwd273tech.workers.dev"
    ];


    /*
        Test each destination.
    */

    for (const domain of domains) {

        let target;

        if (subdomain) {

            target =
                `https://${subdomain}.${domain}${queryString}`;

        } else {

            target =
                `https://${domain}${queryString}`;
        }


        try {

            /*
                Use GET instead of HEAD.

                The destination streams apparently don't
                support HEAD correctly.
            */

            const response =
                await fetch(target, {
                    method: "GET",
                    redirect: "manual"
                });


            console.log(
                `Tested ${target} -> ${response.status}`
            );


            /*
                Only consider successful responses.
            */

            if (
                response.status >= 200 &&
                response.status < 300
            ) {

                /*
                    Check Content-Type first.
                */

                const contentType =
                    response.headers.get("content-type") || "";


                /*
                    If it identifies itself as an HLS
                    playlist, accept it immediately.
                */

                if (
                    contentType.includes("mpegurl") ||
                    contentType.includes("m3u8") ||
                    contentType.includes("application/x-mpegURL")
                ) {

                    const cacheValue =
                        subdomain
                            ? `${subdomain}.${domain}`
                            : domain;


                    if (env.REDIRECT_CACHE) {

                        await env.REDIRECT_CACHE.put(
                            cacheKey,
                            cacheValue,
                            {
                                expirationTtl: 600
                            }
                        );
                    }


                    return Response.redirect(
                        target,
                        302
                    );
                }


                /*
                    Some servers incorrectly return
                    text/plain for an M3U8.

                    Read a small amount of the body and
                    check for #EXTM3U.
                */

                const reader =
                    response.body?.getReader();

                if (reader) {

                    const { value } =
                        await reader.read();

                    reader.cancel();


                    if (value) {

                        const text =
                            new TextDecoder()
                                .decode(value);


                        if (
                            text.includes("#EXTM3U")
                        ) {

                            const cacheValue =
                                subdomain
                                    ? `${subdomain}.${domain}`
                                    : domain;


                            if (env.REDIRECT_CACHE) {

                                await env.REDIRECT_CACHE.put(
                                    cacheKey,
                                    cacheValue,
                                    {
                                        expirationTtl: 600
                                    }
                                );
                            }


                            return Response.redirect(
                                target,
                                302
                            );
                        }
                    }
                }
            }


        } catch (error) {

            console.log(
                `Failed ${target}:`,
                error
            );

            continue;
        }
    }


    /*
        Nothing worked.
    */

    return new Response(
        "No redirect destination available",
        {
            status: 404,
            headers: {
                "content-type": "text/plain"
            }
        }
    );
}
