import SLPLogo from '../../../Assets/slp.svg'
import './CSS/SLPSelector.css'

const SLPSelector = ({ onSelect }) => {
    const DUMMY_SLPS = [
      { id: 1, name: "Dr. Emily Brown", avatar: SLPLogo, expertise: "Fluency Specialist" },
      { id: 2, name: "Mr. John Davis", avatar: SLPLogo, expertise: "Articulation Coach" },
      { id: 3, name: "Ms. Sophia Lee", avatar: SLPLogo, expertise: "Language Development" },
      { id: 4, name: "Mrs. Olivia Clark", avatar: SLPLogo, expertise: "Early Childhood Communication" },
      { id: 5, name: "Mr. Ethan Patel", avatar: SLPLogo, expertise: "Social Communication" },
      { id: 6, name: "Dr. Ava Rodriguez", avatar: SLPLogo, expertise: "Cognitive-Communication Disorders" },
      { id: 7, name: "Ms. Lily Thompson", avatar: SLPLogo, expertise: "Voice Therapy" },
      { id: 8, name: "Mr. Noah Anderson", avatar: SLPLogo, expertise: "Autism Spectrum Support" },
      { id: 9, name: "Mrs. Grace Kim", avatar: SLPLogo, expertise: "Hearing & Speech Rehabilitation" },
      { id: 10, name: "Dr. Benjamin Moore", avatar: SLPLogo, expertise: "Feeding & Swallowing Disorders" },
    ];
  
    return (
      <div className="slp-list-container">
        <div className="slp-list-header">Choose an SLP to chat with</div>
        <div className="slp-list">
          {DUMMY_SLPS.map((slp) => (
            <div key={slp.id} className="slp-list-item" onClick={() => onSelect(slp)}>
              <img src={slp.avatar} alt={slp.name} className="slp-list-avatar" />
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