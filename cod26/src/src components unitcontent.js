import React, { useState } from 'react';
import { units } from '../unitdata';

export default function UnitContent({ unitId }) {
  const [page, setPage] = useState(0);
  const unit = units.find(u => u.id === unitId);

  return (
    <div>
      <h1>{unit.title}</h1>
      <div className="theory-box" style={{ padding: '20px', border: '1px solid #ccc' }}>
        <p>{unit.pages[page]}</p>
      </div>
      
      <div className="controls" style={{ marginTop: '20px' }}>
        <button onClick={() => setPage(p => Math.max(0, p - 1))}>Previous</button>
        <span> Page {page + 1} of 6 </span>
        <button onClick={() => setPage(p => Math.min(5, p + 1))}>Next</button>
      </div>

      {page === 5 && (
        <div className="assessment" style={{ marginTop: '30px' }}>
          <h3>Quiz: {unit.quiz}</h3>
          <h3>Assignment: {unit.assignment}</h3>
        </div>
      )}
    </div>
  );
}