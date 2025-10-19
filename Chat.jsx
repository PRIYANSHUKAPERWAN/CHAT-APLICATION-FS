// src/components/Chat.jsx
import React, { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

const SOCKET_SERVER_URL = 'http://localhost:5000';

export default function Chat() {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [name, setName] = useState('');
  const [tempName, setTempName] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]); // { name?, text, time, type: 'chat'|'system' }
  const messagesRef = useRef(null);

  useEffect(() => {
    // create socket once
    const s = io(SOCKET_SERVER_URL, { transports: ['websocket', 'polling'] });
    setSocket(s);

    s.on('connect', () => {
      setConnected(true);
      console.log('Connected to socket server', s.id);
    });

    s.on('disconnect', () => {
      setConnected(false);
      console.log('Disconnected from socket server');
    });

    s.on('chatMessage', (msg) => {
      setMessages(prev => [...prev, { ...msg, type: 'chat' }]);
    });

    s.on('systemMessage', (msg) => {
      setMessages(prev => [...prev, { ...msg, type: 'system' }]);
    });

    return () => {
      s.disconnect();
      setSocket(null);
    };
  }, []);

  // auto-scroll
  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages]);

  const joinChat = () => {
    if (!tempName.trim()) return alert('Please enter a name');
    setName(tempName.trim());
    socket.emit('join', tempName.trim());
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    if (!name) return alert('Enter your name first and click Join');
    socket.emit('chatMessage', message.trim());
    setMessage('');
  };

  return (
    <div style={{ border: '1px solid #ddd', borderRadius: 8, padding: 16 }}>
      <div style={{ marginBottom: 12, display: 'flex', gap: 8, alignItems: 'center' }}>
        <input
          placeholder="Your name"
          value={tempName}
          onChange={(e) => setTempName(e.target.value)}
          disabled={!!name}
          style={{ padding: '8px 10px', borderRadius: 6, border: '1px solid #ccc', flex: '0 0 200px' }}
        />
        {!name ? (
          <button onClick={joinChat} style={btnStyle}>Join</button>
        ) : (
          <>
            <div style={{ color: '#555' }}>Joined as <strong>{name}</strong></div>
            <div style={{ marginLeft: 'auto', color: connected ? 'green' : 'red' }}>
              {connected ? '● Connected' : '○ Disconnected'}
            </div>
          </>
        )}
      </div>

      <div ref={messagesRef} style={{
        height: 360,
        overflowY: 'auto',
        padding: 12,
        border: '1px solid #eee',
        borderRadius: 6,
        background: '#fafafa',
        marginBottom: 12
      }}>
        {messages.length === 0 && <div style={{ color: '#777', textAlign: 'center' }}>No messages yet — start the conversation!</div>}
        {messages.map((m, idx) => (
          <div key={idx} style={{ marginBottom: 10 }}>
            {m.type === 'system' ? (
              <div style={{ color: '#888', fontStyle: 'italic', fontSize: 13 }}>
                [{new Date(m.time).toLocaleTimeString()}] {m.text}
              </div>
            ) : (
              <div>
                <div style={{ fontSize: 13, color: '#555' }}>
                  <strong>{m.name}</strong> <span style={{ color: '#999', fontSize: 12 }}>[{new Date(m.time).toLocaleTimeString()}]</span>
                </div>
                <div style={{ padding: '6px 10px', background: '#fff', display: 'inline-block', borderRadius: 6, boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }}>
                  {m.text}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <form onSubmit={sendMessage} style={{ display: 'flex', gap: 8 }}>
        <input
          placeholder={name ? "Type a message..." : "Join first to send messages"}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={!name}
          style={{ flex: 1, padding: '10px 12px', borderRadius: 6, border: '1px solid #ccc' }}
        />
        <button type="submit" disabled={!name || !message.trim()} style={btnStyle}>Send</button>
      </form>
    </div>
  );
}

const btnStyle = {
  padding: '8px 14px',
  background: '#007bff',
  border: 'none',
  color: '#fff',
  borderRadius: 6,
  cursor: 'pointer'
};
