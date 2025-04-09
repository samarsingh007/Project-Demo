import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import "./CSS/ChatInterface.css";
import SLPSelector from "./SLPSelector";

import BotLogo from "../../../Assets/main-logo.svg";
// import VoiceIcon from "../../../Assets/voice.svg";
import SLPLogo from "../../../Assets/slp.svg";
import { io } from "socket.io-client";
import { FaArrowLeft } from "react-icons/fa";

const ChatInterface = ({
  videoTime,
  videoDuration,
  newVideoUploaded,
  setNewVideoUploaded,
  seekToTime,
  videoId,
  profile,
  isGuest,
  refreshTrigger,
}) => {
  const [aiMessages, setAiMessages] = useState([]);
  const [slpConversations, setSlpConversations] = useState({});
  const [currentMessage, setCurrentMessage] = useState("");
  const [chatMode, setChatMode] = useState("ai");
  const [senderRole, setSenderRole] = useState("bot");
  const [messages, setMessages] = useState([]);
  const [messageQueue, setMessageQueue] = useState([]);
  const [context, setContext] = useState("base");
  const [isAwaitingResponse, setIsAwaitingResponse] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [parentName, setParentName] = useState("");
  const [childName, setChildName] = useState("");
  const [selectedSlp, setSelectedSlp] = useState(null);

  const processedMessages = useRef(new Set());
  const typingTimeoutRef = useRef(null);

  const chatBoxRef = useRef(null);

  const REACT_APP_API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

  const displayedMessages = useMemo(() => {
    if (chatMode === "ai") return aiMessages;
    if (selectedSlp) return slpConversations[selectedSlp.id] || [];
    return [];
  }, [chatMode, aiMessages, selectedSlp, slpConversations]);
  
  useEffect(() => {
    const socket = io(REACT_APP_API_BASE_URL, {});

    socket.on("new_assistant_message", (data) => {
      if (data.videoId === videoId) {
        setAiMessages((prev) => [
          ...prev,
          { text: data.message, sender: "bot" },
        ]);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [videoId, REACT_APP_API_BASE_URL]);

  useEffect(() => {
    if (isGuest) {
      const storedParentName = sessionStorage.getItem("guest_parent_name");
      const storedChildName = sessionStorage.getItem("guest_child_name");

      if (storedParentName) setParentName(storedParentName);
      if (storedChildName) setChildName(storedChildName);
    } else if (profile) {
      if (profile?.parent_name) setParentName(profile.parent_name);
      if (profile?.child_name) setChildName(profile.child_name);
    }
  }, [profile, isGuest, refreshTrigger]);

  useEffect(() => {
    if (chatMode === "ai" && aiMessages.length === 0) {
      const defaultAiMsg = {
        text: "Hi, I'm a conversational assistant designed to help. Upload a video in the 'Review' tab, then let's reflect on your interactions.",
        sender: senderRole,
      };
      setAiMessages([defaultAiMsg]);
    }
  }, [chatMode, aiMessages.length, slpConversations, senderRole, selectedSlp]);

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
  }, [context, parentName, childName, REACT_APP_API_BASE_URL]);

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
        setAiMessages((prevMessages) => [...prevMessages, nextMessage]);

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
          sender: senderRole,
        };
        if (!processedMessages.current.has(videoUploadMessage.text)) {
          processedMessages.current.add(videoUploadMessage.text);
          setAiMessages((prev) => [...prev, videoUploadMessage]);
        }
        if (!parentName.trim() || !childName.trim()) {
          setContext("askParentName");
          const askParentMsg = {
            text: "Please enter the parent's name:",
            sender: senderRole,
          };
          setAiMessages((prev) => [...prev, askParentMsg]);
          setIsAwaitingResponse(true);
        } else {
          setContext("introduction");
          return;
        }

      if (chatMode === "slp" && selectedSlp) {
        appendToSlp(selectedSlp.id, {
          text: "A new video has been uploaded (SLP mode).",
          sender: senderRole,
          });
      }
      setNewVideoUploaded(false);
    }
  }, [
    newVideoUploaded,
    setNewVideoUploaded,
    selectedSlp,
    chatMode,
    senderRole,
    parentName,
    childName,
  ]);

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [displayedMessages, isTyping]);

  const handleYesClick = () => {
    if (context === "introduction" && isAwaitingResponse) {
      setIsAwaitingResponse(false);
      setContext("LLM");
      const botReplyMsg = {
        text: `First, let’s take a moment to reflect on today’s interaction with ${childName}. What specific interactions or moments felt most positive with ${childName}? Why do you think those worked well?`,
        sender: "bot",
      };
      setAiMessages((prev) => [...prev, botReplyMsg]);
    }
  };

  const handleSkipClick = async () => {
    if (chatMode === "slp") return;

    const skippedMessage = { text: "[Skipped]", sender: "user" };
    setAiMessages((prev) => [...prev, skippedMessage]);

    setIsAwaitingResponse(false);
    setIsTyping(true);

    try {
      const conversationHistory = [...aiMessages, skippedMessage].map(
        (msg) => ({
          role: msg.sender === "bot" ? "assistant" : "user",
          content: msg.text,
        })
      );
      const userId = profile ? profile.id : null;
      const response = await fetch(`${REACT_APP_API_BASE_URL}/api/ai-chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          videoId,
          conversationHistory,
          context,
          parentName,
          childName,
          userId,
        }),
      });

      const data = await response.json();
      setIsTyping(false);

      if (data.botReply) {
        setAiMessages((prev) => [
          ...prev,
          { text: data.botReply, sender: "bot" },
        ]);
      }
    } catch (error) {
      console.error("Error calling /api/ai-chat:", error);
      setIsTyping(false);
    }
  };

  const sendMessage = async () => {
    const userInput = currentMessage.trim();
    if (!userInput) return;

    const userMessage = { text: userInput, sender: "user" };
    if (chatMode === "ai") {
      setAiMessages((prev) => [...prev, userMessage]);
    } else {
      appendToSlp(selectedSlp.id, userMessage);
    }
    setCurrentMessage("");

    if (isAwaitingResponse && chatMode === "ai") {
      setIsAwaitingResponse(false);
    }

    if (chatMode === "slp" && selectedSlp) {
      setIsTyping(true);
      setTimeout(async () => {
        const slpReply = {
          text: "I have received your message and will respond soon!",
          sender: senderRole,
        };
        appendToSlp(selectedSlp.id, slpReply);
        setIsTyping(false);
        const conversationHistory = [
          { role: "user-slp", content: userInput },
          { role: "slp", content: slpReply.text },
        ];

        try {
          const userId = profile ? profile.id : null;
          await fetch(`${REACT_APP_API_BASE_URL}/api/slp-chat`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              videoId,
              conversationHistory,
              userId,
            }),
          });
        } catch (error) {
          console.error("Error sending SLP chat:", error);
        }
      }, 1000);
      return;
    }

    if (context === "askParentName") {
      setParentName(userInput);
      setIsTyping(true);

      setTimeout(() => {
        const askChildMsg = {
          text: "Please enter the child's name:",
          sender: senderRole,
        };
        setAiMessages((prev) => [...prev, askChildMsg]);

        setIsTyping(false);
        setContext("askChildName");
        setIsAwaitingResponse(true);
      }, 1000);

      return;
    } else if (context === "askChildName") {
      setChildName(userInput);
      setContext("introduction");
      return;
    } else if (context !== "askParentName" && context !== "askChildName") {
      try {
        setIsTyping(true);

        const conversationHistory = aiMessages.map((msg) => ({
          role: msg.sender === "bot" ? "assistant" : "user",
          content: msg.text,
        }));
        conversationHistory.push({ role: "user", content: userInput });
        const userId = profile ? profile.id : null;
        const response = await fetch(`${REACT_APP_API_BASE_URL}/api/ai-chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            videoId,
            conversationHistory,
            context,
            parentName,
            childName,
            userId,
          }),
        });

        const data = await response.json();
        setIsTyping(false);

        if (data.botReply) {
          setAiMessages((prev) => [
            ...prev,
            { text: data.botReply, sender: "bot" },
          ]);
        }
      } catch (error) {
        console.error("Error calling /api/ai-chat:", error);
        setIsTyping(false);
      }
    }
  };

  const handleSelectSlp = (slp) => {
    setSelectedSlp(slp);
    setSenderRole("slp");
  
    setSlpConversations((prev) => {
      if (prev[slp.id]) return prev;
      const greeting = {
        text: `Hello, I'm ${slp.name}. Let me know how I can help you today!`,
        sender: "slp",
      };
      return { ...prev, [slp.id]: [greeting] };
    });
  };

  const appendToSlp = (slpId, newMsg) =>
    setSlpConversations((prev) => ({
      ...prev,
      [slpId]: [...(prev[slpId] || []), newMsg],
    }));
  
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60)
      .toString()
      .padStart(2, "0");
    return `${minutes}:${secs}`;
  };

  const [expandedMessages, setExpandedMessages] = useState({});
  const toggleExpandMessage = (index) => {
    setExpandedMessages((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  return (
    <div className="chat-interface">
      <div className="chat-mode-toggle">
        <input
          type="radio"
          id="chat-ai"
          name="chatMode"
          value="ai"
          checked={chatMode === "ai"}
          onChange={() => {
            setChatMode("ai");
            setSenderRole("bot");
          }}
        />
        <label htmlFor="chat-ai">Chat with AI</label>

        <input
          type="radio"
          id="chat-slp"
          name="chatMode"
          value="slp"
          checked={chatMode === "slp"}
          onChange={() => {
            setChatMode("slp");
            setSenderRole("slp");
            setSelectedSlp(null);
          }}
        />
        <label htmlFor="chat-slp">Chat with SLP</label>
      </div>
      {chatMode === "slp" && !selectedSlp ? (
         <SLPSelector onSelect={handleSelectSlp} />
        ) : (
          <>
          {chatMode === "slp" && selectedSlp && (
          <div className="slp-chat-header">
            <button className="back-button-slp" onClick={() => setSelectedSlp(null)}>
              <FaArrowLeft className="back-icon" />
              Back
            </button>
            <span className="slp-name-header">{selectedSlp.name}</span>
          </div>
        )}
        <div className="chat-box" ref={chatBoxRef}>
        {displayedMessages.map((msg, index) => (
          <div key={index} className={`chat-message ${msg.sender} fade-in`}>
            {msg.sender === "bot" ? (
              <img src={BotLogo} alt="Bot" className="bot-avatar" />
            ) : msg.sender === "slp" ? (
              <div className="slp-chat-avatar-container">
              <img src={selectedSlp?.avatar} alt={selectedSlp?.name} className="slp-chat-avatar" />
              </div>
            ) : null}
            <div className={`message-content ${msg.sender}`}>
              {msg.sender === "bot" && msg.timestamp && (
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

        {isTyping && !isAwaitingResponse && (
          <div className="typing-indicator">
            {chatMode === "ai" ? (
              <img src={BotLogo} alt="Bot" className="bot-avatar" />
            ) : (
              <img src={SLPLogo} alt="Bot" className="slp-avatar" />
            )}
            <span className="dot"></span>
            <span className="dot"></span>
            <span className="dot"></span>
          </div>
        )}
        </div>

        <div className="input-container">
        <input
          type="text"
          placeholder={
            chatMode === "ai"
              ? "Ask the AI Assistant..."
              : selectedSlp
              ? `Message ${selectedSlp.name}...`
              : "Select an SLP first..."
          }
          value={currentMessage}
          onChange={(e) => setCurrentMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") sendMessage();
          }}
          disabled={chatMode === "slp" && !selectedSlp}
        />

        {chatMode === "ai" && context === "LLM" && (
          <button className="skip-button" onClick={handleSkipClick}>
            Skip
          </button>
        )}

        <button className="send-button" onClick={sendMessage} disabled={chatMode === "slp" && !selectedSlp}>
          Send
        </button>

        {/* <button className="voice-button">
          <img src={VoiceIcon} alt="Voice" className="voice-icon" />
        </button> */}
        </div>
        </>
      )}
    </div>
  );
};

export default ChatInterface;
