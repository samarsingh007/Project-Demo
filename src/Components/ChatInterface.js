import React, { useState, useEffect, useRef } from 'react';
import './CSS/ChatInterface.css';

const ChatInterface = ({ videoTime, videoId, newVideoUploaded, setNewVideoUploaded }) => {
  const [messages] = useState([
    { 
      text: "The parent uses a positive teaching strategy by asking open-ended questions.", 
      sender: 'bot', 
      timestamp: 10
    },
    { 
      text: "The parent did not engage the child when they lost attention. This is negative feedback.", 
      sender: 'bot', 
      timestamp: 25
    },
    { 
      text: "The parent uses positive reinforcement when the child responds correctly.", 
      sender: 'bot', 
      timestamp: 35
    }
  ]);

  const [displayedMessages, setDisplayedMessages] = useState({});
  const [allMessages, setAllMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const chatBoxRef = useRef(null);

  const sendMessage = () => {
    if (currentMessage.trim() !== '') {
      const userMessage = { 
        text: currentMessage, 
        sender: 'user'
      };

      setDisplayedMessages((prevState) => ({
        ...prevState,
        [videoId]: [...(prevState[videoId] || []), userMessage]
      }));
      
      setAllMessages((prevMessages) => [...prevMessages, userMessage]);

      setCurrentMessage('');
    }
  };

  useEffect(() => {
    const initialMessage = {
      text: "Hi, I'm a conversational assistant designed to help.",
      sender: 'bot'
    };
    
    setAllMessages([initialMessage]);
  }, []);

  useEffect(() => {
    if (!videoId) return;

    const currentDisplayedMessages = displayedMessages[videoId] || [];
    const newMessages = messages.filter(
      (msg) => msg.timestamp <= videoTime && !currentDisplayedMessages.includes(msg)
    );

    if (newMessages.length > 0) {
      setDisplayedMessages((prevState) => ({
        ...prevState,
        [videoId]: [...currentDisplayedMessages, ...newMessages]
      }));

      setAllMessages((prevMessages) => [...prevMessages, ...newMessages]);
    }
  }, [videoTime, messages, videoId, displayedMessages]);

  useEffect(() => {
    if (newVideoUploaded) {
      const videoUploadMessage = {
        text: "A new video has been successfully uploaded.",
        sender: 'bot'
      };

      setAllMessages((prevMessages) => [...prevMessages, videoUploadMessage]);

      setNewVideoUploaded(false);
    }
  }, [newVideoUploaded, setNewVideoUploaded]);

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [allMessages]);

  return (
    <div className="chat-section">
      <h2>AI Assistant</h2>
      <div className="chat-box" ref={chatBoxRef}>
        {allMessages.map((msg, index) => (
          <div key={index} className={`chat-message ${msg.sender}`}>
            {msg.sender === 'bot' && msg.timestamp && (
              <span className="message-timestamp">
                [ {new Date(msg.timestamp * 1000).toISOString().substr(14, 5)} ]
              </span>
            )}
            <span className="message-text"> {msg.text}</span>
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
