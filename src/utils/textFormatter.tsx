import React from 'react';
import { ExternalLink } from 'lucide-react';

interface FormattedTextProps {
  text: string;
  onTagClick?: (username: string) => void;
  className?: string;
}

export const FormattedText: React.FC<FormattedTextProps> = ({ text, onTagClick, className = '' }) => {
  if (!text) return null;

  // Regex for matching URLs and @usernames
  // URL matcher
  const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/gi;
  // Username matcher (@word)
  const tagRegex = /(@[a-zA-Z0-9_]+)/g;

  // Split by whitespace or tokens
  const words = text.split(/(\s+)/);

  return (
    <span className={`whitespace-pre-wrap break-words ${className}`}>
      {words.map((word, index) => {
        // Check if word is a URL
        if (word.match(urlRegex)) {
          let href = word;
          if (word.toLowerCase().startsWith('www.')) {
            href = `https://${word}`;
          }
          return (
            <a
              key={index}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-0.5 text-blue-600 dark:text-blue-400 hover:underline font-medium break-all underline-offset-2"
            >
              {word}
              <ExternalLink className="w-3 h-3 inline-block ml-0.5 opacity-80" />
            </a>
          );
        }

        // Check if word is a @tag
        if (word.match(tagRegex)) {
          const cleanUsername = word.replace('@', '');
          return (
            <button
              key={index}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (onTagClick) onTagClick(cleanUsername);
              }}
              className="font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 hover:underline cursor-pointer px-1 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/40 inline-block transition-colors"
            >
              {word}
            </button>
          );
        }

        return <React.Fragment key={index}>{word}</React.Fragment>;
      })}
    </span>
  );
};

// Helper to extract tagged usernames from string
export const extractTaggedUsernames = (text: string): string[] => {
  const matches = text.match(/@[a-zA-Z0-9_]+/g);
  if (!matches) return [];
  return Array.from(new Set(matches.map((tag) => tag.replace('@', ''))));
};
