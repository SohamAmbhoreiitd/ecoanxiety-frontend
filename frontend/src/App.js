import React, { useState, useEffect, useRef } from 'react';
import './App.css';

function App() {
  const [messages, setMessages] = useState([
    { text: 'Hello! I am an AI assistant here to help you with feelings of eco-anxiety. How are you feeling today?', sender: 'ai' }
  ]);
  const [input, setInput] = useState('');
  
  // --- CHANGE 1: Add a new state for loading status ---
  const [isLoading, setIsLoading] = useState(false);
  
  const chatWindowRef = useRef(null);

  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [messages, isLoading]);


  const handleSend = async () => {
    if (input.trim() === '' || isLoading) return;

    const userMessage = { text: input, sender: 'user' };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    
    // --- CHANGE 2: Set loading to true before the API call ---
    setIsLoading(true);

    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
      const response = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          query: input, 
          chat_history: newMessages
        }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      const aiMessage = { text: data.response, sender: 'ai' };
      setMessages(prevMessages => [...prevMessages, aiMessage]);

    } catch (error) {
      console.error('There was a problem with the fetch operation:', error);
      const errorMessage = { text: 'Sorry, I seem to be having trouble connecting. Please try again later.', sender: 'ai' };
      setMessages(prevMessages => [...prevMessages, errorMessage]);
    } finally {
      // --- Set loading back to false after getting a response or an error ---
      setIsLoading(false);
    }
  };
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h2>Eco-Anxiety Counselor</h2>
      </header>
      <div className="chat-window" ref={chatWindowRef}>
        <div className="message-list">
          {messages.map((msg, index) => (
            <div key={index} className={`message-container ${msg.sender}`}>
              <div className={`message ${msg.sender}`}>
                <p>{msg.text}</p>
              </div>
            </div>
          ))}
          
          {/* --- CHANGE 3: Conditionally render the loading indicator --- */}
          {isLoading && (
            <div className="message-container ai">
              <div className="message ai">
                <p><i>Typing...</i></p>
              </div>
            </div>
          )}

        </div>
      </div>
      <div className="chat-input">
        <input
          type="text"
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={isLoading} // Optionally disable input while loading
        />
        <button onClick={handleSend} disabled={isLoading}>
          {isLoading ? '...' : 'Send'}
        </button>
      </div>
    </div>
  );
}

export default App;
