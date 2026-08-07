export async function onRequest(context) {
    const { request, env } = context;

    const requestUrl = new URL(request.url);

    const hostname = requestUrl.hostname;

    const parts = hostname.split(".");

    const subdomain = parts.length > 2
        ? parts[0]
        : "";


    /*
        The path is intentionally ignored.

        Example:

        https://mysite.pages.dev/?id=ch1

        becomes:

        https://destination.example/?id=ch1
    */

    const queryString = requestUrl.search;


    /*
        Cache based only on the subdomain.

        This means:

        ?id=ch1
        ?id=ch2
        ?id=ch3

        all use the same cached destination for that
        subdomain.

        If you want each ID to have its own cached
        destination, change this to include the query
        parameter.
    */

    const cacheKey = `subdomain:${subdomain}`;


    /*
        Check KV first.
    */

    if (env.REDIRECT_CACHE) {

        const cached =
            await env.REDIRECT_CACHE.get(cacheKey);

        if (cached) {

            /*
                The cached value is the destination
                domain only.

                Reattach the original query string.
            */

            const target =
                `https://${cached}${queryString}`;

            return Response.redirect(
                target,
                302
            );
        }
    }


    /*
        Add your destination domains here.
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

        /*
            If the request has a subdomain:

            ch1.mysite.pages.dev/?id=abc

            becomes:

            https://ch1.ftv.itscwd273.workers.dev/?id=abc

        */

        if (subdomain) {

            target =
                `https://${subdomain}.${domain}${queryString}`;

        } else {

            /*
                Root domain:

                mysite.pages.dev/?id=abc

                becomes:

                https://ftv.itscwd273.workers.dev/?id=abc
            */

            target =
                `https://${domain}${queryString}`;
        }


        try {

            const response =
                await fetch(target, {
                    method: "HEAD",
                    redirect: "manual"
                });


            /*
                A successful response means this
                destination is available.
            */

            if (
                response.status >= 200 &&
                response.status < 400
            ) {

                /*
                    Cache ONLY the domain.

                    Query parameters are intentionally
                    not cached.
                */

                if (env.REDIRECT_CACHE) {

                    await env.REDIRECT_CACHE.put(
                        cacheKey,
                        subdomain
                            ? `${subdomain}.${domain}`
                            : domain,
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


        } catch {

            /*
                Destination failed.
                Try the next domain.
            */

            continue;
        }
    }


    /*
        None of the destinations worked.
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
