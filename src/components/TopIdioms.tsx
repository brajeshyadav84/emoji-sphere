import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, BookOpen, Lightbulb, Trophy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import idiomsData from '@/data/idioms.json';

interface Idiom {
  id: number;
  idiom: string;
  meaning: string;
  example: string;
  grade: string;
}

const TopIdioms: React.FC = () => {
  const [featuredIdiom, setFeaturedIdiom] = useState<Idiom | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Get a random featured idiom from all grades
    const allIdioms: Idiom[] = [
      ...idiomsData['grade3-5'],
      ...idiomsData['grade6-8'],
      ...idiomsData['grade9-10']
    ];
    
    const randomIndex = Math.floor(Math.random() * allIdioms.length);
    setFeaturedIdiom(allIdioms[randomIndex]);
  }, []);

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case '3-5':
        return 'bg-green-100 text-green-800 border-green-200';
      case '6-8':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case '9-10':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleShowMore = () => {
    navigate('/idioms');
  };

  if (!featuredIdiom) {
    return (
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-none shadow-lg">
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-full"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-none shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            <CardTitle className="text-lg font-bold text-gray-800">
              📚 Top Idioms
            </CardTitle>
          </div>
          <Badge className={`text-xs font-medium ${getGradeColor(featuredIdiom.grade)}`}>
            Grade {featuredIdiom.grade}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Featured Idiom */}
        <div className="bg-white rounded-lg p-4 border-l-4 border-l-blue-400 shadow-sm">
          <h3 className="text-lg font-bold text-gray-800 mb-2">
            "{featuredIdiom.idiom}"
          </h3>
          
          <div className="flex items-start gap-2 mb-3">
            <Lightbulb className="h-4 w-4 text-yellow-500 mt-1 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-gray-700">Meaning:</p>
              <p className="text-sm text-gray-600">{featuredIdiom.meaning}</p>
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-3 border-l-3 border-l-green-400">
            <p className="text-sm font-medium text-gray-700 mb-1">Example:</p>
            <p className="text-sm text-gray-700 italic">"{featuredIdiom.example}"</p>
          </div>
        </div>

        {/* Show More Button */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <BookOpen className="h-4 w-4" />
            <span>60+ idioms</span>
          </div>
          
          <Button 
            onClick={handleShowMore}
            className="bg-blue-600 hover:bg-blue-700 text-white"
            size="sm"
          >
            Show More
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-200">
          <div className="text-center">
            <div className="text-lg font-bold text-green-600">20</div>
            <div className="text-xs text-gray-500">Easy</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-blue-600">20</div>
            <div className="text-xs text-gray-500">Medium</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-purple-600">20</div>
            <div className="text-xs text-gray-500">Advanced</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TopIdioms;