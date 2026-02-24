"use client";

import { useState, useEffect } from 'react';

const messages = [
  "Sure! What do you need help with?",
  "I can help you find a listing in your preferred neighborhood.",
  "Would you like to schedule a tour for 123 Maple St?",
  "I've captured your contact info. An agent will reach out shortly!"
];

export default function ChatDemo() {
  const [step, setStep] = useState(0); // 0: thinking, 1: typing, 2: reading
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [displayText, setDisplayText] = useState('');

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    if (step === 0) {
      // Thinking (dots)
      timeout = setTimeout(() => {
        setStep(1);
      }, 1500);
    } else if (step === 1) {
      // Typing text
      const fullText = messages[currentMessageIndex];
      if (displayText.length < fullText.length) {
        timeout = setTimeout(() => {
          setDisplayText(fullText.slice(0, displayText.length + 1));
        }, 30);
      } else {
        setStep(2);
      }
    } else if (step === 2) {
      // Reading
      timeout = setTimeout(() => {
        setStep(0);
        setDisplayText('');
        setCurrentMessageIndex((prev) => (prev + 1) % messages.length);
      }, 3000);
    }

    return () => clearTimeout(timeout);
  }, [step, displayText, currentMessageIndex]);

  return (
    <aside className="assistia-chat-demo" aria-label="Live assistant preview">
      <div className="assistia-chat-container">
        <header className="assistia-chat-header">
          <h3>AI Chat</h3>
          <button aria-label="Toggle theme" type="button">Theme</button>
        </header>
        <div className="assistia-chat-box">
          <div className="assistia-message assistia-message-ai">
            <span>Hi there! I&apos;m your AI assistant.</span>
          </div>
          <div className="assistia-message assistia-message-user">
            <span>Hello! Can you help me with something?</span>
          </div>
          
          <div className="assistia-message assistia-message-ai">
            {step === 0 ? (
              <div className="assistia-typing-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
            ) : (
              <span>
                {displayText}
                {step === 1 && <span className="assistia-typing-cursor">|</span>}
              </span>
            )}
          </div>
        </div>
        <div className="assistia-input-area">
          <input type="text" placeholder="Type your message..." readOnly aria-label="Type your message" />
          <button type="button">Send</button>
        </div>
      </div>
    </aside>
  );
}
