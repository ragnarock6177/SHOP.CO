import { AdminInventoryService } from "../services/admin/inventory.service.js";

let isRunning = false;

/**
 * Sweeps expired reservations (15-minute TTL) every 2 minutes.
 */
export function startInventoryCron(intervalMs = 2 * 60 * 1000) {
  console.log("🕒 Inventory reservation TTL sweep cron initialized (interval: 2m).");

  // Initial sweep on server startup
  AdminInventoryService.releaseExpiredReservations()
    .then((res) => {
      if (res.releasedCount > 0) {
        console.log(`🧹 Initial sweep: Auto-released ${res.releasedCount} expired inventory reservation(s).`);
      }
    })
    .catch((err) => {
      console.error("Error during initial reservation sweep:", err);
    });

  // Recurring sweep
  const timer = setInterval(async () => {
    if (isRunning) return;
    isRunning = true;
    try {
      const res = await AdminInventoryService.releaseExpiredReservations();
      if (res.releasedCount > 0) {
        console.log(`🧹 Periodic sweep: Auto-released ${res.releasedCount} expired inventory reservation(s).`);
      }
    } catch (err) {
      console.error("Error during periodic reservation sweep:", err);
    } finally {
      isRunning = false;
    }
  }, intervalMs);

  return () => clearInterval(timer);
}
