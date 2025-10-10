import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import { Monitor, Clock, CheckCircle, XCircle, Trophy, Home, Computer, Cpu } from 'lucide-react';
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

const ComputerExam: React.FC = () => {
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
    let timer: NodeJS.Timeout;
    if (examStarted && timeLeft > 0 && !showResults) {
      timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    } else if (timeLeft === 0) {
      handleSubmitExam();
    }
    return () => clearTimeout(timer);
  }, [examStarted, timeLeft, showResults]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartExam = () => {
    if (!selectedGrade) return;
    setExamStarted(true);
    setCurrentQuestion(0);
    setShowResults(false);
  };

  const handleAnswerSelect = (optionIndex: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestion] = optionIndex;
    setSelectedAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmitExam = () => {
    setShowResults(true);
  };

  const calculateScore = () => {
    return selectedAnswers.reduce((score, answerIndex, questionIndex) => {
      if (answerIndex === -1) return score;
      const question = questions[questionIndex];
      const selectedOption = question.options[answerIndex];
      return selectedOption === question.correctAnswer ? score + 1 : score;
    }, 0);
  };

  const getGradeLevel = (score: number, total: number) => {
    const percentage = (score / total) * 100;
    if (percentage >= 90) return { grade: 'A+', color: 'text-green-600', message: 'Excellent!' };
    if (percentage >= 80) return { grade: 'A', color: 'text-green-500', message: 'Great job!' };
    if (percentage >= 70) return { grade: 'B', color: 'text-blue-500', message: 'Good work!' };
    if (percentage >= 60) return { grade: 'C', color: 'text-yellow-500', message: 'Fair performance' };
    return { grade: 'D', color: 'text-red-500', message: 'Need improvement' };
  };

  const restartExam = () => {
    setExamStarted(false);
    setShowResults(false);
    setCurrentQuestion(0);
    setSelectedAnswers(new Array(questions.length).fill(-1));
    setTimeLeft(30 * 60);
    setSelectedGrade('');
  };

  if (!examStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-2xl mx-auto shadow-2xl border-0">
            <CardHeader className="text-center bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Computer className="h-12 w-12" />
                <Cpu className="h-8 w-8" />
              </div>
              <CardTitle className="text-3xl font-bold">Computer Science Exam</CardTitle>
              <p className="text-blue-100 mt-2">Test your ICT knowledge and skills!</p>
            </CardHeader>
            <CardContent className="p-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Select Your Grade Level:
                  </label>
                  <Select value={selectedGrade} onValueChange={setSelectedGrade}>
                    <SelectTrigger className="w-full h-12 text-lg">
                      <SelectValue placeholder="Choose your grade..." />
                    </SelectTrigger>
                    <SelectContent>
                      {gradeOptions.map((grade) => (
                        <SelectItem key={grade.key} value={grade.key} className="text-lg py-3">
                          {grade.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedGrade && (
                  <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                    <h3 className="font-semibold text-lg text-blue-800 mb-3">Exam Information:</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Monitor className="h-5 w-5 text-blue-600" />
                        <span><strong>Questions:</strong> {questions.length}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-blue-600" />
                        <span><strong>Time:</strong> 30 minutes</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-blue-600" />
                        <span><strong>Passing Score:</strong> 60%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Trophy className="h-5 w-5 text-blue-600" />
                        <span><strong>Subject:</strong> Computer Science / ICT</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex gap-4">
                  <Button
                    onClick={handleStartExam}
                    disabled={!selectedGrade}
                    className="flex-1 h-12 text-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  >
                    Start Exam
                  </Button>
                  <Button
                    onClick={() => navigate('/exams')}
                    variant="outline"
                    className="h-12 px-6"
                  >
                    <Home className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (showResults) {
    const score = calculateScore();
    const total = questions.length;
    const gradeInfo = getGradeLevel(score, total);
    const percentage = Math.round((score / total) * 100);

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-4xl mx-auto shadow-2xl border-0">
            <CardHeader className="text-center bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Trophy className="h-12 w-12" />
              </div>
              <CardTitle className="text-3xl font-bold">Exam Results</CardTitle>
              <p className="text-blue-100 mt-2">Computer Science / ICT Exam Complete!</p>
            </CardHeader>
            <CardContent className="p-8">
              <div className="text-center mb-8">
                <div className="text-6xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  {score}/{total}
                </div>
                <div className={`text-4xl font-bold ${gradeInfo.color} mb-2`}>
                  {gradeInfo.grade} ({percentage}%)
                </div>
                <p className="text-xl text-gray-600">{gradeInfo.message}</p>
              </div>

              <div className="space-y-4 mb-8">
                {questions.map((question, index) => {
                  const userAnswerIndex = selectedAnswers[index];
                  const userAnswer = userAnswerIndex !== -1 ? question.options[userAnswerIndex] : 'No answer';
                  const isCorrect = userAnswer === question.correctAnswer;

                  return (
                    <Card key={question.id} className={`border-l-4 ${isCorrect ? 'border-l-green-500 bg-green-50' : 'border-l-red-500 bg-red-50'}`}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          {isCorrect ? (
                            <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0 mt-1" />
                          ) : (
                            <XCircle className="h-6 w-6 text-red-500 flex-shrink-0 mt-1" />
                          )}
                          <div className="flex-1">
                            <p className="font-semibold mb-2">
                              {index + 1}. {question.question}
                            </p>
                            <div className="text-sm space-y-1">
                              <p>
                                <span className="font-medium">Your answer:</span>{' '}
                                <span className={isCorrect ? 'text-green-600' : 'text-red-600'}>
                                  {userAnswer}
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
                  onClick={restartExam}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
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

  const currentQ = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-4xl mx-auto shadow-2xl border-0">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Computer className="h-8 w-8" />
                <div>
                  <CardTitle className="text-2xl">Computer Science Exam</CardTitle>
                  <p className="text-blue-100">Question {currentQuestion + 1} of {questions.length}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2 text-blue-100 mb-2">
                  <Clock className="h-5 w-5" />
                  <span className="text-xl font-mono">{formatTime(timeLeft)}</span>
                </div>
                <div className="text-sm text-blue-200">Time Remaining</div>
              </div>
            </div>
            <Progress value={progress} className="mt-4 bg-blue-500" />
          </CardHeader>
          <CardContent className="p-8">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                {currentQ.question}
              </h2>
              <div className="grid grid-cols-1 gap-4">
                {currentQ.options.map((option, index) => (
                  <Button
                    key={index}
                    onClick={() => handleAnswerSelect(index)}
                    variant={selectedAnswers[currentQuestion] === index ? 'default' : 'outline'}
                    className={`h-auto p-4 text-left justify-start text-wrap ${
                      selectedAnswers[currentQuestion] === index
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white'
                        : 'hover:bg-blue-50'
                    }`}
                  >
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold mr-4 flex-shrink-0">
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span className="flex-1">{option}</span>
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex justify-between items-center">
              <Button
                onClick={handlePrevious}
                disabled={currentQuestion === 0}
                variant="outline"
                className="px-6"
              >
                Previous
              </Button>

              <div className="text-center">
                <p className="text-sm text-gray-500">
                  Answered: {selectedAnswers.filter(a => a !== -1).length} / {questions.length}
                </p>
              </div>

              {currentQuestion === questions.length - 1 ? (
                <Button
                  onClick={handleSubmitExam}
                  className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 px-6"
                >
                  Submit Exam
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 px-6"
                >
                  Next
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ComputerExam;