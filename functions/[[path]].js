export async function onRequest(context) {
    const { request } = context;
    const requestUrl = new URL(request.url);
    const path = requestUrl.pathname;
    const queryString = requestUrl.search;
    const domains = [
        "ftv.itscwd273.workers.dev",
        "ftv.r5hmg295fg.workers.dev",
        "ftv.cwd273tech.workers.dev"
    ];

    for (const domain of domains) {
        const target = `https://${domain}${path}${queryString}`;

        try {
            const response = await fetch(target, {
                method: "GET",
                redirect: "manual"
            });

            console.log(`TEST ${target} -> ${response.status}`);

            // If the worker itself redirected (3xx), follow its Location header
            // straight to the final destination instead of bouncing through
            // the worker URL again.
            if (response.status >= 300 && response.status < 400) {
                const location = response.headers.get("location");
                if (location) {
                    console.log(`FOLLOW ${target} -> ${location}`);
                    return Response.redirect(location, 302);
                }
                // No Location header despite a 3xx status; fall back to
                // redirecting to the worker URL itself.
                return Response.redirect(target, 302);
            }

            // A plain 2xx means the worker responded successfully itself.
            if (response.status >= 200 && response.status < 300) {
                return Response.redirect(target, 302);
            }
        } catch (error) {
            console.log(`ERROR ${target}`, error);
        }
    }

    return new Response("No destination worked", {
        status: 404
    });
}
