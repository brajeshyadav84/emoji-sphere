import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import { BookOpen, Calculator, Beaker, PuzzleIcon, Trophy, Clock, Users, Monitor } from 'lucide-react';

interface Subject {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  questionsCount: number;
  timeLimit: string;
  difficulty: string;
  color: string;
}

const Exams: React.FC = () => {
  const navigate = useNavigate();

  const subjects: Subject[] = [
    {
      id: 'math',
      name: 'Mathematics',
      icon: <Calculator className="h-8 w-8" />,
      description: 'Test your mathematical skills with arithmetic, geometry, and problem-solving questions.',
      questionsCount: 15,
      timeLimit: '20 minutes',
      difficulty: 'Elementary',
      color: 'from-blue-400 to-blue-600'
    },
    {
      id: 'science',
      name: 'Science',
      icon: <Beaker className="h-8 w-8" />,
      description: 'Explore the world of science with questions about nature, space, and how things work.',
      questionsCount: 15,
      timeLimit: '25 minutes',
      difficulty: 'Elementary',
      color: 'from-green-400 to-green-600'
    },
    {
      id: 'english',
      name: 'English',
      icon: <BookOpen className="h-8 w-8" />,
      description: 'Improve your language skills with grammar, vocabulary, and reading comprehension.',
      questionsCount: 15,
      timeLimit: '25 minutes',
      difficulty: 'Elementary',
      color: 'from-purple-400 to-purple-600'
    },
    {
      id: 'puzzles',
      name: 'Puzzles',
      icon: <PuzzleIcon className="h-8 w-8" />,
      description: 'Challenge your mind with fun riddles, patterns, and logical thinking puzzles.',
      questionsCount: 15,
      timeLimit: '30 minutes',
      difficulty: 'Elementary',
      color: 'from-orange-400 to-orange-600'
    },
    {
      id: 'ict',
      name: 'ICT / Computer Science',
      icon: <Monitor className="h-8 w-8" />,
      description: 'Learn about computers, technology, and digital literacy with ICT questions.',
      questionsCount: 25,
      timeLimit: '30 minutes',
      difficulty: 'Elementary',
      color: 'from-indigo-400 to-indigo-600'
    }
  ];

  const handleSubjectClick = (subjectId: string) => {
    navigate(`/exam/${subjectId}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 min-h-screen">
        <div className="container mx-auto px-4 py-8">
          {/* Header Section */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-4">
              <Trophy className="h-10 w-10 text-yellow-500 mr-3" />
              <h1 className="text-4xl font-bold text-gray-800">Student Exams</h1>
            </div>
            <p className="text-lg text-gray-600 mb-8">
              Test your knowledge and challenge yourself with our interactive exams!
            </p>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto mb-8">
              <div className="bg-white rounded-lg shadow-sm p-4">
                <div className="flex items-center justify-center gap-2">
                  <BookOpen className="h-5 w-5 text-blue-500" />
                  <span className="text-sm font-medium text-gray-700">5 Subjects</span>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-4">
                <div className="flex items-center justify-center gap-2">
                  <Clock className="h-5 w-5 text-green-500" />
                  <span className="text-sm font-medium text-gray-700">85 Questions</span>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-4">
                <div className="flex items-center justify-center gap-2">
                  <Users className="h-5 w-5 text-purple-500" />
                  <span className="text-sm font-medium text-gray-700">All Grades</span>
                </div>
              </div>
            </div>
          </div>

          {/* Subjects Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 mx-auto">
            {subjects.map((subject) => (
              <Card 
                key={subject.id} 
                className="hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-[1.02] bg-white border-none shadow-lg"
                onClick={() => handleSubjectClick(subject.id)}
              >
                <CardHeader className="pb-4">
                  <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${subject.color} flex items-center justify-center text-white mb-4 mx-auto`}>
                    {subject.icon}
                  </div>
                  <CardTitle className="text-2xl font-bold text-center text-gray-800">
                    {subject.name}
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <p className="text-gray-600 text-center leading-relaxed">
                    {subject.description}
                  </p>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-700">Questions:</span>
                      <span className="text-sm font-bold text-blue-600">{subject.questionsCount}</span>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-700">Time Limit:</span>
                      <span className="text-sm font-bold text-green-600">{subject.timeLimit}</span>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-700">Difficulty:</span>
                      <span className="text-sm font-bold text-purple-600">{subject.difficulty}</span>
                    </div>
                  </div>
                  
                  <Button 
                    className={`w-full mt-6 bg-gradient-to-r ${subject.color} hover:opacity-90 transition-opacity text-white font-semibold py-3`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSubjectClick(subject.id);
                    }}
                  >
                    Start {subject.name} Exam
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Tips Section */}
          <div className="mt-16 max-w-4xl mx-auto">
            <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-center text-gray-800 flex items-center justify-center gap-2">
                  <Trophy className="h-6 w-6 text-yellow-500" />
                  Exam Tips
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-700">Before Starting:</h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                        Read all instructions carefully
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                        Make sure you have enough time
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                        Find a quiet place to concentrate
                      </li>
                    </ul>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-700">During the Exam:</h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                        Read each question carefully
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                        Take your time to think
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                        Don't worry if you don't know an answer
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Exams;