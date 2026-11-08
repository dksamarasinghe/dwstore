import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Enterprise E-Commerce Security Middleware for DWstore.lk
 * - Layer 1: Anti-Bot & Vulnerability Scanner Blocking
 * - Layer 2: Exploit Path & Probe Shield
 * - Layer 3: Dynamic In-Memory Rate Limiter (Anti-DDoS / Anti-Brute-Force)
 */

// Malicious automated bots and exploit scanners
const BLOCKED_USER_AGENTS = [
  'sqlmap',
  'nikto',
  'wpscan',
  'masscan',
  'acunetix',
  'dirbuster',
  'nmap',
  'nessus',
  'gobuster',
  'zgrab',
  'openvas',
  'semrushbot-probe',
  'censysinspect',
  'shodan',
];

// Vulnerability probe paths commonly targeted by automated scripts
const BLOCKED_PROBE_PATHS = [
  '/.env',
  '/.git',
  '/wp-admin',
  '/wp-login',
  '/wp-content',
  '/xmlrpc.php',
  '/phpmyadmin',
  '/pma',
  '/eval-stdin.php',
  '/cgi-bin',
  '/boaform',
  '/config.json',
  '/.aws',
];

// In-Memory Rate Limiting Cache
// Structure: Map<IP, { count: number, resetTime: number }>
const rateLimitCache = new Map<string, { count: number; resetTime: number }>();

// Garbage collector for expired rate limit entries every 5 minutes
const CLEANUP_INTERVAL = 5 * 60 * 1000;
let lastCleanup = Date.now();

function cleanExpiredEntries() {
  const now = Date.now();
  if (now - lastCleanup > CLEANUP_INTERVAL) {
    lastCleanup = now;
    rateLimitCache.forEach((record, ip) => {
      if (now > record.resetTime) {
        rateLimitCache.delete(ip);
      }
    });
  }
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const userAgent = (req.headers.get('user-agent') || '').toLowerCase();
  const forwardedFor = req.headers.get('x-forwarded-for');
  const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : '127.0.0.1';

  // 1. LAYER 1: Anti-Bot & Automated Scanner Blocking
  const isMaliciousBot = BLOCKED_USER_AGENTS.some((bot) => userAgent.includes(bot));
  if (isMaliciousBot) {
    console.warn(`[Security Alert] Blocked malicious bot UA "${userAgent}" from IP ${ip}`);
    return new NextResponse('Access Denied: Automated vulnerability scanning detected.', {
      status: 403,
      headers: { 'Content-Type': 'text/plain' },
    });
  }

  // 2. LAYER 2: Exploit Path Shield (Block probes for .env, wp-login, etc.)
  const lowerPath = pathname.toLowerCase();
  const isProbePath = BLOCKED_PROBE_PATHS.some(
    (probe) => lowerPath.startsWith(probe) || lowerPath.includes(probe)
  );
  if (isProbePath) {
    console.warn(`[Security Alert] Blocked exploit probe to "${pathname}" from IP ${ip}`);
    return new NextResponse('Not Found', { status: 404 });
  }

  // 3. LAYER 3: Rate Limiting
  // Skip rate limiting for static assets (_next/static, images, media, favicon)
  if (
    lowerPath.startsWith('/_next') ||
    lowerPath.startsWith('/media') ||
    lowerPath.startsWith('/favicon') ||
    lowerPath.endsWith('.svg') ||
    lowerPath.endsWith('.png') ||
    lowerPath.endsWith('.jpg') ||
    lowerPath.endsWith('.webp') ||
    lowerPath.endsWith('.css') ||
    lowerPath.endsWith('.js')
  ) {
    return NextResponse.next();
  }

  cleanExpiredEntries();

  const now = Date.now();
  const WINDOW_MS = 60 * 1000; // 1 minute window

  // Stricter limit on sensitive API routes (orders, upload, checkout) vs general browsing
  const isSensitiveEndpoint =
    lowerPath.startsWith('/api/orders') ||
    lowerPath.startsWith('/api/upload') ||
    lowerPath.startsWith('/checkout');

  const MAX_REQUESTS = isSensitiveEndpoint ? 45 : 120; // 45 per min for checkout/orders, 120 for catalog

  const record = rateLimitCache.get(ip);

  if (!record || now > record.resetTime) {
    rateLimitCache.set(ip, { count: 1, resetTime: now + WINDOW_MS });
  } else {
    record.count += 1;
    if (record.count > MAX_REQUESTS) {
      console.warn(`[Security Alert] Rate limit exceeded by IP ${ip} on path ${pathname} (${record.count} reqs)`);
      return new NextResponse(
        JSON.stringify({
          error: 'Too Many Requests',
          message: 'Rate limit exceeded. Please wait a minute before making more requests.',
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': '60',
          },
        }
      );
    }
  }

  // Proceed with added security response headers
  const response = NextResponse.next();
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-XSS-Protection', '1; mode=block');

  return response;
}

// Apply middleware to all web and API routes
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
