// src/App.js
import React from 'react';
import Chat from './components/Chat';

function App() {
  return (
    <div style={{ maxWidth: 900, margin: '20px auto', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ textAlign: 'center' }}>🚀 Realtime Chat (Socket.io)</h1>
      <Chat />
    </div>
  );
}

export default App;
