import { Test, TestingModule } from '@nestjs/testing';
import { Controller, Get, Post, INestApplication } from '@nestjs/common';
import { ThrottlerModule, Throttle } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import request from 'supertest';
import { CustomThrottlerGuard } from './custom-throttler.guard';

@Controller('test')
class TestController {
  @Get('normal')
  getNormal() {
    return { ok: true };
  }

  @Throttle({ default: { limit: 2, ttl: 60000 } })
  @Post('login')
  postLogin() {
    return { ok: true };
  }
}

describe('CustomThrottlerGuard & Rate Limiting', () => {
  let app: INestApplication;

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
    const res1 = await request(app.getHttpServer()).post('/test/login');
    expect(res1.status).toBe(201);

    const res2 = await request(app.getHttpServer()).post('/test/login');
    expect(res2.status).toBe(201);
  });

  it('should block brute force attempts with HTTP 429 when exceeding limit', async () => {
    const res = await request(app.getHttpServer()).post('/test/login');
    expect(res.status).toBe(429);
    expect(res.body.message).toContain('ມີການຮ້ອງຂໍຫຼາຍເກີນໄປ');
  });

  it('should correctly track forwarded IP header', async () => {
    const res = await request(app.getHttpServer())
      .post('/test/login')
      .set('X-Forwarded-For', '203.0.113.195');
    expect(res.status).toBe(201);
  });
});
