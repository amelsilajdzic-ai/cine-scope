export const generateErrorHTML = (error) => {
  const { message = 'An unexpected error occurred', statusCode = 500, details = {} } = error || {};
  const statusMessages = {
    400: 'Invalid Request',
    404: 'Not Found',
    429: 'Too Many Requests',
    500: 'Server Error',
    503: 'Service Unavailable',
  };
  const statusText = statusMessages[statusCode] || 'Error';

  const detailsHtml = Object.keys(details).length
    ? `<pre style="white-space:pre-wrap;font-family:monospace;background:#f6f6f6;padding:8px;border-radius:6px;">${JSON.stringify(details, null, 2)}</pre>`
    : '';

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>${statusCode} - ${statusText}</title>
    <style>
      body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;background:#f3f4f6;color:#111;margin:0;padding:24px}
      .container{max-width:800px;margin:40px auto;background:#fff;padding:24px;border-radius:8px;box-shadow:0 6px 20px rgba(16,24,40,0.08)}
      h1{margin:0 0 8px;font-size:20px}
      p{margin:0 0 12px;color:#374151}
    </style>
  </head>
  <body>
    <div class="container">
      <h1>${statusCode} — ${statusText}</h1>
      <p>${String(message)}</p>
      ${detailsHtml}
      <hr />
      <p style="font-size:12px;color:#6b7280">Timestamp: ${new Date().toISOString()}</p>
    </div>
  </body>
</html>`;
};
