import * as admin from 'firebase-admin';
import * as path from 'path';

export function initFirebase() {
  if (admin.apps.length > 0) return;

  const serviceAccount = require(
    path.join(process.cwd(), 'src/config/firebase.service-account.json'),
  );

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: serviceAccount.project_id,
  });
}

// ===============================
// 🔥 send FCM
// ===============================
export async function sendFCM(tokens: string[], title: string, body: string) {
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
      console.error(`Error sending batch ${batchIdx} FCM notifications:`, error);
    }
  }

  console.log(
    `📢 Total FCM Notification Status: Success = ${totalSuccess}, Failure = ${totalFailure}`,
  );

  return results;
}
