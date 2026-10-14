import { createContext, useEffect, useRef, useState } from 'react';
import runChat from '../config/gemini';

export const Context = createContext();

const CHATS_KEY = 'gemini-clone-chats';
const THEME_KEY = 'gemini-clone-theme';
const MAX_CHATS = 3;

const readStorage = (key, fallback) => {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

const writeStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage unavailable or full; the app still works without persistence
  }
};

const ContextProvider = (props) => {
  const [input, setInput] = useState('');
  const [recentPrompt, setRecentPrompt] = useState('');
  const [chats, setChats] = useState(() => readStorage(CHATS_KEY, []));
  const [theme, setTheme] = useState(() => readStorage(THEME_KEY, 'light'));
  const timers = useRef([]);
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resultsData, setResultsData] = useState('');

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    writeStorage(THEME_KEY, theme);
  }, [theme]);

  useEffect(() => {
    writeStorage(CHATS_KEY, chats);
  }, [chats]);

  const toggleTheme = () =>
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));

  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  const delayPara = (index, nextWord) => {
    timers.current.push(
      setTimeout(function () {
        setResultsData((prev) => prev + nextWord);
      }, 75 * index)
    );
  };

  const newChat = () => {
    clearTimers();
    setLoading(false);
    setShowResult(false);
  };

  const loadChat = (chat) => {
    clearTimers();
    setLoading(false);
    setRecentPrompt(chat.prompt);
    setResultsData(chat.response);
    setShowResult(true);
  };

  const onSent = async (prompt) => {
    clearTimers();
    setResultsData('');
    setLoading(true);
    setShowResult(true);
    const query = prompt !== undefined ? prompt : input;
    setRecentPrompt(query);
    let response;
    try {
      response = await runChat(query);
    } catch (error) {
      setResultsData(error.message);
      setLoading(false);
      return;
    }

    let responseArray = response.split('**');
    let newResponse = '';
    for (let i = 0; i < responseArray.length; i++) {
      if (i === 0 || i % 2 !== 1) {
        newResponse += responseArray[i];
      } else {
        newResponse += '<br />' + '<b>' + responseArray[i] + '</b>';
      }
    }
    let newResponse2 = newResponse.split('*').join('<br></br>');
    setChats((prev) =>
      [
        { prompt: query, response: newResponse2 },
        ...prev.filter((chat) => chat.prompt !== query),
      ].slice(0, MAX_CHATS)
    );
    let newResponseArray = newResponse2.split(' ');
    for (let i = 0; i < newResponseArray.length; i++) {
      const nextWord = newResponseArray[i];
      delayPara(i, nextWord + ' ');
    }
    setLoading(false);
    setInput('');
  };

  const contextValue = {
    input,
    setInput,
    recentPrompt,
    setRecentPrompt,
    chats,
    loadChat,
    theme,
    toggleTheme,
    showResult,
    setShowResult,
    loading,
    setLoading,
    resultsData,
    setResultsData,
    onSent,
    newChat,
  };

  return (
    <Context.Provider value={contextValue}>{props.children}</Context.Provider>
  );
};

export default ContextProvider;
