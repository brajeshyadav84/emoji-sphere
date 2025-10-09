import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import { Monitor, Clock, CheckCircle, XCircle, Trophy, Home, Computer, BookOpen } from 'lucide-react';
import computerQuestions from '@/data/exam/computerQuestions.json';

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

const ICTExam: React.FC = () => {
  const navigate = useNavigate();
  const [selectedGrade, setSelectedGrade] = useState<string>('');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30 * 60); // 30 minutes in seconds
  const [examStarted, setExamStarted] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);

  const grades = computerQuestions.grades as GradesData;
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
      setTimeLeft(30 * 60); // Reset timer
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
      if (answer !== -1 && questions[index] && questions[index].options[answer] === questions[index].correctAnswer) {
        correct++;
      }
    });
    return correct;
  };

  const getPercentage = () => {
    const score = calculateScore();
    return Math.round((score / questions.length) * 100);
  };

  const getGrade = () => {
    const percentage = getPercentage();
    if (percentage >= 90) return { letter: 'A+', color: 'text-green-600' };
    if (percentage >= 80) return { letter: 'A', color: 'text-green-500' };
    if (percentage >= 70) return { letter: 'B', color: 'text-blue-500' };
    if (percentage >= 60) return { letter: 'C', color: 'text-yellow-500' };
    return { letter: 'F', color: 'text-red-500' };
  };

  const resetExam = () => {
    setSelectedGrade('');
    setCurrentQuestion(0);
    setSelectedAnswers([]);
    setShowResults(false);
    setTimeLeft(30 * 60);
    setExamStarted(false);
    setQuestions([]);
  };

  // Start Exam Screen
  if (!examStarted) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 min-h-screen">
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-2xl mx-auto">
              <Card className="bg-white shadow-xl">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-indigo-400 to-purple-600 flex items-center justify-center text-white mb-4 mx-auto">
                    <Monitor className="h-8 w-8" />
                  </div>
                  <CardTitle className="text-3xl font-bold text-gray-800">ICT Exam</CardTitle>
                  <p className="text-gray-600 mt-2">Test your ICT and Computer Science knowledge</p>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Grade Selection */}
                  <div className="space-y-4">
                    <div className="text-center">
                      <BookOpen className="h-8 w-8 text-indigo-500 mx-auto mb-2" />
                      <h3 className="text-xl font-semibold text-gray-800 mb-2">Select Your Grade Level</h3>
                      <p className="text-gray-600 text-sm">Choose your grade to get age-appropriate questions</p>
                    </div>
                    
                    <Select value={selectedGrade} onValueChange={setSelectedGrade}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Choose your grade (2-10)" />
                      </SelectTrigger>
                      <SelectContent>
                        {gradeOptions.map((grade) => (
                          <SelectItem key={grade.key} value={grade.key}>
                            {grade.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedGrade && (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center justify-between p-4 bg-indigo-50 rounded-lg">
                          <span className="font-medium text-gray-700">Questions:</span>
                          <span className="font-bold text-indigo-600">{questions.length}</span>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                          <span className="font-medium text-gray-700">Time Limit:</span>
                          <span className="font-bold text-green-600">30 minutes</span>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                          <span className="font-medium text-gray-700">Grade Level:</span>
                          <span className="font-bold text-purple-600">{grades[selectedGrade].name}</span>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
                          <span className="font-medium text-gray-700">Subject:</span>
                          <span className="font-bold text-orange-600">ICT / Computer Science</span>
                        </div>
                      </div>
                      
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <h3 className="font-semibold text-yellow-800 mb-2">Instructions:</h3>
                        <ul className="space-y-1 text-sm text-yellow-700">
                          <li>• Read each question carefully before selecting your answer</li>
                          <li>• You can navigate between questions using the Previous/Next buttons</li>
                          <li>• Make sure to submit your exam before time runs out</li>
                          <li>• You can review your answers before submitting</li>
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
                          className="flex-1 bg-gradient-to-r from-indigo-400 to-purple-600 hover:opacity-90"
                          disabled={!selectedGrade}
                        >
                          Start ICT Exam
                        </Button>
                      </div>
                    </>
                  )}

                  {!selectedGrade && (
                    <div className="text-center py-8">
                      <p className="text-gray-500">Please select your grade level to continue</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Results Screen
  if (showResults) {
    const score = calculateScore();
    const percentage = getPercentage();
    const grade = getGrade();

    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-4xl mx-auto shadow-lg">
            <CardHeader className="text-center bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-t-lg">
              <Trophy className="h-12 w-12 mx-auto mb-4" />
              <CardTitle className="text-3xl font-bold mb-2">Exam Results</CardTitle>
              <p className="text-purple-100">ICT / Computer Science Exam Complete</p>
            </CardHeader>
            <CardContent className="p-8">
              <div className="text-center mb-8">
                <div className="text-6xl font-bold text-gray-800 mb-2">
                  {score}/{questions.length}
                </div>
                <div className={`text-4xl font-bold ${grade.color} mb-2`}>
                  {grade.letter} ({percentage}%)
                </div>
                <p className="text-gray-600">
                  {percentage >= 60 ? 'Congratulations! You passed!' : 'Keep studying and try again!'}
                </p>
              </div>

              <div className="space-y-4 mb-8">
                <h3 className="text-xl font-bold text-gray-800">Question Review:</h3>
                {questions.map((question, index) => {
                  const userAnswer = selectedAnswers[index];
                  const isCorrect = userAnswer !== -1 && question.options[userAnswer] === question.correctAnswer;
                  
                  return (
                    <Card key={question.id} className={`border-l-4 ${isCorrect ? 'border-l-green-500 bg-green-50' : 'border-l-red-500 bg-red-50'}`}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          {isCorrect ? (
                            <CheckCircle className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-500 mt-1 flex-shrink-0" />
                          )}
                          <div className="flex-1">
                            <p className="font-medium mb-2">
                              {index + 1}. {question.question}
                            </p>
                            <div className="text-sm space-y-1">
                              <p>
                                <span className="font-medium">Your answer:</span>{' '}
                                <span className={isCorrect ? 'text-green-600' : 'text-red-600'}>
                                  {userAnswer !== -1 ? question.options[userAnswer] : 'No answer'}
                                </span>
                              </p>
                              {!isCorrect && (
                                <p>
                                  <span className="font-medium">Correct answer:</span>{' '}
                                  <span className="text-green-600">{question.correctAnswer}</span>
                                </p>
                              )}
                              <p className="text-gray-600 italic">{question.explanation}</p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              <div className="flex gap-4 justify-center">
                <Button
                  onClick={resetExam}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                >
                  Take Again
                </Button>
                <Button
                  onClick={() => navigate('/exams')}
                  variant="outline"
                >
                  Back to Exams
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Exam Screen
  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Timer and Progress */}
            <Card className="mb-6 bg-white shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Monitor className="h-5 w-5 text-indigo-600" />
                    <span className="font-semibold text-gray-800">ICT Exam</span>
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
                  <span className="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded">
                    ICT
                  </span>
                  <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
                    Grade 5
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
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-900'
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
                    Answered: {selectedAnswers.filter(answer => answer !== -1).length} / {questions.length}
                  </div>
                  
                  {currentQuestion === questions.length - 1 ? (
                    <Button
                      onClick={handleSubmitExam}
                      className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:opacity-90"
                      disabled={selectedAnswers.filter(answer => answer !== -1).length === 0}
                    >
                      Submit Exam
                    </Button>
                  ) : (
                    <Button
                      onClick={handleNextQuestion}
                      className="bg-gradient-to-r from-indigo-400 to-purple-600 hover:opacity-90"
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

export default ICTExam;