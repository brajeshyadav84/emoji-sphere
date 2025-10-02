export interface Question {
  id: number;
  question: string;
  answer: string;
  videoId: string;
  category: string;
  difficulty: string;
  date: string;
}

export interface Post {
  author: string;
  avatar: string;
  content: string;
  likes: number;
  comments: number;
}

export interface Challenge {
  id: number;
  title: string;
  grade: number;
  date: string;
  points: number;
  description: string;
}