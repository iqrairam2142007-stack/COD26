import React, { useState } from 'react';
import UnitContent from './UnitContent';
import { units } from '../unitdata'; // This imports your 17 topics

export default function Dashboard() {
  const [selectedUnitId, setSelectedUnitId] = useState(1);

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      {/* Sidebar: Navigation for 17 Units */}
      <nav style={{ width: '250px', background: '#f4f4f4', padding: '20px', borderRight: '1px solid #ddd' }}>
        <h3>COD 26 Curriculum</h3>
        {units.map(unit => (
          <button 
            key={unit.id} 
            onClick={() => setSelectedUnitId(unit.id)}
            style={{ display: 'block', margin: '10px 0', width: '100%' }}
          >
            Unit {unit.id}: {unit.title}
          </button>
        ))}
      </nav>

      {/* Main Content: Deep-Dive Lesson */}
      <main style={{ flex: 1, padding: '20px' }}>
        <UnitContent unitId={selectedUnitId} />
      </main>
    </div>
  );
}

