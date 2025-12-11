import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, X, MessageSquare, Loader2 } from "lucide-react";
import io from "socket.io-client";
import api from "../api";

const SOCKET_URL = "http://localhost:3000"; // Adjust if different

export default function ChatPanel({
  isOpen,
  onClose,
  receiverId,
  receiverName,
}) {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [socket, setSocket] = useState(null);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const id = localStorage.getItem("userId");
    setUserId(id);

    if (id) {
      const newSocket = io(SOCKET_URL, {
        query: { userId: id },
      });
      setSocket(newSocket);

      newSocket.on("newMessage", (newMessage) => {
        // Only add if it belongs to this conversation
        if (newMessage.senderId === receiverId || newMessage.senderId === id) {
          setMessages((prev) => [...prev, newMessage]);
          scrollToBottom();
        }
      });

      return () => newSocket.close();
    }
  }, [receiverId]);

  useEffect(() => {
    if (isOpen && receiverId && userId) {
      fetchMessages();
    }
  }, [isOpen, receiverId, userId]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      // Pass senderId since backend auth is missing
      const res = await api.get(`/messages/${receiverId}?senderId=${userId}`);
      setMessages(res.data);
      scrollToBottom();
    } catch (error) {
      console.error("Failed to fetch messages", error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || !userId) return;

    try {
      const payload = {
        text: inputMessage,
        senderId: userId,
      };
      const res = await api.post(`/messages/send/${receiverId}`, payload);
      setMessages((prev) => [...prev, res.data]);
      setInputMessage("");
      scrollToBottom();
    } catch (error) {
      console.error("Failed to send message", error);
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          className="absolute inset-0 z-[60] bg-background flex flex-col md:rounded-3xl overflow-hidden"
        >
          {/* Header */}
          <div className="p-4 bg-primary text-primary-foreground flex items-center justify-between shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <MessageSquare size={20} className="text-white" />
              </div>
              <div>
                <h3 className="font-bold text-lg">{receiverName || "Chat"}</h3>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <p className="text-xs text-primary-foreground/80">Online</p>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-secondary/10">
            {loading && messages.length === 0 ? (
              <div className="flex justify-center py-10">
                <Loader2 className="animate-spin text-primary" />
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center text-muted-foreground py-10 opacity-50">
                <p>No messages yet.</p>
                <p className="text-sm">Say hello! 👋</p>
              </div>
            ) : (
              messages.map((msg, index) => {
                const isMe = msg.senderId === userId;
                return (
                  <div
                    key={msg._id || index}
                    className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm ${
                        isMe
                          ? "bg-primary text-primary-foreground rounded-tr-none"
                          : "bg-secondary text-secondary-foreground rounded-tl-none border border-border"
                      }`}
                    >
                      {msg.text}
                      <p
                        className={`text-[10px] mt-1 opacity-70 ${
                          isMe ? "text-right" : "text-left"
                        }`}
                      >
                        {new Date(msg.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form
            onSubmit={sendMessage}
            className="p-3 bg-background border-t border-border flex gap-2 items-center"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 px-4 py-3 rounded-xl bg-secondary/30 focus:bg-secondary/50 focus:ring-2 focus:ring-primary outline-none transition-all"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim()}
              className="p-3 bg-primary text-primary-foreground rounded-xl disabled:opacity-50 hover:opacity-90 transition-opacity shadow-lg"
            >
              <Send size={20} />
            </button>
          </form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
