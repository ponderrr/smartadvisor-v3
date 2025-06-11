
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface Question {
  id: string;
  question: string;
  type: 'text' | 'choice';
  choices?: string[];
}

interface QuestionnaireFlowProps {
  contentType: 'movie' | 'book' | 'both';
  userAge: number;
  onComplete: (answers: Record<string, string>) => void;
  onBack: () => void;
}

const QuestionnaireFlow = ({ contentType, userAge, onComplete, onBack }: QuestionnaireFlowProps) => {
  // For MVP, using predefined questions. In full implementation, these would be AI-generated
  const getQuestions = (): Question[] => {
    const baseQuestions = [
      {
        id: 'genre',
        question: `What's your favorite genre in ${contentType === 'both' ? 'movies and books' : contentType === 'movie' ? 'movies' : 'books'}?`,
        type: 'text' as const
      },
      {
        id: 'mood',
        question: 'What kind of mood are you in? Do you want something light and fun, or deep and thought-provoking?',
        type: 'text' as const
      },
      {
        id: 'recent',
        question: `What's a ${contentType === 'both' ? 'movie or book' : contentType} you enjoyed recently and why?`,
        type: 'text' as const
      },
      {
        id: 'length',
        question: contentType === 'movie' ? 'Do you prefer shorter films (under 2 hours) or don\'t mind longer epics?' : 
                  contentType === 'book' ? 'Do you prefer shorter reads or are you up for a longer novel?' :
                  'Do you prefer shorter content or don\'t mind longer experiences?',
        type: 'text' as const
      },
      {
        id: 'themes',
        question: 'Are there any themes or topics you\'re particularly interested in or want to avoid?',
        type: 'text' as const
      }
    ];

    return baseQuestions;
  };

  const [questions] = useState(getQuestions());
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  const handleAnswer = (answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: answer
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      onComplete(answers);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    } else {
      onBack();
    }
  };

  const canProceed = answers[currentQuestion.id]?.trim().length > 0;

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-semibold text-gray-900">
              Question {currentQuestionIndex + 1} of {questions.length}
            </h1>
            <span className="text-sm text-gray-500 capitalize">
              {contentType} recommendation
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-xl">{currentQuestion.question}</CardTitle>
            <CardDescription>
              Take your time to think about your answer. The more details you provide, the better we can tailor our recommendation.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={answers[currentQuestion.id] || ''}
              onChange={(e) => handleAnswer(e.target.value)}
              placeholder="Share your thoughts..."
              className="min-h-32 resize-none"
            />
          </CardContent>
        </Card>

        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Previous</span>
          </Button>

          <Button
            onClick={handleNext}
            disabled={!canProceed}
            className="flex items-center space-x-2"
          >
            <span>
              {currentQuestionIndex === questions.length - 1 ? 'Get Recommendations' : 'Next'}
            </span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default QuestionnaireFlow;
