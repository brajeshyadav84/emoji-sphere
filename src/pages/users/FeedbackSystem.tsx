import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { MessageSquare, Send, CheckCircle, Clock, AlertCircle, MessageCircle } from 'lucide-react';
import { useGetFeedbacksQuery, useSubmitFeedbackMutation } from '@/store/api/userApi';

interface FeedbackSystemProps {
  userId: string;
}

const FeedbackSystem: React.FC<FeedbackSystemProps> = ({ userId }) => {
  const { toast } = useToast();
  const { data: feedbacks, isLoading } = useGetFeedbacksQuery(userId);
  const [submitFeedback, { isLoading: isSubmitting }] = useSubmitFeedbackMutation();
  
  const [feedbackForm, setFeedbackForm] = useState({
    type: 'general',
    subject: '',
    message: ''
  });
  const [showForm, setShowForm] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFeedbackForm({
      ...feedbackForm,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!feedbackForm.subject.trim() || !feedbackForm.message.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      await submitFeedback({
        userId,
        type: feedbackForm.type,
        subject: feedbackForm.subject.trim(),
        message: feedbackForm.message.trim()
      }).unwrap();
      
      setFeedbackForm({
        type: 'general',
        subject: '',
        message: ''
      });
      setShowForm(false);
      
      toast({
        title: "Feedback Submitted",
        description: "Thank you for your feedback! We'll review it soon.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'resolved':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'in_progress':
        return <Clock className="h-4 w-4 text-orange-600" />;
      case 'closed':
        return <CheckCircle className="h-4 w-4 text-gray-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-blue-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      open: { variant: 'default' as const, text: 'Open' },
      in_progress: { variant: 'secondary' as const, text: 'In Progress' },
      resolved: { variant: 'default' as const, text: 'Resolved' },
      closed: { variant: 'outline' as const, text: 'Closed' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.open;
    
    if (status === 'resolved') {
      return (
        <Badge variant={config.variant} className="bg-green-100 text-green-800">
          {config.text}
        </Badge>
      );
    }
    
    return (
      <Badge variant={config.variant}>
        {config.text}
      </Badge>
    );
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'bug':
        return '🐛';
      case 'feature':
        return '💡';
      case 'suggestion':
        return '💭';
      default:
        return '💬';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Feedback & Suggestions
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
          <MessageSquare className="h-5 w-5" />
          Feedback & Suggestions
          <Badge variant="outline" className="ml-auto">
            {feedbacks?.length || 0} Submitted
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Submit New Feedback Button */}
        {!showForm && (
          <Button onClick={() => setShowForm(true)} className="w-full flex items-center gap-2">
            <Send className="h-4 w-4" />
            Submit New Feedback
          </Button>
        )}

        {/* Feedback Form */}
        {showForm && (
          <div className="border rounded-lg p-4 bg-gray-50">
            <h4 className="font-medium mb-4 flex items-center gap-2">
              <Send className="h-4 w-4" />
              Submit Feedback
            </h4>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="type">Feedback Type</Label>
                <select
                  id="type"
                  name="type"
                  value={feedbackForm.type}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="general">General Feedback</option>
                  <option value="suggestion">Suggestion</option>
                  <option value="bug">Bug Report</option>
                  <option value="feature">Feature Request</option>
                </select>
              </div>

              <div>
                <Label htmlFor="subject">Subject *</Label>
                <Input
                  id="subject"
                  name="subject"
                  value={feedbackForm.subject}
                  onChange={handleInputChange}
                  placeholder="Brief description of your feedback"
                  required
                />
              </div>

              <div>
                <Label htmlFor="message">Message *</Label>
                <Textarea
                  id="message"
                  name="message"
                  value={feedbackForm.message}
                  onChange={handleInputChange}
                  placeholder="Provide detailed feedback, suggestions, or describe the issue..."
                  rows={4}
                  required
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Feedback Statistics */}
        {feedbacks && feedbacks.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">
                {feedbacks.filter(f => f.status === 'open').length}
              </p>
              <p className="text-sm text-gray-500">Open</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">
                {feedbacks.filter(f => f.status === 'in_progress').length}
              </p>
              <p className="text-sm text-gray-500">In Progress</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {feedbacks.filter(f => f.status === 'resolved').length}
              </p>
              <p className="text-sm text-gray-500">Resolved</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-600">
                {feedbacks.filter(f => f.status === 'closed').length}
              </p>
              <p className="text-sm text-gray-500">Closed</p>
            </div>
          </div>
        )}

        {/* Feedback List */}
        <div className="space-y-3">
          {feedbacks && feedbacks.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No feedback submitted yet</p>
              <p className="text-sm">Share your thoughts and help us improve!</p>
            </div>
          ) : (
            feedbacks
              ?.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
              .map((feedback) => (
                <div key={feedback.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{getTypeIcon(feedback.type)}</span>
                      <div>
                        <h5 className="font-medium">{feedback.subject}</h5>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <span className="capitalize">{feedback.type}</span>
                          <span>•</span>
                          <span>{new Date(feedback.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(feedback.status)}
                      {getStatusBadge(feedback.status)}
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <p className="text-gray-700 text-sm leading-relaxed">
                      {feedback.message}
                    </p>
                  </div>

                  {feedback.adminResponse && (
                    <div className="mt-3 p-3 bg-blue-50 rounded-md border-l-4 border-blue-400">
                      <div className="flex items-center gap-2 mb-2">
                        <MessageCircle className="h-4 w-4 text-blue-600" />
                        <span className="font-medium text-blue-900">Admin Response</span>
                      </div>
                      <p className="text-blue-800 text-sm">{feedback.adminResponse}</p>
                    </div>
                  )}
                </div>
              ))
          )}
        </div>

        {/* Help Text */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">💡 Tips for Better Feedback:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Be specific about the issue or suggestion</li>
            <li>• Include steps to reproduce if reporting a bug</li>
            <li>• Mention which device/browser you're using</li>
            <li>• We typically respond within 24-48 hours</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default FeedbackSystem;