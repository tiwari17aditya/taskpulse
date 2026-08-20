/**
 * Standardized Date Utility Functions for TaskPulse
 */

export const getLocalDateStr = (date = new Date()) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getTodayStr = () => getLocalDateStr();
export const getTomorrowStr = () => getLocalDateStr(new Date(Date.now() + 86400000));
export const getNextWeekStr = () => getLocalDateStr(new Date(Date.now() + 7 * 86400000));
export const getYesterdayStr = () => getLocalDateStr(new Date(Date.now() - 86400000));

export const formatDisplayDate = (dateStr) => {
  if (!dateStr) return '';
  const todayStr = getTodayStr();
  const tomorrowStr = getTomorrowStr();
  const yesterdayStr = getYesterdayStr();

  if (dateStr === todayStr) return 'Today';
  if (dateStr === tomorrowStr) return 'Tomorrow';
  if (dateStr === yesterdayStr) return 'Yesterday';

  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const d = new Date(parts[0], parts[1] - 1, parts[2]);
      return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: d.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined });
    }
    return dateStr;
  } catch (e) {
    return dateStr;
  }
};
