import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { PrismaService } from '../../../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';

interface CachedUser {
  user: any;
  cachedAt: number;
}

const USER_CACHE_TTL_MS = 60 * 1000; // 60 seconds
const userCache = new Map<number, CachedUser>();

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    const jwtSecret = configService.get<string>('JWT_SECRET');
    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not defined in environment variables');
    }

    const cookieExtractor = (req: Request) => {
      let token = null;
      if (req && req.cookies) {
        token = req.cookies['token'];
      }
      return token;
    };

    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        cookieExtractor,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });
  }

  async validate(payload: { sub: number }) {
    const now = Date.now();
    const cached = userCache.get(payload.sub);

    if (cached && now - cached.cachedAt < USER_CACHE_TTL_MS) {
      if (cached.user.status !== 'A') {
        userCache.delete(payload.sub);
        throw new UnauthorizedException('User is not active');
      }
      return cached.user;
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        username: true,
        employeeId: true,
        roleId: true,
        status: true,
        provinceId: true,
        districtId: true,
        branchId: true,
        repairDistrictId: true,
        role: {
          select: {
            id: true,
            name: true,
          },
        },
        employee: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            emp_code: true,
            empimg: true,
            gender: true,
            tel: true,
            email: true,
            departmentId: true,
            divisionId: true,
            officeId: true,
            unitId: true,
            department: true,
            division: true,
            office: true,
            unit: true,
            position: true,
          },
        },
      },
    });

    if (!user) {
      userCache.delete(payload.sub);
      throw new UnauthorizedException('User not found');
    }

    if (user.status !== 'A') {
      userCache.delete(payload.sub);
      throw new UnauthorizedException('User is not active');
    }

    userCache.set(payload.sub, { user, cachedAt: now });

    // Periodic cleanup if cache grows
    if (userCache.size > 2000) {
      for (const [id, item] of userCache.entries()) {
        if (now - item.cachedAt > USER_CACHE_TTL_MS) {
          userCache.delete(id);
        }
      }
    }

    return user;
  }
}
