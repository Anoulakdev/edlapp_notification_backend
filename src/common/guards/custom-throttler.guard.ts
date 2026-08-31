import { Injectable, ExecutionContext } from '@nestjs/common';
import { ThrottlerGuard, ThrottlerLimitDetail } from '@nestjs/throttler';
import jwt from 'jsonwebtoken';

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  protected async getTracker(req: Record<string, any>): Promise<string> {
    // 1. If user is already resolved on the request
    if (req.user?.id) {
      return `user_${req.user.id}`;
    }

    // 2. Decode JWT Bearer token or cookie token without making a DB call (O(1) fast lookup)
    const token = this.extractToken(req);
    if (token) {
      try {
        const decoded = jwt.decode(token) as {
          sub?: number | string;
          id?: number | string;
        } | null;
        if (decoded?.sub) {
          return `user_${decoded.sub}`;
        }
        if (decoded?.id) {
          return `user_${decoded.id}`;
        }
      } catch {
        // Fall back if decoding fails
      }
    }

    // 3. For login endpoint: track per (IP + username) so that 2,000 employees behind the same office NAT
    // do not block each other while still preventing brute-force against any individual account.
    const url = req.originalUrl || req.url || '';
    if (url.includes('/auth/login')) {
      const username = req.body?.username
        ? String(req.body.username).trim().toLowerCase()
        : '';
      if (username) {
        return `login_${this.getClientIp(req)}_${username}`;
      }
    }

    // 4. Fallback to Client IP for unauthenticated requests
    return `ip_${this.getClientIp(req)}`;
  }

  private extractToken(req: Record<string, any>): string | null {
    const authHeader = req.headers?.authorization || req.headers?.Authorization;
    if (
      authHeader &&
      typeof authHeader === 'string' &&
      authHeader.startsWith('Bearer ')
    ) {
      return authHeader.substring(7).trim();
    }
    if (req.cookies && req.cookies['token']) {
      return req.cookies['token'];
    }
    return null;
  }

  private getClientIp(req: Record<string, any>): string {
    const forwarded = req.headers?.['x-forwarded-for'];
    if (forwarded) {
      const ip = Array.isArray(forwarded)
        ? forwarded[0]
        : forwarded.split(',')[0];
      return ip.trim();
    }
    return (
      (req.ips && req.ips.length > 0 ? req.ips[0] : req.ip) ||
      req.connection?.remoteAddress ||
      'unknown'
    );
  }

  protected async getErrorMessage(
    _context: ExecutionContext,
    _throttlerLimitDetail: ThrottlerLimitDetail,
  ): Promise<string> {
    return 'ມີການຮ້ອງຂໍຫຼາຍເກີນໄປ, ກະລຸນາລໍຖ້າແລ້ວລອງໃໝ່ອີກຄັ້ງ (Too many requests. Please try again later)';
  }
}
