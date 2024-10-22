import React, { useState, useEffect, useRef } from 'react';
import './CSS/ChatInterface.css';

const ChatInterface = () => {
  const [messages, setMessages] = useState([
    { text: "Hi, I'm a conversational assistant designed to help.", sender: 'bot' },
  ]);
  const [currentMessage, setCurrentMessage] = useState('');
  const chatBoxRef = useRef(null);

  const sendMessage = () => {
    if (currentMessage.trim() !== '') {
      setMessages([...messages, { text: currentMessage, sender: 'user' }]);
      setCurrentMessage('');
    }
  };

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="chat-section">
      <h2>AI Assitant</h2>
      <div className="chat-box" ref={chatBoxRef}>
        {messages.map((msg, index) => (
          <div key={index} className={`chat-message ${msg.sender}`}>
            {msg.text}
          </div>
        ))}
      </div>
      <div className="input-container">
        <input
          type="text"
          placeholder="Type a message..."
          value={currentMessage}
          onChange={(e) => setCurrentMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              sendMessage();
            }
          }}
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
};

export default ChatInterface;
