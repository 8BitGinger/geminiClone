import React, { useState, useContext } from 'react';
import './Sidebar.css';
import { assets } from '../../assets/assets';
import { Context } from '../../context/Context';

const Sidebar = () => {
  const [extended, setExtended] = useState(false);
  const { chats, loadChat, newChat, theme, toggleTheme } = useContext(Context);

  return (
    <div className="sidebar">
      <div className="top">
        <img
          className="menu"
          onClick={() => setExtended((prev) => !prev)}
          src={assets.menu_icon}
          alt="hamburger menu"
        />
        <div className="new-chat">
          <img
            onClick={() => newChat()}
            src={assets.plus_icon}
            alt="plus icon"
          />
          {extended ? <p>New Chat</p> : null}
        </div>
        {extended ? (
          <div className="recent">
            <p className="recent-title">Recent</p>
            {chats.map((chat) => {
              return (
                <div
                  key={chat.prompt}
                  onClick={() => loadChat(chat)}
                  className="recent-entry"
                >
                  <img src={assets.message_icon} alt="message icon" />
                  <p>{chat.prompt.slice(0, 18)} ...</p>
                </div>
              );
            })}
          </div>
        ) : null}
      </div>
      <div className="bottom">
        <div className="bottom-item recent-entry">
          <img src={assets.question_icon} alt="question icon" />
          {extended ? <p>Help</p> : null}
        </div>
        <div className="bottom-item recent-entry">
          <img src={assets.history_icon} alt="history icon" />
          {extended ? <p>Activity</p> : null}
        </div>
        <div className="bottom-item recent-entry" onClick={toggleTheme}>
          <img src={assets.setting_icon} alt="setting icon" />
          {extended ? (
            <p>{theme === 'dark' ? 'Light mode' : 'Dark mode'}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
