import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, BookOpen, Lightbulb } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Header from '@/components/Header';
import idiomsData from '@/data/idioms.json';

interface Idiom {
  id: number;
  idiom: string;
  meaning: string;
  example: string;
  grade: string;
}

const Idioms: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [idioms, setIdioms] = useState<Idiom[]>([]);
  const itemsPerPage = 15;

  useEffect(() => {
    // Combine all idioms from different grades
    const allIdioms: Idiom[] = [
      ...idiomsData['grade3-5'],
      ...idiomsData['grade6-8'],
      ...idiomsData['grade9-10']
    ];

    if (selectedGrade === 'all') {
      setIdioms(allIdioms);
    } else {
      const gradeKey = selectedGrade as keyof typeof idiomsData;
      setIdioms(idiomsData[gradeKey] || []);
    }
    setCurrentPage(1); // Reset to first page when grade changes
  }, [selectedGrade]);

  const totalPages = Math.ceil(idioms.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentIdioms = idioms.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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

  const renderPagination = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <Button
          key={i}
          variant={currentPage === i ? 'default' : 'outline'}
          size="sm"
          onClick={() => handlePageChange(i)}
          className="mx-1"
        >
          {i}
        </Button>
      );
    }

    return (
      <div className="flex items-center justify-center space-x-2 mt-8">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>
        
        {startPage > 1 && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(1)}
            >
              1
            </Button>
            {startPage > 2 && <span className="px-2">...</span>}
          </>
        )}
        
        {pages}
        
        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && <span className="px-2">...</span>}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(totalPages)}
            >
              {totalPages}
            </Button>
          </>
        )}
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-4">
        <div className="mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <BookOpen className="h-8 w-8 text-blue-600 mr-2" />
            <h1 className="text-4xl font-bold text-gray-800">Learning Idioms</h1>
          </div>
          <p className="text-lg text-gray-600 mb-6">
            Discover the fascinating world of idioms for students from Grade 3 to Grade 10
          </p>
          
          {/* Grade Filter */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <label className="text-sm font-medium text-gray-700">Filter by Grade:</label>
            <Select value={selectedGrade} onValueChange={setSelectedGrade}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select grade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Grades</SelectItem>
                <SelectItem value="grade3-5">Grade 3-5</SelectItem>
                <SelectItem value="grade6-8">Grade 6-8</SelectItem>
                <SelectItem value="grade9-10">Grade 9-10</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Stats */}
          <div className="bg-white rounded-lg shadow-sm p-4 inline-block">
            <div className="flex items-center gap-6 text-sm text-gray-600">
              <span>Total Idioms: <strong className="text-blue-600">{idioms.length}</strong></span>
              <span>Page: <strong className="text-purple-600">{currentPage} of {totalPages}</strong></span>
              <span>Showing: <strong className="text-green-600">{startIndex + 1}-{Math.min(startIndex + itemsPerPage, idioms.length)}</strong></span>
            </div>
          </div>
        </div>

        {/* Idioms Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
          {currentIdioms.map((idiom) => (
            <Card key={idiom.id} className="hover:shadow-lg transition-shadow duration-300 bg-white border-l-4 border-l-blue-400">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg font-bold text-gray-800 leading-tight">
                    "{idiom.idiom}"
                  </CardTitle>
                  <Badge className={`ml-2 text-xs font-medium ${getGradeColor(idiom.grade)}`}>
                    Grade {idiom.grade}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-2">
                  <Lightbulb className="h-4 w-4 text-yellow-500 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Meaning:</p>
                    <p className="text-sm text-gray-600">{idiom.meaning}</p>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-3 border-l-3 border-l-green-400">
                  <p className="text-sm font-medium text-gray-700 mb-1">Example:</p>
                  <p className="text-sm text-gray-700 italic">"{idiom.example}"</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {currentIdioms.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-700 mb-2">No idioms found</h3>
            <p className="text-gray-500">Try selecting a different grade filter.</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && renderPagination()}
        
        {/* Footer Info */}
        <div className="text-center mt-12 py-8 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            Learning idioms helps improve language skills and cultural understanding.
            <br />
            Keep practicing and soon these expressions will become second nature!
          </p>
        </div>
        </div>
      </div>
    </div>
  );
};

export default Idioms;