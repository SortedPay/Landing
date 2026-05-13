// middleware.ts
// ─────────────────────────────────────────────────────────────
// Vercel Edge Middleware. Lives at repo root (next to package.json).
// Protects /admin with HTTP Basic Auth before any page renders.
//
// Set env var ARCH_PASSWORD in Vercel (Production + Preview).
// Default fallback is the original password if env var missing.
// ─────────────────────────────────────────────────────────────

export const config = {
  matcher: ['/admin', '/admin/:path*', '/architecture', '/architecture/:path*'],
};

export default function middleware(request: Request): Response | undefined {
  const password =
    (globalThis as any).process?.env?.ARCH_PASSWORD ?? 'sortedAUD123';

  const auth = request.headers.get('authorization');
  if (auth) {
    const [scheme, encoded] = auth.split(' ');
    if (scheme === 'Basic' && encoded) {
      try {
        const decoded = atob(encoded);
        const idx = decoded.indexOf(':');
        const supplied = idx >= 0 ? decoded.slice(idx + 1) : decoded;
        if (supplied === password) {
          return undefined; // let the request through
        }
      } catch {
        // fall through to 401
      }
    }
  }

  return new Response('Authentication required', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Sorted Internal", charset="UTF-8"',
      'Content-Type': 'text/plain',
      'Cache-Control': 'no-store',
    },
  });
}
