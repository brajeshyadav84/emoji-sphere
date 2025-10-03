import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import { BookOpen, Clock, CheckCircle, XCircle, Trophy, Home } from 'lucide-react';
import englishQuestions from '@/data/exam/englishQuestions.json';

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

interface Grade {
  name: string;
  questions: Question[];
}

interface GradesData {
  [key: string]: Grade;
}

const EnglishExam: React.FC = () => {
  const navigate = useNavigate();
  const [selectedGrade, setSelectedGrade] = useState<string>('');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [examStarted, setExamStarted] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);

  const grades = englishQuestions.grades as GradesData;
  const gradeOptions = Object.keys(grades).map(key => ({
    key,
    name: grades[key].name
  }));

  useEffect(() => {
    if (selectedGrade && !examStarted) {
      const gradeQuestions = grades[selectedGrade]?.questions || [];
      setQuestions(gradeQuestions);
      setSelectedAnswers(new Array(gradeQuestions.length).fill(-1));
    }
  }, [selectedGrade, examStarted, grades]);

  useEffect(() => {
    if (examStarted && timeLeft > 0 && !showResults) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0) {
      handleSubmitExam();
    }
  }, [examStarted, timeLeft, showResults]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartExam = () => {
    if (selectedGrade && questions.length > 0) {
      setExamStarted(true);
      setCurrentQuestion(0);
      setTimeLeft(25 * 60); // Reset timer
    }
  };

  const handleAnswerSelect = (answerIndex: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestion] = answerIndex;
    setSelectedAnswers(newAnswers);
  };

  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmitExam = () => {
    setShowResults(true);
  };

  const calculateScore = () => {
    let correct = 0;
    selectedAnswers.forEach((answer, index) => {
      const correctAnswerIndex = questions[index].options.indexOf(questions[index].correctAnswer);
      if (answer === correctAnswerIndex) {
        correct++;
      }
    });
    return { correct, total: questions.length, percentage: Math.round((correct / questions.length) * 100) };
  };

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreMessage = (percentage: number) => {
    if (percentage >= 80) return 'Excellent! You have strong English language skills.';
    if (percentage >= 60) return 'Good work! Keep reading and practicing your English.';
    return 'Keep learning! Reading books will help improve your English skills.';
  };

  if (!examStarted) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 min-h-screen">
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-2xl mx-auto">
              <Card className="bg-white shadow-xl">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-400 to-purple-600 flex items-center justify-center text-white mb-4 mx-auto">
                    <BookOpen className="h-8 w-8" />
                  </div>
                  <CardTitle className="text-3xl font-bold text-gray-800">English Exam</CardTitle>
                  <p className="text-gray-600 mt-2">Test your English language and reading skills</p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                      <span className="font-medium text-gray-700">Questions:</span>
                      <span className="font-bold text-purple-600">{questions.length}</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                      <span className="font-medium text-gray-700">Time Limit:</span>
                      <span className="font-bold text-blue-600">25 minutes</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                      <span className="font-medium text-gray-700">Difficulty:</span>
                      <span className="font-bold text-green-600">Elementary</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
                      <span className="font-medium text-gray-700">Topics:</span>
                      <span className="font-bold text-orange-600">Mixed</span>
                    </div>
                  </div>
                  
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h3 className="font-semibold text-yellow-800 mb-2">Instructions:</h3>
                    <ul className="space-y-1 text-sm text-yellow-700">
                      <li>• Read each question carefully and think about grammar rules</li>
                      <li>• Pay attention to spelling, punctuation, and word meanings</li>
                      <li>• You can navigate between questions using the Previous/Next buttons</li>
                      <li>• Learn from the explanations provided after submission</li>
                    </ul>
                  </div>
                  
                  <div className="flex gap-4">
                    <Button 
                      onClick={() => navigate('/exams')} 
                      variant="outline" 
                      className="flex-1"
                    >
                      <Home className="h-4 w-4 mr-2" />
                      Back to Exams
                    </Button>
                    <Button 
                      onClick={handleStartExam} 
                      className="flex-1 bg-gradient-to-r from-purple-400 to-purple-600 hover:opacity-90"
                    >
                      Start English Exam
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (showResults) {
    const score = calculateScore();
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 min-h-screen">
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto">
              <Card className="bg-white shadow-xl mb-6">
                <CardHeader className="text-center">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-r from-purple-400 to-purple-600 flex items-center justify-center text-white mb-4 mx-auto">
                    <Trophy className="h-10 w-10" />
                  </div>
                  <CardTitle className="text-3xl font-bold text-gray-800">Exam Complete!</CardTitle>
                  <p className="text-gray-600 mt-2">Here are your results for the English exam</p>
                </CardHeader>
                <CardContent>
                  <div className="text-center mb-8">
                    <div className={`text-6xl font-bold mb-2 ${getScoreColor(score.percentage)}`}>
                      {score.percentage}%
                    </div>
                    <div className="text-xl text-gray-600 mb-4">
                      {score.correct} out of {score.total} questions correct
                    </div>
                    <div className="text-lg text-gray-700 max-w-md mx-auto">
                      {getScoreMessage(score.percentage)}
                    </div>
                  </div>
                  
                  <div className="space-y-4 mb-8">
                    {questions.map((question, index) => (
                      <div key={question.id} className="border rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 mt-1">
                            {selectedAnswers[index] === question.options.indexOf(question.correctAnswer) ? (
                              <CheckCircle className="h-5 w-5 text-green-500" />
                            ) : (
                              <XCircle className="h-5 w-5 text-red-500" />
                            )}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-800 mb-2">
                              {index + 1}. {question.question}
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
                              {question.options.map((option, optionIndex) => (
                                <div 
                                  key={optionIndex}
                                  className={`p-2 rounded text-sm ${
                                    optionIndex === question.options.indexOf(question.correctAnswer)
                                      ? 'bg-green-100 text-green-800 border border-green-300'
                                      : selectedAnswers[index] === optionIndex
                                      ? 'bg-red-100 text-red-800 border border-red-300'
                                      : 'bg-gray-50 text-gray-700'
                                  }`}
                                >
                                  {String.fromCharCode(65 + optionIndex)}. {option}
                                </div>
                              ))}
                            </div>
                            <div className="text-sm text-gray-600 bg-purple-50 p-3 rounded">
                              <strong>Explanation:</strong> {question.explanation}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex gap-4">
                    <Button 
                      onClick={() => navigate('/exams')} 
                      className="flex-1 bg-gradient-to-r from-purple-400 to-purple-600 hover:opacity-90"
                    >
                      <Home className="h-4 w-4 mr-2" />
                      Back to Exams
                    </Button>
                    <Button 
                      onClick={() => window.location.reload()} 
                      variant="outline" 
                      className="flex-1"
                    >
                      Retake Exam
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="bg-gradient-to-br from-purple-50 to-indigo-50 min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Timer and Progress */}
            <Card className="mb-6 bg-white shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-purple-600" />
                    <span className="font-semibold text-gray-800">English Exam</span>
                  </div>
                  <div className="flex items-center gap-2 text-lg font-mono">
                    <Clock className="h-5 w-5 text-red-500" />
                    <span className={timeLeft < 300 ? 'text-red-600 font-bold' : 'text-gray-700'}>
                      {formatTime(timeLeft)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                  <span>Question {currentQuestion + 1} of {questions.length}</span>
                  <span>{Math.round(((currentQuestion + 1) / questions.length) * 100)}% Complete</span>
                </div>
                <Progress value={((currentQuestion + 1) / questions.length) * 100} className="h-2" />
              </CardContent>
            </Card>

            {/* Question */}
            <Card className="mb-6 bg-white shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl text-gray-800">
                  {questions[currentQuestion].question}
                </CardTitle>
                <div className="flex gap-2">
                  <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
                    English
                  </span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                    Elementary
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {questions[currentQuestion].options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => handleAnswerSelect(index)}
                      className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                        selectedAnswers[currentQuestion] === index
                          ? 'border-purple-500 bg-purple-50 text-purple-900'
                          : 'border-gray-200 hover:border-gray-300 bg-white text-gray-700'
                      }`}
                    >
                      <span className="font-semibold mr-3">
                        {String.fromCharCode(65 + index)}.
                      </span>
                      {option}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Navigation */}
            <Card className="bg-white shadow-lg">
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <Button
                    onClick={handlePrevQuestion}
                    disabled={currentQuestion === 0}
                    variant="outline"
                  >
                    Previous
                  </Button>
                  
                  <div className="text-sm text-gray-600">
                    Answered: {selectedAnswers.filter(answer => answer !== undefined).length} / {questions.length}
                  </div>
                  
                  {currentQuestion === questions.length - 1 ? (
                    <Button
                      onClick={handleSubmitExam}
                      className="bg-gradient-to-r from-green-500 to-green-600 hover:opacity-90"
                      disabled={selectedAnswers.filter(answer => answer !== undefined).length === 0}
                    >
                      Submit Exam
                    </Button>
                  ) : (
                    <Button
                      onClick={handleNextQuestion}
                      className="bg-gradient-to-r from-purple-400 to-purple-600 hover:opacity-90"
                    >
                      Next
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnglishExam;