import { useState, useEffect } from "react";
import type { Question } from "@/types";
import { getTodaysQuestion } from "@/utils/questions";
import YouTubeModal from "@/components/YouTubeModal";

const TodaysChallenge = () => {
  const [todaysQuestion, setTodaysQuestion] = useState<Question | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  useEffect(() => {
    setTodaysQuestion(getTodaysQuestion());
  }, []);

  if (!todaysQuestion) {
    return (
      <div className="bg-card p-4 rounded-2xl shadow-playful border-2 border-primary/20">
        <h3 className="font-bold text-base mb-3 flex items-center gap-2">
          🎯 Today's Question
        </h3>
        <p className="text-sm text-muted-foreground mb-3">
          Loading today's question...
        </p>
        <div className="text-3xl">🤔📚✨</div>
      </div>
    );
  }

  const getCategoryEmoji = (category: string) => {
    const emojiMap: { [key: string]: string } = {
      'Astronomy': '🚀',
      'Art': '🎨',
      'Science': '🔬',
      'Geography': '🌍',
      'Physics': '⚡',
      'Literature': '📚',
      'Biology': '🧬',
      'History': '📜',
    };
    return emojiMap[category] || '🤔';
  };

  const getDifficultyColor = (difficulty: string) => {
    const colorMap: { [key: string]: string } = {
      'Easy': 'text-green-500',
      'Medium': 'text-yellow-500',
      'Hard': 'text-red-500',
    };
    return colorMap[difficulty] || 'text-gray-500';
  };

  return (
    <div className="bg-card p-4 rounded-2xl shadow-playful border-2 border-primary/20">
      <h3 className="font-bold text-base mb-3 flex items-center gap-2">
        🎯 Today's Question
      </h3>
      
      <div className="mb-3">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg">{getCategoryEmoji(todaysQuestion.category)}</span>
          <span className="text-xs text-muted-foreground uppercase tracking-wide">
            {todaysQuestion.category}
          </span>
          <span className={`text-xs font-semibold ${getDifficultyColor(todaysQuestion.difficulty)}`}>
            {todaysQuestion.difficulty}
          </span>
        </div>
        
        <p className="text-sm font-medium mb-3 leading-relaxed">
          {todaysQuestion.question}
        </p>
        
        {!showAnswer ? (
          <button
            onClick={() => setShowAnswer(true)}
            className="text-xs text-primary hover:text-primary/80 font-medium transition-colors"
          >
            🤔 Think about it... (Click to reveal answer)
          </button>
        ) : (
          <div className="bg-secondary/20 p-3 rounded-lg mt-2">
            <p className="text-xs text-muted-foreground mb-1">Answer:</p>
            <p className="text-sm leading-relaxed">{todaysQuestion.answer}</p>
            {todaysQuestion.videoId && (
              <button
                onClick={() => setIsVideoModalOpen(true)}
                className="inline-flex items-center gap-2 text-xs bg-primary/10 hover:bg-primary/20 text-primary px-3 py-2 rounded-lg mt-3 transition-all duration-200 font-medium hover:scale-105"
              >
                📺 Watch Educational Video
              </button>
            )}
          </div>
        )}
      </div>
      
      <div className="text-2xl text-center">
        {getCategoryEmoji(todaysQuestion.category)}🌟✨
      </div>
      
      {/* YouTube Video Modal */}
      {todaysQuestion.videoId && (
        <YouTubeModal
          isOpen={isVideoModalOpen}
          onClose={() => setIsVideoModalOpen(false)}
          videoId={todaysQuestion.videoId}
          title={`Learn more: ${todaysQuestion.question}`}
        />
      )}
    </div>
  );
};

export default TodaysChallenge;