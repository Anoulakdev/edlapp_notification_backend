import { Injectable, ExecutionContext } from '@nestjs/common';
import { ThrottlerGuard, ThrottlerLimitDetail } from '@nestjs/throttler';

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  protected async getTracker(req: Record<string, any>): Promise<string> {
    const forwarded = req.headers?.['x-forwarded-for'];
    if (forwarded) {
      const ip = Array.isArray(forwarded) ? forwarded[0] : forwarded.split(',')[0];
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
