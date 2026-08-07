export async function onRequest(context) {

    const { request, env } = context;

    const requestUrl = new URL(request.url);

    const hostname = requestUrl.hostname;

    const parts = hostname.split(".");

    const subdomain = parts.length > 2
        ? parts[0]
        : "";


    const path =
        requestUrl.pathname +
        requestUrl.search;


    /*
        Cache key

        Example:

        channel1:/live/test.m3u8
    */

    const cacheKey =
        `${subdomain}:${path}`;


    /*
        Check KV first
    */

    const cached =
        await env.REDIRECT_CACHE.get(cacheKey);


    if (cached) {

        return Response.redirect(
            cached,
            302
        );

    }



    /*
        Add your destinations here
    */

      const domains = [
        "ftv.itscwd273.workers.dev",
        "ftv.r5hmg295fg.workers.dev",
        "ftv.cwd273tech.workers.dev"
    ];



    for (const domain of domains) {


        let target;


        if (subdomain) {

            target =
                `https://${subdomain}.${domain}${path}`;

        } else {

            target =
                `https://${domain}${path}`;

        }



        try {


            const response =
                await fetch(target, {
                    method: "HEAD",
                    redirect: "manual"
                });



            if (
                response.status >= 200 &&
                response.status < 400
            ) {


                /*
                    Save result

                    Cache for 10 minutes
                */

                await env.REDIRECT_CACHE.put(
                    cacheKey,
                    target,
                    {
                        expirationTtl: 600
                    }
                );


                return Response.redirect(
                    target,
                    302
                );

            }


        } catch {

            continue;

        }

    }



    return new Response(
        "No redirect destination available",
        {
            status:404
        }
    );

}
