import React, { useState, useEffect, useRef } from 'react';

import { getLLMConfig } from '../config';
import { extractFlashcards } from '../services/llmService';
import { fetchWikipediaContent } from '../services/wikipediaService';
import { FlashcardSet } from '../types';

import { MockModeToggle } from './MockModeToggle';
import '../styles/InputForm.css';

interface InputFormProps {
  setFlashcardSet: React.Dispatch<React.SetStateAction<FlashcardSet | null>>;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
}

const InputForm: React.FC<InputFormProps> = ({ setFlashcardSet, setLoading, setError }) => {
  const [isUrlInput, setIsUrlInput] = useState(true);
  const [input, setInput] = useState('');
  const [useMockMode, setUseMockMode] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const csvFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const savedSetting = localStorage.getItem('use_mock_mode');
    if (savedSetting !== null && savedSetting !== '') {
      setUseMockMode(savedSetting === 'true');
    }
  }, []);

  const isValidWikipediaUrl = (url: string): boolean => {
    try {
      const parsedUrl = new URL(url);
      return (
        parsedUrl.hostname === 'en.wikipedia.org'
        || parsedUrl.hostname === 'wikipedia.org'
      );
    } catch (error) {
      return false;
    }
  };

  const extractTitleFromUrl = (url: string): string => {
    try {
      const parsedUrl = new URL(url);
      const pathParts = parsedUrl.pathname.split('/');
      const title = pathParts[pathParts.length - 1];
      return title.replace(/_/g, ' ');
    } catch (error) {
      return 'Wikipedia Article';
    }
  };

  const handleImportJson = (): void => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0];
    
    // If no file is selected (user canceled), do nothing
    if (!file) {
      return;
    }
    
    if (file.type === 'application/json') {
      const reader = new FileReader();
      reader.onload = (e) => {
        const contents = e.target?.result as string;
        setInput(contents);
        setIsUrlInput(false); // Switch to custom text mode when importing JSON
      };
      reader.readAsText(file);
    } else {
      setError('Please select a valid JSON file');
    }
    
    // Reset the file input
    if (event.target) {
      event.target.value = '';
    }
  };

  const handleImportCsv = (): void => {
    if (csvFileInputRef.current) {
      csvFileInputRef.current.click();
    }
  };

  const handleCsvFileChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0];
    
    // If no file is selected (user canceled), do nothing
    if (!file) {
      return;
    }
    
    if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const contents = e.target?.result as string;
        setInput(contents);
        setIsUrlInput(false); // Switch to custom text mode when importing CSV
      };
      reader.readAsText(file);
    } else {
      setError('Please select a valid CSV file');
    }
    
    // Reset the file input
    if (event.target) {
      event.target.value = '';
    }
  };
  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setError(null);

    if (!input.trim()) {
      setError('Please enter a Wikipedia URL or text');
      return;
    }

    const config = getLLMConfig();

    if (config.defaultApiKey === undefined || config.defaultApiKey === '' || config.defaultApiKey.trim() === '') {
      setError('Please set your API key in LLM Settings');
      return;
    }

    setLoading(true);

    try {
      let content = input;
      let source = 'Custom text';

      if (isUrlInput) {
        if (!isValidWikipediaUrl(input)) {
          setError('Please enter a valid Wikipedia URL');
          setLoading(false);
          return;
        }

        const wikiContent = await fetchWikipediaContent(input);
        content = wikiContent.content;
        source = input;
      }

      const flashcards = await extractFlashcards(content, undefined, useMockMode);

      setFlashcardSet({
        title: isUrlInput ? extractTitleFromUrl(input) : 'Custom Text Flashcards',
        source,
        cards: flashcards,
        createdAt: new Date(),
      });
    } catch (error) {
      setError(`Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="input-form-container">
      <div className="form-header">
        <h2>Generate new flash cards:</h2>
      </div>
      
      <form
        onSubmit={(e): void => {
          handleSubmit(e).catch((_) => { /* Error handled in handleSubmit */ });
        }}
      >
        <div className="input-type-selector">
          <button
            type="button"
            className={isUrlInput === true ? 'active' : ''}
            onClick={(): void => setIsUrlInput(true)}
          >
            Wikipedia URL
          </button>
          <button
            type="button"
            className={isUrlInput === false ? 'active' : ''}
            onClick={(): void => setIsUrlInput(false)}
          >
            Custom Text
          </button>
        </div>

        <div className="form-group">
          <label htmlFor="input">
            {isUrlInput ? 'Wikipedia URL' : 'Text to extract flashcards from'}
          </label>
          <textarea
            id="input"
            value={input}
            onChange={(e): void => setInput(e.target.value)}
            placeholder={
              isUrlInput
                ? 'https://en.wikipedia.org/wiki/Artificial_intelligence'
                : 'Paste your text here...'
            }
            rows={isUrlInput ? 1 : 10}
          />
        </div>

        <MockModeToggle onChange={setUseMockMode} />
        
        <div className="main-action">
          <button className="generate-button" type="submit">Generate Flashcards</button>
        </div>
        
        <div className="divider">
          <span>OR</span>
        </div>
        
        <div className="import-actions">
          <button className="import-json-button" type="button" onClick={handleImportJson}>
            Import from JSON
          </button>
          <button className="import-csv-button" type="button" onClick={handleImportCsv}>
            Import from CSV
          </button>
        </div>
        
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".json"
          style={{ display: 'none' }}
        />
        <input
          type="file"
          ref={csvFileInputRef}
          onChange={handleCsvFileChange}
          accept=".csv"
          style={{ display: 'none' }}
        />
      </form>
    </div>
  );
};

export default InputForm;
