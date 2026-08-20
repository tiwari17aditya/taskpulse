/**
 * Tag Management & Extraction Utilities
 */

export const TAG_COLOR_PALETTE = [
  '#6366f1', '#ec4899', '#ef4444', '#3b82f6', '#10b981',
  '#f59e0b', '#8b5cf6', '#06b6d4', '#14b8a6', '#f43f5e'
];

/**
 * Harvests tags from all database items (tasks, notes, routines) and preserves custom workspace tags
 */
export function mergeAndExtractTags(existingTags = [], dbTasks = [], dbNotes = [], dbRoutines = []) {
  const tagMap = new Map();

  // 1. Register existing workspace tags
  (existingTags || []).forEach((t, idx) => {
    if (typeof t === 'string') {
      const clean = t.replace(/^#/, '').trim();
      if (clean) {
        tagMap.set(clean.toLowerCase(), {
          id: `tg-${clean.toLowerCase()}`,
          name: clean,
          color: TAG_COLOR_PALETTE[idx % TAG_COLOR_PALETTE.length]
        });
      }
    } else if (t && t.name) {
      const clean = t.name.replace(/^#/, '').trim();
      if (clean) {
        tagMap.set(clean.toLowerCase(), {
          id: t.id || `tg-${clean.toLowerCase()}`,
          name: clean,
          color: t.color || TAG_COLOR_PALETTE[idx % TAG_COLOR_PALETTE.length]
        });
      }
    }
  });

  // 2. Harvest any tags stored on tasks, notes, routines in DB
  const harvestTags = (items) => {
    (items || []).forEach(item => {
      let rawTags = item?.tags;
      if (typeof rawTags === 'string') {
        try { rawTags = JSON.parse(rawTags); } catch (e) { rawTags = []; }
      }
      if (Array.isArray(rawTags)) {
        rawTags.forEach(tagName => {
          if (typeof tagName === 'string') {
            const clean = tagName.replace(/^#/, '').trim();
            if (clean && !tagMap.has(clean.toLowerCase())) {
              tagMap.set(clean.toLowerCase(), {
                id: `tg-${clean.toLowerCase()}`,
                name: clean,
                color: TAG_COLOR_PALETTE[tagMap.size % TAG_COLOR_PALETTE.length]
              });
            }
          }
        });
      }
    });
  };

  harvestTags(dbTasks);
  harvestTags(dbNotes);
  harvestTags(dbRoutines);

  return Array.from(tagMap.values());
}
