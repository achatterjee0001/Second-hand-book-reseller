import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { apiCall } from "../lib/api";
import { useAuth } from "../hooks/useAuth";
import { Send, ArrowLeft, MessageSquare } from "lucide-react";
import { cn } from "../lib/utils";
import { format } from "date-fns";

export default function Chat() {
  const { id } = useParams(); // threadId
  const { user } = useAuth();
  const navigate = useNavigate();
  const [threads, setThreads] = useState([]);
  const [messages, setMessages] = useState([]);
  const [book, setBook] = useState(null);
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!user) return;

    const fetchThreads = async () => {
      try {
        const data = await apiCall('/chat/threads');
        setThreads(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchThreads();
    const interval = setInterval(fetchThreads, 3000); // Polling every 3s
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    if (!id || !user) return;

    const fetchMessages = async () => {
      try {
        const data = await apiCall(`/chat/threads/${id}/messages`);
        setMessages(data);
        scrollToBottom();
      } catch (err) {
        console.error(err);
      }
    };

    const fetchThreadInfo = async () => {
      try {
        // Find thread in threads array if possible, or fetch from API if there was an endpoint for single thread
        const tData = threads.find(t => t.id === id); 
        const bookId = tData?.bookId?._id || tData?.bookId;
        if (bookId) {
            const bData = await apiCall(`/books/${bookId}`);
            setBook(bData);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchThreadInfo();
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000); // Polling every 3s
    return () => clearInterval(interval);
  }, [id, user, threads]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !id || !user) return;

    const messageText = inputText.trim();
    setInputText("");

    try {
      await apiCall(`/chat/threads/${id}/messages`, {
        method: 'POST',
        body: JSON.stringify({ text: messageText })
      });
      // Immediately fetch messages after sending
      const data = await apiCall(`/chat/threads/${id}/messages`);
      setMessages(data);
      scrollToBottom();
    } catch (error) {
      console.error(error);
    }
  };

  if (!user) return null;

  return (
    <div className="flex h-[80vh] bg-white rounded-[2.5rem] border border-stone-200 overflow-hidden shadow-2xl animate-in">
      {/* Sidebar */}
      <div
        className={cn(
          "w-full md:w-80 lg:w-96 border-r border-stone-100 bg-stone-50 flex flex-col",
          id ? "hidden md:flex" : "flex",
        )}
      >
        <div className="p-6 border-b border-stone-200">
          <h2 className="font-display text-2xl font-bold text-stone-900">
            Conversations
          </h2>
          <p className="text-xs text-stone-500 font-bold uppercase tracking-widest mt-1">
            Collector Network
          </p>
        </div>
        <div className="flex-grow overflow-y-auto p-4 space-y-2">
          {threads.length > 0 ? (
            threads.map((thread) => (
              <button
                key={thread.id}
                onClick={() => navigate(`/chat/${thread.id}`)}
                className={cn(
                  "w-full p-4 rounded-2xl text-left transition-all flex items-center gap-4 group",
                  id === thread.id
                    ? "bg-white shadow-lg shadow-stone-200 border border-stone-200"
                    : "hover:bg-white/50",
                )}
              >
                <div className="w-12 h-12 bg-stone-900 rounded-xl flex items-center justify-center text-white font-bold group-hover:scale-105 transition-transform">
                  {thread.participants
                    .find((p) => (p._id || p) !== user.uid)
                    ?.displayName?.slice(0, 1)
                    .toUpperCase() || "C"}
                </div>
                <div className="flex-grow overflow-hidden">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-stone-900 text-sm">
                      Thread #{thread.id.slice(-4)}
                    </span>
                    <span className="text-[10px] text-stone-400 font-bold uppercase tracking-tighter">
                      {thread.lastMessageTime
                        ? format(new Date(thread.lastMessageTime), "HH:mm")
                        : ""}
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 line-clamp-1 mt-1 font-medium">
                    {thread.lastMessage || "Start the conversation..."}
                  </p>
                </div>
              </button>
            ))
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-10 space-y-4 opacity-40">
              <MessageSquare className="w-10 h-10" />
              <p className="text-sm font-medium italic">
                No active negotiations.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Main Chat */}
      <div
        className={cn(
          "flex-grow flex flex-col items-center justify-center bg-white",
          !id ? "hidden md:flex" : "flex",
        )}
      >
        {id ? (
          <>
            {/* Chat header */}
            <div className="w-full h-20 border-b border-stone-100 flex items-center justify-between px-8 bg-stone-50/50">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate("/chat")}
                  className="md:hidden p-2 hover:bg-stone-200 rounded-full"
                >
                  <ArrowLeft className="w-5 h-5 text-stone-700" />
                </button>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-stone-900 rounded-xl flex items-center justify-center text-white text-xs font-bold shadow-lg">
                    {threads
                      .find((t) => t.id === id)
                      ?.participants.find((p) => (p._id || p) !== user.uid)
                      ?.displayName?.slice(0, 1)
                      .toUpperCase() || "C"}
                  </div>
                  <div>
                    <h3 className="font-bold text-stone-900 leading-tight">
                      Collector Negotiation
                    </h3>
                    <p className="text-xs text-stone-400 font-bold uppercase tracking-widest">
                      Active Status
                    </p>
                  </div>
                </div>
              </div>

              {book && (
                <Link
                  to={`/book/${book.id}`}
                  className="group hidden md:flex items-center gap-3 p-2 pl-4 bg-white border border-stone-200 rounded-2xl hover:border-stone-900 transition-all"
                >
                  <div className="text-right">
                    <p className="text-xs font-bold text-stone-900 line-clamp-1">
                      {book.title}
                    </p>
                    <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">
                      ${book.price}
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-stone-100 flex-shrink-0">
                    <img
                      src={book.coverUrl || book.images?.[0]}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                    />
                  </div>
                </Link>
              )}
            </div>

            {/* Messages area */}
            <div className="flex-grow w-full overflow-y-auto p-8 space-y-6 scroll-smooth">
              {messages.map((msg, i) => {
                const isMe = msg.senderId === user.uid;
                return (
                  <div
                    key={msg.id || i}
                    className={cn(
                      "flex flex-col",
                      isMe ? "items-end" : "items-start",
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-[70%] px-6 py-4 rounded-3xl text-sm leading-relaxed shadow-sm",
                        isMe
                          ? "bg-stone-900 text-white rounded-br-none"
                          : "bg-stone-100 text-stone-800 rounded-bl-none",
                      )}
                    >
                      {msg.text}
                    </div>
                    <span className="text-[10px] text-stone-400 font-bold uppercase tracking-widest mt-2 px-2">
                      {msg.createdAt
                        ? format(new Date(msg.createdAt), "HH:mm • MMM d")
                        : "Moments ago"}
                    </span>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input area */}
            <form
              onSubmit={handleSendMessage}
              className="w-full p-6 border-t border-stone-100 bg-stone-50/50"
            >
              <div className="max-w-4xl mx-auto relative flex gap-4">
                <input
                  type="text"
                  placeholder="Draft your proposal..."
                  className="flex-grow bg-white border border-stone-200 rounded-full py-4 px-8 focus:ring-2 focus:ring-stone-900 outline-none transition-all shadow-xl"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                />

                <button
                  type="submit"
                  className="bg-stone-900 text-white rounded-full w-14 h-14 flex items-center justify-center hover:bg-stone-800 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-stone-200 flex-shrink-0"
                >
                  <Send className="w-6 h-6" />
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center text-center space-y-6 max-w-sm">
            <div className="w-24 h-24 bg-stone-50 rounded-[2rem] flex items-center justify-center shadow-inner">
              <MessageSquare className="w-10 h-10 text-stone-300" />
            </div>
            <div className="space-y-2">
              <h4 className="font-display text-2xl font-bold text-stone-900">
                Select a Thread
              </h4>
              <p className="text-stone-500 font-light italic">
                Continue your negotiations with other esteemed collectors in the
                LibriSwap network.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
