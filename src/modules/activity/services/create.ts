import { PrismaService } from '../../../prisma/prisma.service';
import { AuthUser } from '../../../interfaces/auth-user.interface';
import { CreateActivityDto } from '../dto/create-activity.dto';
import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';
import { sendFCM } from '../../../fcm/fcm.service';

/**
 * Background worker to fetch FCM tokens and broadcast notification.
 * Optimized for high scale (500,000 - 1,000,000+ tokens) with:
 * - maxContentLength & maxBodyLength Infinity (allows 100MB+ response)
 * - Memory-safe token extraction and prompt garbage collection
 * - Concurrent FCM batch delivery (concurrency = 15)
 */
async function broadcastActivityFCM(
  activityId: number,
  title: string,
  content: string,
) {
  try {
    console.log(
      `📡 [Activity #${activityId}] Fetching FCM tokens from ${process.env.EDLAPP_URL_API}/getfcmtoken...`,
    );
    const startTime = Date.now();

    const response = await axios.get(
      `${process.env.EDLAPP_URL_API}/getfcmtoken`,
      {
        headers: {
          'x-api-key': process.env.API_KEY,
        },
        timeout: 300000, // 5 minutes timeout for 1M+ records
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      },
    );

    const apiUsers = response.data?.data ?? response.data;
    const tokenSet = new Set<string>();

    if (apiUsers) {
      if (Array.isArray(apiUsers)) {
        const len = apiUsers.length;
        for (let i = 0; i < len; i++) {
          const user = apiUsers[i];
          const token = user?.access_noti
            ? String(user.access_noti).trim()
            : '';
          if (
            token !== '' &&
            token.toLowerCase() !== 'demo' &&
            token.toLowerCase() !== 'null' &&
            token.toLowerCase() !== 'undefined'
          ) {
            tokenSet.add(token);
          }
        }
      } else {
        const token = apiUsers.access_noti
          ? String(apiUsers.access_noti).trim()
          : '';
        if (
          token !== '' &&
          token.toLowerCase() !== 'demo' &&
          token.toLowerCase() !== 'null' &&
          token.toLowerCase() !== 'undefined'
        ) {
          tokenSet.add(token);
        }
      }
    }

    // Support pagination if the API returns paginated data (e.g. totalPages > 1)
    if (response.data?.totalPages && response.data.totalPages > 1) {
      const totalPages = response.data.totalPages;
      for (let p = 2; p <= totalPages; p++) {
        try {
          const pageRes = await axios.get(
            `${process.env.EDLAPP_URL_API}/getfcmtoken?page=${p}&limit=50000`,
            {
              headers: {
                'x-api-key': process.env.API_KEY,
              },
              timeout: 120000,
              maxContentLength: Infinity,
              maxBodyLength: Infinity,
            },
          );
          const pageUsers = pageRes.data?.data ?? pageRes.data;
          if (Array.isArray(pageUsers)) {
            for (let i = 0; i < pageUsers.length; i++) {
              const token = pageUsers[i]?.access_noti
                ? String(pageUsers[i].access_noti).trim()
                : '';
              if (
                token !== '' &&
                token.toLowerCase() !== 'demo' &&
                token.toLowerCase() !== 'null' &&
                token.toLowerCase() !== 'undefined'
              ) {
                tokenSet.add(token);
              }
            }
          }
          pageRes.data = null;
        } catch (pageErr) {
          console.error(
            `[Activity #${activityId}] Failed to fetch page ${p} of tokens:`,
            pageErr,
          );
        }
      }
    }

    // Free raw response memory immediately
    response.data = null;

    const fcmTokens = Array.from(tokenSet);
    tokenSet.clear(); // Free Set memory immediately

    const elapsedFetch = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(
      `🎯 [Activity #${activityId}] Retrieved ${fcmTokens.length.toLocaleString()} valid tokens in ${elapsedFetch}s. Starting broadcast...`,
    );

    if (fcmTokens.length > 0) {
      await sendFCM(
        fcmTokens,
        `📢 ${title} ✨`,
        `📝 ${content}`,
        {
          activityId: String(activityId),
          type: 'activity',
        },
        { concurrency: 15 }, // 15 parallel workers for high throughput (approx. 50-60s for 1M tokens)
      );
    } else {
      console.log(
        `⚠️ [Activity #${activityId}] No valid FCM tokens found to notify.`,
      );
    }
  } catch (error) {
    console.error(
      `❌ [Activity #${activityId}] Failed to broadcast FCM notifications:`,
      error,
    );
  }
}

export async function createActivity(
  prisma: PrismaService,
  user: AuthUser,
  createActivityDto: CreateActivityDto,
  Docfilename: string,
) {
  try {
    const result = await prisma.activity.create({
      data: {
        title: createActivityDto.title,
        content: createActivityDto.content,
        location: createActivityDto.location,
        startDate: new Date(createActivityDto.startDate),
        endDate: new Date(createActivityDto.endDate),
        actFile: Docfilename,
        facebookLink: createActivityDto.facebookLink || null,
        createdById: user.id,
      },
    });

    // 🚀 Run FCM broadcast in the background to prevent HTTP timeout
    // and safely handle 500,000 - 1,000,000+ users without blocking the response.
    setImmediate(() => {
      broadcastActivityFCM(result.id, result.title, result.content).catch(
        (err) => {
          console.error('[Activity FCM] Unhandled background error:', err);
        },
      );
    });

    return result;
  } catch (error) {
    if (Docfilename) {
      const filePath = path.resolve(
        process.env.UPLOAD_BASE_PATH || '',
        'activity',
        Docfilename,
      );

      try {
        await fs.promises.access(filePath, fs.constants.F_OK);
        await fs.promises.unlink(filePath);
      } catch (fsError) {
        console.error('Error deleting uploaded icon:', fsError);
      }
    }
    throw error;
  }
}
