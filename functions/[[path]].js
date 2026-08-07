export async function onRequest(context) {
    const requestUrl = new URL(context.request.url);

    const hostname = requestUrl.hostname;

    // Gets the first subdomain
    // Example:
    // channel.example.com -> channel
    const parts = hostname.split(".");

    const subdomain = parts.length > 2
        ? parts[0]
        : "";

    const requestedPath = requestUrl.pathname + requestUrl.search;


    /*
        Add your redirect destinations here.

        The function will test each domain in order.

        Example result:

        channel + stream1.com
        becomes:

        https://channel.stream1.com/live/test.m3u8
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
                `https://${subdomain}.${domain}${requestedPath}`;
        } else {
            target =
                `https://${domain}${requestedPath}`;
        }


        try {

            const response = await fetch(target, {
                method: "HEAD",
                redirect: "manual"
            });


            /*
                Modify this detection logic.

                Examples:

                response.status === 200
                response.headers.get("content-type")
                response.headers.get("server")
            */


            const contentType =
                response.headers.get("content-type") || "";


            if (
                response.status >= 200 &&
                response.status < 400
            ) {

                return Response.redirect(
                    target,
                    302
                );

            }


        } catch (error) {

            // Failed domain, try next one
            continue;

        }

    }


    return new Response(
        "No available redirect destination",
        {
            status: 404,
            headers: {
                "content-type": "text/plain"
            }
        }
    );
}
