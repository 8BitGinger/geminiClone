import { createContext, useState } from 'react';
import runChat from '../config/gemini';

export const Context = createContext();

const ContextProvider = (props) => {
  const [input, setInput] = useState('');
  const [recentPrompt, setRecentPrompt] = useState('');
  const [prevPrompts, setPrevPrompts] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resultsData, setResultsData] = useState('');

  const delayPara = (index, nextWord) => {
    setTimeout(function () {
      setResultsData((prev) => prev + nextWord);
    }, 75 * index);
  };

  const onSent = async (prompt) => {
    setResultsData('');
    setLoading(true);
    setShowResult(true);
    let response;
    if (prompt !== undefined) {
      response = await runChat(prompt);
      setRecentPrompt(input);
    } else {
      setPrevPrompts((prev) => [...prev, input]);

      setRecentPrompt(input);
      response = await runChat(input);
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
    prevPrompts,
    setPrevPrompts,
    showResult,
    setShowResult,
    loading,
    setLoading,
    resultsData,
    setResultsData,
    onSent,
    // newChat,
  };

  return (
    <Context.Provider value={contextValue}>{props.children}</Context.Provider>
  );
};

export default ContextProvider;
