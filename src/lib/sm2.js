/**
 * SuperMemo-2 (SM-2) Spaced Repetition Algorithm
 * 
 * Quality options:
 * 0: Complete blackout.
 * 1: Incorrect response; the correct one remembered.
 * 2: Incorrect response; where the correct one seemed easy to recall.
 * 3: Correct response recalled with serious difficulty.
 * 4: Correct response after a hesitation.
 * 5: Perfect response.
 * 
 * Simplified to:
 * - Again (q=1)
 * - Hard (q=3)
 * - Good (q=4)
 * - Easy (q=5)
 */

export function calculateSM2(quality, lastInterval, lastRepetition, lastEfactor) {
  let interval;
  let repetition;
  let efactor;

  // Cap quality at 5 for the traditional efactor calculation to prevent math exploding
  let effectiveQuality = quality > 5 ? 5 : quality;
  
  // Calculate new efactor
  efactor = lastEfactor + (0.1 - (5 - effectiveQuality) * (0.08 + (5 - effectiveQuality) * 0.02));
  if (efactor < 1.3) efactor = 1.3;

  if (quality >= 3) {
    if (lastRepetition === 0) {
      if (quality === 3) interval = 1;
      else if (quality === 4) interval = 3;    // Gut
      else if (quality === 5) interval = 7;    // Einfach
      else if (quality === 6) interval = 21;   // Bekannt (Instant 3 weeks)
      else interval = 1;
    } else if (lastRepetition === 1) {
      if (quality === 3) interval = 3;
      else if (quality === 4) interval = 8;
      else if (quality === 5) interval = 16;
      else if (quality === 6) interval = 45;
      else interval = 6;
    } else {
      if (quality === 3) {
        interval = Math.round(lastInterval * 1.2);
      } else if (quality === 5) {
        interval = Math.round(lastInterval * efactor * 1.5);
      } else if (quality === 6) {
        interval = Math.round(lastInterval * efactor * 2.5); // Massive jump
      } else {
        interval = Math.round(lastInterval * efactor);
      }
    }
    repetition = lastRepetition + 1;
  } else {
    repetition = 0;
    interval = 0; // 0 means due immediately / today
  }

  return { interval, repetition, efactor };
}
