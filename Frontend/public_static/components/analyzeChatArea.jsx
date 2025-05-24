import React, { useState } from 'react';
import './styles/analyzeChatArea.css';
import {useEffect} from 'react';
import { TbMessageForward } from "react-icons/tb";
import { MdOutlineUploadFile } from "react-icons/md";


export default function AnalyzeChatArea({onSendMessage, messages,onFileUpload }) {
  const [input, setInput] = useState('');
  const [text, setText] = useState('');
  const handleSubmit = (e) => {
    if (!text) return;
    e.preventDefault();
    onSendMessage(text,'user');
    let chat = document.getElementById('chat-input');
    console.log(chat.value);
    if(chat) {
      chat.value = '';
      setText('');
    }
  };
  useEffect(() => {
      const handleKeyPress = (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
          event.preventDefault();
          document.getElementById('Analyzer-submit-button')?.click();
        }
      };
      document.addEventListener('keydown', handleKeyPress);
      return () => document.removeEventListener('keydown', handleKeyPress);
  }, []);
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      onFileUpload(file);
    } else {
      alert('Please upload a valid PDF file.');
    }
  };

  const openFileSelector = () => {
    document.getElementById('pdf-upload').click();
  };
  const handleTextChange = (e) => setText(e.target.value);
  return (
    <div className="analyze-chat-area">
      <div className="analyze-messages">
        {messages.map((msg, index) => (
          <div key={index} className={`analyze-message ${msg.sender}`}>
            <p>{msg.text}</p>
          </div>
        ))}
      </div>
      <div className="Analyzer-chat-box">
      <input
          type="file"
          id="pdf-upload"
          accept="application/pdf"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
        <button
          className="Analyzer-Upload-Button"
          onClick={openFileSelector}
          title="Upload PDF"
        >
          <MdOutlineUploadFile size={32}/>
        </button>
        <textarea
            className="Analyzer-Text-Area"
            placeholder="Ask your Analyzer..."
            id = "chat-input"
            value={text}
            onChange={handleTextChange}
        />
        <button type="submit" id='Analyzer-submit-button' className='Analyzer-submit-button'
          onClick={handleSubmit}>
          <TbMessageForward size={36} />
        </button>
      </div>
    </div>
  );
}
