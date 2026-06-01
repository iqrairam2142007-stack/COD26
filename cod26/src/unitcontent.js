// src/components/UnitContent.js
import React, { useState } from 'react';
import { units } from '../unitData';

export default function UnitContent({ unitId }) {
  const [currentPage, setCurrentPage] = useState(0);
  const unit = units.find(u => u.id === unitId);

  return (
    <div className="content-container">
      <h2>{unit.title}</h2>
      
      {/* The 6-page deep dive theory */}
      <div className="theory-box">
        <p>{unit.pages[currentPage]}</p>
      </div>

      {/* Navigation */}
      <button onClick={() => setCurrentPage(p => Math.max(0, p - 1))}>Previous</button>
      <span>Page {currentPage + 1} of 6</span>
      <button onClick={() => setCurrentPage(p => Math.min(5, p + 1))}>Next</button>

      {/* Quiz & Assignment Section */}
      {currentPage === 5 && (
        <div className="task-section">
          <h3>Unit Quiz</h3>
          <p>{unit.quiz[0].question}</p>
          <h3>Assignment</h3>
          <p>{unit.assignment}</p>
        </div>
      )}
    </div>
  );
}