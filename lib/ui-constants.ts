// UI Constants for consistent styling and animations
export const UI_CONSTANTS = {
  // PageHeader animation constants
  PAGE_HEADER: {
    SCROLL_DISTANCE: 56, // pixels to scroll for full animation
    TITLE_FONT_SIZE: {
      INITIAL: 34, // initial font size in px
      MIN: 17, // minimum font size in px
    },
  },
} as const

// Helper functions for calculations
export const calculateTitleSize = (progress: number): number => {
  const { INITIAL, MIN } = UI_CONSTANTS.PAGE_HEADER.TITLE_FONT_SIZE
  return INITIAL - (INITIAL - MIN) * progress
}