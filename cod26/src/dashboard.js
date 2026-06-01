 // src/components/Dashboard.js
import React, { useState } from 'react';
import UnitContent from './UnitContent';
import QuizSection from './QuizSection';
import Competition from './Competition';
import ProjectSubmission from './ProjectSubmission';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('learn');

  return (
    <div className="dashboard-container">
      <nav className="sidebar">
        <button onClick={() => setActiveTab('learn')}>Curriculum</button>
        <button onClick={() => setActiveTab('quiz')}>Individual Quiz</button>
        <button onClick={() => setActiveTab('compete')}>Compete</button>
        <button onClick={() => setActiveTab('project')}>Projects</button>
      </nav>

      <main className="content">
        {activeTab === 'learn' && <UnitContent />}
        {activeTab === 'quiz' && <QuizSection />}
        {activeTab === 'compete' && <Competition />}
        {activeTab === 'project' && <ProjectSubmission />}
      </main>
    </div>
  );
}