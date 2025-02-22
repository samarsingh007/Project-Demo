import React from 'react';
import training from './training.png';

function TrainingHistory() {
  return (
    <div style={{ textAlign: 'center' }}>
        <img 
            src={training}
            alt="Design Placeholder" 
            style={{ maxWidth: '100%', height: 'auto', borderRadius: '10px' }}
        />
    </div>
    );
  }
  
export default TrainingHistory;