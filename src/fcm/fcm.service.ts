import * as admin from 'firebase-admin';
import * as path from 'path';
import * as fs from 'fs';

export function initFirebase() {
  if (admin.apps.length > 0) return;

  const candidatePaths = [
    process.env.FIREBASE_SERVICE_ACCOUNT_PATH,
    path.join(process.cwd(), 'src/config/firebase.service-account.json'),
    path.join(process.cwd(), 'dist/src/config/firebase.service-account.json'),
    path.join(__dirname, '../config/firebase.service-account.json'),
  ].filter(Boolean) as string[];

  let serviceAccountPath: string | null = null;
  for (const candidate of candidatePaths) {
    if (fs.existsSync(candidate)) {
      serviceAccountPath = candidate;
      break;
    }
  }

  if (!serviceAccountPath) {
    console.warn(
      '[FCM] Warning: firebase.service-account.json not found in candidate paths. Push notifications may fail.',
    );
    return;
  }

  try {
    const serviceAccount = JSON.parse(
      fs.readFileSync(serviceAccountPath, 'utf8'),
    );

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: serviceAccount.project_id,
    });
  } catch (err) {
    console.error('[FCM] Failed to initialize Firebase:', err);
  }
}

// ===============================
// 🔥 send FCM
// ===============================
export async function sendFCM(
  tokens: string[],
  title: string,
  body: string,
  data?: Record<string, string>,
  options?: { concurrency?: number; batchSize?: number },
) {
  if (!tokens.length)
    return { totalSuccess: 0, totalFailure: 0, totalBatches: 0 };

  initFirebase();

  const batchSize = Math.min(options?.batchSize || 500, 500);
  const totalTokens = tokens.length;
  const totalBatches = Math.ceil(totalTokens / batchSize);
  const isLargeScale = totalTokens > 5000;
  const concurrency = options?.concurrency || (isLargeScale ? 15 : 5);

  let totalSuccess = 0;
  let totalFailure = 0;
  let currentBatchIndex = 0;

  console.log(
    `🚀 [FCM] Broadcasting to ${totalTokens.toLocaleString()} tokens (${totalBatches.toLocaleString()} batches, concurrency=${concurrency})...`,
  );

  const startTime = Date.now();

  async function worker() {
    while (true) {
      const idx = currentBatchIndex++;
      if (idx >= totalBatches) break;

      const start = idx * batchSize;
      const chunk = tokens.slice(start, start + batchSize);
      const batchNum = idx + 1;

      try {
        const response = await admin.messaging().sendEachForMulticast({
          tokens: chunk,
          notification: {
            title,
            body,
          },
          data: data || undefined,
          apns: {
            headers: {
              'apns-priority': '10',
            },
            payload: {
              aps: {
                sound: 'default',
              },
            },
          },
          android: {
            priority: 'high',
          },
        });

        const successCount = response.successCount || 0;
        const failureCount = response.failureCount || 0;
        totalSuccess += successCount;
        totalFailure += failureCount;

        if (!isLargeScale) {
          console.log(
            `🚀 FCM Batch ${batchNum}/${totalBatches}: Success = ${successCount}, Failure = ${failureCount}`,
          );
          response.responses.forEach((res, resIdx) => {
            if (!res.success) {
              console.log(
                '❌ Invalid token:',
                chunk[resIdx],
                res.error?.message,
              );
            }
          });
        } else if (batchNum % 50 === 0 || batchNum === totalBatches) {
          const percent = ((batchNum / totalBatches) * 100).toFixed(1);
          const elapsedSec = ((Date.now() - startTime) / 1000).toFixed(1);
          console.log(
            `🚀 [FCM Progress] ${batchNum}/${totalBatches} batches (${percent}%) in ${elapsedSec}s - Success: ${totalSuccess.toLocaleString()}, Failure: ${totalFailure.toLocaleString()}`,
          );
        }
      } catch (error) {
        console.error(
          `Error sending batch ${batchNum}/${totalBatches} FCM notifications:`,
          error,
        );
      }
    }
  }

  const workerCount = Math.min(concurrency, totalBatches);
  const workers = Array.from({ length: workerCount }, () => worker());
  await Promise.all(workers);

  const totalTimeSec = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(
    `📢 [FCM Done] Total: ${totalTokens.toLocaleString()} tokens in ${totalTimeSec}s | Success: ${totalSuccess.toLocaleString()} | Failure: ${totalFailure.toLocaleString()}`,
  );

  return { totalSuccess, totalFailure, totalBatches };
}
