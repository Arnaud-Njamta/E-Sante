const { sendPriseReminders } = require('./prise-reminder.service');

/**
 * Vérifie toutes les N minutes les prises à rappeler.
 */
const startPriseReminderScheduler = () => {
  if (process.env.PRISE_REMINDER_ENABLED === 'false') {
    console.log('[Prise Reminder] Désactivé (PRISE_REMINDER_ENABLED=false)');
    return;
  }

  const intervalMin = Math.max(1, parseInt(process.env.PRISE_REMINDER_INTERVAL_MIN || '5', 10));
  const windowMinutes = Math.max(3, parseInt(process.env.PRISE_REMINDER_WINDOW_MIN || '8', 10));
  const ms = intervalMin * 60 * 1000;

  const run = async () => {
    try {
      const result = await sendPriseReminders({ windowMinutes });
      if (result.sentSms || result.sentEmail) {
        console.log(
          `[Prise Reminder] ${result.at} — SMS ${result.sentSms}, email ${result.sentEmail}`,
        );
      }
    } catch (err) {
      console.error('[Prise Reminder] Erreur:', err.message);
    }
  };

  console.log(`[Prise Reminder] Toutes les ${intervalMin} min (fenêtre ±${windowMinutes} min)`);
  setTimeout(run, 15_000);
  setInterval(run, ms);
};

module.exports = { startPriseReminderScheduler };
