/** true sur l'instance PM2 #0 (cron / schedulers uniques en cluster). */
const isPrimaryPm2Instance = () => {
  const id = process.env.NODE_APP_INSTANCE;
  return id === undefined || id === '0';
};

module.exports = { isPrimaryPm2Instance };
