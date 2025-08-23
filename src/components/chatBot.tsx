"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Send } from "lucide-react";
import Image from "next/image"; // Import Next.js Image

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
    <div className="fixed bottom-6 right-6 z-50">
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

      {/* Chat Window */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-80 h-96 shadow-2xl rounded-2xl p-4 flex flex-col "
        >
          {/* Messages */}
          <div className="flex-1 overflow-y-auto space-y-2">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`p-2 rounded-lg max-w-[80%] ${
                  msg.role === "bot"
                    ? " self-start"
                    : "bg-orange-500 self-end"
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
      )}
    </div>
  );
}
