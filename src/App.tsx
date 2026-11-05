/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { ChatMessage } from './components/ChatMessage';
import { ChatInput } from './components/ChatInput';
import { WelcomeScreen } from './components/WelcomeScreen';
import { SubjectSelector } from './components/SubjectSelector';
import { AuthModal } from './components/AuthModal';
import { SettingsModal } from './components/SettingsModal';
import { ChatSession, Message, SubjectType, ThemeMode, UserProfile } from './types';
import { createFreshSession, INITIAL_SAMPLE_CHAT } from './data/subjects';

const PROFILES_STORAGE_KEY = 'eduai_user_profiles_v1';
const CURRENT_USER_KEY = 'eduai_active_user_id_v1';
const THEME_KEY = 'eduai_theme_mode_v1';
const START_CLEAN_KEY = 'eduai_start_clean_v1';
const INCOGNITO_KEY = 'eduai_incognito_mode_v1';

const DEFAULT_PROFILE: UserProfile = {
  id: 'user-default-1',
  name: 'Աննա Ավագյան',
  email: 'annaavagyan34@gmail.com',
  grade: '9-րդ դասարան (Միջին դպրոց)',
  avatar: '🎓',
  avatarColor: 'from-violet-600 to-indigo-600',
  school: 'Երևանի հիմնական դպրոց',
  createdAt: 1730300000000,
};

export default function App() {
  // Theme state: light or dark
  const [theme, setTheme] = useState<ThemeMode>(() => {
    try {
      const savedTheme = localStorage.getItem(THEME_KEY);
      if (savedTheme === 'dark' || savedTheme === 'light') {
        return savedTheme;
      }
      if (
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-color-scheme: dark)').matches
      ) {
        return 'dark';
      }
    } catch (e) {
      console.error('Failed to read theme preference:', e);
    }
    return 'light';
  });

  // Profiles state
  const [profiles, setProfiles] = useState<UserProfile[]>(() => {
    try {
      const saved = localStorage.getItem(PROFILES_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const hasDefault = parsed.some(
            (p: UserProfile) =>
              p.id === DEFAULT_PROFILE.id || p.email === DEFAULT_PROFILE.email
          );
          return hasDefault ? parsed : [DEFAULT_PROFILE, ...parsed];
        }
      }
    } catch (e) {
      console.error('Failed to load profiles:', e);
    }
    return [DEFAULT_PROFILE];
  });

  const [currentUserId, setCurrentUserId] = useState<string | null>(() => {
    try {
      const saved = localStorage.getItem(CURRENT_USER_KEY);
      if (saved && saved !== 'guest') {
        return saved;
      }
    } catch (e) {
      console.error('Failed to load active user id:', e);
    }
    // New visitors start as guest, so anyone can explicitly activate Anna's account or create their own
    return null;
  });

  const currentUser = profiles.find((p) => p.id === currentUserId) || null;
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // User Setting: Always start on a fresh, clean chat when opening the app (default: true)
  const [startCleanOnVisit, setStartCleanOnVisit] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(START_CLEAN_KEY);
      return saved !== null ? saved === 'true' : true;
    } catch {
      return true;
    }
  });

  // User Setting: Incognito mode - do not save history to browser storage (default: false)
  const [incognitoMode, setIncognitoMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem(INCOGNITO_KEY) === 'true';
    } catch {
      return false;
    }
  });

  // Helper to determine session storage key per user
  const getSessionKey = (uid: string | null) =>
    uid ? `eduai_sessions_${uid}` : 'eduai_sessions_guest';

  // Load initial sessions for current user or guest
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    const freshSession = createFreshSession();
    try {
      if (localStorage.getItem(INCOGNITO_KEY) === 'true') {
        return [freshSession];
      }

      const key = currentUserId ? `eduai_sessions_${currentUserId}` : 'eduai_sessions_guest';
      const saved = localStorage.getItem(key);
      let loaded: ChatSession[] = [];
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          loaded = parsed;
        }
      }

      // Migration from previous single-user key if needed
      if (loaded.length === 0) {
        const oldLegacy = localStorage.getItem('eduai_chat_sessions_v1');
        if (oldLegacy && currentUserId === DEFAULT_PROFILE.id) {
          try {
            const parsed = JSON.parse(oldLegacy);
            if (Array.isArray(parsed) && parsed.length > 0) {
              loaded = parsed;
            }
          } catch {}
        }
      }

      // Check user preference: should we start with a clean new chat?
      const shouldStartClean = localStorage.getItem(START_CLEAN_KEY) !== 'false';
      if (shouldStartClean) {
        // If the top session is already empty (no messages), we reuse it
        if (loaded.length > 0 && loaded[0].messages.length === 0) {
          return loaded;
        }
        // Otherwise, prepend a fresh empty session so entry always starts clean
        return [freshSession, ...loaded];
      }

      return loaded.length > 0 ? loaded : [freshSession];
    } catch (e) {
      console.error('Failed to load chat history:', e);
    }
    return [freshSession];
  });

  const [activeSessionId, setActiveSessionId] = useState<string>(() => {
    const shouldStartClean = (() => {
      try {
        return localStorage.getItem(START_CLEAN_KEY) !== 'false';
      } catch {
        return true;
      }
    })();

    if (shouldStartClean) {
      // In startClean mode, the initial sessions list begins with an empty session
      return sessions[0]?.id || `chat-${Date.now()}`;
    }

    try {
      const key = currentUserId ? `eduai_active_${currentUserId}` : 'eduai_active_guest';
      const savedActive = localStorage.getItem(key);
      if (savedActive && sessions.some((s) => s.id === savedActive)) {
        return savedActive;
      }
    } catch (e) {}

    return sessions[0]?.id || `chat-${Date.now()}`;
  });

  const [isSidebarOpenMobile, setIsSidebarOpenMobile] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<SubjectType>('all');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Sync theme changes to html class and localStorage
  useEffect(() => {
    try {
      localStorage.setItem(THEME_KEY, theme);
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch (e) {
      console.error('Failed to save theme:', e);
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Sync sessions for current user to localStorage (unless incognito mode is enabled)
  useEffect(() => {
    if (incognitoMode) return;
    try {
      const key = getSessionKey(currentUserId);
      // Clean up multiple consecutive empty sessions to prevent list clutter
      const cleaned = sessions.filter((s, idx) => s.messages.length > 0 || idx === 0);
      localStorage.setItem(key, JSON.stringify(cleaned));
    } catch (e) {
      console.error('Failed to save sessions:', e);
    }
  }, [sessions, currentUserId, incognitoMode]);

  // Sync active session ID to localStorage only when NOT in startCleanOnVisit mode
  useEffect(() => {
    const key = currentUserId ? `eduai_active_${currentUserId}` : 'eduai_active_guest';
    if (startCleanOnVisit || incognitoMode) {
      try {
        localStorage.removeItem(key);
      } catch (e) {}
      return;
    }
    try {
      localStorage.setItem(key, activeSessionId);
    } catch (e) {
      console.error('Failed to save active session ID:', e);
    }
  }, [activeSessionId, currentUserId, startCleanOnVisit, incognitoMode]);

  // Save profiles array whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(PROFILES_STORAGE_KEY, JSON.stringify(profiles));
    } catch (e) {
      console.error('Failed to save profiles:', e);
    }
  }, [profiles]);

  // Handle switching users
  const handleSelectUser = (user: UserProfile | null) => {
    // 1. Persist current sessions for current user before switching (unless incognito)
    if (!incognitoMode) {
      try {
        const oldKey = getSessionKey(currentUserId);
        const cleaned = sessions.filter((s, idx) => s.messages.length > 0 || idx === 0);
        localStorage.setItem(oldKey, JSON.stringify(cleaned));
      } catch (e) {}
    }

    const newId = user ? user.id : null;
    setCurrentUserId(newId);
    try {
      localStorage.setItem(CURRENT_USER_KEY, newId ? newId : 'guest');
    } catch (e) {}

    // 2. Load sessions for new user
    const newKey = getSessionKey(newId);
    let loadedSessions: ChatSession[] = [];
    if (!incognitoMode) {
      try {
        const saved = localStorage.getItem(newKey);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            loadedSessions = parsed;
          }
        }
      } catch (e) {
        console.error('Failed to load new user sessions:', e);
      }
    }

    if (startCleanOnVisit) {
      if (loadedSessions.length > 0 && loadedSessions[0].messages.length === 0) {
        setSessions(loadedSessions);
        setActiveSessionId(loadedSessions[0].id);
      } else {
        const fresh = createFreshSession();
        setSessions([fresh, ...loadedSessions]);
        setActiveSessionId(fresh.id);
      }
    } else {
      const finalSessions = loadedSessions.length > 0 ? loadedSessions : [createFreshSession()];
      setSessions(finalSessions);
      setActiveSessionId(finalSessions[0].id);
    }
  };

  // Handle saving (creating or editing) a profile
  const handleSaveProfile = (profile: UserProfile) => {
    setProfiles((prev) => {
      const exists = prev.some((p) => p.id === profile.id);
      return exists ? prev.map((p) => (p.id === profile.id ? profile : p)) : [...prev, profile];
    });
  };

  // Handle deleting a profile
  const handleDeleteProfile = (id: string) => {
    setProfiles((prev) => prev.filter((p) => p.id !== id));
    try {
      localStorage.removeItem(`eduai_sessions_${id}`);
    } catch (e) {}
    if (currentUserId === id) {
      handleSelectUser(null);
    }
  };

  // Handle Export all chat & profile data as a JSON file
  const handleExportData = () => {
    const data = {
      app: 'EduAI',
      version: '1.0',
      exportedAt: new Date().toISOString(),
      user: currentUser,
      sessions: sessions,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const cleanName = currentUser?.name ? currentUser.name.replace(/\s+/g, '_') : 'guest';
    link.download = `eduai_backup_${cleanName}_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Handle Import chat & profile data from a JSON file
  const handleImportData = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsed = JSON.parse(content);
        if (parsed.sessions && Array.isArray(parsed.sessions)) {
          if (parsed.user && parsed.user.name) {
            handleSaveProfile(parsed.user);
            setCurrentUserId(parsed.user.id);
          }
          setSessions(parsed.sessions);
          if (parsed.sessions[0]?.id) {
            setActiveSessionId(parsed.sessions[0].id);
          }
          alert('Տվյալները հաջողությամբ ներմուծվեցին:');
          setIsAuthModalOpen(false);
        } else {
          alert('Ֆայլի ֆորմատը անվավեր է:');
        }
      } catch (err) {
        alert('Սխալ առաջացավ ֆայլը կարդալիս:');
      }
    };
    reader.readAsText(file);
  };

  // Find currently active session or fallback to first
  const activeSession =
    sessions.find((s) => s.id === activeSessionId) || sessions[0] || createFreshSession();

  // Auto-scroll to bottom of messages
  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  useEffect(() => {
    scrollToBottom('smooth');
  }, [activeSession?.messages?.length]);

  // Create a brand new chat (only when user explicitly requests New Chat)
  const handleNewChat = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsLoading(false);

    const newSession = createFreshSession(selectedSubject);
    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
  };

  // Delete chat
  const handleDeleteSession = (id: string) => {
    setSessions((prev) => {
      const updated = prev.filter((s) => s.id !== id);
      if (updated.length === 0) {
        const fresh = createFreshSession();
        setActiveSessionId(fresh.id);
        return [fresh];
      }
      if (id === activeSessionId) {
        setActiveSessionId(updated[0].id);
      }
      return updated;
    });
  };

  // Rename chat
  const handleRenameSession = (id: string, newTitle: string) => {
    setSessions((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, title: newTitle, updatedAt: Date.now() } : s
      )
    );
  };

  // Clear all chats
  const handleClearAll = () => {
    if (window.confirm('Իսկապե՞ս ցանկանում եք ջնջել բոլոր զրույցների պատմությունը:')) {
      const fresh = createFreshSession();
      setSessions([fresh]);
      setActiveSessionId(fresh.id);
      try {
        const key = getSessionKey(currentUserId);
        localStorage.removeItem(key);
        const activeKey = currentUserId ? `eduai_active_${currentUserId}` : 'eduai_active_guest';
        localStorage.removeItem(activeKey);
      } catch (e) {}
    }
  };

  // Stop generation
  const handleStopGenerating = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsLoading(false);
  };

  // Trigger celebration confetti
  const triggerCelebration = () => {
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#8b5cf6', '#c084fc', '#3b82f6', '#10b981'],
    });
  };

  // Send message - PRESERVE SEQUENTIALLY IN THE CURRENT CHAT (հերթով, ոչ թե նոր զրույց)
  const handleSendMessage = async (
    userText: string,
    subject: SubjectType = selectedSubject,
    image?: string
  ) => {
    if ((!userText.trim() && !image) || isLoading) return;

    // Detect celebratory keywords in Armenian
    const lowerText = userText.toLowerCase();
    if (
      lowerText.includes('շնորհակալ') ||
      lowerText.includes('հասկացա') ||
      lowerText.includes('ստացվեց') ||
      lowerText.includes('հիանալի է')
    ) {
      triggerCelebration();
    }

    const userMessage: Message = {
      id: `msg-user-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      role: 'user',
      content: userText,
      timestamp: Date.now(),
      subject,
      image,
    };

    const assistantPlaceholderId = `msg-ai-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const assistantMessage: Message = {
      id: assistantPlaceholderId,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      subject,
      isStreaming: true,
    };

    // Target the current active chat session so questions are preserved in order
    const targetSessionId = activeSession.id;
    let fullHistoryForApi: { role: string; content: string; image?: string }[] = [];

    setSessions((prev) =>
      prev.map((s) => {
        if (s.id === targetSessionId) {
          const updatedMessages = [...s.messages, userMessage, assistantMessage];
          fullHistoryForApi = [...s.messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
            image: m.image,
          }));
          const fallbackTitle = image ? 'Կցված նկարով խնդիր' : 'Նոր հարց';
          return {
            ...s,
            title:
              s.messages.length === 0
                ? userText.length > 35
                  ? `${userText.slice(0, 32)}...`
                  : userText || fallbackTitle
                : s.title,
            subject: subject !== 'all' ? subject : s.subject,
            updatedAt: Date.now(),
            messages: updatedMessages,
          };
        }
        return s;
      })
    );

    setIsLoading(true);
    const controller = new AbortController();
    abortControllerRef.current = controller;

    let fullAssistantText = '';

    try {
      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: fullHistoryForApi,
          subject: subject,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`Սերվերի սխալ: ${response.status}`);
      }

      if (!response.body) {
        throw new Error('Սերվերի պատասխանը դատարկ է:');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('data: ')) {
            const dataStr = trimmed.replace('data: ', '');
            if (dataStr === '[DONE]') {
              break;
            }
            try {
              const data = JSON.parse(dataStr);
              if (data.error) {
                fullAssistantText += `\n\n⚠️ ${data.error}`;
              } else if (data.text) {
                fullAssistantText += data.text;
              }

              // Update message in state (keeping all turns in sequence)
              setSessions((prev) =>
                prev.map((s) => {
                  if (s.id === targetSessionId) {
                    return {
                      ...s,
                      messages: s.messages.map((m) =>
                        m.id === assistantPlaceholderId
                          ? { ...m, content: fullAssistantText, isStreaming: true }
                          : m
                      ),
                    };
                  }
                  return s;
                })
              );
              scrollToBottom('auto');
            } catch (err) {
              console.error('Failed to parse SSE data:', err);
            }
          }
        }
      }

      // Finalize streaming
      setSessions((prev) =>
        prev.map((s) => {
          if (s.id === targetSessionId) {
            return {
              ...s,
              updatedAt: Date.now(),
              messages: s.messages.map((m) =>
                m.id === assistantPlaceholderId
                  ? { ...m, content: fullAssistantText, isStreaming: false }
                  : m
              ),
            };
          }
          return s;
        })
      );
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.log('Stream generation was aborted by user');
        setSessions((prev) =>
          prev.map((s) => {
            if (s.id === targetSessionId) {
              return {
                ...s,
                messages: s.messages.map((m) =>
                  m.id === assistantPlaceholderId
                    ? {
                        ...m,
                        content:
                          fullAssistantText || 'Պատասխանի ստեղծումը դադարեցվեց։',
                        isStreaming: false,
                      }
                    : m
                ),
              };
            }
            return s;
          })
        );
      } else {
        console.error('Error in handleSendMessage:', err);
        const fallbackNotice =
          fullAssistantText ||
          `⚠️ Խնդիր առաջացավ պատասխանը ստանալիս։ Խնդրում ենք կրկին փորձել կամ ստուգել կապը։`;

        setSessions((prev) =>
          prev.map((s) => {
            if (s.id === targetSessionId) {
              return {
                ...s,
                messages: s.messages.map((m) =>
                  m.id === assistantPlaceholderId
                    ? { ...m, content: fallbackNotice, isStreaming: false }
                    : m
                ),
              };
            }
            return s;
          })
        );
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
      scrollToBottom('smooth');
    }
  };

  // Regenerate last response
  const handleRegenerate = () => {
    if (activeSession.messages.length === 0 || isLoading) return;
    const lastUserMsg = [...activeSession.messages]
      .reverse()
      .find((m) => m.role === 'user');

    if (lastUserMsg) {
      setSessions((prev) =>
        prev.map((s) => {
          if (s.id === activeSession.id) {
            const msgs = [...s.messages];
            if (msgs[msgs.length - 1].role === 'assistant') {
              msgs.pop();
            }
            return { ...s, messages: msgs };
          }
          return s;
        })
      );
      handleSendMessage(lastUserMsg.content, activeSession.subject);
    }
  };

  // Select prompt from welcome screen (continues in the same chat)
  const handleSelectSuggestedPrompt = (
    promptText: string,
    subjectType: SubjectType
  ) => {
    setSelectedSubject(subjectType);
    handleSendMessage(promptText, subjectType);
  };

  const isDark = theme === 'dark';
  const totalUserQuestions = activeSession.messages.filter((m) => m.role === 'user').length;

  return (
    <div
      className={`flex h-screen w-screen overflow-hidden font-sans transition-colors duration-150 ${
        isDark ? 'bg-[#212121] text-[#ececec]' : 'bg-[#ffffff] text-[#0d0d0d]'
      }`}
    >
      {/* Left Sidebar with saved history, filters & new chat */}
      <Sidebar
        sessions={sessions}
        activeSessionId={activeSession.id}
        onSelectSession={setActiveSessionId}
        onNewChat={handleNewChat}
        onDeleteSession={handleDeleteSession}
        onRenameSession={handleRenameSession}
        onClearAll={handleClearAll}
        isOpenMobile={isSidebarOpenMobile}
        onCloseMobile={() => setIsSidebarOpenMobile(false)}
        theme={theme}
        onToggleTheme={toggleTheme}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
      />

      {/* Main Chat View Area */}
      <div className="flex-1 flex flex-col h-full min-w-0 relative">
        {/* Top Header with theme toggle, account badge, and mobile menu */}
        <Header
          onToggleSidebar={() => setIsSidebarOpenMobile(!isSidebarOpenMobile)}
          onNewChat={handleNewChat}
          chatTitle={activeSession.title}
          subject={activeSession.subject}
          theme={theme}
          onToggleTheme={toggleTheme}
          currentUser={currentUser}
          onOpenAuth={() => setIsAuthModalOpen(true)}
          onOpenSettings={() => setIsSettingsModalOpen(true)}
        />

        {/* Dedicated Subject Selector bar when chat is active */}
        {activeSession.messages.length > 0 && (
          <div
            className={`border-b shrink-0 flex items-center justify-between px-2 ${
              isDark ? 'border-[#303030] bg-[#212121]/90' : 'border-[#f0f0f0] bg-white/90'
            }`}
          >
            <div className="flex-1 min-w-0">
              <SubjectSelector
                selectedSubject={selectedSubject}
                onSelectSubject={setSelectedSubject}
                theme={theme}
              />
            </div>
            {totalUserQuestions > 0 && (
              <span className="hidden sm:inline-flex items-center text-[11px] font-semibold text-slate-400 mr-3 shrink-0">
                💬 {totalUserQuestions} հարց հերթականությամբ
              </span>
            )}
          </div>
        )}

        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto scrollbar-none flex flex-col">
          {activeSession.messages.length === 0 ? (
            <WelcomeScreen
              onSelectPrompt={handleSelectSuggestedPrompt}
              selectedSubject={selectedSubject}
              onSelectSubject={setSelectedSubject}
              theme={theme}
              currentUser={currentUser}
              onOpenAuth={() => setIsAuthModalOpen(true)}
            />
          ) : (
            <div className="py-4">
              {activeSession.messages.map((msg, index) => {
                // Calculate turn order number for sequential interview flow
                const userCountBeforeOrAt = activeSession.messages
                  .slice(0, index + 1)
                  .filter((m) => m.role === 'user').length;

                return (
                  <ChatMessage
                    key={msg.id}
                    message={msg}
                    turnNumber={userCountBeforeOrAt}
                    onQuickAction={(actionPrompt) =>
                      handleSendMessage(actionPrompt, activeSession.subject)
                    }
                    onRegenerate={handleRegenerate}
                    isLastAssistantMessage={
                      index === activeSession.messages.length - 1 &&
                      msg.role === 'assistant'
                    }
                    theme={theme}
                  />
                );
              })}
              <div ref={messagesEndRef} className="h-6" />
            </div>
          )}
        </div>

        {/* Bottom Input Area */}
        <div
          className={`shrink-0 pt-2 transition-colors duration-150 ${
            isDark
              ? 'bg-gradient-to-t from-[#212121] via-[#212121]/95 to-transparent'
              : 'bg-gradient-to-t from-[#ffffff] via-[#ffffff]/95 to-transparent'
          }`}
        >
          <ChatInput
            onSend={(text, sub, img) => handleSendMessage(text, sub, img)}
            onStop={handleStopGenerating}
            isLoading={isLoading}
            selectedSubject={selectedSubject}
            onSelectSubject={setSelectedSubject}
            theme={theme}
          />
        </div>
      </div>

      {/* Account & Profile Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        profiles={profiles}
        onSelectUser={handleSelectUser}
        onSaveProfile={handleSaveProfile}
        onDeleteProfile={handleDeleteProfile}
        onExportData={handleExportData}
        onImportData={handleImportData}
        theme={theme}
        totalChatsCount={sessions.length}
        onOpenSettings={() => {
          setIsAuthModalOpen(false);
          setIsSettingsModalOpen(true);
        }}
      />

      {/* Settings & Privacy Modal */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        theme={theme}
        startCleanOnVisit={startCleanOnVisit}
        onToggleStartClean={(val) => {
          setStartCleanOnVisit(val);
          try {
            localStorage.setItem(START_CLEAN_KEY, String(val));
          } catch {}
        }}
        incognitoMode={incognitoMode}
        onToggleIncognito={(val) => {
          setIncognitoMode(val);
          try {
            localStorage.setItem(INCOGNITO_KEY, String(val));
            if (val) {
              const key = getSessionKey(currentUserId);
              localStorage.removeItem(key);
            }
          } catch {}
        }}
        totalSessionsCount={sessions.length}
        onClearAllHistory={handleClearAll}
      />
    </div>
  );
}
