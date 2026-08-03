import React, { useState, useEffect } from 'react';
import MonacoEditor from '@monaco-editor/react';
import { Play, Save, Send, Loader2 } from 'lucide-react';
import { Challenge } from '../../types/challenge';
import { useSavedQueries } from '../../hooks/useSavedQueries';
import { toast } from '../../store/useToastStore';

interface ChallengeEditorProps {
  challenge: Challenge | null;
  query: string;
  setQuery: (val: string) => void;
  canSubmit: boolean;
  onRun: () => Promise<void>;
  onSubmit: () => Promise<void>;
}

export const ChallengeEditor: React.FC<ChallengeEditorProps> = ({
  challenge,
  query,
  setQuery,
  canSubmit,
  onRun,
  onSubmit
}) => {
  const { saveQuery } = useSavedQueries();
  const [isSaving, setIsSaving] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        if (challenge && !isRunning && !isSubmitting) handleRun();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (challenge && !isSaving && query.trim()) handleSave();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [challenge, isRunning, isSubmitting, isSaving, query, onRun, onSubmit]);

  const handleRun = async () => {
    setIsRunning(true);
    await onRun();
    setIsRunning(false);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    await onSubmit();
    setIsSubmitting(false);
  };

  const handleSave = async () => {
    if (!challenge) return;
    setIsSaving(true);
    try {
      await saveQuery({
        title: `${challenge.slug || challenge.title}.sql`,
        query,
        collection: 'Practice',
        notes: `Solution for challenge: ${challenge.title}`,
        challengeId: challenge.id
      });
      toast.success('Query saved to your collection.');
    } catch (error) {
      toast.error('Failed to save query.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="flex h-full min-w-0 flex-col">
      <div className="flex items-center justify-between border-b border-vscode-border bg-[#0d1a28] px-3 py-2">
        <span className="text-sm">solution.sql</span>
        <div className="flex gap-2">
          <button 
            type="button"
            onClick={handleRun} 
            disabled={!challenge || isRunning || isSubmitting} 
            className="secondary-action flex items-center gap-1 px-3 py-1 disabled:opacity-50"
            title="Run Query (Ctrl+Enter)"
          >
            {isRunning ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />}
            {isRunning ? 'Running...' : 'Run'}
          </button>
          
          <button 
            type="button"
            onClick={handleSave} 
            disabled={!challenge || isSaving || !query.trim()} 
            className="secondary-action flex items-center gap-1 px-3 py-1 disabled:opacity-50"
            title="Save Query (Ctrl+S)"
          >
            {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            {isSaving ? 'Saving...' : 'Save'}
          </button>
          
          <button 
            type="button"
            onClick={handleSubmit} 
            disabled={!canSubmit || isSubmitting || !query.trim()} 
            className="primary-action flex items-center gap-1 px-3 py-1 disabled:opacity-50"
          >
            {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
            {isSubmitting ? 'Evaluating...' : 'Submit'}
          </button>
        </div>
      </div>
      <div className="min-h-0 flex-1">
        <MonacoEditor 
          height="100%" 
          language="sql" 
          theme="vs-dark" 
          value={query} 
          onChange={value => setQuery(value || '')} 
          options={{ 
            minimap: { enabled: false }, 
            fontSize: 14, 
            padding: { top: 16 }, 
            scrollBeyondLastLine: false 
          }} 
        />
      </div>
    </section>
  );
};
