import React, { useState, useRef, useEffect } from "react";
import { Cookies } from "react-cookie";
import axios from "../api/axios";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, BrainCircuit, User, SendHorizonal, Sparkles } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function AIPage() {
  const cookies = new Cookies();
  const token = cookies.get("token");
  const navigate = useNavigate();

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  
  const MAX_CHARS = 1000;

  useEffect(() => {
    if (!token) {
      navigate("/");
    }
  }, [token, navigate]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(scrollToBottom, [messages]);

  const sendMessage = async (promptText) => {
    if (!promptText.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: promptText,
      sender: "user",
    };

    setMessages((prev) => [...prev, userMessage]);
    setMessage("");
    setIsLoading(true);

    try {
      const response = await axios.post("/api/Ai/ask", { prompt: promptText }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const aiMessage = {
        id: Date.now() + 1,
        text: response.data?.reply || "عذراً، لم أتمكن من فهم طلبك.",
        sender: "ai",
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("AI Error:", error);
      const errorMessage = {
        id: Date.now() + 1,
        text: "عذراً، حدث خطأ في الاتصال. يرجى المحاولة مرة أخرى لاحقًا.",
        sender: "ai",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleFormSubmit = (e) => {
      e.preventDefault();
      sendMessage(message);
  }

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(message);
    }
  };

  const suggestedPrompts = [
      "اشرح لي قانون نيوتن الثاني ببساطة",
      "ما هي خطوات حل مسألة في الكيمياء العضوية؟",
      "اكتب لي فقرة عن أهمية الأدب في العصر الحديث",
  ];

  return (
    // This component is now a content panel, not a full screen page.
    // The parent layout should provide the Three.js background.
    <div className="text-gray-100 font-[Cairo] flex flex-col h-[calc(100vh-2rem)] bg-slate-900/50 backdrop-blur-lg border border-cyan-400/10 rounded-2xl shadow-2xl shadow-cyan-500/10 m-4">
      {/* Header */}
      <header className="flex-shrink-0 border-b border-slate-700/50 p-4 sm:p-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <BrainCircuit className="w-7 h-7 text-white" />
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-bold text-white">المساعد الذكي</p>
              <p className="text-slate-400 text-sm">شريكك الدراسي نحو التفوق</p>
            </div>
          </div>
          <button className="cursor-pointer text-slate-400 hover:text-white transition" onClick={() => navigate(-1)}>
            <ArrowLeft size={25} />
          </button>
        </div>
      </header>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
              <Sparkles size={48} className="text-cyan-400 mb-4 animate-pulse" />
              <h3 className="text-xl font-bold text-white mb-2">مرحباً بك! كيف يمكنني مساعدتك اليوم؟</h3>
              <p className="text-slate-400 max-w-sm mb-6">يمكنك أن تسألني عن شرح لدرس، أو المساعدة في حل واجب، أو حتى اقتراح خطة للمذاكرة.</p>
              <div className="flex flex-col sm:flex-row gap-3">
                  {suggestedPrompts.slice(0, 2).map(prompt => (
                      <button key={prompt} onClick={() => sendMessage(prompt)} className="px-4 py-2 bg-slate-800/70 border border-slate-700 rounded-lg text-sm text-slate-300 hover:bg-slate-700/90 hover:border-slate-600 transition">
                          {prompt}
                      </button>
                  ))}
              </div>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className={`flex items-start gap-4 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
            {msg.sender === "ai" && (
              <div className="w-9 h-9 bg-slate-700 rounded-full flex items-center justify-center flex-shrink-0">
                <BrainCircuit size={20} className="text-cyan-400" />
              </div>
            )}
            <div className={`max-w-xl px-5 py-3 rounded-2xl ${msg.sender === "user" ? "bg-gradient-to-br from-cyan-500 to-blue-500 text-white rounded-tr-none" : "bg-slate-800/80 text-white rounded-tl-none"}`}>
              <div className="prose prose-sm prose-invert prose-p:my-2 prose-ul:my-2 prose-ol:my-2 max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.text}</ReactMarkdown>
              </div>
            </div>
             {msg.sender === "user" && (
              <div className="w-9 h-9 bg-slate-700 rounded-full flex items-center justify-center flex-shrink-0">
                <User size={20} className="text-slate-300" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex items-start gap-4 justify-start">
             <div className="w-9 h-9 bg-slate-700 rounded-full flex items-center justify-center flex-shrink-0">
                <BrainCircuit size={20} className="text-cyan-400 animate-pulse" />
              </div>
            <div className="bg-slate-800/80 px-4 py-3 rounded-2xl rounded-tl-none">
              <div className="flex space-x-1.5 space-x-reverse p-2">
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="flex-shrink-0 border-t border-slate-700/50 p-4 sm:p-6">
        <form onSubmit={handleFormSubmit} className="relative">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="اكتب رسالتك هنا..."
            className="w-full p-4 pl-16 rounded-xl bg-slate-800 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/50 transition-all resize-none"
            rows="1"
            maxLength={MAX_CHARS}
            style={{ minHeight: "58px", maxHeight: "150px" }}
          />
          <div className="absolute left-16 top-1/2 -translate-y-1/2 text-xs text-slate-500 font-mono">
            {message.length}/{MAX_CHARS}
          </div>
          <button
            type="submit"
            disabled={!message.trim() || isLoading}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-11 h-11 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-110 active:scale-100"
          >
            <SendHorizonal size={20} />
          </button>
        </form>
      </div>
    </div>
  );
}