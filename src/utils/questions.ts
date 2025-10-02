import generalKnowledge from "@/data/generalKnowledge.json";
import type { Question } from "@/types";

/**
 * Get today's question based on current date
 */
export const getTodaysQuestion = (): Question => {
  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];
  
  // Find question for today's date
  const question = generalKnowledge.find(q => q.date === today);
  
  if (question) {
    return question as Question;
  }
  
  // If no question for today, cycle through questions based on day of year
  const startOfYear = new Date(new Date().getFullYear(), 0, 0);
  const dayOfYear = Math.floor((Date.now() - startOfYear.getTime()) / (1000 * 60 * 60 * 24));
  const questionIndex = dayOfYear % generalKnowledge.length;
  
  return generalKnowledge[questionIndex] as Question;
};

/**
 * Get question by specific date
 */
export const getQuestionByDate = (date: string): Question | null => {
  const question = generalKnowledge.find(q => q.date === date);
  return question ? (question as Question) : null;
};

/**
 * Get all questions
 */
export const getAllQuestions = (): Question[] => {
  return generalKnowledge as Question[];
};

/**
 * Get questions by category
 */
export const getQuestionsByCategory = (category: string): Question[] => {
  return generalKnowledge.filter(q => 
    q.category.toLowerCase() === category.toLowerCase()
  ) as Question[];
};

/**
 * Get questions by difficulty
 */
export const getQuestionsByDifficulty = (difficulty: string): Question[] => {
  return generalKnowledge.filter(q => 
    q.difficulty.toLowerCase() === difficulty.toLowerCase()
  ) as Question[];
};

/**
 * Get random question
 */
export const getRandomQuestion = (): Question => {
  const randomIndex = Math.floor(Math.random() * generalKnowledge.length);
  return generalKnowledge[randomIndex] as Question;
};