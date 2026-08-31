const { sendReminders } = require('./rdv-reminder.service');

const msUntilNextRun = (targetHour = 8) => {
  const now = new Date();
  const next = new Date(now);
  next.setHours(targetHour, 0, 0, 0);
  if (next <= now) next.setDate(next.getDate() + 1);
  return next.getTime() - now.getTime();
};

const startRdvReminderScheduler = () => {
  if (process.env.RDV_REMINDER_ENABLED === 'false') {
    console.log('[RDV Reminder] Désactivé (RDV_REMINDER_ENABLED=false)');
    return;
  }

  const hour = parseInt(process.env.RDV_REMINDER_HOUR || '8', 10);
  const DAY_MS = 24 * 60 * 60 * 1000;

  const run = async () => {
    try {
      const result = await sendReminders();
      if (result.total > 0) {
        console.log(
          `[RDV Reminder] ${result.sentSms || 0} SMS / ${result.sentEmail || 0} e-mails pour le ${result.date}`,
        );
      }
    } catch (err) {
      console.error('[RDV Reminder] Erreur:', err.message);
    }
  };

  const delay = msUntilNextRun(hour);
  console.log(`[RDV Reminder] Planifié à ${hour}h00 (dans ${Math.round(delay / 60000)} min)`);

  setTimeout(() => {
    run();
    setInterval(run, DAY_MS);
  }, delay);
};

module.exports = { startRdvReminderScheduler };
