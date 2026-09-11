import { neon } from '@neondatabase/serverless';
import { timingSafeEqual } from 'node:crypto';

export function getSql() {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  return neon(url);
}

export function send(res, status, payload) {
  res.status(status);
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(payload));
}

export function parseBody(req) {
  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { body = null; }
  }
  return body && typeof body === 'object' ? body : null;
}

export function clientMeta(req) {
  const userAgent = (req.headers['user-agent'] || '').toString().slice(0, 500);
  const ip = (
    req.headers['x-forwarded-for'] ||
    req.headers['x-real-ip'] ||
    req.socket?.remoteAddress ||
    ''
  ).toString().split(',')[0].trim().slice(0, 100);
  return { ip, userAgent };
}

// Basic auth against ADMIN_PASSWORD. Username is ignored. No fallback password:
// an unset env var means the admin surface is closed, not open.
export function isAuthorised(req) {
  const expected = process.env.ADMIN_PASSWORD || process.env.ARCH_PASSWORD;
  if (!expected) return false;
  const auth = req.headers && (req.headers.authorization || req.headers.Authorization);
  if (!auth || typeof auth !== 'string') return false;
  const [scheme, encoded] = auth.split(' ');
  if (scheme !== 'Basic' || !encoded) return false;
  let supplied = '';
  try {
    const decoded = Buffer.from(encoded, 'base64').toString('utf8');
    const idx = decoded.indexOf(':');
    supplied = idx >= 0 ? decoded.slice(idx + 1) : decoded;
  } catch {
    return false;
  }
  const a = Buffer.from(supplied);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function send401(res) {
  res.status(401);
  res.setHeader('WWW-Authenticate', 'Basic realm="Sorted Internal", charset="UTF-8"');
  res.setHeader('Content-Type', 'text/plain');
  res.setHeader('Cache-Control', 'no-store');
  res.end('Authentication required');
}

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const HANDLE_RE = /^[a-z0-9_]{3,20}$/;

// Handles nobody can claim from the marketing site. Brand words, support
// aliases, and things that would look official in a payment request.
export const RESERVED_HANDLES = new Set([
  'admin', 'administrator', 'support', 'help', 'info', 'contact', 'hello',
  'sorted', 'sortedpay', 'sortedaud', 'paymentsorted', 'team', 'official',
  'staff', 'security', 'compliance', 'privacy', 'legal', 'press', 'billing',
  'payments', 'payid', 'audd', 'audc', 'novatti', 'solana', 'mastercard',
  'test', 'demo', 'example', 'user', 'null', 'undefined', 'me', 'you',
  'hannah',
]);
