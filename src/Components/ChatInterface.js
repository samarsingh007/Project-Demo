import React, { useState, useEffect, useRef } from 'react';
import './CSS/ChatInterface.css';

const ChatInterface = ({ videoTime, videoId, newVideoUploaded, setNewVideoUploaded, seekToTime }) => {
  const [messages] = useState([
    { 
      text: "You're effectively following the intervention flowchart steps by establishing joint attention, presenting your strategy, and waiting for at least 3 seconds.", 
      sender: 'bot', 
      timestamp: 25
    },
    { 
      text: "Pay closer attention to non-verbal cues, such as signing or gestures, especially when your child is engaged in activities that may make verbal communication difficult, like being inside a tunnel.", 
      sender: 'bot', 
      timestamp: 31
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

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${minutes}:${secs}`;
  };

  return (
    <div className="chat-section">
      <h2>AI Assistant</h2>
      <div className="chat-box" ref={chatBoxRef}>
        {allMessages.map((msg, index) => (
          <div key={index} className={`chat-message ${msg.sender}`}>
            {msg.sender === 'bot' && msg.timestamp && (
              <span className="message-timestamp">
              [ 
              <button onClick={() => seekToTime(msg.timestamp)}>
                {formatTime(msg.timestamp)}
              </button> 
              ]
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
        <button className="send-button" onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
};

export default ChatInterface;
