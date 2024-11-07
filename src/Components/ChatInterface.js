import React, { useState, useEffect, useRef } from 'react';
import './CSS/ChatInterface.css';

const ChatInterface = ({ videoTime, videoId, newVideoUploaded, setNewVideoUploaded, seekToTime, onMessagesUpdate}) => {
  const [messages] = useState([
    { 
      text: "Pay closer attention to non-verbal cues, such as signing or gestures, especially when your child is engaged in activities that may make verbal communication difficult, like being inside a tunnel.", 
      sender: 'bot', 
      timestamp: 88, 
      fidelityScore: 3
    },
    { 
      text: "You're effectively following the intervention flowchart steps by establishing joint attention, presenting your strategy, and waiting for at least 3 seconds.\n\nAfter repeating the question, your response should branch into two outcomes: if you receive a correct response, acknowledge and reinforce it; if no response or an incorrect response occurs, repeat the exact question once more. This structured repetition helps the child understand and engage while providing clarity in your feedback process.", 
      sender: 'bot', 
      timestamp: 96, 
      fidelityScore: 4
    },
    { 
      text: "The child is now both gesturing and vocalizing, showing progress in her communication. You followed the correct procedure by repeating the question after receiving an unclear response, allowing her to articulate more effectively on the second attempt.\n\nWhile the initial response may have been acceptable despite being unclear, your decision to repeat the question aligns with the flowchart guidelines: if no response or an unclear response is given, repeat the question once more to support clearer communication and reinforce understanding.", 
      sender: 'bot', 
      timestamp: 100, 
      fidelityScore: 4
    },
    { 
      text: "You followed an effective approach by waiting approximately 3 seconds after asking the initial question and then repeating the exact same question when there was no response.\n\nThis consistency is key—by not altering the question, you maintained clarity and avoided introducing potential confusion.\n\nChanging the question, even with good intentions, could shift the child's focus and lead to a different response. Sticking to the original question allows for a more accurate follow-through in the flowchart process, keeping the intervention on track.", 
      sender: 'bot', 
      timestamp: 103, 
      fidelityScore: 4
    },
    { 
      text: "It's important to recognize that some children may need extra time to process and respond to questions. By repeating the same question after a 3-second pause, you give the child time to understand, process their response, and express it. This is especially crucial for children with developmental delays, such as those with Down syndrome or autism, who may require additional time for both comprehension and expressive language. Although the 3-second pause may feel lengthy for adults, it is essential for the child’s processing. You are already applying this strategy effectively by allowing this pause before repeating the question, which helps reinforce understanding and gives the child an opportunity to respond.\n\nThe same approach can be applied when modeling language: for instance, when teaching a word like 'shoes,' give the child time to process by pausing for 3 seconds before repeating the word. If the child responds, affirm their effort ('Yes, shoes!'), reinforcing their language development. Keep following this method, as it supports both comprehension and expressive language growth.\n\nWhen modeling language for your child, maintain the same 3-second wait time after each modeled phrase to give her time to process and respond. You know her vocabulary best, so tailor your modeling based on her familiarity with the material—books she's more familiar with may require fewer new words, while unfamiliar books can introduce more vocabulary.\n\nAt this stage, consider encouraging multiple-word responses to help expand her language. For example, instead of just modeling 'shoes,' you can expand to 'brown shoes' or 'blue shoes.' This helps her practice two-word utterances, which are appropriate for her developmental level. Model these expanded phrases, then wait for her to imitate. By doing this, you're helping her progress from single words to more complex speech, enhancing both her vocabulary and her ability to form more structured responses.", 
      sender: 'bot', 
      timestamp: 107, 
      fidelityScore: 3
    },
    { 
      text: "Joint attention is a critical first step in any interaction, whether you're asking a question or modeling language. If the child is not physically or mentally engaged—such as when she shows no interest—this indicates a lack of joint attention. In such moments, it's important not to proceed with asking questions or providing feedback. Instead, focus on gently redirecting her attention to the shared activity before continuing.\n\nOnce you regain her attention, avoid rushing into the next question or prompt. As you discussed previously, it's okay to let the interaction flow naturally and not feel pressured to ask a question immediately. You can hold onto that question for later or use it in the next part of the activity, such as the following pages of a book, when discussing something related to the story or illustrations. This approach helps maintain engagement and supports a more meaningful interaction when both parties are truly focused on the same thing.", 
      sender: 'bot', 
      timestamp: 112, 
      fidelityScore: 1
    },
    { 
      text: "Your approach of acknowledging and then expanding on your child's response was highly effective. When Aria responded with 'rain,' you did the right thing by first validating her response with a simple affirmation: 'Yes, rain.' This immediate acknowledgment provides positive feedback and reinforces her language use.\n\nYou then took it a step further by expanding on her single-word response, introducing a more complex sentence ('It's raining,' 'There's an umbrella,' etc.). This method not only enriches her understanding of the concept but also models more complex language structures for her. By observing your facial expressions and hearing your elaboration, Aria is absorbing more language than she might be able to express at the moment, which is a key part of her learning process.\n\nFor future interactions, you can further simplify or scaffold responses, such as adding two-word combinations ('a lot of rain,' 'umbrella and rain') to gradually build upon her current language level. This balanced approach of acknowledging, expanding, and then simplifying as needed helps nurture her language growth in a structured yet supportive way.", 
      sender: 'bot', 
      timestamp: 216, 
      fidelityScore: 4
    }
  ]);  

  const [displayedMessages, setDisplayedMessages] = useState({});
  const [allMessages, setAllMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const chatBoxRef = useRef(null);
  const [expandedMessages, setExpandedMessages] = useState({});

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
    onMessagesUpdate(messages);
  }, [messages, onMessagesUpdate]);

useEffect(() => {
  const currentDisplayedMessages = displayedMessages[videoId] || [];
  
  const relevantMessages = messages.filter(
    (msg) => msg.timestamp <= videoTime
  );

  const newMessages = relevantMessages.filter(
    (msg) => !currentDisplayedMessages.includes(msg)
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

  const toggleExpandMessage = (index) => {
    setExpandedMessages((prev) => ({
      ...prev,
      [index]: !prev[index]
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
                  <button className="toggle-expand-btn" onClick={() => toggleExpandMessage(index)}>Show More</button>
                </>
              ) : msg.text.length > 200 && expandedMessages[index] ? (
                <>
                  {msg.text}{' '}
                  <button className="toggle-expand-btn" onClick={() => toggleExpandMessage(index)}>Show Less</button>
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
        <button className="send-button" onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
};

export default ChatInterface;
