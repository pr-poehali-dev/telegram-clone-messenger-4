import { useState, useRef, useEffect } from "react";
import Icon from "@/components/ui/icon";

const CHATS = [
  {
    id: 1,
    name: "Александра Иванова",
    avatar: "А",
    color: "#5288c1",
    lastMsg: "Окей, увидимся завтра 👍",
    time: "22:14",
    unread: 0,
    online: true,
    messages: [
      { id: 1, from: "them", text: "Привет! Как дела?", time: "21:50" },
      { id: 2, from: "me", text: "Всё хорошо, спасибо! А у тебя?", time: "21:52" },
      { id: 3, from: "them", text: "Отлично. Встретимся завтра в кафе?", time: "22:10" },
      { id: 4, from: "me", text: "Да, конечно! В 13:00 подойдёт?", time: "22:12" },
      { id: 5, from: "them", text: "Окей, увидимся завтра 👍", time: "22:14" },
    ],
  },
  {
    id: 2,
    name: "Рабочий чат",
    avatar: "Р",
    color: "#ee4928",
    lastMsg: "Миша: Отчёт готов, отправил на почту",
    time: "20:33",
    unread: 3,
    online: false,
    messages: [
      { id: 1, from: "them", text: "Всем доброе утро! Напоминаю про созвон в 10:00", time: "09:01" },
      { id: 2, from: "me", text: "Буду, спасибо за напоминание", time: "09:15" },
      { id: 3, from: "them", text: "Миша: Отчёт готов, отправил на почту", time: "20:33" },
    ],
  },
  {
    id: 3,
    name: "Дмитрий Петров",
    avatar: "Д",
    color: "#3d8b6a",
    lastMsg: "Ты: Договорились!",
    time: "вчера",
    unread: 0,
    online: false,
    messages: [
      { id: 1, from: "them", text: "Можешь помочь с проектом?", time: "вчера" },
      { id: 2, from: "me", text: "Договорились!", time: "вчера" },
    ],
  },
  {
    id: 4,
    name: "Мама",
    avatar: "М",
    color: "#c1925b",
    lastMsg: "Позвони когда будешь свободен",
    time: "вчера",
    unread: 1,
    online: true,
    messages: [
      { id: 1, from: "them", text: "Сынок, как ты?", time: "вчера" },
      { id: 2, from: "me", text: "Всё отлично мам, занят немного", time: "вчера" },
      { id: 3, from: "them", text: "Позвони когда будешь свободен", time: "вчера" },
    ],
  },
  {
    id: 5,
    name: "Новости Tech",
    avatar: "Н",
    color: "#7c5cbf",
    lastMsg: "Apple представила новый MacBook...",
    time: "пн",
    unread: 12,
    online: false,
    messages: [
      { id: 1, from: "them", text: "Apple представила новый MacBook с чипом M4 Ultra. Производительность выросла на 40%.", time: "пн" },
    ],
  },
  {
    id: 6,
    name: "Сергей Волков",
    avatar: "С",
    color: "#c15b5b",
    lastMsg: "👍",
    time: "вс",
    unread: 0,
    online: false,
    messages: [
      { id: 1, from: "me", text: "Серёга, увидимся на выходных?", time: "вс" },
      { id: 2, from: "them", text: "👍", time: "вс" },
    ],
  },
];

type Message = { id: number; from: string; text: string; time: string };
type Chat = typeof CHATS[0];

export default function Index() {
  const [chats, setChats] = useState(CHATS);
  const [activeChat, setActiveChat] = useState<Chat>(CHATS[0]);
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const [showSidebar, setShowSidebar] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeChat, activeChat.messages]);

  const filteredChats = chats.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const sendMessage = () => {
    const text = input.trim();
    if (!text) return;

    const now = new Date();
    const time = `${now.getHours()}:${String(now.getMinutes()).padStart(2, "0")}`;
    const newMsg: Message = { id: Date.now(), from: "me", text, time };

    const updated = chats.map((c) =>
      c.id === activeChat.id
        ? { ...c, messages: [...c.messages, newMsg], lastMsg: `Ты: ${text}`, time }
        : c
    );
    const updatedActive = updated.find((c) => c.id === activeChat.id)!;
    setChats(updated);
    setActiveChat(updatedActive);
    setInput("");
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const selectChat = (chat: Chat) => {
    const updated = chats.map((c) => c.id === chat.id ? { ...c, unread: 0 } : c);
    setChats(updated);
    setActiveChat(updated.find((c) => c.id === chat.id)!);
    setShowSidebar(false);
  };

  return (
    <div className="tg-app">
      {/* Sidebar */}
      <aside className={`tg-sidebar ${showSidebar ? "tg-sidebar--open" : ""}`}>
        <div className="tg-sidebar-header">
          <button className="tg-icon-btn" title="Меню">
            <Icon name="Menu" size={20} />
          </button>
          <div className="tg-search-wrap">
            <Icon name="Search" size={15} className="tg-search-icon" />
            <input
              className="tg-search"
              placeholder="Поиск"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button className="tg-icon-btn" title="Написать">
            <Icon name="PenSquare" size={20} />
          </button>
        </div>

        <div className="tg-chat-list">
          {filteredChats.map((chat) => (
            <button
              key={chat.id}
              className={`tg-chat-item ${activeChat.id === chat.id ? "tg-chat-item--active" : ""}`}
              onClick={() => selectChat(chat)}
            >
              <div className="tg-avatar" style={{ background: chat.color }}>
                {chat.avatar}
                {chat.online && <span className="tg-online-dot" />}
              </div>
              <div className="tg-chat-info">
                <div className="tg-chat-top">
                  <span className="tg-chat-name">{chat.name}</span>
                  <span className="tg-chat-time">{chat.time}</span>
                </div>
                <div className="tg-chat-bottom">
                  <span className="tg-chat-preview">{chat.lastMsg}</span>
                  {chat.unread > 0 && (
                    <span className="tg-badge">{chat.unread}</span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </aside>

      {/* Overlay for mobile */}
      {showSidebar && (
        <div className="tg-overlay" onClick={() => setShowSidebar(false)} />
      )}

      {/* Main chat area */}
      <main className="tg-main">
        {/* Chat header */}
        <header className="tg-chat-header">
          <button
            className="tg-icon-btn tg-mobile-menu"
            onClick={() => setShowSidebar(true)}
          >
            <Icon name="ArrowLeft" size={20} />
          </button>
          <div className="tg-avatar tg-avatar--sm" style={{ background: activeChat.color }}>
            {activeChat.avatar}
            {activeChat.online && <span className="tg-online-dot" />}
          </div>
          <div className="tg-header-info">
            <span className="tg-header-name">{activeChat.name}</span>
            <span className="tg-header-status">
              {activeChat.online ? "в сети" : "был(а) недавно"}
            </span>
          </div>
          <div className="tg-header-actions">
            <button className="tg-icon-btn"><Icon name="Search" size={18} /></button>
            <button className="tg-icon-btn"><Icon name="Phone" size={18} /></button>
            <button className="tg-icon-btn"><Icon name="MoreVertical" size={18} /></button>
          </div>
        </header>

        {/* Messages */}
        <div className="tg-messages">
          <div className="tg-messages-inner">
            {activeChat.messages.map((msg, i) => (
              <div
                key={msg.id}
                className={`tg-msg-wrap ${msg.from === "me" ? "tg-msg-wrap--me" : ""}`}
                style={{ animationDelay: `${i * 0.04}s` }}
              >
                <div className={`tg-bubble ${msg.from === "me" ? "tg-bubble--me" : "tg-bubble--them"}`}>
                  <span className="tg-bubble-text">{msg.text}</span>
                  <span className="tg-bubble-time">
                    {msg.time}
                    {msg.from === "me" && (
                      <Icon name="CheckCheck" size={14} className="tg-check" />
                    )}
                  </span>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input */}
        <div className="tg-input-bar">
          <button className="tg-icon-btn"><Icon name="Smile" size={22} /></button>
          <div className="tg-input-wrap">
            <textarea
              ref={inputRef}
              className="tg-input"
              placeholder="Написать сообщение..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              rows={1}
            />
          </div>
          <button className="tg-icon-btn"><Icon name="Paperclip" size={20} /></button>
          {input.trim() ? (
            <button className="tg-send-btn" onClick={sendMessage}>
              <Icon name="Send" size={18} />
            </button>
          ) : (
            <button className="tg-icon-btn"><Icon name="Mic" size={20} /></button>
          )}
        </div>
      </main>
    </div>
  );
}
