import React, { useState, useRef, useEffect } from 'react';

const Chatbot = () => {
  
  const botAvatar = "https://cdn-icons-png.flaticon.com/512/4712/4712035.png";

  const [messages, setMessages] = useState([
    { text: "سلام! من ربات راهنمای دانشگاه پیام نور هستم. چطور می‌تونم کمکت کنم؟ 👋", sender: "bot" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null); 

  // اسکرول به انتهای صفحه چت
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // فعال شدن اینپوت
  useEffect(() => {
    if (!loading) {
      
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [loading]);
  
  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = { text: input, sender: "user" };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);
  
    try {
      
      const response = await fetch("http://localhost:5056/webhooks/rest/webhook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sender: "user_web_" + Date.now(),
          message: userMessage.text,
        }),
      });

      const data = await response.json();

      if (data && data.length > 0) {
        const botMessages = data.map((msg) => ({
          text: msg.text || "پیامی دریافت نشد (شاید عکس یا دکمه باشد)",
          sender: "bot",
        }));
        setMessages((prev) => [...prev, ...botMessages]);
      } else {
        setMessages((prev) => [...prev, { text: "متاسفانه متوجه نشدم، دوباره بگو. 🤔", sender: "bot" }]);
      }
    } catch (error) {
      console.error("Error connecting to Rasa:", error);
      setMessages((prev) => [...prev, { text: "خطا در اتصال به سرور. لطفاً مطمئن شوید Rasa با --cors \"*\" اجرا شده است.", sender: "bot" }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') sendMessage();
  };

  return (
    // کانتینر اصلی
    <div className="flex h-screen antialiased text-gray-800 bg-gray-100 md:items-center md:justify-center font-sans" dir="rtl">
      
      {/* باکس چت */}
      <div className="flex flex-col w-full h-full bg-white md:h-[650px] md:w-[450px] md:rounded-2xl md:shadow-2xl overflow-hidden">
        
        {/* هدر */}
        <div className="flex items-center justify-start p-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md">
          <div className="relative">
             <img className="w-10 h-10 rounded-full border-2 border-white p-0.5 bg-white" src={botAvatar} alt="Bot Avatar" />
             <span className="absolute bottom-0 left-0 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></span>
          </div>
          <div className="mr-4">
            <h3 className="text-lg font-bold">دستیار پیام نور 🎓</h3>
            <p className="text-xs text-blue-100">آنلاین و آماده پاسخگویی</p>
          </div>
        </div>
        
        {/* ناحیه پیام‌ها */}
        <div className="flex flex-col flex-auto h-full p-4 overflow-y-auto bg-gray-50 scrollbar-thumb-blue scrollbar-thumb-rounded scrollbar-track-blue-lighter scrollbar-w-2 scrolling-touch">
          <div className="flex flex-col gap-4">
            {messages.map((msg, index) => (
              <div key={index} className={`flex w-full ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                 
                 {msg.sender === 'bot' && (
                    <img src={botAvatar} alt="bot" className="w-8 h-8 rounded-full ml-2 self-end mb-1 shadow-sm hidden md:block" />
                 )}
                <div className={`relative max-w-[80%] px-4 py-3 shadow-sm 
                  ${msg.sender === 'user' 
                    ? 'bg-blue-600 text-white rounded-3xl rounded-bl-none' 
                    : 'bg-white text-gray-800 border border-gray-200 rounded-3xl rounded-br-none'
                  }`}>
                  <span 
                    className="block text-sm leading-relaxed whitespace-pre-line text-right" 
                    dir="rtl"
                  >
                    {msg.text}
                  </span>
                </div>
              </div>
            ))}
            
            {/* نمایش حالت لودینگ */}
            {loading && (
               <div className="flex w-full justify-start">
                 <img src={botAvatar} alt="bot" className="w-8 h-8 rounded-full ml-2 self-end mb-1 hidden md:block" />
                  <div className="bg-white text-gray-800 border border-gray-200 rounded-3xl rounded-br-none px-4 py-3 shadow-sm">
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  </div>
               </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* ناحیه ورودی متن */}
        <div className="flex flex-row items-center h-20 p-4 bg-white border-t border-gray-200">
          <div className="flex-grow relative">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="سوال خود را بپرسید..."
              disabled={loading}
              className="flex w-full border rounded-full focus:outline-none focus:border-blue-400 pl-4 pr-6 py-3 text-gray-700 bg-gray-50 text-sm transition-colors duration-200"
            />
          </div>
          <div className="mr-3">
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className={`flex items-center justify-center w-12 h-12 rounded-full focus:outline-none transition-all duration-200 shadow-md
                ${loading || !input.trim() ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white hover:scale-105 active:scale-95'}
              `}
            >
               
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;