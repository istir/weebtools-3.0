import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import icon from '../assets/icon.svg';
import GetTags from './GetTags';
import Download from './Download';
const { ipcRenderer } = window.require('electron');



var gettags;
ipcRenderer.on('clipboard', async (event, arg) => {
  console.log(arg); // prints "pong"
  // gettags = await new GetTags('', arg);
  // console.log(await new GetTags('', arg));
  var tags = new GetTags('', arg);
  // console.log(tags.getTags());
  // var test = gettags.getTest();

  // console.log(gettags.getTest());
  // console.log(clipboardy.readSync());
});

const Hello = () => {
  return (
    <div>
      <div className="Hello">
        <img width="200px" alt="icon" src={icon} />
      </div>
      <h1>electron-react-boilerplate</h1>
      <div className="Hello">
        <a
          href="https://electron-react-boilerplate.js.org/"
          target="_blank"
          rel="noreferrer"
        >
          <button type="button">
            <span role="img" aria-label="books">
              📚
            </span>
            Read our docs
          </button>
        </a>
        <a
          href="https://github.com/sponsors/electron-react-boilerplate"
          target="_blank"
          rel="noreferrer"
        >
          <button type="button">
            <span role="img" aria-label="books">
              🙏
            </span>
            Donate
          </button>
        </a>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <Router>
      <Switch>
        <Route path="/" component={Hello} />
        <h3></h3>
      </Switch>
    </Router>
  );
}
