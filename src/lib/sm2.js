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

  if (quality >= 3) {
    if (lastRepetition === 0) {
      interval = 1;
    } else if (lastRepetition === 1) {
      interval = 6;
    } else {
      interval = Math.round(lastInterval * lastEfactor);
    }
    repetition = lastRepetition + 1;
  } else {
    repetition = 0;
    interval = 1;
  }

  efactor = lastEfactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  
  if (efactor < 1.3) {
    efactor = 1.3;
  }

  return { interval, repetition, efactor };
}
