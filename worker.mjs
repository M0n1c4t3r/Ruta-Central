export const contentSecurityPolicy = [
  "default-src 'none'", "script-src 'self'", "script-src-attr 'none'",
  "style-src 'self' https://fonts.googleapis.com",
  "style-src-elem 'self' https://fonts.googleapis.com",
  "style-src-attr 'unsafe-inline'", "font-src https://fonts.gstatic.com",
  "img-src 'self'", "connect-src 'none'", "frame-src 'none'",
  "object-src 'none'", "worker-src 'none'", "base-uri 'none'",
  "form-action 'none'", "frame-ancestors 'none'", 'upgrade-insecure-requests',
].join('; ') + ';';

export const securityHeaders = Object.freeze({
  'Content-Security-Policy': contentSecurityPolicy,
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
  'X-Frame-Options': 'DENY',
  'Cross-Origin-Opener-Policy': 'same-origin',
});

// One source of header policy for assets, errors and redirects; no _headers file.
export function withSecurityHeaders(response) {
  const headers = new Headers(response.headers);
  for (const [name, value] of Object.entries(securityHeaders)) headers.set(name, value);
  return new Response(response.body, {
    status: response.status, statusText: response.statusText, headers,
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.protocol === 'http:' || url.hostname !== 'rutacentral.cl') {
      url.protocol = 'https:';
      url.hostname = 'rutacentral.cl';
      url.port = '';
      return withSecurityHeaders(Response.redirect(url.href, 308));
    }
    // This binding contains only the generated public artifact, never the repo.
    return withSecurityHeaders(await env.ASSETS.fetch(request));
  },
};
