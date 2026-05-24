import { isBefore, addDays, startOfDay, parseISO } from 'date-fns';

export const isDue = (card, today = startOfDay(new Date())) => {
  const srs = card.srsData;
  if (!srs || !srs.nextReviewDate) return true;
  if (srs.repetition === 0) return true;
  const reviewDate = parseISO(srs.nextReviewDate);
  return isBefore(reviewDate, addDays(today, 1));
};

export const isLearned = (card) => {
  if (!card.srsData || card.srsData.repetition === 0) return false;
  if (card.srsData.lastQuality !== undefined) return card.srsData.lastQuality >= 4;
  return card.srsData.interval > 1; // fallback
};

export const isLearning = (card) => {
  if (!card.srsData) return false;
  if (card.srsData.repetition > 0 && !isLearned(card)) return true;
  if (card.srsData.repetition === 0 && card.srsData.lastQuality !== undefined) return true; // lapsed card
  return false;
};
