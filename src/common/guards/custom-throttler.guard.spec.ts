import { Test, TestingModule } from '@nestjs/testing';
import { Controller, Get, Post, INestApplication } from '@nestjs/common';
import { ThrottlerModule, Throttle } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { CustomThrottlerGuard } from './custom-throttler.guard';

@Controller('test')
class TestController {
  @Get('normal')
  getNormal() {
    return { ok: true };
  }

  @Throttle({ default: { limit: 2, ttl: 60000 } })
  @Post('auth/login')
  postLogin() {
    return { ok: true };
  }

  @Throttle({ default: { limit: 2, ttl: 60000 } })
  @Get('user-resource')
  getUserResource() {
    return { ok: true };
  }
}

describe('CustomThrottlerGuard & Rate Limiting (2000 Users Support)', () => {
  let app: INestApplication;
  const SECRET = 'test-secret';

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [
        ThrottlerModule.forRoot([
          {
            name: 'default',
            ttl: 60000,
            limit: 10,
          },
        ]),
      ],
      controllers: [TestController],
      providers: [
        {
          provide: APP_GUARD,
          useClass: CustomThrottlerGuard,
        },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should allow requests within the limit', async () => {
    const res1 = await request(app.getHttpServer()).post('/test/auth/login').send({ username: 'user1' });
    expect(res1.status).toBe(201);

    const res2 = await request(app.getHttpServer()).post('/test/auth/login').send({ username: 'user1' });
    expect(res2.status).toBe(201);
  });

  it('should block brute force attempts with HTTP 429 when exceeding limit for the same username', async () => {
    const res = await request(app.getHttpServer()).post('/test/auth/login').send({ username: 'user1' });
    expect(res.status).toBe(429);
    expect(res.body.message).toContain('ມີການຮ້ອງຂໍຫຼາຍເກີນໄປ');
  });

  it('should allow different users from the SAME IP to log in without blocking each other', async () => {
    // user1 is already rate limited above. user2 on the same IP should still be allowed!
    const resUser2 = await request(app.getHttpServer()).post('/test/auth/login').send({ username: 'user2' });
    expect(resUser2.status).toBe(201);
  });

  it('should isolate rate limit quotas for different authenticated users sharing the SAME IP (NAT/Office network)', async () => {
    const tokenUserA = jwt.sign({ sub: 1001 }, SECRET);
    const tokenUserB = jwt.sign({ sub: 1002 }, SECRET);
    const sharedIp = '203.0.113.50';

    // User A exhausts their 2 requests quota
    const resA1 = await request(app.getHttpServer())
      .get('/test/user-resource')
      .set('Authorization', `Bearer ${tokenUserA}`)
      .set('X-Forwarded-For', sharedIp);
    expect(resA1.status).toBe(200);

    const resA2 = await request(app.getHttpServer())
      .get('/test/user-resource')
      .set('Authorization', `Bearer ${tokenUserA}`)
      .set('X-Forwarded-For', sharedIp);
    expect(resA2.status).toBe(200);

    // User A 3rd request -> Blocked (429)
    const resA3 = await request(app.getHttpServer())
      .get('/test/user-resource')
      .set('Authorization', `Bearer ${tokenUserA}`)
      .set('X-Forwarded-For', sharedIp);
    expect(resA3.status).toBe(429);

    // User B from the EXACT same IP is NOT blocked and can make requests
    const resB1 = await request(app.getHttpServer())
      .get('/test/user-resource')
      .set('Authorization', `Bearer ${tokenUserB}`)
      .set('X-Forwarded-For', sharedIp);
    expect(resB1.status).toBe(200);
  });

  it('should correctly track forwarded IP header for unauthenticated clients', async () => {
    const res = await request(app.getHttpServer())
      .get('/test/normal')
      .set('X-Forwarded-For', '203.0.113.195');
    expect(res.status).toBe(200);
  });
});
