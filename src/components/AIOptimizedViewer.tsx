import React, { useState, useEffect } from 'react';

import { FlashcardSet } from '../types';
import '../styles/AIOptimizedViewer.css';

interface AIOptimizedViewerProps {
  flashcardSet: FlashcardSet;
  onReset: () => void;
}

const AIOptimizedViewer: React.FC<AIOptimizedViewerProps> = ({ flashcardSet, onReset }) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [flipped, setFlipped] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'cards' | 'grid' | 'list'>('cards');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filteredCards, setFilteredCards] = useState(flashcardSet.cards);
  const [showStats, setShowStats] = useState<boolean>(false);

  useEffect(() => {
    const filtered = flashcardSet.cards.filter(
      (card) =>
        card.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        card.answer.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCards(filtered);
    setCurrentIndex(0);
  }, [searchTerm, flashcardSet.cards]);

  const handleNext = (): void => {
    if (currentIndex < filteredCards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setFlipped(false);
    }
  };

  const handlePrevious = (): void => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setFlipped(false);
    }
  };

  const handleFlip = (): void => {
    setFlipped(!flipped);
  };

  const handleKeyPress = (e: React.KeyboardEvent): void => {
    if (e.key === 'ArrowLeft') handlePrevious();
    if (e.key === 'ArrowRight') handleNext();
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      handleFlip();
    }
  };

  const exportAsCSV = (): void => {
    const csvContent = [
      ['Question', 'Answer'],
      ...filteredCards.map((card) => [card.question, card.answer]),
    ]
      .map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `${flashcardSet.title.replace(/\s+/g, '_')}_flashcards.csv`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportAsJSON = (): void => {
    const exportData = {
      ...flashcardSet,
      cards: filteredCards,
      exportedAt: new Date().toISOString(),
    };
    const jsonContent = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `${flashcardSet.title.replace(/\s+/g, '_')}_flashcards.json`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const hasCards = filteredCards.length > 0;
  const currentCard = hasCards ? filteredCards[currentIndex] : null;
  const progress = hasCards ? ((currentIndex + 1) / filteredCards.length) * 100 : 0;

  return (
    <div className="ai-optimized-viewer" onKeyDown={handleKeyPress} tabIndex={0}>
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">{flashcardSet.title}</h1>
          <p className="hero-subtitle">AI-Generated Learning Cards</p>
          <div className="hero-stats">
            <div className="stat-item">
              <span className="stat-number">{flashcardSet.cards.length}</span>
              <span className="stat-label">Total Cards</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{filteredCards.length}</span>
              <span className="stat-label">Filtered</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{Math.round(progress)}%</span>
              <span className="stat-label">Progress</span>
            </div>
          </div>
        </div>
        <div className="hero-image">
          <div className="ai-brain-icon">🧠</div>
        </div>
      </div>

      {/* Controls Section */}
      <div className="controls-section">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search flashcards..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <span className="search-icon">🔍</span>
        </div>

        <div className="view-controls">
          <button
            type="button"
            className={`control-btn ${viewMode === 'cards' ? 'active' : ''}`}
            onClick={() => setViewMode('cards')}
          >
            <span className="btn-icon">📱</span>
            Cards
          </button>
          <button
            type="button"
            className={`control-btn ${viewMode === 'grid' ? 'active' : ''}`}
            onClick={() => setViewMode('grid')}
          >
            <span className="btn-icon">⊞</span>
            Grid
          </button>
          <button
            type="button"
            className={`control-btn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
          >
            <span className="btn-icon">📋</span>
            List
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="progress-container">
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <span className="progress-text">
          {hasCards ? `${currentIndex + 1} of ${filteredCards.length}` : 'No cards'}
        </span>
      </div>

      {/* Content Section */}
      <div className="content-section">
        {viewMode === 'cards' && (
          <div className="card-view-modern">
            {hasCards ? (
              <div className="flashcard-container">
                <div
                  className={`modern-flashcard ${flipped ? 'flipped' : ''}`}
                  onClick={handleFlip}
                  role="button"
                  tabIndex={0}
                >
                  <div className="card-inner">
                    <div className="card-front">
                      <div className="card-header">
                        <span className="card-type">Question</span>
                        <span className="card-number">#{currentIndex + 1}</span>
                      </div>
                      <div className="card-content">
                        <p>{currentCard?.question}</p>
                      </div>
                      <div className="card-footer">
                        <span className="flip-hint">Click to reveal answer</span>
                      </div>
                    </div>
                    <div className="card-back">
                      <div className="card-header">
                        <span className="card-type">Answer</span>
                        <span className="card-number">#{currentIndex + 1}</span>
                      </div>
                      <div className="card-content">
                        <p>{currentCard?.answer}</p>
                      </div>
                      <div className="card-footer">
                        <span className="flip-hint">Click to see question</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card-navigation-modern">
                  <button
                    type="button"
                    onClick={handlePrevious}
                    disabled={currentIndex === 0}
                    className="nav-btn prev-btn"
                  >
                    ← Previous
                  </button>
                  <button
                    type="button"
                    onClick={handleNext}
                    disabled={currentIndex === filteredCards.length - 1}
                    className="nav-btn next-btn"
                  >
                    Next →
                  </button>
                </div>
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">📚</div>
                <h3>No flashcards found</h3>
                <p>Try adjusting your search terms or create new flashcards.</p>
              </div>
            )}
          </div>
        )}

        {viewMode === 'grid' && (
          <div className="grid-view">
            {hasCards ? (
              <div className="cards-grid">
                {filteredCards.map((card, index) => (
                  <div
                    key={card.id}
                    className={`grid-card ${index === currentIndex ? 'active' : ''}`}
                    onClick={() => setCurrentIndex(index)}
                  >
                    <div className="grid-card-header">
                      <span className="grid-card-number">#{index + 1}</span>
                    </div>
                    <div className="grid-card-content">
                      <p className="grid-question">{card.question}</p>
                      <p className="grid-answer">{card.answer}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">📚</div>
                <h3>No flashcards found</h3>
                <p>Try adjusting your search terms.</p>
              </div>
            )}
          </div>
        )}

        {viewMode === 'list' && (
          <div className="list-view-modern">
            {hasCards ? (
              <div className="modern-table">
                <div className="table-header">
                  <div className="table-cell">#</div>
                  <div className="table-cell">Question</div>
                  <div className="table-cell">Answer</div>
                </div>
                {filteredCards.map((card, index) => (
                  <div key={card.id} className="table-row">
                    <div className="table-cell">{index + 1}</div>
                    <div className="table-cell">{card.question}</div>
                    <div className="table-cell">{card.answer}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">📚</div>
                <h3>No flashcards found</h3>
                <p>Try adjusting your search terms.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action Section */}
      <div className="action-section">
        <div className="action-buttons">
          <button type="button" onClick={exportAsCSV} className="action-btn export-csv">
            <span className="btn-icon">📊</span>
            Export CSV
          </button>
          <button type="button" onClick={exportAsJSON} className="action-btn export-json">
            <span className="btn-icon">📄</span>
            Export JSON
          </button>
          <button type="button" onClick={onReset} className="action-btn create-new">
            <span className="btn-icon">✨</span>
            Create New
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIOptimizedViewer;
