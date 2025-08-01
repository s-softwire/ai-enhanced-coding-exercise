import React, { useState } from 'react';

import FlashcardViewer from './components/FlashcardViewer';
import AIOptimizedViewer from './components/AIOptimizedViewer';
import InputForm from './components/InputForm';
import { FlashcardSet } from './types';
import './styles/App.css';

const App: React.FC = () => {
  const [flashcardSet, setFlashcardSet] = useState<FlashcardSet | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [useAIOptimizedView, setUseAIOptimizedView] = useState<boolean>(true);

  return (
    <div className="app-container">
      <header>
        <h1>Flashcard Extractor</h1>
        <p>Extract flashcards from Wikipedia articles or text</p>
        {flashcardSet !== null && (
          <div className="view-toggle">
            <button
              type="button"
              className={!useAIOptimizedView ? 'active' : ''}
              onClick={() => setUseAIOptimizedView(false)}
            >
              Classic View
            </button>
            <button
              type="button"
              className={useAIOptimizedView ? 'active' : ''}
              onClick={() => setUseAIOptimizedView(true)}
            >
              AI-Optimized View
            </button>
          </div>
        )}
      </header>

      <main>
        {flashcardSet === null ? (
          <InputForm
            setFlashcardSet={setFlashcardSet}
            setLoading={setLoading}
            setError={setError}
          />
        ) : (
          useAIOptimizedView ? (
            <AIOptimizedViewer
              flashcardSet={flashcardSet}
              onReset={() => setFlashcardSet(null)}
            />
          ) : (
            <FlashcardViewer
              flashcardSet={flashcardSet}
              onReset={() => setFlashcardSet(null)}
            />
          )
        )}

        {loading === true && <div className="loader">Generating flashcards...</div>}
        {error !== null && <div className="error">{error}</div>}
      </main>

      <footer>
        <p>
          ©
          {' '}
          {new Date().getFullYear()}
          {' '}
          Flashcard Extractor
        </p>
      </footer>
    </div>
  );
};

export default App;
