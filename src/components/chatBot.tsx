"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Send } from "lucide-react";
import Image from "next/image";

interface Message {
  role: "user" | "bot";
  text: string;
}

const FAQ = [
  { q: "What is your refund policy?", a: "We offer a 7-day refund policy on all plans." },
  { q: "How can I contact support?", a: "You can reach support at support@yourdomain.com." },
  { q: "Is the AI tool free?", a: "Yes, we offer a free plan with limited features." },
];

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "bot", text: "Hi 👋, how can I help you today?" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const isVagueQuestion = (msg: string) => {
    const vaguePatterns = [
      "what is website about",
      "tell me about website",
      "about the website",
      "what is this site",
    ];
    return vaguePatterns.some(pattern => msg.toLowerCase().includes(pattern));
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const newMessage: Message = { role: "user", text: input };
    setMessages(prev => [...prev, newMessage]);
    setInput("");
    setLoading(true);

    let botReply = "";

    // 1. Check vague question first
    if (isVagueQuestion(newMessage.text)) {
      botReply = "I need a little more information to help you. Could you please tell me the website address (URL)?";
    }
    // 2. Then check FAQ
    else {
      const faqMatch = FAQ.find(f => newMessage.text.toLowerCase().includes(f.q.toLowerCase()));
      if (faqMatch) {
        botReply = faqMatch.a;
      }
      // 3. Otherwise call Gemini API
      else {
        try {
          const res = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: newMessage.text, history: messages }),
          });
          const data = await res.json();
          botReply = data.reply || "Sorry, I’m not sure about that.";
        } catch (err) {
          console.error(err);
          botReply = "Error contacting AI service. Try again later.";
        }
      }
    }

    setMessages(prev => [...prev, { role: "bot", text: botReply }]);
    setLoading(false);
  };

  return (
    <>
      <style>{`
        @media (max-width: 640px) {
          .chatbot-fab {
            bottom: 16px !important;
            right: 16px !important;
          }
          .chatbot-overlay {
            position: fixed !important;
            inset: 0 !important;
            width: 100vw !important;
            height: 100dvh !important;
            background: rgba(30,30,40,0.85) !important;
            z-index: 9999 !important;
            display: flex !important;
            align-items: flex-end !important;
            justify-content: center !important;
          }
          .chatbot-window {
            width: 100vw !important;
            max-width: 100vw !important;
            height: 100dvh !important;
            min-height: 100dvh !important;
            border-radius: 0 !important;
            bottom: 0 !important;
            right: 0 !important;
            left: 0 !important;
            top: 0 !important;
            padding: 0 !important;
            background: #fff !important;
            box-shadow: none !important;
            display: flex !important;
            flex-direction: column !important;
          }
        }
      `}</style>
      <div className="fixed bottom-6 right-6 z-50 chatbot-fab">
        {/* Toggle Button */}
        <button
          className="bg-white hover:bg-orange-400 p-3 rounded-full shadow-lg flex items-center justify-center hover:scale-105 transition"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Open chatbot"
        >
          <Image
            src="/chatbot.svg"
            alt="Chatbot"
            width={36}
            height={36}
            className="w-9 h-9"
            priority
          />
        </button>

        {/* Chat Window with overlay for mobile */}
        {isOpen && (
          <>
            {/* Overlay for mobile */}
            <div className="hidden sm:block fixed inset-0 bg-transparent z-40" />
            <div className="chatbot-overlay sm:static sm:bg-transparent sm:inset-auto sm:w-auto sm:h-auto sm:z-auto">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="chatbot-window fixed bottom-24 right-0 w-80 max-w-[95vw] h-96 sm:rounded-2xl rounded-none p-4 flex flex-col bg-white shadow-2xl"
                style={{
                  background: "#fff",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
                  zIndex: 100,
                  display: "flex",
                }}
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-gray-800">AI Assistant</span>
                  <button
                    className="text-gray-400 hover:text-gray-700 text-xl font-bold px-2"
                    onClick={() => setIsOpen(false)}
                    aria-label="Close chatbot"
                    type="button"
                  >
                    ×
                  </button>
                </div>
                {/* Messages */}
                <div className="flex-1 overflow-y-auto space-y-2 pb-2">
                  {messages.map((msg, i) => (
                    <div
                      key={i}
                      className={`p-2 rounded-lg max-w-[80%] text-sm ${
                        msg.role === "bot"
                          ? "bg-gray-100 text-gray-800 self-start"
                          : "bg-orange-500 text-white self-end"
                      }`}
                    >
                      {msg.text}
                    </div>
                  ))}
                  {loading && <div className="text-gray-500 text-sm">Thinking...</div>}
                </div>

                {/* Input */}
                <div className="flex items-center mt-2">
                  <input
                    type="text"
                    className="flex-1 border p-2 rounded-lg text-sm"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleSend()}
                    placeholder="Type a message..."
                  />
                  <button
                    onClick={handleSend}
                    className="ml-2 bg-blue-600 p-2 rounded-lg text-white"
                    aria-label="Send message"
                  >
                    <Send size={18} />
                  </button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
