import React, { useState, useEffect, useRef } from "react";
import BACKEND_URL from "../../config.js";
import { Send, Mic, X, MessageCircle } from "lucide-react"; 
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    { role: "bot", text: "👋 Hi! I’m your AI assistant. How can I help you today?" },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newUserMessage = { role: "user", text: input };
    setMessages((prev) => [...prev, newUserMessage]);
    setInput("");
    setIsTyping(true);

    try {
      const response = await fetch(`${BACKEND_URL}/api/chat/stream`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: newUserMessage.text }),
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let botText = "";
      let isFirstChunk = true;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n\n");
        
        for (const line of lines) {
            if (line.startsWith("data: ")) {
                try {
                    const data = JSON.parse(line.slice(6));
                    if (data.output) {
                         botText += data.output;
                         
                         if (isFirstChunk) {
                             setIsTyping(false);
                             setMessages((prev) => [...prev, { role: "bot", text: botText }]);
                             isFirstChunk = false;
                         } else {
                             setMessages((prev) => {
                                 const newMsgs = [...prev];
                                 newMsgs[newMsgs.length - 1] = { ...newMsgs[newMsgs.length - 1], text: botText };
                                 return newMsgs;
                             });
                         }
                    }
                } catch (e) {
                    // Ignore parse errors for partial chunks
                }
            }
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: "Sorry, something went wrong. Please try again later." },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col items-end">
      {/* Chat Window */}
      {isOpen && (
        <div className="animate-slide-up bg-white shadow-2xl rounded-2xl w-[90vw] sm:w-[600px] h-[700px] flex flex-col border border-gray-200 mb-3">
          {/* Header */}
          <div className="flex justify-between items-center p-3 bg-indigo-600 text-white rounded-t-2xl">
            <h2 className="text-lg font-semibold">Talk 2 Donovan ✨</h2>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-indigo-700 p-1 rounded-full"
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-gray-50">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`p-3 rounded-xl text-base max-w-[85%] shadow-sm ${
                    msg.role === "user"
                      ? "bg-indigo-600 text-white rounded-br-none"
                      : "bg-white border border-gray-200 rounded-tl-none text-gray-800"
                  }`}
                >
                  {msg.role === "bot" ? (
                    <ReactMarkdown 
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeRaw]}
                        components={{
                          table: ({node, ...props}) => <div className="overflow-x-auto my-2 rounded-lg border border-gray-200"><table className="min-w-full divide-y divide-gray-200 text-left" {...props} /></div>,
                          thead: ({node, ...props}) => <thead className="bg-gray-50" {...props} />,
                          th: ({node, ...props}) => <th className="px-3 py-2 text-sm font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200" {...props} />,
                          td: ({node, ...props}) => <td className="px-3 py-2 text-base text-gray-700 border-b border-gray-100 whitespace-pre-wrap" {...props} />,
                          tr: ({node, ...props}) => <tr className="hover:bg-gray-50 transition-colors" {...props} />,
                          ul: ({node, ...props}) => <ul className="list-disc list-inside my-2 space-y-1" {...props} />,
                          ol: ({node, ...props}) => <ol className="list-decimal list-inside my-2 space-y-1" {...props} />,
                          p: ({node, ...props}) => <p className="mb-2 last:mb-0 leading-relaxed" {...props} />,
                          a: ({node, ...props}) => <a className="text-blue-600 hover:underline font-medium" target="_blank" rel="noopener noreferrer" {...props} />,
                          strong: ({node, ...props}) => <strong className="font-bold text-gray-900" {...props} />,
                          code: ({node, inline, className, children, ...props}) => 
                            inline 
                              ? <code className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono text-red-500" {...props}>{children}</code>
                              : <pre className="bg-gray-900 text-gray-100 p-3 rounded-lg overflow-x-auto text-sm font-mono my-2" {...props}><code>{children}</code></pre>
                        }}
                    >
                        {msg.text}
                    </ReactMarkdown>
                  ) : (
                    <span className="whitespace-pre-wrap">{msg.text}</span>
                  )}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="p-3 rounded-xl bg-white border border-gray-200 text-base text-gray-600 shadow-sm rounded-tl-none">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <form
            onSubmit={handleSend}
            className="flex items-center p-3 border-t bg-white rounded-b-2xl"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-base focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
            <button
              type="submit"
              className={`ml-2 p-2 rounded-full transition-all text-white shadow-md ${input.trim() ? "bg-indigo-600 hover:bg-indigo-700" : "bg-gray-400 cursor-not-allowed"}`}
              disabled={!input.trim()}
            >
              {input.trim() ? <Send size={18} /> : <Mic size={18} />}
            </button>
          </form>
        </div>
      )}

      {/* Floating Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`p-4 rounded-full shadow-xl text-white transition-all duration-300 transform hover:scale-110 ${
          isOpen ? "bg-rose-500 rotate-90" : "bg-indigo-600 hover:bg-indigo-700"
        }`}
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </button>
    </div>
  );
};

export default Chatbot;
