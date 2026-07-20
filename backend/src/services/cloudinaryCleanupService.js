import CloudinaryCleanupTask from "../models/CloudinaryCleanupTask.js";
import { deleteCloudinaryImage } from "../utils/cloudinaryUpload.js";

function uniquePublicIds(publicIds = []) {
  return [...new Set(publicIds.map((value) => String(value || "").trim()).filter(Boolean))];
}

function wait(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function deleteWithRetry(publicId, attempts = 3) {
  let lastError;

  for (let index = 0; index < attempts; index += 1) {
    try {
      await deleteCloudinaryImage(publicId);
      return { publicId, deleted: true, error: null };
    } catch (error) {
      lastError = error;
      if (index < attempts - 1) await wait(250 * (index + 1));
    }
  }

  return { publicId, deleted: false, error: lastError };
}

async function persistCleanupTasks(publicIds) {
  const ids = uniquePublicIds(publicIds);
  if (!ids.length) return;

  await CloudinaryCleanupTask.bulkWrite(
    ids.map((publicId) => ({
      updateOne: {
        filter: { publicId },
        update: {
          $setOnInsert: {
            publicId,
            attempts: 0,
            lastError: "",
            nextAttemptAt: new Date()
          }
        },
        upsert: true
      }
    })),
    { ordered: false }
  );
}

async function markDeleteFailure(publicId, error) {
  const message = String(error?.message || error || "Cloudinary delete failed").slice(0, 800);

  await CloudinaryCleanupTask.findOneAndUpdate(
    { publicId },
    {
      $set: {
        lastError: message,
        nextAttemptAt: new Date(Date.now() + 5 * 60 * 1000)
      },
      $inc: { attempts: 1 }
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
}

export async function deleteCloudinaryImagesSafely(publicIds = []) {
  const ids = uniquePublicIds(publicIds);
  if (!ids.length) return { deleted: [], queued: [] };

  // نسجل الصور أولًا قبل محاولة الحذف حتى لا تضيع أي صورة عند توقف الطلب فجأة.
  await persistCleanupTasks(ids);

  const results = await Promise.all(ids.map((publicId) => deleteWithRetry(publicId, 3)));
  const deleted = results.filter((item) => item.deleted).map((item) => item.publicId);
  const failed = results.filter((item) => !item.deleted);

  if (deleted.length) {
    await CloudinaryCleanupTask.deleteMany({ publicId: { $in: deleted } });
  }

  await Promise.all(failed.map((item) => markDeleteFailure(item.publicId, item.error)));

  return {
    deleted,
    queued: failed.map((item) => item.publicId)
  };
}

export async function processPendingCloudinaryDeletes(limit = 40) {
  const tasks = await CloudinaryCleanupTask.find({
    nextAttemptAt: { $lte: new Date() }
  })
    .sort({ nextAttemptAt: 1 })
    .limit(limit);

  if (!tasks.length) return { processed: 0, deleted: 0, remaining: 0 };

  let deletedCount = 0;

  for (const task of tasks) {
    const result = await deleteWithRetry(task.publicId, 2);

    if (result.deleted) {
      await task.deleteOne();
      deletedCount += 1;
      continue;
    }

    task.attempts += 1;
    task.lastError = String(result.error?.message || result.error || "Cloudinary delete failed").slice(0, 800);
    const delayMinutes = Math.min(24 * 60, Math.max(5, 2 ** Math.min(task.attempts, 10)));
    task.nextAttemptAt = new Date(Date.now() + delayMinutes * 60 * 1000);
    await task.save();
  }

  return {
    processed: tasks.length,
    deleted: deletedCount,
    remaining: tasks.length - deletedCount
  };
}
