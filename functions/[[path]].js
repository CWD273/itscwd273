export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);
  
  const searchParams = url.search; // Captures ?id=123

  // Define target workers (DO NOT leave a trailing slash)
  const targetDomains = [
"ftv.itscwd273.workers.dev",
        "ftv.r5hmg295fg.workers.dev",
        "ftv.cwd273tech.workers.dev"
  ];

  let chosenDomain = null;

  for (const domain of targetDomains) {
    try {
      // Direct health-check to the base domain containing the parameters
      const checkUrl = `${domain}/${searchParams}`;
      
      const response = await fetch(checkUrl, { 
        method: 'HEAD', 
        redirect: 'follow', 
        headers: { 'User-Agent': 'Cloudflare-Pages-Redirector' }
      });
      
      if (response.headers.get('x-redirect-ready') === 'true' || response.status === 200) {
        chosenDomain = domain;
        break; 
      }
    } catch (error) {
      console.error(`Error connecting to target worker ${domain}:`, error);
    }
  }

  // Fallback engine execution block if workers fail
  if (!chosenDomain) {
    return new Response(
      `<h1>Configuration Error</h1><p>No backend targets were ready to accept this profile pattern.</p>`, 
      {
        status: 502,
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
      }
    );
  }

  // Construct precise path payload safely
  const destinationUrl = `${chosenDomain}/${searchParams}`;

  // Return real raw 302 Header. Browsers will immediately break out and move.
  return new Response(null, {
    status: 302,
    headers: {
      'Location': destinationUrl,
      'Cache-Control': 'no-cache, no-store, must-revalidate'
    }
  });
}
