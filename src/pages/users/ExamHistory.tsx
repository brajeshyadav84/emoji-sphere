import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { BookOpen, Trophy, TrendingUp, Calendar, BarChart3 } from 'lucide-react';
import { useGetExamScoresQuery } from '@/store/api/userApi';

interface ExamHistoryProps {
  userId: string;
}

const ExamHistory: React.FC<ExamHistoryProps> = ({ userId }) => {
  const { toast } = useToast();
  const { data: examScores, isLoading } = useGetExamScoresQuery(userId);
  const [selectedExamType, setSelectedExamType] = useState<string>('all');

  const examTypes = examScores ? [...new Set(examScores.map(exam => exam.examType))] : [];
  
  const filteredExams = examScores?.filter(exam => 
    selectedExamType === 'all' || exam.examType === selectedExamType
  ) || [];

  const getScoreColor = (score: number, total: number) => {
    const percentage = (score / total) * 100;
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreBadge = (score: number, total: number) => {
    const percentage = (score / total) * 100;
    if (percentage >= 80) return <Badge className="bg-green-100 text-green-800">Excellent</Badge>;
    if (percentage >= 60) return <Badge className="bg-orange-100 text-orange-800">Good</Badge>;
    return <Badge className="bg-red-100 text-red-800">Needs Improvement</Badge>;
  };

  const calculateStats = () => {
    if (!examScores || examScores.length === 0) return null;

    const totalExams = examScores.length;
    const totalScore = examScores.reduce((sum, exam) => sum + exam.score, 0);
    const totalQuestions = examScores.reduce((sum, exam) => sum + exam.totalQuestions, 0);
    const averagePercentage = (totalScore / totalQuestions) * 100;
    
    const bestExam = examScores.reduce((best, exam) => {
      const currentPercentage = (exam.score / exam.totalQuestions) * 100;
      const bestPercentage = (best.score / best.totalQuestions) * 100;
      return currentPercentage > bestPercentage ? exam : best;
    });

    const examTypeStats = examTypes.map(type => {
      const typeExams = examScores.filter(exam => exam.examType === type);
      const typeScore = typeExams.reduce((sum, exam) => sum + exam.score, 0);
      const typeQuestions = typeExams.reduce((sum, exam) => sum + exam.totalQuestions, 0);
      return {
        type,
        count: typeExams.length,
        percentage: (typeScore / typeQuestions) * 100
      };
    });

    return {
      totalExams,
      averagePercentage,
      bestExam,
      examTypeStats
    };
  };

  const stats = calculateStats();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Exam History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Exam History
          <Badge variant="outline" className="ml-auto">
            {examScores?.length || 0} Exams Taken
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Statistics Overview */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <BarChart3 className="h-5 w-5 text-blue-600" />
                <span className="font-medium">Total Exams</span>
              </div>
              <p className="text-2xl font-bold text-blue-600">{stats.totalExams}</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <span className="font-medium">Average Score</span>
              </div>
              <p className="text-2xl font-bold text-green-600">
                {stats.averagePercentage.toFixed(1)}%
              </p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Trophy className="h-5 w-5 text-yellow-600" />
                <span className="font-medium">Best Score</span>
              </div>
              <p className="text-2xl font-bold text-yellow-600">
                {((stats.bestExam.score / stats.bestExam.totalQuestions) * 100).toFixed(1)}%
              </p>
            </div>
          </div>
        )}

        {/* Subject-wise Performance */}
        {stats && stats.examTypeStats.length > 0 && (
          <div>
            <h4 className="font-medium mb-3">Subject-wise Performance</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {stats.examTypeStats.map((stat) => (
                <div key={stat.type} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium capitalize">{stat.type}</p>
                    <p className="text-sm text-gray-500">{stat.count} exam{stat.count > 1 ? 's' : ''}</p>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${getScoreColor(stat.percentage, 100)}`}>
                      {stat.percentage.toFixed(1)}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filter */}
        {examTypes.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedExamType === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedExamType('all')}
            >
              All Subjects
            </Button>
            {examTypes.map((type) => (
              <Button
                key={type}
                variant={selectedExamType === type ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedExamType(type)}
                className="capitalize"
              >
                {type}
              </Button>
            ))}
          </div>
        )}

        {/* Exam List */}
        <div className="space-y-3">
          {filteredExams.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {examScores?.length === 0 ? (
                <>
                  <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No exams taken yet</p>
                  <p className="text-sm">Start taking exams to see your progress!</p>
                </>
              ) : (
                <p>No exams found for the selected filter</p>
              )}
            </div>
          ) : (
            filteredExams
              .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
              .map((exam) => (
                <div key={exam.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center">
                      <BookOpen className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h5 className="font-medium capitalize">{exam.examType}</h5>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Calendar className="h-4 w-4" />
                        {new Date(exam.completedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-lg font-bold ${getScoreColor(exam.score, exam.totalQuestions)}`}>
                        {exam.score}/{exam.totalQuestions}
                      </span>
                      <span className={`text-sm ${getScoreColor(exam.score, exam.totalQuestions)}`}>
                        ({((exam.score / exam.totalQuestions) * 100).toFixed(1)}%)
                      </span>
                    </div>
                    {getScoreBadge(exam.score, exam.totalQuestions)}
                  </div>
                </div>
              ))
          )}
        </div>

        {/* Recent Achievement */}
        {examScores && examScores.length > 0 && (
          <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              Recent Achievement
            </h4>
            <p className="text-blue-800 text-sm">
              Last exam: <span className="font-medium capitalize">
                {examScores[examScores.length - 1]?.examType}
              </span> - Score: <span className="font-medium">
                {examScores[examScores.length - 1]?.score}/{examScores[examScores.length - 1]?.totalQuestions}
              </span>
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ExamHistory;