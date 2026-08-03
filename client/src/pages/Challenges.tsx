import React from 'react';
import { AppNavbar } from '../components/layout/AppNavbar';
import { ChallengeWorkspace } from '../components/challenges/ChallengeWorkspace';

export const Challenges: React.FC = () => {
  return (
    <div className="app-shell flex h-screen flex-col font-sans text-vscode-text">
      <AppNavbar />
      <ChallengeWorkspace />
    </div>
  );
};
