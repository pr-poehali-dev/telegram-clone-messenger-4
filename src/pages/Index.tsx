import { useState, useRef, useEffect } from "react";
import Icon from "@/components/ui/icon";

// ─── Auth screens ───────────────────────────────────────────────────────────

function AuthPhone({ onNext }: { onNext: (phone: string) => void }) {
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState({ code: "+7", flag: "🇷🇺", name: "Россия" });
  const [showCountry, setShowCountry] = useState(false);

  const countries = [
    { code: "+7", flag: "🇷🇺", name: "Россия" },
    { code: "+380", flag: "🇺🇦", name: "Украина" },
    { code: "+375", flag: "🇧🇾", name: "Беларусь" },
    { code: "+7", flag: "🇰🇿", name: "Казахстан" },
    { code: "+1", flag: "🇺🇸", name: "США" },
    { code: "+44", flag: "🇬🇧", name: "Великобритания" },
    { code: "+49", flag: "🇩🇪", name: "Германия" },
  ];

  const formatted = phone.replace(/\D/g, "").slice(0, 10);
  const display = formatted.replace(/(\d{3})(\d{0,3})(\d{0,4})/, (_, a, b, c) =>
    [a, b, c].filter(Boolean).join(" ")
  );

  return (
    <div className="auth-screen">
      <div className="auth-logo">
        <div className="auth-logo-icon">
          <svg viewBox="0 0 48 48" width="72" height="72" fill="none">
            <circle cx="24" cy="24" r="24" fill="#5288c1"/>
            <path d="M34 16L20.5 29.5L14 23" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M34 16L26 32L20.5 29.5" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" opacity="0.6"/>
          </svg>
        </div>
        <h1 className="auth-title">Vega</h1>
        <p className="auth-subtitle">Пожалуйста, введите ваш номер телефона</p>
      </div>

      <div className="auth-form">
        <div className="auth-phone-row">
          <button className="auth-country-btn" onClick={() => setShowCountry(!showCountry)}>
            <span className="auth-flag">{country.flag}</span>
            <span className="auth-code">{country.code}</span>
            <Icon name="ChevronDown" size={13} />
          </button>
          <input
            className="auth-phone-input"
            placeholder="000 000 0000"
            value={display}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
            inputMode="numeric"
            autoFocus
          />
        </div>

        {showCountry && (
          <div className="auth-country-list">
            {countries.map((c, i) => (
              <button key={i} className="auth-country-item" onClick={() => { setCountry(c); setShowCountry(false); }}>
                <span>{c.flag}</span>
                <span className="auth-country-name">{c.name}</span>
                <span className="auth-country-code">{c.code}</span>
              </button>
            ))}
          </div>
        )}

        <button
          className="auth-btn"
          onClick={() => formatted.length >= 10 && onNext(`${country.code} ${display}`)}
          disabled={formatted.length < 10}
        >
          Далее
        </button>
        <p className="auth-hint">Введите номер вашего телефона.<br/>На него придёт код подтверждения.</p>
      </div>
    </div>
  );
}

function AuthCode({ phone, onNext, onBack }: { phone: string; onNext: (name: string) => void; onBack: () => void }) {
  const [code, setCode] = useState(["", "", "", "", ""]);
  const r0 = useRef<HTMLInputElement>(null);
  const r1 = useRef<HTMLInputElement>(null);
  const r2 = useRef<HTMLInputElement>(null);
  const r3 = useRef<HTMLInputElement>(null);
  const r4 = useRef<HTMLInputElement>(null);
  const refs = [r0, r1, r2, r3, r4];

  const handleDigit = (i: number, val: string) => {
    const d = val.replace(/\D/g, "").slice(-1);
    const next = [...code];
    next[i] = d;
    setCode(next);
    if (d && i < 4) refs[i + 1].current?.focus();
    if (next.every((x) => x)) setTimeout(() => onNext("Иван"), 400);
  };

  const handleKey = (i: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[i] && i > 0) refs[i - 1].current?.focus();
  };

  return (
    <div className="auth-screen">
      <button className="auth-back" onClick={onBack}>
        <Icon name="ArrowLeft" size={20} />
      </button>
      <div className="auth-logo">
        <div className="auth-logo-icon">
          <svg viewBox="0 0 48 48" width="72" height="72" fill="none">
            <circle cx="24" cy="24" r="24" fill="#5288c1"/>
            <rect x="12" y="16" width="24" height="18" rx="3" fill="white" opacity="0.9"/>
            <rect x="16" y="22" width="16" height="2" rx="1" fill="#5288c1"/>
            <rect x="16" y="27" width="10" height="2" rx="1" fill="#5288c1" opacity="0.6"/>
          </svg>
        </div>
        <h1 className="auth-title">{phone}</h1>
        <p className="auth-subtitle">Мы отправили SMS с кодом.<br/>Введите код <b style={{color:"#5288c1"}}>12345</b> для демо.</p>
      </div>
      <div className="auth-form">
        <div className="auth-code-row">
          {code.map((d, i) => (
            <input
              key={i}
              ref={refs[i]}
              className="auth-code-input"
              value={d}
              maxLength={1}
              inputMode="numeric"
              autoFocus={i === 0}
              onChange={(e) => handleDigit(i, e.target.value)}
              onKeyDown={(e) => handleKey(i, e)}
            />
          ))}
        </div>
        <p className="auth-hint">Отправить код повторно через <b>59 сек</b></p>
      </div>
    </div>
  );
}

// ─── Data ────────────────────────────────────────────────────────────────────

const INITIAL_CHATS = [
  {
    id: 1, name: "Александра Иванова", avatar: "А", color: "#5288c1",
    lastMsg: "Окей, увидимся завтра 👍", time: "22:14", unread: 0, online: true, pinned: true, muted: false,
    messages: [
      { id: 1, from: "them", text: "Привет! Как дела?", time: "21:50", read: true },
      { id: 2, from: "me", text: "Всё хорошо, спасибо! А у тебя?", time: "21:52", read: true },
      { id: 3, from: "them", text: "Отлично. Встретимся завтра в кафе?", time: "22:10", read: true },
      { id: 4, from: "me", text: "Да, конечно! В 13:00 подойдёт?", time: "22:12", read: true },
      { id: 5, from: "them", text: "Окей, увидимся завтра 👍", time: "22:14", read: true },
    ],
  },
  {
    id: 2, name: "Рабочий чат 💼", avatar: "Р", color: "#ee4928",
    lastMsg: "Миша: Отчёт готов, отправил на почту", time: "20:33", unread: 3, online: false, pinned: true, muted: false,
    messages: [
      { id: 1, from: "them", text: "Всем доброе утро! Напоминаю про созвон в 10:00", time: "09:01", read: true },
      { id: 2, from: "me", text: "Буду, спасибо за напоминание", time: "09:15", read: true },
      { id: 3, from: "them", text: "Миша: Отчёт готов, отправил на почту", time: "20:33", read: false },
    ],
  },
  {
    id: 3, name: "Дмитрий Петров", avatar: "Д", color: "#3d8b6a",
    lastMsg: "Договорились!", time: "вчера", unread: 0, online: false, pinned: false, muted: false,
    messages: [
      { id: 1, from: "them", text: "Можешь помочь с проектом?", time: "вчера", read: true },
      { id: 2, from: "me", text: "Договорились!", time: "вчера", read: true },
    ],
  },
  {
    id: 4, name: "Мама", avatar: "М", color: "#c1925b",
    lastMsg: "Позвони когда будешь свободен", time: "вчера", unread: 1, online: true, pinned: false, muted: false,
    messages: [
      { id: 1, from: "them", text: "Сынок, как ты?", time: "вчера", read: true },
      { id: 2, from: "me", text: "Всё отлично мам, занят немного", time: "вчера", read: true },
      { id: 3, from: "them", text: "Позвони когда будешь свободен", time: "вчера", read: false },
    ],
  },
  {
    id: 5, name: "Новости Tech 📡", avatar: "Н", color: "#7c5cbf",
    lastMsg: "Apple представила новый MacBook с чипом M4 Ultra...", time: "пн", unread: 12, online: false, pinned: false, muted: true,
    messages: [
      { id: 1, from: "them", text: "Apple представила новый MacBook с чипом M4 Ultra. Производительность выросла на 40%.", time: "пн", read: false },
      { id: 2, from: "them", text: "Google объявила об обновлении алгоритма поиска. Изменения затронут 15% запросов.", time: "пн", read: false },
    ],
  },
  {
    id: 6, name: "Сергей Волков", avatar: "С", color: "#c15b5b",
    lastMsg: "👍", time: "вс", unread: 0, online: false, pinned: false, muted: false,
    messages: [
      { id: 1, from: "me", text: "Серёга, увидимся на выходных?", time: "вс", read: true },
      { id: 2, from: "them", text: "👍", time: "вс", read: true },
    ],
  },
  {
    id: 7, name: "Елена Смирнова", avatar: "Е", color: "#5b8fc1",
    lastMsg: "Спасибо за помощь!", time: "сб", unread: 0, online: false, pinned: false, muted: false,
    messages: [
      { id: 1, from: "them", text: "Привет! Ты не мог бы помочь с вопросом?", time: "сб", read: true },
      { id: 2, from: "me", text: "Конечно, расскажи в чём проблема.", time: "сб", read: true },
      { id: 3, from: "them", text: "Спасибо за помощь!", time: "сб", read: true },
    ],
  },
];

type Chat = typeof INITIAL_CHATS[0];

// ─── Main App ────────────────────────────────────────────────────────────────

export default function Index() {
  const [auth, setAuth] = useState<"phone" | "code" | "app">("phone");
  const [authPhone, setAuthPhone] = useState("");

  const [chats, setChats] = useState(INITIAL_CHATS);
  const [activeId, setActiveId] = useState<number>(1);
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; chatId: number } | null>(null);
  const [msgContext, setMsgContext] = useState<{ x: number; y: number; msgId: number } | null>(null);
  const [filter, setFilter] = useState<"all" | "unread" | "groups">("all");
  const [showProfile, setShowProfile] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const activeChat = chats.find((c) => c.id === activeId)!;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeId, chats]);

  useEffect(() => {
    const close = () => { setContextMenu(null); setMsgContext(null); };
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, []);

  const filteredChats = chats
    .filter((c) => {
      if (search) return c.name.toLowerCase().includes(search.toLowerCase());
      if (filter === "unread") return c.unread > 0;
      if (filter === "groups") return c.name.includes("чат") || c.name.includes("📡");
      return true;
    })
    .sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));

  const totalUnread = chats.reduce((s, c) => s + (c.muted ? 0 : c.unread), 0);

  const sendMessage = () => {
    const text = input.trim();
    if (!text) return;
    const now = new Date();
    const time = `${now.getHours()}:${String(now.getMinutes()).padStart(2, "0")}`;
    const newMsg = { id: Date.now(), from: "me", text, time, read: false };
    setChats((prev) => prev.map((c) =>
      c.id === activeId ? { ...c, messages: [...c.messages, newMsg], lastMsg: `Ты: ${text}`, time, unread: 0 } : c
    ));
    setInput("");
    setTimeout(() => { if (inputRef.current) { inputRef.current.style.height = "auto"; } }, 0);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const selectChat = (id: number) => {
    setChats((prev) => prev.map((c) => c.id === id ? { ...c, unread: 0 } : c));
    setActiveId(id);
    setShowMobileSidebar(false);
    setShowProfile(false);
  };

  const pinChat = (id: number) => {
    setChats((prev) => prev.map((c) => c.id === id ? { ...c, pinned: !c.pinned } : c));
    setContextMenu(null);
  };

  const muteChat = (id: number) => {
    setChats((prev) => prev.map((c) => c.id === id ? { ...c, muted: !c.muted } : c));
    setContextMenu(null);
  };

  // ── Auth ──
  if (auth === "phone") return <AuthPhone onNext={(p) => { setAuthPhone(p); setAuth("code"); }} />;
  if (auth === "code") return <AuthCode phone={authPhone} onBack={() => setAuth("phone")} onNext={() => setAuth("app")} />;

  return (
    <div className="tg-app" onClick={() => { setContextMenu(null); setMsgContext(null); }}>

      {/* Sidebar */}
      <aside className={`tg-sidebar ${showMobileSidebar ? "tg-sidebar--open" : ""}`}>
        <div className="tg-sidebar-header">
          <button className="tg-icon-btn"><Icon name="Menu" size={20} /></button>
          <div className="tg-search-wrap">
            <Icon name="Search" size={15} className="tg-search-icon" />
            <input
              className="tg-search"
              placeholder="Поиск"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && <button className="tg-search-clear" onClick={() => setSearch("")}><Icon name="X" size={13} /></button>}
          </div>
          <button className="tg-icon-btn"><Icon name="PenSquare" size={20} /></button>
        </div>

        {!search && (
          <div className="tg-filters">
            {(["all", "unread", "groups"] as const).map((f) => (
              <button key={f} className={`tg-filter-tab ${filter === f ? "tg-filter-tab--active" : ""}`} onClick={() => setFilter(f)}>
                {f === "all" ? "Все" : f === "unread" ? `Непрочитанные${totalUnread ? ` ${totalUnread}` : ""}` : "Группы"}
              </button>
            ))}
          </div>
        )}

        <div className="tg-chat-list">
          {filteredChats.length === 0 && <div className="tg-empty">Ничего не найдено</div>}
          {filteredChats.map((chat) => (
            <button
              key={chat.id}
              className={`tg-chat-item ${activeId === chat.id ? "tg-chat-item--active" : ""}`}
              onClick={() => selectChat(chat.id)}
              onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); setContextMenu({ x: e.clientX, y: e.clientY, chatId: chat.id }); }}
            >
              <div className="tg-avatar" style={{ background: chat.color }}>
                {chat.avatar}
                {chat.online && <span className="tg-online-dot" />}
              </div>
              <div className="tg-chat-info">
                <div className="tg-chat-top">
                  <span className="tg-chat-name">
                    {chat.pinned && <Icon name="Pin" size={11} className="tg-pin-icon" />}
                    {chat.name}
                  </span>
                  <span className="tg-chat-time">{chat.time}</span>
                </div>
                <div className="tg-chat-bottom">
                  <span className="tg-chat-preview">{chat.lastMsg}</span>
                  <div className="tg-chat-badges">
                    {chat.muted && <Icon name="BellOff" size={13} className="tg-muted-icon" />}
                    {chat.unread > 0 && <span className={`tg-badge ${chat.muted ? "tg-badge--muted" : ""}`}>{chat.unread}</span>}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="tg-sidebar-nav">
          <button className="tg-nav-btn tg-nav-btn--active" title="Чаты"><Icon name="MessageCircle" size={22} /></button>
          <button className="tg-nav-btn" title="Контакты"><Icon name="Users" size={22} /></button>
          <button className="tg-nav-btn" title="Звонки"><Icon name="Phone" size={22} /></button>
          <button className="tg-nav-btn" title="Закладки"><Icon name="Bookmark" size={22} /></button>
          <button className="tg-nav-btn" title="Настройки" onClick={() => setAuth("phone")}>
            <Icon name="Settings" size={22} />
          </button>
        </div>
      </aside>

      {showMobileSidebar && <div className="tg-overlay" onClick={() => setShowMobileSidebar(false)} />}

      {/* Context menu — chats */}
      {contextMenu && (
        <div className="tg-context-menu" style={{ top: contextMenu.y, left: contextMenu.x }} onClick={(e) => e.stopPropagation()}>
          {[
            { icon: "Pin", label: chats.find(c => c.id === contextMenu.chatId)?.pinned ? "Открепить" : "Закрепить", action: () => pinChat(contextMenu.chatId) },
            { icon: "BellOff", label: chats.find(c => c.id === contextMenu.chatId)?.muted ? "Включить звук" : "Без звука", action: () => muteChat(contextMenu.chatId) },
            { icon: "CheckCheck", label: "Пометить прочитанным", action: () => { setChats(p => p.map(c => c.id === contextMenu.chatId ? {...c, unread: 0} : c)); setContextMenu(null); } },
            { icon: "Archive", label: "Архивировать", action: () => setContextMenu(null) },
            { icon: "Trash2", label: "Удалить чат", action: () => setContextMenu(null), danger: true },
          ].map((item, i) => (
            <button key={i} className={`tg-context-item ${item.danger ? "tg-context-item--danger" : ""}`} onClick={item.action}>
              <Icon name={item.icon as "Pin"} size={16} /><span>{item.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Context menu — messages */}
      {msgContext && (
        <div className="tg-context-menu" style={{ top: msgContext.y, left: msgContext.x }} onClick={(e) => e.stopPropagation()}>
          {[
            { icon: "Reply", label: "Ответить" },
            { icon: "Copy", label: "Копировать" },
            { icon: "Forward", label: "Переслать" },
            { icon: "Pencil", label: "Изменить" },
            { icon: "Trash2", label: "Удалить", danger: true },
          ].map((item, i) => (
            <button key={i} className={`tg-context-item ${item.danger ? "tg-context-item--danger" : ""}`} onClick={() => setMsgContext(null)}>
              <Icon name={item.icon as "Reply"} size={16} /><span>{item.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Main */}
      <main className="tg-main">
        <header className="tg-chat-header" onClick={() => setShowProfile(!showProfile)} style={{ cursor: "pointer" }}>
          <button className="tg-icon-btn tg-mobile-menu" onClick={(e) => { e.stopPropagation(); setShowMobileSidebar(true); }}>
            <Icon name="ArrowLeft" size={20} />
          </button>
          <div className="tg-avatar tg-avatar--sm" style={{ background: activeChat.color }}>
            {activeChat.avatar}
            {activeChat.online && <span className="tg-online-dot tg-online-dot--sm" />}
          </div>
          <div className="tg-header-info">
            <span className="tg-header-name">{activeChat.name}</span>
            <span className="tg-header-status">
              {activeChat.online ? "в сети" : "был(а) недавно"}
            </span>
          </div>
          <div className="tg-header-actions" onClick={(e) => e.stopPropagation()}>
            <button className="tg-icon-btn"><Icon name="Search" size={18} /></button>
            <button className="tg-icon-btn"><Icon name="Phone" size={18} /></button>
            <button className="tg-icon-btn"><Icon name="MoreVertical" size={18} /></button>
          </div>
        </header>

        <div className="tg-messages">
          <div className="tg-date-sep"><span>Сегодня</span></div>
          <div className="tg-messages-inner">
            {activeChat.messages.map((msg, i) => {
              const isMe = msg.from === "me";
              return (
                <div
                  key={msg.id}
                  className={`tg-msg-wrap ${isMe ? "tg-msg-wrap--me" : ""}`}
                  style={{ animationDelay: `${i * 0.035}s` }}
                  onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); setMsgContext({ x: e.clientX, y: e.clientY, msgId: msg.id }); }}
                >
                  <div className={`tg-bubble ${isMe ? "tg-bubble--me" : "tg-bubble--them"}`}>
                    <span className="tg-bubble-text">{msg.text}</span>
                    <span className="tg-bubble-meta">
                      {msg.time}
                      {isMe && <Icon name={msg.read ? "CheckCheck" : "Check"} size={14} className={`tg-check ${msg.read ? "tg-check--read" : ""}`} />}
                    </span>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        </div>

        <div className="tg-input-bar">
          <button className="tg-icon-btn"><Icon name="Smile" size={22} /></button>
          <div className="tg-input-wrap">
            <textarea
              ref={inputRef}
              className="tg-input"
              placeholder="Написать сообщение..."
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKey}
              rows={1}
            />
            <button className="tg-attach-btn"><Icon name="Paperclip" size={18} /></button>
          </div>
          {input.trim() ? (
            <button className="tg-send-btn" onClick={sendMessage}>
              <Icon name="Send" size={18} />
            </button>
          ) : (
            <button className="tg-send-btn tg-send-btn--mic">
              <Icon name="Mic" size={20} />
            </button>
          )}
        </div>
      </main>

      {/* Profile panel */}
      {showProfile && (
        <aside className="tg-profile-panel animate-slide-in-right">
          <div className="tg-profile-header">
            <button className="tg-icon-btn" onClick={(e) => { e.stopPropagation(); setShowProfile(false); }}>
              <Icon name="X" size={20} />
            </button>
            <span className="tg-profile-title">Информация</span>
          </div>
          <div className="tg-profile-avatar-wrap">
            <div className="tg-profile-avatar" style={{ background: activeChat.color }}>{activeChat.avatar}</div>
            {activeChat.online && <span className="tg-profile-online-badge">в сети</span>}
          </div>
          <div className="tg-profile-name">{activeChat.name}</div>
          <div className="tg-profile-actions">
            <button className="tg-profile-btn"><Icon name="MessageCircle" size={20} /><span>Сообщение</span></button>
            <button className="tg-profile-btn"><Icon name="Phone" size={20} /><span>Звонок</span></button>
            <button className="tg-profile-btn"><Icon name="Video" size={20} /><span>Видео</span></button>
            <button className="tg-profile-btn"><Icon name="BellOff" size={20} /><span>Без звука</span></button>
          </div>
          <div className="tg-profile-rows">
            {[
              { icon: "Phone", label: "+7 999 000-00-00", sub: "Телефон" },
              { icon: "AtSign", label: "@" + activeChat.name.split(" ")[0].toLowerCase(), sub: "Имя пользователя" },
              { icon: "Info", label: "Привет, я использую Vega!", sub: "О себе" },
            ].map((row, i) => (
              <div key={i} className="tg-profile-row">
                <Icon name={row.icon as "Phone"} size={20} className="tg-profile-row-icon" />
                <div>
                  <div className="tg-profile-row-val">{row.label}</div>
                  <div className="tg-profile-row-sub">{row.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </aside>
      )}
    </div>
  );
}