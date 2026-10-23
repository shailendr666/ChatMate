import React, { useState, useEffect, useRef } from "react";
import {
  Plus,
  MessageSquare,
  Send,
  User,
  Bot,
  ChevronRight,
  History,
  Trash2,
  Sparkles,
  Menu,
  X,
  Upload,
} from "lucide-react";

import apiClient from "../utils/apiClient";
import { MODES } from "../utils/Modes";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
//@ts-ignore
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
// @ts-ignore
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Copy, Check } from "lucide-react";
import "katex/dist/katex.min.css";
import { toast } from "react-toastify";

import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  setActiveChatId,
  setActiveChats,
  startActiveChat,
} from "../store/Slices/ChatSlice";

type ConversationId = {
  user_id: string;
  mode: string;
  conversation_id: string;
};
type chatType = {
  role: string;
  content: string;
};
const Chats = () => {
  const [, setChats] = useState<chatType[]>([]);
  const [isSelectingMode, setIsSelectingMode] = useState(true);
  const [inputValue, setInputValue] = useState("");
  const [isBotTyping, setIsBotTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const [allConversationId, setConversationId] = useState<ConversationId[]>([]);
  const [, setShowFileUpload] = useState<true | false>(false);
  // console.log(activeChatId);
  const { activeChatId, activeChats } = useAppSelector((state) => state.chat);
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();

  const activeChat = allConversationId.find(
    (c) => c.conversation_id === activeChatId,
  );

  const fetchAllConversationIds = async () => {
    try {
      const res = await apiClient.get(`/chat/${user?.email}`);
      setConversationId([...allConversationId, ...res.data.data]);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchAChat = async (activeChatId: string) => {
    dispatch(setActiveChatId(activeChatId));
    setIsSelectingMode(false);
    try {
      const res = await apiClient.get(`/conversations/${activeChatId}`);
      dispatch(startActiveChat(res.data.messages));
    } catch (error) {
      console.log(error);
      setChats([]);
    }
  };

  useEffect(() => {
    fetchAllConversationIds();
  }, []);
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeChatId, isBotTyping]);

  const startNewConversation = () => {
    setIsSelectingMode(true);
    dispatch(setActiveChatId("1"));
  };

  const handleSendMessage = async (e: React.ChangeEvent<HTMLFormElement>) => {
    e.preventDefault();

    setIsBotTyping(true);
    try {
      const payload = {
        user_id: user?.email,
        mode: activeChat?.mode,
        conversation_id: activeChat?.conversation_id,
        query: inputValue,
      };
      setInputValue("");
      dispatch(setActiveChats({ role: "user", content: payload.query }));
      const res = await apiClient.post("/chat/generate", payload);
      setIsBotTyping(false);
      dispatch(
        setActiveChats({ role: "assistant", content: res.data.messages }),
      );
    } catch (error) {
      console.log(error);
    }
  };

  const deleteChat = async (
    e: React.MouseEvent<HTMLButtonElement>,
    id: string,
  ) => {
    e.stopPropagation();
    const toastId = toast.loading("Deleting conversation...");
    try {
      await apiClient.delete(`/conversations/${id}`);
      setConversationId((prev) =>
        prev.filter((item) => item["conversation_id"] !== id),
      );
      setChats([]);
      toast.update(toastId, {
        render: "Deleted successfully!",
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });
    } catch (error) {
      console.error(error);
      toast.update(toastId, {
        render: "Failed to delete.",
        type: "error",
        isLoading: false,
        autoClose: 4000,
      });
    }
  };

  const startConversation = async (mode: string) => {
    const toastId = toast.loading("Starting conversation...");
    try {
      const res = await apiClient.post("/chat/start", {
        user_id: user?.email,
        mode,
      });
      toast.update(toastId, {
        render: "Conversation started!",
        type: "success",
        isLoading: false,
        autoClose: 2000,
      });
      setConversationId([...allConversationId, res.data.data]);
      dispatch(startActiveChat(res.data.data.messages));
      setIsSelectingMode(false);
      dispatch(setActiveChatId(res.data.data.conversation_id));
      dispatch(setActiveChats(res.data.data.messages[0]));
    } catch (error) {
      toast.update(toastId, {
        render: "Failed to start conversation.",
        type: "error",
        isLoading: false,
        autoClose: 4000,
      });
      console.log(error);
    }
  };

  type CodeBlockProps = {
    language: string;
    value: string;
  };
  const CodeBlock = ({ language, value }: CodeBlockProps) => {
    const [copied, setCopied] = useState(false);

    const onCopy = () => {
      navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    };

    return (
      <div className="relative group my-4">
        <div className="absolute right-2 top-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={onCopy}
            className="p-1.5 rounded-md  border border-zinc-700 bg-zinc-700 text-zinc-300 transition-colors"
          >
            {copied ? (
              <Check size={16} className="text-green-500" />
            ) : (
              <Copy size={16} />
            )}
          </button>
        </div>
        <SyntaxHighlighter
          language={language}
          style={oneDark}
          customStyle={{
            margin: 0,
            borderRadius: "0.5rem",
            fontSize: "0.875rem",
          }}
        >
          {value}
        </SyntaxHighlighter>
      </div>
    );
  };
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    let progress = 0;
    let fakeProgressInterval: ReturnType<typeof setInterval> | undefined =
      undefined;

    const toastRef = toast.loading("Uploading PDF");

    fakeProgressInterval = setInterval(() => {
      progress += Math.random() * 15;

      if (progress < 30) {
        toast.update(toastRef, {
          render: "Uploading PDF",
          isLoading: true,
        });
      } else if (progress < 60) {
        toast.update(toastRef, {
          render: "Processing PDF",
          isLoading: true,
        });
      } else if (progress < 90) {
        toast.update(toastRef, {
          render: "Storing in database",
          isLoading: true,
        });
      }

      if (progress >= 90) {
        clearInterval(fakeProgressInterval);

        toast.update(toastRef, {
          render: "Finalizing...",
          isLoading: true,
        });
      }
    }, 500);
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      toast.update(toastRef, { render: "Processing PDF", isLoading: true });
      await apiClient.post(`/chat/upload/${activeChatId}`, formData);
      toast.update(toastRef, {
        render: "PDF processed successfully",
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });
      clearInterval(fakeProgressInterval);
    } catch (error) {
      console.error(error);
      clearInterval(fakeProgressInterval);
      toast.update(toastRef, {
        render: "Failed to upload PDF",
        type: "error",
        isLoading: false,
        autoClose: 4000,
      });
    }
  };

  const [isMobileView, setIsMobileView] = useState(false);

  const toggleMobileView = () => setIsMobileView(!isMobileView);

  return (
    <div className="flex h-[92.2vh] bg-[#09090b] text-zinc-200 overflow-hidden font-sans selection:bg-violet-500/30 relative">
      {isMobileView && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsMobileView(false)}
        />
      )}

      <aside
        className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-[#0c0c0e] border-r border-zinc-800/60 flex flex-col transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0 
        ${isMobileView ? "translate-x-0" : "-translate-x-full"}
      `}
      >
        <div className="p-6 border-b border-zinc-800/40 flex items-center justify-between gap-3">
          <div className="flex items-center md:w-full md:justify-center  gap-3">
            <Bot size={20} className="text-white" />
          </div>
          <button
            onClick={() => setIsMobileView(false)}
            className="md:hidden p-1 text-zinc-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4">
          <button
            onClick={() => {
              startNewConversation();
              setIsMobileView(false);
            }}
            className="w-full py-2.5 px-4 bg-zinc-100 hover:bg-white cursor-pointer text-zinc-950 rounded-xl flex items-center justify-center gap-2 transition-all font-semibold text-sm shadow-sm"
          >
            <Plus size={18} />
            New Conversation
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 space-y-1 py-2">
          <div className="px-3 mb-3 flex items-center justify-between text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
            <div className="flex items-center gap-2">
              <History size={12} />
              All Convesations
            </div>
          </div>
          {allConversationId.map((chat) => (
            <div
              key={chat.conversation_id}
              onClick={() => {
                fetchAChat(chat.conversation_id);
                setIsMobileView(false);
              }}
              className={`group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all duration-200 ${
                activeChatId === chat.conversation_id
                  ? "bg-zinc-800/50 text-white ring-1 ring-zinc-700/50"
                  : "hover:bg-zinc-800/30 text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <MessageSquare
                  size={16}
                  className={
                    activeChatId === chat.conversation_id
                      ? "text-violet-400"
                      : "text-zinc-600"
                  }
                />
                <span className="text-sm truncate font-medium">
                  {chat.conversation_id}
                </span>
              </div>
              <button
                onClick={(e) => deleteChat(e, chat.conversation_id)}
                className="opacity-100 p-1.5 bg-zinc-700 rounded-md text-red-400 transition-all"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      </aside>

      <main className="flex-1 flex flex-col relative bg-[#09090b] w-full min-w-0">
        <header className="h-16 border-b border-zinc-800/60 flex items-center justify-between px-4 md:px-6 bg-[#09090b]/80 backdrop-blur-xl z-10">
          <div className="flex items-center gap-4">
            <button
              onClick={toggleMobileView}
              className="md:hidden p-2 -ml-2 text-zinc-400 hover:text-white hover:bg-zinc-800/50 rounded-lg transition-colors"
            >
              <Menu size={22} />
            </button>

            {activeChat && !isSelectingMode ? (
              <>
                <div
                  className={`p-2 rounded-xl ${
                    MODES.find((m) => m.id === activeChat.mode)?.bgColor
                  }`}
                >
                  {React.createElement(
                    MODES.find((m) => m.id === activeChat.mode)?.icon ||
                      MessageSquare,
                    {
                      size: 18,
                      className: MODES.find((m) => m.id === activeChat.mode)
                        ?.color,
                    },
                  )}
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white tracking-tight truncate max-w-[150px] sm:max-w-none"></h2>
                  <div className="flex items-center gap-2">
                    <p className="text-[10px] text-white uppercase tracking-widest font-black">
                      {activeChat.mode}
                    </p>
                  </div>
                </div>
              </>
            ) : null}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-4 py-8 md:px-0">
          <div className="max-w-3xl mx-auto w-full">
            {isSelectingMode ? (
              <div className="py-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="text-center mb-12">
                  <h1 className="text-4xl font-black text-white mb-3 tracking-tighter">
                    Choose Any Mode
                  </h1>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {MODES.map((mode) => (
                    <button
                      key={mode.id}
                      onClick={() => startConversation(mode.id)}
                      className="group p-6 bg-zinc-900/30 border cursor-pointer border-zinc-800 hover:border-zinc-600 rounded-2xl text-left hover:bg-zinc-800/40 transition-all flex items-start gap-5 relative overflow-hidden"
                    >
                      <div
                        className={`p-4 rounded-2xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 ${mode.bgColor}`}
                      >
                        <mode.icon className={mode.color} size={28} />
                      </div>
                      <div className="flex-1 pt-1">
                        <h3 className="font-bold text-white mb-1 group-hover:text-violet-400 transition-colors">
                          {mode.title}
                        </h3>
                        <p className="text-xs text-zinc-500 leading-relaxed font-medium">
                          {mode.description}
                        </p>
                      </div>
                      <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <ChevronRight size={18} className="text-zinc-600" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : activeChat ? (
              <div className="space-y-10">
                {activeChats.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-24 text-center">
                    <div className="w-20 h-20 rounded-3xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-6 shadow-2xl transition-transform hover:scale-110 duration-500">
                      <Sparkles size={32} className="text-violet-500" />
                    </div>
                    <p className="text-white font-bold text-lg">
                      Empty Workspace
                    </p>
                    <p className="text-sm text-zinc-500 mt-2 max-w-xs leading-relaxed">
                      System is ready for {activeChat.mode} instructions.
                    </p>
                  </div>
                )}

                {activeChats.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex gap-5 ${
                      msg.role === "user" ? "flex-row-reverse" : "flex-row"
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-1 shadow-md ${
                        msg.role === "user"
                          ? "bg-zinc-100 text-zinc-950"
                          : "bg-zinc-900 border border-zinc-800 text-zinc-400"
                      }`}
                    >
                      {msg.role === "user" ? (
                        <User size={18} />
                      ) : (
                        <Bot size={18} />
                      )}
                    </div>
                    <div
                      className={`flex flex-col max-w-[85%] ${
                        msg.role === "user" ? "items-end" : "items-start"
                      }`}
                    >
                      <div
                        className={`px-5 py-3.5 rounded-2xl text-[15px] leading-relaxed font-medium shadow-sm transition-all ${
                          msg.role === "user"
                            ? "bg-zinc-100 text-zinc-950 rounded-tr-none"
                            : "bg-zinc-900/50 border border-zinc-800/60 text-zinc-200 rounded-tl-none"
                        }`}
                      >
                        <div className="message prose prose-invert max-w-none">
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm, remarkMath, rehypeKatex]}
                            components={{
                              h1: ({ ...props }) => (
                                <h1
                                  className="text-3xl font-bold mb-4 mt-6 text-white"
                                  {...props}
                                />
                              ),
                              h2: ({ ...props }) => (
                                <h2
                                  className="text-2xl font-bold mb-3 mt-5 text-white"
                                  {...props}
                                />
                              ),
                              h3: ({ ...props }) => (
                                <h3
                                  className="text-xl font-semibold mb-2 mt-4 text-white"
                                  {...props}
                                />
                              ),
                              p: ({ ...props }) => (
                                <p
                                  className="mb-3 text-base leading-relaxed "
                                  {...props}
                                />
                              ),
                              ul: ({ ...props }) => (
                                <ul
                                  className="list-disc ml-6 mb-3 space-y-1 text-gray-200"
                                  {...props}
                                />
                              ),
                              ol: ({ ...props }) => (
                                <ol
                                  className="list-decimal ml-6 mb-3 space-y-1 text-gray-200"
                                  {...props}
                                />
                              ),
                              li: ({ ...props }) => (
                                <li className="mb-1 text-gray-200" {...props} />
                              ),
                              strong: ({ ...props }) => (
                                <strong
                                  className="font-bold text-white"
                                  {...props}
                                />
                              ),
                              code: ({
                                inline,
                                className,
                                children,
                                ...props
                              }: any) => {
                                const match = /language-(\w+)/.exec(
                                  className || "",
                                );
                                const language = match ? match[1] : "";
                                const value = String(children).replace(
                                  /\n$/,
                                  "",
                                );
                                const isCodeBlock =
                                  !inline && (match || value.includes("\n"));

                                if (inline || !isCodeBlock) {
                                  return (
                                    <code
                                      className="bg-zinc-800 text-red-400 px-1.5 py-0.5 rounded text-sm font-mono"
                                      {...props}
                                    >
                                      {children}
                                    </code>
                                  );
                                }

                                return (
                                  <CodeBlock
                                    language={language}
                                    value={value}
                                  />
                                );
                              },
                              pre: ({ children }) => {
                                return <>{children}</>;
                              },
                            }}
                          >
                            {msg.content}
                          </ReactMarkdown>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {isBotTyping && (
                  <div className="flex gap-5">
                    <div className="w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center flex-shrink-0">
                      <Bot size={18} className="text-zinc-600 animate-pulse" />
                    </div>
                    <div className="bg-zinc-900/30 border border-zinc-800/40 px-5 py-4 rounded-2xl rounded-tl-none flex gap-1.5 items-center">
                      <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                      <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                      <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce"></div>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center py-20 text-center">
                <div className="w-24 h-24 bg-zinc-900 rounded-[2.5rem] flex items-center justify-center mb-8 border border-zinc-800 shadow-2xl relative overflow-hidden group">
                  <div className="absolute inset-0 bg-violet-600 opacity-0 group-hover:opacity-10 transition-opacity duration-700"></div>
                  <Bot
                    size={48}
                    className="text-violet-500 group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <button
                  onClick={() => {
                    startNewConversation();
                    setIsMobileView(false);
                  }}
                  className="px-8 py-4 bg-zinc-100 hover:bg-white text-zinc-950 rounded-2xl font-black transition-all shadow-xl shadow-zinc-950/20 active:scale-95 flex items-center gap-3"
                >
                  <Plus size={20} /> Start New Conversation
                </button>
              </div>
            )}
          </div>
        </div>

        {!isSelectingMode && activeChat && (
          <footer className="p-6 bg-[#09090b]">
            <div className="max-w-3xl mx-auto">
              <form
                onSubmit={handleSendMessage}
                className="relative group bg-zinc-900/50 rounded-2xl border border-zinc-800/60 focus-within:border-zinc-600 transition-all p-1"
              >
                <textarea
                  // type="text"
                  rows={2}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Enter prompt..."
                  className="w-full bg-transparent text-white rounded-xl py-4 pl-5 pr-14 focus:outline-none text-[15px] font-medium placeholder:text-zinc-600"
                />
                <button
                  type="submit"
                  disabled={!inputValue.trim() || isBotTyping}
                  className={`absolute right-2 top-1/2 -translate-y-1/2 p-2.5 rounded-xl transition-all ${
                    inputValue.trim() && !isBotTyping
                      ? "bg-zinc-100 text-zinc-950 hover:bg-white"
                      : "text-zinc-700 bg-zinc-800/50 cursor-not-allowed"
                  }`}
                >
                  <div className="flex flex-row gap-5">
                    <Send size={18} />
                  </div>
                </button>

                {activeChat?.mode == "rag" ? (
                  <button
                    type="button"
                    onClick={() => setShowFileUpload(true)}
                    className={`absolute right-13 top-1/2 -translate-y-1/2 p-2.5 rounded-xl transition-all bg-zinc-100 text-zinc-950 hover:bg-white`}
                  >
                    <div className="flex flex-row ">
                      <input
                        type="file"
                        id="fileUpload"
                        className="hidden"
                        accept=".pdf"
                        onChange={handleFileUpload}
                      />
                      <label
                        htmlFor="fileUpload"
                        className="cursor-pointer  rounded-xl"
                      >
                        <Upload size={18} />
                      </label>
                    </div>
                  </button>
                ) : null}
              </form>
            </div>
          </footer>
        )}
      </main>
    </div>
  );
};

export default Chats;
