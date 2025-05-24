import React, { useState, useEffect, useRef } from 'react';
import {format_text, to_server_api } from './funcs.jsx';
import './styles/chatarea.css';
import axiosInstance from './utils/axiosInstance';
import { TbMessageForward } from "react-icons/tb";
import { MdCopyAll } from "react-icons/md";

const Chat_area = ({ onCopyToNotebook, currentTool }) => {
  const [text, setText] = useState('');
  const [messages, setMessages] = useState([]);
  const chatAreaRef = useRef(null);
  const [isTyping, setIsTyping] = useState(false);
  
  useEffect(() => {
    const fetchChatHistory = async () => {
      const token = localStorage.getItem('token');
      if (!token || !currentTool) return;
      try {
        const res = await axiosInstance.get(`http://localhost:5000/api/history?tool_name=${currentTool}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const history = res.data.history.map(chat => ({
          user: chat.user_message,
          bot: format_text(chat.bot_reply),
        }));

        setMessages(history);
      } catch (error) {
        console.error('Failed to load history:', error);
      }
    };

    fetchChatHistory();
  }, [currentTool]);

  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        document.getElementById('submit')?.click();
      }
    };
    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, []);

  const scrollToBottom = () => {
    setTimeout(() => {
      chatAreaRef.current?.scrollTo({ top: chatAreaRef.current.scrollHeight, behavior: 'smooth' });
    }, 100);
  };

  const handleTextChange = (e) => setText(e.target.value);

  const handleButtonClick = async () => {
    if (!text.trim()) return;

    const userMessage = text.trim();
    setText('');

    const newMessage = { user: userMessage, bot: '' };
    setMessages(prev => [...prev, newMessage]);
    scrollToBottom();

    const index = messages.length;
    setIsTyping(true);
    try {
      const submitBtn = document.getElementById('submit');

      await to_server_api(
        userMessage,
        currentTool,
        (partialText) => {
          setMessages(prev => {
            const updated = [...prev];
            updated[index] = { ...updated[index], bot: partialText };
            return updated;
          });
          scrollToBottom();
        },
        submitBtn
      );
    } catch (error) {
      console.error(error);
      setMessages(prev => {
        const updated = [...prev];
        updated[index] = { ...updated[index], bot: '⚠️ Error from server.' };
        return updated;
      });
    } finally {
      setIsTyping(false); // ← STOP spinner
    }
  };

  return (
    <div className="main-container fade-in">
      <div className="chat-area" id="chat-area" ref={chatAreaRef}>
        {messages.map((msg, idx) => (
          <React.Fragment key={idx}>
            <article className="user_text">{msg.user}</article>

              <div className="bot_area">
                <article
                        className="bot_text"
                        dangerouslySetInnerHTML={{ __html: msg.bot }}
                  />
                  <div className="bot_text_area">
                    {isTyping && idx === messages.length - 1 && (
                        <div className="spinner"></div>
                      )}
                  </div>
              <button
                className="copy-btn"
                title="Copy to Notebook"
                onClick={() => onCopyToNotebook && onCopyToNotebook(msg.bot)}
              >
                <MdCopyAll size={30}/>
              </button>
            </div>
          </React.Fragment>
        ))}
      </div>

      <div className="Search_Box">
        <textarea
          className="Text-Area"
          placeholder="Ask your research assistant..."
          id="input_area"
          value={text}
          onChange={handleTextChange}
        />
        <button type="submit" className="Submit-Button" onClick={handleButtonClick} id="submit">
          <TbMessageForward size={36} />
        </button>
      </div>
    </div>
  );
};

export default Chat_area;
