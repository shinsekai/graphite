/**
 * Note-related constants.
 */
export const NOTE_TITLE_MAX_LENGTH = 500;
export const NOTE_CONTENT_MAX_BYTES = 1_048_576; // 1MB
export const NOTE_PREVIEW_LENGTH = 80;

/**
 * Image upload constraints.
 */
export const IMAGE_MAX_SIZE_BYTES = 10_485_760; // 10MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'] as const;

/**
 * UI debounce timing.
 */
export const AUTOSAVE_DEBOUNCE_MS = 1500;
export const SEARCH_DEBOUNCE_MS = 300;
