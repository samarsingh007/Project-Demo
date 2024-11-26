import React, { useState, useEffect, useRef, useCallback } from 'react';
import './CSS/ChatInterface.css';

const ChatInterface = ({ videoTime, videoDuration, newVideoUploaded, setNewVideoUploaded, seekToTime }) => {
  const [messages, setMessages] = useState([]);
  const [allMessages, setAllMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [expandedMessages, setExpandedMessages] = useState({});
  const [context, setContext] = useState();
  const [isAwaitingResponse, setIsAwaitingResponse] = useState(false);
  const [messageQueue, setMessageQueue] = useState([]);
  const processedMessages = useRef(new Set());
  const chatBoxRef = useRef(null);
  const REACT_APP_API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

  const fetchMessages = useCallback(async () => {
    try {
      const response = await fetch(
        `${REACT_APP_API_BASE_URL}/api/chat/${context}?videoTime=${videoTime || 0}`
      );
      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }
      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  }, [context, videoTime, REACT_APP_API_BASE_URL]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  useEffect(() => {
    if (messages.length > 0) {
      const newMessages = messages.filter(
        (msg) => !processedMessages.current.has(msg.text + msg.timestamp)
      );

      newMessages.forEach((msg) => {
        processedMessages.current.add(msg.text + msg.timestamp);
      });

      setMessageQueue((prevQueue) => [...prevQueue, ...newMessages]);
    }
  }, [messages]);

  useEffect(() => {
    if (!isAwaitingResponse && messageQueue.length > 0) {
      const nextMessage = messageQueue[0];
      setAllMessages((prevMessages) => [...prevMessages, nextMessage]);

      if (nextMessage.awaitResponse) {
        setIsAwaitingResponse(true);
      }

      setMessageQueue((prevQueue) => prevQueue.slice(1));
    }
  }, [messageQueue, isAwaitingResponse]);

  useEffect(() => {
    if (newVideoUploaded) {
      const videoUploadMessage = {
        text: "A new video has been successfully uploaded.",
        sender: 'bot',
      };

      if (!processedMessages.current.has(videoUploadMessage.text)) {
        processedMessages.current.add(videoUploadMessage.text);
        setAllMessages((prevMessages) => [...prevMessages, videoUploadMessage]);
      }

      setNewVideoUploaded(false);
      setContext('introduction');
    }
  }, [newVideoUploaded, setNewVideoUploaded]);

  useEffect(() => {
    const initialMessage = {
      text: "Hi, I'm a conversational assistant designed to help.",
      sender: 'bot',
    };

    if (!processedMessages.current.has(initialMessage.text)) {
      processedMessages.current.add(initialMessage.text);
      setAllMessages([initialMessage]);
    }
  }, []);

  useEffect(() => {
    if (context === 'introduction') {
      setContext('selfReflection');
    } else if (context === 'selfReflection' && videoTime > 0) {
      setContext('fidelity');
    } else if (context === 'fidelity' && videoTime >= videoDuration - 1) {
      setContext('problemSolvingDialogue');
    } else if (context === 'problemSolvingDialogue' && videoTime >= videoDuration) {
      setContext('jointPlanning');
    }
  }, [context, videoTime, newVideoUploaded, videoDuration]);

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
      if (isAwaitingResponse) {
        setIsAwaitingResponse(false);
      }
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
              {msg.text.length > 210 && !expandedMessages[index] ? (
                <>
                  {msg.text.substring(0, 210)}...{' '}
                  <button className="toggle-expand-btn" onClick={() => toggleExpandMessage(index)}>
                    Show More
                  </button>
                </>
              ) : msg.text.length > 210 && expandedMessages[index] ? (
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
