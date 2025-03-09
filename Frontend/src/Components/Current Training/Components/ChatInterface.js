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
  // ------------------------------
  // Separate message states
  // ------------------------------
  const [aiMessages, setAiMessages] = useState([]);
  const [slpMessages, setSlpMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState("");

  // This is the mode toggle: "ai" or "slp"
  const [chatMode, setChatMode] = useState("ai");

  // For AI-specific usage
  const [messages, setMessages] = useState([]); // pulled from /api/chat/:context
  const [messageQueue, setMessageQueue] = useState([]);
  const [context, setContext] = useState();
  const [isAwaitingResponse, setIsAwaitingResponse] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  // For name placeholders
  const [parentName, setParentName] = useState("");
  const [childName, setChildName] = useState("");

  // For tracking processed messages
  const processedMessages = useRef(new Set());
  const typingTimeoutRef = useRef(null);

  // Access to the chat container for auto-scroll
  const chatBoxRef = useRef(null);

  const REACT_APP_API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

  // ------------------------------------------------------------------
  // 1) "Display" the right message array for the current chatMode
  // ------------------------------------------------------------------
  const displayedMessages = chatMode === "ai" ? aiMessages : slpMessages;

  // ------------------------------------------------------------------
  // 2) Provide different default messages for AI vs. SLP
  //    We'll inject them once when we switch modes — if that mode’s
  //    array is still empty.
  // ------------------------------------------------------------------
  useEffect(() => {
    if (chatMode === "ai" && aiMessages.length === 0) {
      const defaultAiMsg = {
        text: "Hi, I'm the AI Assistant! Please upload a video and I'll help you reflect on your interactions.",
        sender: "bot",
      };
      setAiMessages([defaultAiMsg]);
    } else if (chatMode === "slp" && slpMessages.length === 0) {
      const defaultSlpMsg = {
        text: "Hello, I'm your SLP (a human). Let me know how I can help you today!",
        sender: "bot",
      };
      setSlpMessages([defaultSlpMsg]);
    }
  }, [chatMode, aiMessages.length, slpMessages.length]);

  // ------------------------------------------------------------------
  // 3) Existing logic that fetches "scripted" AI messages from /api/chat/:context
  //    Only relevant in AI mode
  // ------------------------------------------------------------------
  const fetchMessages = useCallback(async () => {
    if (chatMode !== "ai") return; // skip if in SLP mode
    if (!context) return;
    if (context === "askParentName" || context === "askChildName") return;

    try {
      const response = await fetch(`${REACT_APP_API_BASE_URL}/api/chat/${context}`);
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
  }, [context, chatMode, parentName, childName, REACT_APP_API_BASE_URL]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // ------------------------------------------------------------------
  // 4) Enqueue new scripted messages for AI mode
  // ------------------------------------------------------------------
  useEffect(() => {
    if (chatMode !== "ai") return;
    if (messages.length > 0) {
      const newMessages = messages.filter(
        (msg) => !processedMessages.current.has(msg.text + (msg.timestamp || ""))
      );
      newMessages.forEach((msg) => {
        processedMessages.current.add(msg.text + (msg.timestamp || ""));
      });
      setMessageQueue((prevQueue) => [...prevQueue, ...newMessages]);
    }
  }, [messages, chatMode]);

  // ------------------------------------------------------------------
  // 5) Dequeue one message at a time for AI mode
  // ------------------------------------------------------------------
  useEffect(() => {
    if (chatMode !== "ai") return; // skip in SLP mode
    if (!isAwaitingResponse && messageQueue.length > 0 && !isTyping) {
      setIsTyping(true);

      const nextMessage = messageQueue[0];
      typingTimeoutRef.current = setTimeout(() => {
        // Add the next AI message to aiMessages
        setAiMessages((prevMessages) => [...prevMessages, nextMessage]);

        if (nextMessage.awaitResponse) {
          setIsAwaitingResponse(true);
        }

        setMessageQueue((prevQueue) => prevQueue.slice(1));
        setIsTyping(false);
      }, 1000);
    }
  }, [messageQueue, isAwaitingResponse, isTyping, chatMode]);

  // ------------------------------------------------------------------
  // 6) When a new video is uploaded, handle initial AI queries
  // ------------------------------------------------------------------
  useEffect(() => {
    if (newVideoUploaded) {
      if (chatMode === "ai") {
        // Add video upload message to AI chat
        const videoUploadMessage = {
          text: "A new video has been successfully uploaded.",
          sender: "bot",
        };
        if (!processedMessages.current.has(videoUploadMessage.text)) {
          processedMessages.current.add(videoUploadMessage.text);
          setAiMessages((prev) => [...prev, videoUploadMessage]);
        }

        setContext("askParentName");
        const askParentMsg = { text: "Please enter the parent's name:", sender: "bot" };
        setAiMessages((prev) => [...prev, askParentMsg]);
        setIsAwaitingResponse(true);
      } else {
        // If in SLP mode, you might do something else
        setSlpMessages((prev) => [
          ...prev,
          { text: "A new video has been uploaded (SLP mode).", sender: "bot" },
        ]);
      }
      setNewVideoUploaded(false);
    }
  }, [newVideoUploaded, setNewVideoUploaded, chatMode]);

  // ------------------------------------------------------------------
  // 7) Example initial message for AI mode if user never toggles modes
  //    (We’ll do it once here.)
  // ------------------------------------------------------------------
  useEffect(() => {
    // If AI mode has no messages, add your “initialMessage”.
    // But we do the same in the effect that checks aiMessages.length === 0
    // so it might be redundant.
    // For safety, we can keep this or remove it.
    if (aiMessages.length === 0) {
      const initialMessage = {
        text: "Hi, I'm a conversational assistant designed to help. Upload a video, then let's reflect on your interactions.",
        sender: "bot",
      };
      setAiMessages([initialMessage]);
    }
  }, [aiMessages.length]); // runs only once

  // ------------------------------------------------------------------
  // 8) Auto-scroll the chat container
  // ------------------------------------------------------------------
  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [displayedMessages, isTyping]);

  // =====================
  // Handlers
  // =====================

  // Example "Yes" button handler in AI mode
  const handleYesClick = () => {
    if (context === "introduction" && isAwaitingResponse) {
      setIsAwaitingResponse(false);
      setContext("LLM");
      // Add next AI message:
      const botReplyMsg = {
        text: `First, let’s take a moment to reflect on today’s interaction with ${childName}. What do you think went well?`,
        sender: "bot",
      };
      setAiMessages((prev) => [...prev, botReplyMsg]);
    }
  };

  // Skip button for AI
  const handleSkipClick = async () => {
    if (chatMode === "slp") return; // skip logic if in SLP mode

    const skippedMessage = { text: "[Skipped]", sender: "user" };
    setAiMessages((prev) => [...prev, skippedMessage]);

    setIsAwaitingResponse(false);
    setIsTyping(true);

    try {
      const conversationHistory = [
        ...aiMessages,
        skippedMessage,
      ].map((msg) => ({
        role: msg.sender === "bot" ? "assistant" : "user",
        content: msg.text,
      }));

      const response = await fetch(`${REACT_APP_API_BASE_URL}/api/ai-chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          videoId,
          conversationHistory,
          context,
          parentName,
          childName,
        }),
      });

      const data = await response.json();
      setIsTyping(false);

      if (data.botReply) {
        setAiMessages((prev) => [...prev, { text: data.botReply, sender: "bot" }]);
      }
    } catch (error) {
      console.error("Error calling /api/ai-chat:", error);
      setIsTyping(false);
    }
  };

  const sendMessage = async () => {
    const userInput = currentMessage.trim();
    if (!userInput) return;

    // Add user's message to whichever mode's history is active
    const userMessage = { text: userInput, sender: "user" };
    if (chatMode === "ai") {
      setAiMessages((prev) => [...prev, userMessage]);
    } else {
      setSlpMessages((prev) => [...prev, userMessage]);
    }
    setCurrentMessage("");

    // If we’re in AI mode waiting for user input
    if (isAwaitingResponse && chatMode === "ai") {
      setIsAwaitingResponse(false);
    }

    // ---------------
    // SLP MODE
    // ---------------
    if (chatMode === "slp") {
      // If you have a real-time channel for SLP, you could send `userMessage` to your server.
      // For now, just show a placeholder:
      setIsTyping(true);
      setTimeout(() => {
        const slpReply = {
          text: "SLP (human) will respond soon... (placeholder).",
          sender: "bot",
        };
        setSlpMessages((prev) => [...prev, slpReply]);
        setIsTyping(false);
      }, 1000);
      return;
    }

    // ---------------
    // AI MODE
    // ---------------
    // “askParentName” step
    if (context === "askParentName") {
      setParentName(userInput);
      setIsTyping(true);

      setTimeout(() => {
        const askChildMsg = { text: "Please enter the child's name:", sender: "bot" };
        setAiMessages((prev) => [...prev, askChildMsg]);

        setIsTyping(false);
        setContext("askChildName");
        setIsAwaitingResponse(true);
      }, 1000);

      return;
    }
    // “askChildName” step
    else if (context === "askChildName") {
      setChildName(userInput);
      setContext("introduction");
      return;
    }
    // “LLM” context
    else if (context === "LLM") {
      // Call your AI backend as normal
      try {
        setIsTyping(true);

        const conversationHistory = aiMessages.map((msg) => ({
          role: msg.sender === "bot" ? "assistant" : "user",
          content: msg.text,
        }));
        conversationHistory.push({ role: "user", content: userInput });

        const response = await fetch(`${REACT_APP_API_BASE_URL}/api/ai-chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            videoId,
            conversationHistory,
            context,
            parentName,
            childName,
          }),
        });

        const data = await response.json();
        setIsTyping(false);

        if (data.botReply) {
          setAiMessages((prev) => [...prev, { text: data.botReply, sender: "bot" }]);
        }
      } catch (error) {
        console.error("Error calling /api/ai-chat:", error);
        setIsTyping(false);
      }
    }
  };

  // For formatting timestamps in AI messages
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60).toString().padStart(2, "0");
    return `${minutes}:${secs}`;
  };

  // Toggle expanded text
  const [expandedMessages, setExpandedMessages] = useState({});
  const toggleExpandMessage = (index) => {
    setExpandedMessages((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  // =====================
  // RENDER
  // =====================
  return (
    <div className="chat-interface">
      {/* Radio toggle to choose mode */}
      <div style={{ marginBottom: "10px" }}>
        <label style={{ marginRight: "1rem" }}>
          <input
            type="radio"
            name="chatMode"
            value="ai"
            checked={chatMode === "ai"}
            onChange={() => setChatMode("ai")}
          />
          Chat with AI
        </label>

        <label>
          <input
            type="radio"
            name="chatMode"
            value="slp"
            checked={chatMode === "slp"}
            onChange={() => setChatMode("slp")}
          />
          Chat with SLP
        </label>
      </div>

      {/* Chat Window */}
      <div className="chat-box" ref={chatBoxRef}>
        {displayedMessages.map((msg, index) => (
          <div key={index} className={`chat-message ${msg.sender} fade-in`}>
            {msg.sender === "bot" && <img src={BotLogo} alt="Bot" className="bot-avatar" />}

            <div className="message-content">
              {/* AI message might have a timestamp */}
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

              {/* Example button if the message asks for user confirmation (AI mode) */}
              {msg.awaitResponse && context === "introduction" && isAwaitingResponse && (
                <button className="response-buttons" onClick={handleYesClick}>
                  Yes
                </button>
              )}
            </div>
          </div>
        ))}

        {isTyping && !isAwaitingResponse && (
          <div className="typing-indicator">
            <img src={BotLogo} alt="Bot" className="typing-bot-avatar" />
            <span className="dot"></span>
            <span className="dot"></span>
            <span className="dot"></span>
          </div>
        )}
      </div>

      {/* Input Row */}
      <div className="input-container">
        <input
          type="text"
          placeholder={
            chatMode === "ai" ? "Ask the AI Assistant..." : "Send a message to the SLP..."
          }
          value={currentMessage}
          onChange={(e) => setCurrentMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") sendMessage();
          }}
        />

        {/* Show Skip only in AI + context=LLM */}
        {chatMode === "ai" && context === "LLM" && (
          <button className="skip-button" onClick={handleSkipClick}>
            Skip
          </button>
        )}

        <button className="send-button" onClick={sendMessage}>
          Send
        </button>

        <button className="voice-button">
          <img src={VoiceIcon} alt="Voice" className="voice-icon" />
        </button>
      </div>
    </div>
  );
};

export default ChatInterface;
