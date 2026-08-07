export async function onRequest() {
    return new Response("FUNCTION WORKING", {
        headers: {
            "content-type": "text/plain"
        }
    });
}
