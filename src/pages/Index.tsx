import { useState, useRef, useEffect, useCallback } from "react";
import Icon from "@/components/ui/icon";

// ─── Types ───────────────────────────────────────────────────────────────────
type ChatType = "personal" | "group" | "channel" | "secret" | "bot";
type MsgType = "text" | "voice" | "sticker" | "file" | "system";
interface Reaction { emoji: string; count: number; mine: boolean; }
interface Message {
  id: number; from: string; text: string; time: string; read: boolean;
  type?: MsgType; reactions?: Reaction[]; edited?: boolean; forwarded?: string;
  fileName?: string; fileSize?: string;
}
interface Chat {
  id: number; name: string; avatar: string; color: string;
  lastMsg: string; time: string; unread: number; online: boolean;
  pinned: boolean; muted: boolean; type: ChatType;
  verified?: boolean; premium?: boolean; secret?: boolean;
  members?: number; description?: string; messages: Message[];
  folder?: string;
}

// ─── Auth ────────────────────────────────────────────────────────────────────
function VegaLogo({ size = 72 }: { size?: number }) {
  return (
    <svg viewBox="0 0 48 48" width={size} height={size} fill="none">
      <defs>
        <linearGradient id="vgr" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#5b9bd5"/>
          <stop offset="100%" stopColor="#3a6fa8"/>
        </linearGradient>
      </defs>
      <circle cx="24" cy="24" r="24" fill="url(#vgr)"/>
      <path d="M12 22 L20 30 L36 14" stroke="white" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M19 22 L27 30 L36 14" stroke="white" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" opacity="0.45"/>
    </svg>
  );
}

function AuthPhone({ onNext }: { onNext: (phone: string) => void }) {
  const [tab, setTab] = useState<"phone" | "email">("phone");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [country, setCountry] = useState({ code: "+7", flag: "🇷🇺", name: "Россия" });
  const [showCountry, setShowCountry] = useState(false);

  const countries = [
    { code: "+7", flag: "🇷🇺", name: "Россия" },
    { code: "+380", flag: "🇺🇦", name: "Украина" },
    { code: "+375", flag: "🇧🇾", name: "Беларусь" },
    { code: "+77", flag: "🇰🇿", name: "Казахстан" },
    { code: "+1", flag: "🇺🇸", name: "США" },
    { code: "+44", flag: "🇬🇧", name: "Великобритания" },
    { code: "+49", flag: "🇩🇪", name: "Германия" },
    { code: "+33", flag: "🇫🇷", name: "Франция" },
    { code: "+998", flag: "🇺🇿", name: "Узбекистан" },
  ];

  const fmt = phone.replace(/\D/g, "").slice(0, 10);
  const disp = fmt.replace(/(\d{3})(\d{0,3})(\d{0,4})/, (_, a, b, c) => [a, b, c].filter(Boolean).join(" "));
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const canNext = tab === "phone" ? fmt.length >= 10 : emailOk;

  return (
    <div className="auth-screen">
      <div className="auth-logo">
        <div className="auth-logo-icon"><VegaLogo /></div>
        <h1 className="auth-title">Vega</h1>
        <p className="auth-subtitle">Быстрый и защищённый мессенджер</p>
      </div>

      <div className="auth-tabs">
        <button className={`auth-tab ${tab === "phone" ? "auth-tab--active" : ""}`} onClick={() => setTab("phone")}>
          <Icon name="Phone" size={15} /> Телефон
        </button>
        <button className={`auth-tab ${tab === "email" ? "auth-tab--active" : ""}`} onClick={() => setTab("email")}>
          <Icon name="Mail" size={15} /> Почта
        </button>
      </div>

      <div className="auth-form">
        {tab === "phone" ? (
          <div className="auth-phone-row">
            <button className="auth-country-btn" onClick={() => setShowCountry(!showCountry)}>
              <span className="auth-flag">{country.flag}</span>
              <span className="auth-code">{country.code}</span>
              <Icon name="ChevronDown" size={13} />
            </button>
            <input className="auth-phone-input" placeholder="000 000 0000" value={disp}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))} inputMode="numeric" autoFocus />
          </div>
        ) : (
          <input className="auth-email-input" type="email" placeholder="you@example.com" value={email}
            onChange={(e) => setEmail(e.target.value)} autoFocus />
        )}

        {showCountry && tab === "phone" && (
          <div className="auth-country-list">
            {countries.map((c, i) => (
              <button key={i} className="auth-country-item" onClick={() => { setCountry(c); setShowCountry(false); }}>
                <span>{c.flag}</span><span className="auth-country-name">{c.name}</span><span className="auth-country-code">{c.code}</span>
              </button>
            ))}
          </div>
        )}

        <button className="auth-btn" onClick={() => canNext && onNext(tab === "phone" ? `${country.code} ${disp}` : email)} disabled={!canNext}>
          Далее
        </button>

        <div className="auth-security-note">
          <Icon name="ShieldCheck" size={14} />
          <span>Данные защищены шифрованием MTProto 2.0</span>
        </div>
        <p className="auth-hint">Нажимая «Далее», вы соглашаетесь с условиями использования Vega Messenger.<br/>
          <span style={{color:"#5288c1"}}>© 2025 Vega Messenger / ИП Гафуров Шохрух Шарафович</span>
        </p>
      </div>
    </div>
  );
}

function AuthCode({ contact, onNext, onBack }: { contact: string; onNext: () => void; onBack: () => void }) {
  const [code, setCode] = useState(["", "", "", "", ""]);
  const [timer, setTimer] = useState(59);
  const r = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)];

  useEffect(() => {
    const t = setInterval(() => setTimer(p => p > 0 ? p - 1 : 0), 1000);
    return () => clearInterval(t);
  }, []);

  const handle = (i: number, val: string) => {
    const d = val.replace(/\D/g, "").slice(-1);
    const n = [...code]; n[i] = d; setCode(n);
    if (d && i < 4) r[i + 1].current?.focus();
    if (n.every(x => x)) setTimeout(onNext, 400);
  };

  const isEmail = contact.includes("@");

  return (
    <div className="auth-screen">
      <button className="auth-back" onClick={onBack}><Icon name="ArrowLeft" size={20} /></button>
      <div className="auth-logo">
        <div className="auth-logo-icon" style={{ background: "#1a2533" }}>
          <Icon name={isEmail ? "Mail" : "MessageSquare"} size={40} style={{ color: "#5288c1" }} />
        </div>
        <h1 className="auth-title" style={{ fontSize: 20 }}>{contact}</h1>
        <p className="auth-subtitle">
          {isEmail ? "Мы отправили письмо с кодом на вашу почту." : "Мы отправили SMS с кодом подтверждения."}<br/>
          Введите код <b style={{ color: "#5288c1" }}>12345</b> для демо.
        </p>
      </div>
      <div className="auth-form">
        <div className="auth-code-row">
          {code.map((d, i) => (
            <input key={i} ref={r[i]} className="auth-code-input" value={d} maxLength={1} inputMode="numeric"
              autoFocus={i === 0} onChange={(e) => handle(i, e.target.value)}
              onKeyDown={(e) => e.key === "Backspace" && !d && i > 0 && r[i-1].current?.focus()} />
          ))}
        </div>
        {timer > 0
          ? <p className="auth-hint">Повторная отправка через <b>{timer} сек</b></p>
          : <button className="auth-btn" style={{ marginTop: 0 }} onClick={() => setTimer(59)}>Отправить повторно</button>}
        <div className="auth-security-note"><Icon name="Lock" size={14} /><span>Соединение зашифровано</span></div>
      </div>
    </div>
  );
}

// ─── Data ────────────────────────────────────────────────────────────────────
const OWNER = { name: "Гафуров Шохрух", avatar: "Г", color: "#5288c1", premium: true, role: "owner" as const };

const INITIAL_CHATS: Chat[] = [
  {
    id: 1, name: "Александра Иванова", avatar: "А", color: "#5288c1", type: "personal",
    lastMsg: "Окей, увидимся завтра 👍", time: "22:14", unread: 0, online: true,
    pinned: true, muted: false, premium: true, folder: "Друзья",
    messages: [
      { id: 1, from: "them", text: "Привет! Как дела?", time: "21:50", read: true },
      { id: 2, from: "me", text: "Всё хорошо! А у тебя?", time: "21:52", read: true },
      { id: 3, from: "them", text: "Встретимся завтра в кафе?", time: "22:10", read: true, reactions: [{ emoji: "❤️", count: 1, mine: false }] },
      { id: 4, from: "me", text: "Да, в 13:00?", time: "22:12", read: true },
      { id: 5, from: "them", text: "Окей, увидимся завтра 👍", time: "22:14", read: true, reactions: [{ emoji: "👍", count: 2, mine: true }] },
    ],
  },
  {
    id: 2, name: "Рабочий чат 💼", avatar: "Р", color: "#ee4928", type: "group",
    lastMsg: "Миша: Отчёт готов, отправил на почту", time: "20:33", unread: 3,
    online: false, pinned: true, muted: false, members: 24, folder: "Работа",
    messages: [
      { id: 1, from: "them", text: "Всем доброе утро! Созвон в 10:00", time: "09:01", read: true, type: "system" },
      { id: 2, from: "me", text: "Буду!", time: "09:15", read: true },
      { id: 3, from: "them", text: "Миша: Отчёт готов, отправил на почту", time: "20:33", read: false },
    ],
  },
  {
    id: 3, name: "Vega News 📡", avatar: "V", color: "#5288c1", type: "channel",
    lastMsg: "Vega обновился до версии 2.0!", time: "18:00", unread: 5,
    online: false, pinned: false, muted: false, members: 124500, verified: true, folder: "Каналы",
    messages: [
      { id: 1, from: "channel", text: "🎉 Vega обновился до версии 2.0! Новые функции: звонки, реакции, папки.", time: "18:00", read: false },
      { id: 2, from: "channel", text: "Обновление доступно для всех платформ.", time: "18:01", read: false },
    ],
  },
  {
    id: 4, name: "🔒 Секретный чат", avatar: "С", color: "#3d8b6a", type: "secret",
    lastMsg: "Самоуничтожится через 24ч", time: "16:30", unread: 0,
    online: true, pinned: false, muted: false, secret: true, folder: "Личное",
    messages: [
      { id: 1, from: "system", text: "Чат зашифрован end-to-end. Скриншоты запрещены.", time: "16:00", read: true, type: "system" },
      { id: 2, from: "them", text: "Это защищённый канал связи 🔐", time: "16:30", read: true },
    ],
  },
  {
    id: 5, name: "Дмитрий Петров", avatar: "Д", color: "#3d8b6a", type: "personal",
    lastMsg: "Договорились!", time: "вчера", unread: 0, online: false,
    pinned: false, muted: false, folder: "Друзья",
    messages: [
      { id: 1, from: "them", text: "Можешь помочь с проектом?", time: "вчера", read: true },
      { id: 2, from: "me", text: "Договорились!", time: "вчера", read: true },
    ],
  },
  {
    id: 6, name: "Мама", avatar: "М", color: "#c1925b", type: "personal",
    lastMsg: "Позвони когда будешь свободен", time: "вчера", unread: 1, online: true,
    pinned: false, muted: false, folder: "Семья",
    messages: [
      { id: 1, from: "them", text: "Сынок, как ты?", time: "вчера", read: true },
      { id: 2, from: "me", text: "Всё отлично мам!", time: "вчера", read: true },
      { id: 3, from: "them", text: "Позвони когда будешь свободен", time: "вчера", read: false },
    ],
  },
  {
    id: 7, name: "Vega Bot 🤖", avatar: "B", color: "#7c5cbf", type: "bot",
    lastMsg: "Чем могу помочь?", time: "пн", unread: 0, online: true,
    pinned: false, muted: false, verified: true, folder: "Боты",
    messages: [
      { id: 1, from: "bot", text: "Привет! Я Vega Bot. Могу переводить тексты, искать файлы и многое другое.", time: "пн", read: true },
      { id: 2, from: "me", text: "Привет! Переведи: Hello world", time: "пн", read: true },
      { id: 3, from: "bot", text: "🌐 Перевод: «Привет, мир»", time: "пн", read: true },
    ],
  },
  {
    id: 8, name: "Новости Tech 📡", avatar: "Н", color: "#c1925b", type: "channel",
    lastMsg: "Apple представила M4 Ultra...", time: "пн", unread: 12,
    online: false, pinned: false, muted: true, members: 89200, folder: "Каналы",
    messages: [
      { id: 1, from: "channel", text: "Apple представила новый MacBook с чипом M4 Ultra. Производительность +40%.", time: "пн", read: false },
    ],
  },
];

const FOLDERS = ["Все", "Личное", "Работа", "Друзья", "Семья", "Каналы", "Боты"];
const REACTIONS = ["👍", "❤️", "😂", "😮", "😢", "🔥", "🎉", "👏"];

// ─── Components ──────────────────────────────────────────────────────────────
function ChatTypeIcon({ type }: { type: ChatType }) {
  if (type === "channel") return <Icon name="Megaphone" size={11} className="chat-type-icon" />;
  if (type === "group") return <Icon name="Users" size={11} className="chat-type-icon" />;
  if (type === "secret") return <Icon name="Lock" size={11} className="chat-type-icon chat-type-icon--secret" />;
  if (type === "bot") return <Icon name="Bot" size={11} className="chat-type-icon" />;
  return null;
}

function CallScreen({ chat, type, onEnd }: { chat: Chat; type: "audio" | "video"; onEnd: () => void }) {
  const [dur, setDur] = useState(0);
  const [muted, setMuted] = useState(false);
  const [speaker, setSpeaker] = useState(true);
  const [status, setStatus] = useState<"calling" | "connected">("calling");

  useEffect(() => {
    const t = setTimeout(() => setStatus("connected"), 2000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (status !== "connected") return;
    const t = setInterval(() => setDur(p => p + 1), 1000);
    return () => clearInterval(t);
  }, [status]);

  const fmt = `${String(Math.floor(dur / 60)).padStart(2, "0")}:${String(dur % 60).padStart(2, "0")}`;

  return (
    <div className="call-screen">
      <div className="call-bg" style={{ background: `radial-gradient(ellipse at 50% 30%, ${chat.color}66 0%, #0d1a26 70%)` }} />
      <div className="call-content">
        <div className="call-lock"><Icon name="ShieldCheck" size={14} /><span>Зашифрован</span></div>
        <div className="call-avatar" style={{ background: chat.color }}>{chat.avatar}</div>
        <div className="call-name">{chat.name}</div>
        <div className="call-status">
          {status === "calling" ? (
            <span className="call-dots">Звоним<span>.</span><span>.</span><span>.</span></span>
          ) : (
            <span className="call-timer">{fmt}</span>
          )}
        </div>
        {type === "video" && status === "connected" && (
          <div className="call-video-preview">
            <div className="call-video-self">📷 Камера</div>
          </div>
        )}
        <div className="call-actions">
          <button className={`call-btn ${muted ? "call-btn--active" : ""}`} onClick={() => setMuted(!muted)}>
            <Icon name={muted ? "MicOff" : "Mic"} size={22} />
            <span>{muted ? "Вкл. микр." : "Выкл. микр."}</span>
          </button>
          <button className="call-btn call-btn--end" onClick={onEnd}>
            <Icon name="PhoneOff" size={22} />
            <span>Завершить</span>
          </button>
          <button className={`call-btn ${!speaker ? "call-btn--active" : ""}`} onClick={() => setSpeaker(!speaker)}>
            <Icon name={speaker ? "Volume2" : "VolumeX"} size={22} />
            <span>{speaker ? "Динамик" : "Тихо"}</span>
          </button>
          {type === "video" && (
            <button className="call-btn">
              <Icon name="Monitor" size={22} />
              <span>Экран</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function ReactionPicker({ onPick, onClose }: { onPick: (e: string) => void; onClose: () => void }) {
  return (
    <div className="reaction-picker" onClick={(e) => e.stopPropagation()}>
      {REACTIONS.map(r => (
        <button key={r} className="reaction-btn" onClick={() => { onPick(r); onClose(); }}>{r}</button>
      ))}
    </div>
  );
}

// ─── Main ────────────────────────────────────────────────────────────────────
export default function Index() {
  const [auth, setAuth] = useState<"phone" | "code" | "app">("phone");
  const [contact, setContact] = useState("");

  const [chats, setChats] = useState<Chat[]>(INITIAL_CHATS);
  const [activeId, setActiveId] = useState(1);
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const [folder, setFolder] = useState("Все");
  const [showMobile, setShowMobile] = useState(false);
  const [ctxChat, setCtxChat] = useState<{ x: number; y: number; id: number } | null>(null);
  const [ctxMsg, setCtxMsg] = useState<{ x: number; y: number; id: number } | null>(null);
  const [showProfile, setShowProfile] = useState(false);
  const [call, setCall] = useState<{ type: "audio" | "video" } | null>(null);
  const [reactionFor, setReactionFor] = useState<number | null>(null);
  const [showPremium, setShowPremium] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const active = chats.find(c => c.id === activeId)!;

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [activeId, chats]);
  useEffect(() => {
    const h = () => { setCtxChat(null); setCtxMsg(null); setReactionFor(null); };
    window.addEventListener("click", h);
    return () => window.removeEventListener("click", h);
  }, []);

  const filtered = chats.filter(c => {
    if (search) return c.name.toLowerCase().includes(search.toLowerCase());
    if (folder !== "Все") return c.folder === folder;
    return true;
  }).sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));

  const send = () => {
    const text = input.trim(); if (!text) return;
    const now = new Date();
    const time = `${now.getHours()}:${String(now.getMinutes()).padStart(2, "0")}`;
    const msg: Message = { id: Date.now(), from: "me", text, time, read: false };
    setChats(p => p.map(c => c.id === activeId ? { ...c, messages: [...c.messages, msg], lastMsg: `Ты: ${text}`, time } : c));
    setInput("");
    setTimeout(() => { if (inputRef.current) { inputRef.current.style.height = "auto"; } }, 0);
  };

  const addReaction = useCallback((msgId: number, emoji: string) => {
    setChats(prev => prev.map(c => c.id === activeId ? {
      ...c, messages: c.messages.map(m => {
        if (m.id !== msgId) return m;
        const existing = m.reactions?.find(r => r.emoji === emoji);
        if (existing) {
          return { ...m, reactions: m.reactions!.map(r => r.emoji === emoji ? { ...r, count: r.mine ? r.count - 1 : r.count + 1, mine: !r.mine } : r).filter(r => r.count > 0) };
        }
        return { ...m, reactions: [...(m.reactions || []), { emoji, count: 1, mine: true }] };
      })
    } : c));
  }, [activeId]);

  const pinChat = (id: number) => setChats(p => p.map(c => c.id === id ? { ...c, pinned: !c.pinned } : c));
  const muteChat = (id: number) => setChats(p => p.map(c => c.id === id ? { ...c, muted: !c.muted } : c));
  const selectChat = (id: number) => { setChats(p => p.map(c => c.id === id ? { ...c, unread: 0 } : c)); setActiveId(id); setShowMobile(false); setShowProfile(false); };

  const totalUnread = chats.reduce((s, c) => s + (c.muted ? 0 : c.unread), 0);

  if (auth === "phone") return <AuthPhone onNext={c => { setContact(c); setAuth("code"); }} />;
  if (auth === "code") return <AuthCode contact={contact} onBack={() => setAuth("phone")} onNext={() => setAuth("app")} />;
  if (call) return <CallScreen chat={active} type={call.type} onEnd={() => setCall(null)} />;

  return (
    <div className="tg-app" onClick={() => { setCtxChat(null); setCtxMsg(null); setReactionFor(null); }}>

      {/* ── Sidebar ── */}
      <aside className={`tg-sidebar ${showMobile ? "tg-sidebar--open" : ""}`}>
        {/* Header */}
        <div className="tg-sidebar-header">
          <button className="tg-icon-btn" onClick={() => setShowSettings(!showSettings)}><Icon name="Menu" size={20} /></button>
          <div className="tg-search-wrap">
            <Icon name="Search" size={15} className="tg-search-icon" />
            <input className="tg-search" placeholder="Поиск" value={search} onChange={e => setSearch(e.target.value)} />
            {search && <button className="tg-search-clear" onClick={() => setSearch("")}><Icon name="X" size={13} /></button>}
          </div>
          <button className="tg-icon-btn"><Icon name="PenSquare" size={20} /></button>
        </div>

        {/* Settings dropdown */}
        {showSettings && (
          <div className="tg-settings-menu" onClick={e => e.stopPropagation()}>
            <div className="tg-settings-profile">
              <div className="tg-avatar" style={{ background: OWNER.color }}>{OWNER.avatar}</div>
              <div>
                <div className="tg-settings-name">{OWNER.name}
                  <span className="premium-badge">👑 Владелец</span>
                </div>
                <div className="tg-settings-sub">+7 999 000-00-00</div>
              </div>
            </div>
            {[
              { icon: "UserCog", label: "Мой профиль" },
              { icon: "Users", label: "Контакты" },
              { icon: "Bookmark", label: "Избранное" },
              { icon: "Shield", label: "Конфиденциальность" },
              { icon: "Bell", label: "Уведомления" },
              { icon: "Headphones", label: "Назначить поддержку" },
              { icon: "Star", label: "Vega Premium", premium: true },
              { icon: "Settings", label: "Настройки" },
            ].map((item: { icon: string; label: string; premium?: boolean }, i) => (
              <button key={i} className={`tg-settings-item ${item.premium ? "tg-settings-item--premium" : ""}`}
                onClick={() => { if (item.premium) { setShowPremium(true); } setShowSettings(false); }}>
                <Icon name={item.icon as "Settings"} size={18} />
                <span>{item.label}</span>
                {item.premium && <span className="premium-tag">Premium</span>}
              </button>
            ))}
          </div>
        )}

        {/* Folders */}
        {!search && (
          <div className="tg-filters">
            {FOLDERS.map(f => (
              <button key={f} className={`tg-filter-tab ${folder === f ? "tg-filter-tab--active" : ""}`} onClick={() => setFolder(f)}>
                {f}{f === "Все" && totalUnread > 0 ? ` ${totalUnread}` : ""}
              </button>
            ))}
          </div>
        )}

        {/* Chat list */}
        <div className="tg-chat-list">
          {filtered.length === 0 && <div className="tg-empty">Ничего не найдено</div>}
          {filtered.map(chat => (
            <button key={chat.id}
              className={`tg-chat-item ${activeId === chat.id ? "tg-chat-item--active" : ""}`}
              onClick={() => selectChat(chat.id)}
              onContextMenu={e => { e.preventDefault(); e.stopPropagation(); setCtxChat({ x: e.clientX, y: e.clientY, id: chat.id }); }}>
              <div className="tg-avatar" style={{ background: chat.color }}>
                {chat.avatar}
                {chat.online && chat.type !== "channel" && <span className="tg-online-dot" />}
                {chat.type === "channel" && <span className="tg-chat-type-badge"><Icon name="Megaphone" size={8} /></span>}
                {chat.type === "group" && <span className="tg-chat-type-badge tg-chat-type-badge--group"><Icon name="Users" size={8} /></span>}
                {chat.type === "secret" && <span className="tg-chat-type-badge tg-chat-type-badge--secret"><Icon name="Lock" size={8} /></span>}
                {chat.type === "bot" && <span className="tg-chat-type-badge tg-chat-type-badge--bot"><Icon name="Bot" size={8} /></span>}
              </div>
              <div className="tg-chat-info">
                <div className="tg-chat-top">
                  <span className="tg-chat-name">
                    {chat.pinned && <Icon name="Pin" size={11} className="tg-pin-icon" />}
                    {chat.verified && <Icon name="BadgeCheck" size={13} className="tg-verified" />}
                    {chat.premium && <span className="chat-premium-star">⭐</span>}
                    {chat.name}
                  </span>
                  <span className="tg-chat-time">{chat.time}</span>
                </div>
                <div className="tg-chat-bottom">
                  <span className="tg-chat-preview">
                    {chat.type === "group" || chat.type === "channel" ? chat.lastMsg : chat.lastMsg}
                  </span>
                  <div className="tg-chat-badges">
                    {chat.muted && <Icon name="BellOff" size={13} className="tg-muted-icon" />}
                    {chat.unread > 0 && <span className={`tg-badge ${chat.muted ? "tg-badge--muted" : ""}`}>{chat.unread}</span>}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Bottom nav */}
        <div className="tg-sidebar-nav">
          <button className="tg-nav-btn tg-nav-btn--active" title="Чаты"><Icon name="MessageCircle" size={22} /></button>
          <button className="tg-nav-btn" title="Контакты"><Icon name="Users" size={22} /></button>
          <button className="tg-nav-btn" title="Звонки"><Icon name="Phone" size={22} /></button>
          <button className="tg-nav-btn" title="Медиа"><Icon name="Image" size={22} /></button>
          <button className="tg-nav-btn" title="Настройки" onClick={() => setShowSettings(!showSettings)}>
            <div className="tg-nav-avatar">{OWNER.avatar}</div>
          </button>
        </div>
      </aside>

      {showMobile && <div className="tg-overlay" onClick={() => setShowMobile(false)} />}

      {/* Chat context menu */}
      {ctxChat && (
        <div className="tg-context-menu" style={{ top: ctxChat.y, left: ctxChat.x }} onClick={e => e.stopPropagation()}>
          {[
            { icon: "Pin" as const, label: chats.find(c => c.id === ctxChat.id)?.pinned ? "Открепить" : "Закрепить", action: () => { pinChat(ctxChat.id); setCtxChat(null); }, danger: false },
            { icon: "BellOff" as const, label: chats.find(c => c.id === ctxChat.id)?.muted ? "Включить звук" : "Без звука", action: () => { muteChat(ctxChat.id); setCtxChat(null); }, danger: false },
            { icon: "CheckCheck" as const, label: "Пометить прочитанным", action: () => { setChats(p => p.map(c => c.id === ctxChat.id ? { ...c, unread: 0 } : c)); setCtxChat(null); }, danger: false },
            { icon: "FolderOpen" as const, label: "Переместить в папку", action: () => setCtxChat(null), danger: false },
            { icon: "Archive" as const, label: "Архивировать", action: () => setCtxChat(null), danger: false },
            { icon: "Trash2" as const, label: "Удалить чат", action: () => setCtxChat(null), danger: true },
          ].map((item, i) => (
            <button key={i} className={`tg-context-item ${item.danger ? "tg-context-item--danger" : ""}`} onClick={item.action}>
              <Icon name={item.icon} size={16} /><span>{item.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Message context menu */}
      {ctxMsg && (
        <div className="tg-context-menu" style={{ top: ctxMsg.y, left: ctxMsg.x }} onClick={e => e.stopPropagation()}>
          {[
            { icon: "Smile" as const, label: "Реакция", action: () => { setReactionFor(ctxMsg.id); setCtxMsg(null); } },
            { icon: "Reply" as const, label: "Ответить", action: () => setCtxMsg(null) },
            { icon: "Copy" as const, label: "Копировать", action: () => setCtxMsg(null) },
            { icon: "Forward" as const, label: "Переслать", action: () => setCtxMsg(null) },
            { icon: "Pencil" as const, label: "Изменить", action: () => setCtxMsg(null) },
            { icon: "Trash2" as const, label: "Удалить", action: () => setCtxMsg(null), danger: true },
          ].map((item: { icon: "Smile" | "Reply" | "Copy" | "Forward" | "Pencil" | "Trash2"; label: string; action: () => void; danger?: boolean }, i) => (
            <button key={i} className={`tg-context-item ${item.danger ? "tg-context-item--danger" : ""}`} onClick={item.action}>
              <Icon name={item.icon} size={16} /><span>{item.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Premium modal */}
      {showPremium && (
        <div className="tg-modal-overlay" onClick={() => setShowPremium(false)}>
          <div className="premium-modal" onClick={e => e.stopPropagation()}>
            <button className="tg-icon-btn premium-close" onClick={() => setShowPremium(false)}><Icon name="X" size={20} /></button>
            <div className="premium-header">
              <div className="premium-icon">⭐</div>
              <h2>Vega Premium</h2>
              <p>Откройте максимум возможностей</p>
            </div>
            <div className="premium-features">
              {[
                { icon: "Upload", text: "Файлы до 4 ГБ" },
                { icon: "Zap", text: "Быстрая загрузка" },
                { icon: "FolderOpen", text: "Безлимитные папки" },
                { icon: "Mic", text: "Распознавание голоса в текст" },
                { icon: "Star", text: "Эксклюзивные стикеры и реакции" },
                { icon: "Shield", text: "Приоритетная поддержка 24/7" },
                { icon: "Eye", text: "Скрытый номер телефона" },
                { icon: "BadgeCheck", text: "Значок Premium в профиле" },
              ].map((f, i) => (
                <div key={i} className="premium-feature-row">
                  <Icon name={f.icon as "Upload"} size={18} className="premium-feature-icon" />
                  <span>{f.text}</span>
                </div>
              ))}
            </div>
            <button className="premium-btn">Подключить за 299 ₽/мес</button>
            <p className="premium-hint">Отмена в любое время</p>
          </div>
        </div>
      )}

      {/* ── Main ── */}
      <main className="tg-main">
        <header className="tg-chat-header" onClick={() => setShowProfile(!showProfile)} style={{ cursor: "pointer" }}>
          <button className="tg-icon-btn tg-mobile-menu" onClick={e => { e.stopPropagation(); setShowMobile(true); }}>
            <Icon name="ArrowLeft" size={20} />
          </button>
          <div className="tg-avatar tg-avatar--sm" style={{ background: active.color }}>
            {active.avatar}
            {active.online && active.type === "personal" && <span className="tg-online-dot tg-online-dot--sm" />}
          </div>
          <div className="tg-header-info">
            <span className="tg-header-name">
              {active.verified && <Icon name="BadgeCheck" size={15} className="tg-verified" />}
              {active.secret && <Icon name="Lock" size={13} className="tg-secret-icon" />}
              {active.name}
            </span>
            <span className="tg-header-status">
              {active.type === "channel" ? `${(active.members || 0).toLocaleString()} подписчиков` :
               active.type === "group" ? `${active.members} участников` :
               active.type === "bot" ? "бот" :
               active.online ? "в сети" : "был(а) недавно"}
            </span>
          </div>
          <div className="tg-header-actions" onClick={e => e.stopPropagation()}>
            <button className="tg-icon-btn"><Icon name="Search" size={18} /></button>
            {active.type === "personal" || active.type === "secret" ? (
              <>
                <button className="tg-icon-btn" title="Аудиозвонок" onClick={() => setCall({ type: "audio" })}><Icon name="Phone" size={18} /></button>
                <button className="tg-icon-btn" title="Видеозвонок" onClick={() => setCall({ type: "video" })}><Icon name="Video" size={18} /></button>
              </>
            ) : active.type === "group" ? (
              <button className="tg-icon-btn" title="Голосовой чат"><Icon name="Mic" size={18} /></button>
            ) : null}
            <button className="tg-icon-btn"><Icon name="MoreVertical" size={18} /></button>
          </div>
        </header>

        {/* Channel banner */}
        {active.type === "channel" && (
          <div className="channel-banner">
            <Icon name="Megaphone" size={14} />
            <span>Это канал. Только администраторы могут писать сообщения.</span>
          </div>
        )}
        {active.type === "secret" && (
          <div className="channel-banner channel-banner--secret">
            <Icon name="Lock" size={14} />
            <span>Секретный чат. End-to-end шифрование. Скриншоты запрещены.</span>
          </div>
        )}

        <div className="tg-messages">
          <div className="tg-date-sep"><span>Сегодня</span></div>
          <div className="tg-messages-inner">
            {active.messages.map((msg, i) => {
              const isMe = msg.from === "me";
              const isSystem = msg.type === "system" || msg.from === "system";

              if (isSystem) return (
                <div key={msg.id} className="tg-system-msg">{msg.text}</div>
              );

              return (
                <div key={msg.id} className={`tg-msg-wrap ${isMe ? "tg-msg-wrap--me" : ""}`}
                  style={{ animationDelay: `${i * 0.03}s` }}
                  onContextMenu={e => { e.preventDefault(); e.stopPropagation(); setCtxMsg({ x: e.clientX, y: e.clientY, id: msg.id }); }}>
                  <div className={`tg-bubble ${isMe ? "tg-bubble--me" : "tg-bubble--them"}`}>
                    {msg.forwarded && <div className="tg-forwarded"><Icon name="Forward" size={12} /> Переслано от {msg.forwarded}</div>}
                    <span className="tg-bubble-text">{msg.text}</span>
                    {msg.edited && <span className="tg-edited">изменено</span>}
                    <span className="tg-bubble-meta">
                      {msg.time}
                      {isMe && <Icon name={msg.read ? "CheckCheck" : "Check"} size={14} className={`tg-check ${msg.read ? "tg-check--read" : ""}`} />}
                    </span>
                    {/* Reactions */}
                    {msg.reactions && msg.reactions.length > 0 && (
                      <div className="tg-reactions">
                        {msg.reactions.map((r, ri) => (
                          <button key={ri} className={`tg-reaction ${r.mine ? "tg-reaction--mine" : ""}`}
                            onClick={e => { e.stopPropagation(); addReaction(msg.id, r.emoji); }}>
                            {r.emoji} {r.count}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  {/* Reaction picker */}
                  {reactionFor === msg.id && (
                    <ReactionPicker onPick={e => addReaction(msg.id, e)} onClose={() => setReactionFor(null)} />
                  )}
                </div>
              );
            })}
            <div ref={endRef} />
          </div>
        </div>

        {/* Input */}
        {active.type !== "channel" ? (
          <div className="tg-input-bar">
            <button className="tg-icon-btn"><Icon name="Smile" size={22} /></button>
            <div className="tg-input-wrap">
              <textarea ref={inputRef} className="tg-input" placeholder="Написать сообщение..."
                value={input} onChange={e => { setInput(e.target.value); e.target.style.height = "auto"; e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px"; }}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
                rows={1} />
              <button className="tg-attach-btn"><Icon name="Paperclip" size={18} /></button>
            </div>
            {input.trim()
              ? <button className="tg-send-btn" onClick={send}><Icon name="Send" size={18} /></button>
              : <button className="tg-send-btn tg-send-btn--mic"><Icon name="Mic" size={20} /></button>}
          </div>
        ) : (
          <div className="channel-subscribe-bar">
            <Icon name="Megaphone" size={16} />
            <span>Вы подписаны на канал</span>
            <button className="channel-notify-btn"><Icon name="Bell" size={16} /></button>
          </div>
        )}
      </main>

      {/* Profile panel */}
      {showProfile && (
        <aside className="tg-profile-panel animate-slide-in-right" onClick={e => e.stopPropagation()}>
          <div className="tg-profile-header">
            <button className="tg-icon-btn" onClick={() => setShowProfile(false)}><Icon name="X" size={20} /></button>
            <span className="tg-profile-title">Информация</span>
          </div>
          <div className="tg-profile-avatar-wrap">
            <div className="tg-profile-avatar" style={{ background: active.color }}>{active.avatar}</div>
            {active.verified && <div className="profile-verified"><Icon name="BadgeCheck" size={14} /> Подтверждённый</div>}
            {active.premium && <div className="profile-premium-badge">⭐ Premium</div>}
            {active.online && <span className="tg-profile-online-badge">в сети</span>}
          </div>
          <div className="tg-profile-name">{active.name}</div>
          {active.members && <div className="profile-members">{(active.members).toLocaleString()} {active.type === "channel" ? "подписчиков" : "участников"}</div>}
          <div className="tg-profile-actions">
            {(active.type === "personal" || active.type === "secret") && <>
              <button className="tg-profile-btn" onClick={() => setCall({ type: "audio" })}><Icon name="Phone" size={20} /><span>Звонок</span></button>
              <button className="tg-profile-btn" onClick={() => setCall({ type: "video" })}><Icon name="Video" size={20} /><span>Видео</span></button>
            </>}
            <button className="tg-profile-btn"><Icon name="BellOff" size={20} /><span>Без звука</span></button>
            <button className="tg-profile-btn"><Icon name="Search" size={20} /><span>Поиск</span></button>
          </div>
          <div className="tg-profile-rows">
            {[
              { icon: "Phone", label: "+7 999 000-00-00", sub: "Телефон" },
              { icon: "AtSign", label: "@" + active.name.split(" ")[0].toLowerCase(), sub: "Имя пользователя" },
              { icon: "Info", label: active.description || "Привет, я использую Vega!", sub: "О себе" },
              { icon: "Shield", label: "End-to-end шифрование", sub: "Безопасность" },
            ].map((row, i) => (
              <div key={i} className="tg-profile-row">
                <Icon name={row.icon as "Phone"} size={20} className="tg-profile-row-icon" />
                <div><div className="tg-profile-row-val">{row.label}</div><div className="tg-profile-row-sub">{row.sub}</div></div>
              </div>
            ))}
          </div>
          {active.type === "personal" && (
            <div className="profile-shared-media">
              <div className="profile-section-title">Общие медиафайлы</div>
              <div className="profile-media-grid">
                {["🖼️", "📷", "🎬", "🎵", "📄", "🗂️"].map((e, i) => <div key={i} className="profile-media-item">{e}</div>)}
              </div>
            </div>
          )}
        </aside>
      )}
    </div>
  );
}
