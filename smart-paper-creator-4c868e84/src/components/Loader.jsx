import React from 'react';
import { Brain, Sparkles } from 'lucide-react';

const messages = [
  'Analyzing syllabus content...',
  'Processing previous question patterns...',
  'Identifying key topics and units...',
  'Generating intelligent exam questions...',
  'Calibrating difficulty levels...',
  'Formatting question paper...',
];

export default function AILoader({ progress = 0 }) {
  const messageIndex = Math.min(Math.floor(progress / (100 / messages.length)), messages.length - 1);

  return (
    <div className="flex flex-col items-center justify-center py-16 animate-fade-in">
      {/* Animated brain icon */}
      <div className="relative mb-8">
        <div className="w-24 h-24 rounded-full ai-gradient-bg flex items-center justify-center animate-pulse-glow">
          <Brain className="w-12 h-12 text-primary-foreground" />
        </div>
        <div className="absolute -top-2 -right-2">
          <Sparkles className="w-6 h-6 text-accent animate-float" />
        </div>
      </div>

      {/* Status text */}
      <p className="text-lg font-heading font-semibold text-foreground mb-2">
        AI is Working
      </p>
      <p className="text-sm text-muted-foreground mb-6 transition-all duration-500" key={messageIndex}>
        {messages[messageIndex]}
      </p>

      {/* Progress bar */}
      <div className="w-80 max-w-full">
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full ai-gradient-bg rounded-full transition-all duration-700 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground text-center mt-2">{Math.round(progress)}%</p>
      </div>
    </div>
  );
}
