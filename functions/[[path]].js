export async function onRequest(context) {
    const { request } = context;

    const requestUrl = new URL(request.url);

    const queryString = requestUrl.search;

    const domains = [
        "ftv.itscwd273.workers.dev",
        "ftv.r5hmg295fg.workers.dev",
        "ftv.cwd273tech.workers.dev"
    ];

    for (const domain of domains) {

        const target =
            `https://${domain}/${queryString}`;

        try {

            const response = await fetch(target, {
                method: "GET",
                redirect: "manual"
            });

            console.log(
                `TEST ${target} -> ${response.status}`
            );

            if (response.status >= 200 && response.status < 400) {

                return Response.redirect(
                    target,
                    302
                );
            }

        } catch (error) {

            console.log(
                `ERROR ${target}`,
                error
            );

        }
    }

    return new Response(
        "No destination worked",
        {
            status: 404
        }
    );
}
