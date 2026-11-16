/**
 * Tools for the team testing the demo (v0.23.2) — never in the families' build.
 * The demo build (VITE_SHOW_DRAFTS=1) and development have them; a families' build ignores the code and the switch.
 *
 * This is NOT a secret: it is in the code anyone can read. It guards nothing — every mission is free and the switch
 * only opens what game progress would open anyway. It is there so a tester does not have to play 10 missions first.
 */
export const TESTER_TOOLS = import.meta.env.DEV || import.meta.env.VITE_SHOW_DRAFTS === '1'

/** Typed instead of the answer at the parents' gate: opens the parents' area with the testing section. */
export const TESTER_CODE = '6812007'
