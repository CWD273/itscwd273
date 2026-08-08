export async function onRequest(context) {

    const target =
        "https://ftv.cwd273tech.workers.dev/?id=ch1";

    const response =
        await fetch(target);

    return new Response(
        `Destination returned: ${response.status}`
    );
}
