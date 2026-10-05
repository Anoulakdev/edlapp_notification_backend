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
) {
  if (!tokens.length) return;

  initFirebase();

  const batchSize = 500;
  const results: any[] = [];
  let totalSuccess = 0;
  let totalFailure = 0;

  for (let i = 0; i < tokens.length; i += batchSize) {
    const chunk = tokens.slice(i, i + batchSize);
    const batchIdx = Math.floor(i / batchSize) + 1;

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

      console.log(
        `🚀 FCM Batch ${batchIdx}: Success = ${successCount}, Failure = ${failureCount}`,
      );

      // ✅ handle invalid token
      response.responses.forEach((res, idx) => {
        if (!res.success) {
          console.log('❌ Invalid token:', chunk[idx], res.error);
        }
      });

      results.push(response);
    } catch (error) {
      console.error(
        `Error sending batch ${batchIdx} FCM notifications:`,
        error,
      );
    }
  }

  console.log(
    `📢 Total FCM Notification Status: Success = ${totalSuccess}, Failure = ${totalFailure}`,
  );

  return results;
}
