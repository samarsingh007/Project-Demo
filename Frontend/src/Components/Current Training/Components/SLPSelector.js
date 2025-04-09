import './CSS/SLPSelector.css'
import avatar1 from '../../../Assets/Avatars/avatar1.png';
import avatar2 from '../../../Assets/Avatars/avatar2.png';
import avatar3 from '../../../Assets/Avatars/avatar3.png';
import avatar4 from '../../../Assets/Avatars/avatar4.png';
import avatar5 from '../../../Assets/Avatars/avatar5.png';
import avatar6 from '../../../Assets/Avatars/avatar6.png';

const SLPSelector = ({ onSelect }) => {
    const DUMMY_SLPS = [
      { id: 1, name: "Dr. Emily Brown", avatar: avatar2, expertise: "Fluency Specialist" },
      { id: 2, name: "Mr. John Davis", avatar: avatar1, expertise: "Articulation Coach" },
      { id: 3, name: "Ms. Sophia Lee", avatar: avatar3, expertise: "Language Development" },
      { id: 4, name: "Mrs. Olivia Clark", avatar: avatar6, expertise: "Early Childhood Communication" },
      { id: 5, name: "Mr. Ethan Patel", avatar: avatar4, expertise: "Social Communication" },
      { id: 6, name: "Dr. Ava Rodriguez", avatar: avatar6, expertise: "Cognitive-Communication Disorders" },
      { id: 7, name: "Ms. Lily Thompson", avatar: avatar3, expertise: "Voice Therapy" },
      { id: 8, name: "Mr. Noah Anderson", avatar: avatar5, expertise: "Autism Spectrum Support" },
      { id: 9, name: "Mrs. Grace Kim", avatar: avatar2, expertise: "Hearing & Speech Rehabilitation" },
      { id: 10, name: "Dr. Benjamin Moore", avatar: avatar1, expertise: "Feeding & Swallowing Disorders" },
    ];
  
    return (
      <div className="slp-list-container">
        <div className="slp-list-header">Choose an SLP to chat with</div>
        <div className="slp-list">
          {DUMMY_SLPS.map((slp) => (
            <div key={slp.id} className="slp-list-item" onClick={() => onSelect(slp)}>
                <div className="slp-list-avatar-container">
                  <img src={slp.avatar} alt={slp.name} className="slp-list-avatar" />
                </div>              
                <div className="slp-list-text">
                <div className="slp-list-name">{slp.name}</div>
                <div className="slp-list-expertise">{slp.expertise}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };  

export default SLPSelector;