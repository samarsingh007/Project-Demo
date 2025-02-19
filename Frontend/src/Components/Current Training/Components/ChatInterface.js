import React, { useState, useEffect, useRef, useCallback } from "react";
import "./CSS/ChatInterface.css";

import BotLogo from "../../../Assets/main-logo.svg";
import VoiceIcon from "../../../Assets/voice.svg";

const ChatInterface = ({
  videoTime,
  videoDuration,
  newVideoUploaded,
  setNewVideoUploaded,
  seekToTime,
  videoId,
}) => {
  const [messages, setMessages] = useState([]);
  const [allMessages, setAllMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [expandedMessages, setExpandedMessages] = useState({});
  const [context, setContext] = useState();
  const [isAwaitingResponse, setIsAwaitingResponse] = useState(false);
  const [messageQueue, setMessageQueue] = useState([]);
  const [isTyping, setIsTyping] = useState(false);

  const processedMessages = useRef(new Set());
  const chatBoxRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const REACT_APP_API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
  const [parentName, setParentName] = useState("");
  const [childName, setChildName] = useState("");

  const fetchMessages = useCallback(async () => {
    if (!context) return;
    if (context === "askParentName" || context === "askChildName") return;

    try {
      const response = await fetch(
        `${REACT_APP_API_BASE_URL}/api/chat/${context}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch messages");
      }
      let data = await response.json();

      if (parentName && childName) {
        data = data.map((msg) => {
          let newText = msg.text;
          newText = newText.replace(/\[Parent’s Name\]/g, parentName);
          newText = newText.replace(/\[Child’s Name\]/g, childName);
          return { ...msg, text: newText };
        });
      }
      setMessages(data);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  }, [context, REACT_APP_API_BASE_URL, parentName, childName]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  useEffect(() => {
    if (messages.length > 0) {
      const newMessages = messages.filter(
        (msg) =>
          !processedMessages.current.has(msg.text + (msg.timestamp || ""))
      );

      newMessages.forEach((msg) => {
        processedMessages.current.add(msg.text + (msg.timestamp || ""));
      });

      setMessageQueue((prevQueue) => [...prevQueue, ...newMessages]);
    }
  }, [messages]);

  useEffect(() => {
    if (!isAwaitingResponse && messageQueue.length > 0 && !isTyping) {
      setIsTyping(true);

      const nextMessage = messageQueue[0];
      typingTimeoutRef.current = setTimeout(() => {
        setAllMessages((prevMessages) => [...prevMessages, nextMessage]);

        if (nextMessage.awaitResponse) {
          setIsAwaitingResponse(true);
        }

        setMessageQueue((prevQueue) => prevQueue.slice(1));
        setIsTyping(false);
      }, 1000);
    }
  }, [messageQueue, isAwaitingResponse, isTyping]);

  useEffect(() => {
    if (newVideoUploaded) {
      const videoUploadMessage = {
        text: "A new video has been successfully uploaded.",
        sender: "bot",
      };

      if (!processedMessages.current.has(videoUploadMessage.text)) {
        processedMessages.current.add(videoUploadMessage.text);
        setAllMessages((prevMessages) => [...prevMessages, videoUploadMessage]);
      }

      setNewVideoUploaded(false);
      setContext("askParentName");
      const askParentMsg = {
        text: "Please enter the parent's name:",
        sender: "bot",
      };
      setAllMessages((prev) => [...prev, askParentMsg]);
      setIsAwaitingResponse(true);
    }
  }, [newVideoUploaded, setNewVideoUploaded]);

  useEffect(() => {
    const initialMessage = {
      text: "Hi, I'm a conversational assistant designed to help.",
      sender: "bot",
    };
    if (!processedMessages.current.has(initialMessage.text)) {
      processedMessages.current.add(initialMessage.text);
      setAllMessages([initialMessage]);
    }
  }, []);

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [allMessages, isTyping]);

  const handleYesClick = () => {
    if (context === "introduction" && isAwaitingResponse) {
      setIsAwaitingResponse(false);
      setContext("LLM");

      const botReplyMsg = {
        text: `First, let’s take a moment to reflect on today’s interaction with ${childName}. What do you think went well?`,
        sender: "bot",
      };

      setAllMessages((prev) => [...prev, botReplyMsg]);
    }
  };

  const sendMessage = async () => {
    const userInput = currentMessage.trim();

    if (userInput !== "") {
      const userMessage = {
        text: userInput,
        sender: "user",
      };

      setAllMessages((prevMessages) => [...prevMessages, userMessage]);
      setCurrentMessage("");
      if (isAwaitingResponse) {
        setIsAwaitingResponse(false);
      }

      if (context === "askParentName") {
        setParentName(userInput);
        setIsTyping(true);
        setTimeout(() => {
          setAllMessages((prev) => [
            ...prev,
            { text: "Please enter the child's name:", sender: "bot" },
          ]);
          setIsTyping(false);
          setContext("askChildName");
          setIsAwaitingResponse(true);
        }, 1000);
      } else if (context === "askChildName") {
        setChildName(userInput);
        setContext("introduction");
      } else if (context === "LLM") {
        try {
          setIsTyping(true);

          const conversationHistory = allMessages.map((msg) => ({
            role: msg.sender === "bot" ? "assistant" : "user",
            content: msg.text,
          }));

          conversationHistory.push({ role: "user", content: userInput });

          const response = await fetch(
            `${REACT_APP_API_BASE_URL}/api/ai-chat`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                videoId,
                conversationHistory,
                context,
                parentName,
                childName,
              }),
            }
          );

          const data = await response.json();
          setIsTyping(false);
          if (data.botReply) {
            setAllMessages((prev) => [
              ...prev,
              { text: data.botReply, sender: "bot" },
            ]);
          }
        } catch (error) {
          console.error("Error calling /api/ai-chat:", error);
          setIsTyping(false);
        }
      }
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60)
      .toString()
      .padStart(2, "0");
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
      <div className="chat-box" ref={chatBoxRef}>
        {allMessages.map((msg, index) => (
          <div key={index} className={`chat-message ${msg.sender} fade-in`}>
            {}
            {msg.sender === "bot" && (
              <img src={BotLogo} alt="Bot" className="bot-avatar" />
            )}

            <div className="message-content">
              {}
              {msg.sender === "bot" && msg.timestamp && (
                <span className="message-timestamp">
                  [
                  <button onClick={() => seekToTime(msg.timestamp)}>
                    {formatTime(msg.timestamp)}
                  </button>
                  ]
                </span>
              )}

              {}
              <span className="message-text">
                {msg.text.length > 210 && !expandedMessages[index] ? (
                  <>
                    {msg.text.substring(0, 210)}...{" "}
                    <button
                      className="toggle-expand-btn"
                      onClick={() => toggleExpandMessage(index)}
                    >
                      Show More
                    </button>
                  </>
                ) : msg.text.length > 210 && expandedMessages[index] ? (
                  <>
                    {msg.text}{" "}
                    <button
                      className="toggle-expand-btn"
                      onClick={() => toggleExpandMessage(index)}
                    >
                      Show Less
                    </button>
                  </>
                ) : (
                  msg.text
                )}
              </span>

              {}
              {msg.awaitResponse &&
                context === "introduction" &&
                isAwaitingResponse && (
                  <button className="response-buttons" onClick={handleYesClick}>
                    Yes
                  </button>
                )}
            </div>
          </div>
        ))}

        {}
        {isTyping && !isAwaitingResponse && (
          <div className="typing-indicator">
            <img src={BotLogo} alt="Bot" className="typing-bot-avatar" />
            <span className="dot"></span>
            <span className="dot"></span>
            <span className="dot"></span>
          </div>
        )}
      </div>

      {}
      <div className="input-container">
        <input
          type="text"
          placeholder="Chat with AI Assistant ..."
          value={currentMessage}
          onChange={(e) => setCurrentMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              sendMessage();
            }
          }}
        />

        {}
        <button className="send-button" onClick={sendMessage}>
          Send
        </button>

        {}
        <button className="voice-button">
          <img src={VoiceIcon} alt="Voice" className="voice-icon" />
        </button>
      </div>
    </div>
  );
};

export default ChatInterface;
