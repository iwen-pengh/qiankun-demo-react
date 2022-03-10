import logo from './logo.svg';
import './App.css';
import { loadMicroApp, start } from 'qiankun';
import { useEffect, useState } from 'react';

function App() {


  useEffect(() => {
    const microApps = loadMicroApp({
      name: 'react2',
      entry: '//localhost:10001',
      container: '#containerRef',
      props: { brand: 'qiankun' },
    });
    return () => {
      microApps.unmount();
    }
  }, [])

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        react 2
      </header>
      <div id="containerRef"></div>
    </div>
  );
}

export default App;
