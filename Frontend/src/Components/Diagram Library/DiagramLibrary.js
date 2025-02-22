import React from 'react';
import diagram from './diagram.png';

function DiagramLibrary() {
  return (
    <div style={{ textAlign: 'center' }}>
        <img 
            src={diagram}
            alt="Design Placeholder" 
            style={{ maxWidth: '100%', height: 'auto', borderRadius: '10px' }}
        />
    </div>
    );
  }
  
export default DiagramLibrary;