import logo from './logo.svg';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        react 1
        <button onClick={() => { 
          const dom = document.createElement("div");
          dom.setAttribute("id", "newDiv");
          dom.setAttribute("class", "inside-class");
          dom.innerHTML = "js 动态添加div";
          document.body.appendChild(dom)
         }}>11</button>
      </header>
    </div>
  );
}

export default App;
