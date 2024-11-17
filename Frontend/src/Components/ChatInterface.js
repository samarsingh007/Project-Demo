import React, { useState, useEffect, useRef, useCallback } from 'react';
import './CSS/ChatInterface.css';

const ChatInterface = ({ videoTime, videoId, newVideoUploaded, setNewVideoUploaded, seekToTime, onMessagesUpdate }) => {
  const [messages, setMessages] = useState([]);
  const [allMessages, setAllMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const chatBoxRef = useRef(null);
  const [expandedMessages, setExpandedMessages] = useState({});

  const fetchMessages = useCallback(async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/messages?videoTime=${videoTime}`);
      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }
      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  }, [videoTime]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  useEffect(() => {
    if (messages.length > 0) {
      setAllMessages((prevMessages) => {
        const newMessages = messages.filter(
          (msg) => !prevMessages.some((existing) => existing.text === msg.text && existing.timestamp === msg.timestamp)
        );
        return [...prevMessages, ...newMessages];
      });
      onMessagesUpdate(messages);
    }
  }, [messages, onMessagesUpdate]);

  useEffect(() => {
    if (newVideoUploaded) {
      const videoUploadMessage = {
        text: "A new video has been successfully uploaded.",
        sender: 'bot',
      };
      setAllMessages((prevMessages) => [...prevMessages, videoUploadMessage]);
      setNewVideoUploaded(false);
    }
  }, [newVideoUploaded, setNewVideoUploaded]);

  useEffect(() => {
    const initialMessage = {
      text: "Hi, I'm a conversational assistant designed to help.",
      sender: 'bot',
    };
    setAllMessages([initialMessage]);
  }, []);

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [allMessages]);

  const sendMessage = () => {
    if (currentMessage.trim() !== '') {
      const userMessage = {
        text: currentMessage,
        sender: 'user',
      };
      setAllMessages((prevMessages) => [...prevMessages, userMessage]);
      setCurrentMessage('');
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${minutes}:${secs}`;
  };

  const toggleExpandMessage = (index) => {
    setExpandedMessages((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  return (
    <div className="chat-interface">
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
            <span className="message-text">
              {msg.text.length > 200 && !expandedMessages[index] ? (
                <>
                  {msg.text.substring(0, 200)}...{' '}
                  <button className="toggle-expand-btn" onClick={() => toggleExpandMessage(index)}>
                    Show More
                  </button>
                </>
              ) : msg.text.length > 200 && expandedMessages[index] ? (
                <>
                  {msg.text}{' '}
                  <button className="toggle-expand-btn" onClick={() => toggleExpandMessage(index)}>
                    Show Less
                  </button>
                </>
              ) : (
                msg.text
              )}
            </span>
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
        <button className="send-button" onClick={sendMessage}>
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatInterface;
