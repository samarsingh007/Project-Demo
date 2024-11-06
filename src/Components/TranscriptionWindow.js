import React, { useEffect, useState } from 'react';
import './CSS/TranscriptionWindow.css';

const transcriptions = [
  { timestamp: 8, text: "What is that?" },
  { timestamp: 9, text: "That's the question." },
  { timestamp: 12, text: "So I think she was already telling you like something about the monkey because she's signing it, but maybe you didn't catch it in the tunnel." },
  { timestamp: 20, text: "I love it. Now you've waited long enough, just like from the flow chart steps, and you repeated the same question because the steps as, have joint attention, present your strategy, wait at least 3 seconds, and then your feedback will go on to two different branches. One, you get a correct response, you acknowledge it. If you don't get a response or you get an incorrect response, you repeat the same exact question one more time." },
  { timestamp: 40, text: "Now she's both gesturing and vocalizing. Here you go. See, you asked the same question two times, and now she was able to articulate it in a better way. I will accept her response in the first one. It wasn't clear, it probably wasn't clear to you either, but you repeated the same question to get that. So because that's what the flow chart says if you get no response or you get an incorrect response, you go through the same one more time." },
  { timestamp: 65, text: "So she signed monkey the first response, but she said a different word. And then she said the word stop, stop, stop, or said something similar to that. And I think I don't know if she was getting off task or she was thinking of something else, but I knew at the time, okay, we're close, we're almost there, but that's not the correct response." },
  { timestamp: 85, text: "Hey, what are those?" },
  { timestamp: 90, text: "Oh yeah, what are those?" },
  { timestamp: 100, text: "Again, the reason I'm showing this because I really like that. You did the right thing. You asked the same you asked the question, what are those? She is not responding really." },
  { timestamp: 110, text: "And it's very good. You waited at least, I think I believe about three seconds right around there. And then you repeated the exact same question. Remember, the key is to ask the exact same question without changing it. Because once you change the question, although with good intentions to kind of clarify it, now we're losing where the question is different and the response might be different too." },
  { timestamp: 130, text: "Yeah, they are shoes. So what are those? Shoes." },
  { timestamp: 145, text: "My point here is, sometimes children will not respond to you in your first question because they may need some time to process, positively. And they may need that same question one more time because it kind of helps them understand that there's a question and then I need to think about the answer or I need to think about your response and how I'll respond." },
  { timestamp: 180, text: "Same thing in modeling. Let's say you were modeling shoes, not asking a question about shoes. You just literally say, shoes. [pause 3 seconds] No response. Shoes. [pause 3 seconds] No response. Shoes and I'll move on. But if you said shoes, [pause 3 seconds] no response. Shoes. And she imitates and says, shoes. Yes, shoes. This is how I will respond." },
  { timestamp: 200, text: "So same idea with modeling and men model while the same idea, same amount of waiting in terms of three seconds." },
  { timestamp: 240, text: "So remember one of the steps, the step one in asking a question or modeling something is to have joined the thing attention. That's one example of no joint attention. Because she physically shows no interest. That's clearly there's no joint attention." },
  { timestamp: 270, text: "We see what does he do that?" },
  { timestamp: 290, text: "So I will not ask that question at that moment. It happens with me, it happens with everyone. I will just, that's an example that I just saw. I'm like, oh, I should point it out and let them in and out." },
  { timestamp: 310, text: "Oh, I should point it out and let them in and out. Like I wouldn't ask it once you're right there. Instead, I will probably focus on getting her attention back." },
  { timestamp: 330, text: "So I was using it incorrectly. I was trying, I was attempting to use the man modeling as an attention was this, which is not one of the strategies." },
];


const TranscriptionWindow = ({ videoTime }) => {
  const [activeTranscription, setActiveTranscription] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const currentTranscription = transcriptions
      .filter((transcription) => transcription.timestamp <= videoTime)
      .pop();

    if (currentTranscription) {
      setActiveTranscription(currentTranscription.text);
    } else {
      setActiveTranscription("No transcription available");
    }
  }, [videoTime]);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <div className="transcription-window">
      <div className="transcription-header">
        <h2>Transcriptions</h2>
        <button className="view-full-btn" onClick={openModal}>View Full</button>
      </div>
      <p>{activeTranscription}</p>

      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Full Transcription</h2>
            {transcriptions.map((t, index) => (
              <p key={index}>{t.text}</p>
            ))}
            <button className="close-modal-btn" onClick={closeModal}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TranscriptionWindow;
