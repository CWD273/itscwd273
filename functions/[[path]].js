export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);
  
  const searchParams = url.search; 
  const pathname = url.pathname;   

  // Target domains to check
  const targetDomains = [
    'https://ftv.itscwd273.workers.dev',
    'https://ftv.r5hmg295fg.workers.dev',
    'https://ftv.cwd273tech.workers.dev'
  ];

  let chosenDomain = 'https://ftv.itscwd273.workers.dev';

  for (const domain of targetDomains) {
    try {
      // Sends a HEAD request to the exact same path and query strings
      const response = await fetch(`${domain}${pathname}${searchParams}`, { 
        method: 'HEAD', 
        redirect: 'manual',
        headers: { 'User-Agent': 'Cloudflare-Pages-Redirector' }
      });
      
      // Match your custom header criteria here
      if (response.headers.get('x-redirect-ready') === 'true') {
        chosenDomain = domain;
        break; 
      }
    } catch (error) {
      console.error(`Error checking ${domain}:`, error);
    }
  }

  // Build final URL and return 302
  const destinationUrl = `${chosenDomain}${pathname}${searchParams}`;
  return new Response(null, {
    status: 302,
    headers: {
      'Location': destinationUrl,
      'Cache-Control': 'no-cache, no-store, must-revalidate'
    }
  });
}
