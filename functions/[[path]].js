export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);
  
  const searchParams = url.search; 
  const pathname = url.pathname;   

  // 1. Put your target domains managed by Cloudflare Workers here
  const targetDomains = [
    'https://domain-a.com',
    'https://domain-b.net'
  ];

  let chosenDomain = null;

  for (const domain of targetDomains) {
    try {
      // We switch to 'follow' so internal routing loops don't crash the engine
      const response = await fetch(`${domain}${pathname}${searchParams}`, { 
        method: 'HEAD', 
        redirect: 'follow', 
        headers: { 
          'User-Agent': 'Cloudflare-Pages-Redirector'
        }
      });
      
      // Match the validation marker set in Step 1
      if (response.headers.get('x-redirect-ready') === 'true' || response.status === 200) {
        chosenDomain = domain;
        break; 
      }
    } catch (error) {
      console.error(`Error connecting to target worker ${domain}:`, error);
    }
  }

  // 2. Clear browser error handling: output visual debugging if both workers miss
  if (!chosenDomain) {
    return new Response(
      `Engine Fail: Target Workers down or missing configuration headers. Checked path: ${pathname}`, 
      {
        status: 502,
        headers: { 'Content-Type': 'text/html; charset=utf-8' } // Declaring HTML prevents text downloads
      }
    );
  }

  // 3. Build destination URL and issue the clean 302 redirect
  const destinationUrl = `${chosenDomain}${pathname}${searchParams}`;
  return new Response(null, {
    status: 302,
    headers: {
      'Location': destinationUrl,
      'Cache-Control': 'no-cache, no-store, must-revalidate'
    }
  });
}
