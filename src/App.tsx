import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import icon from '../assets/icon.svg';
import GetTags from './GetTags';

import Database from './Database';
const { ipcRenderer } = window.require('electron');

// var gettags;
var connected: boolean = false;
Database().then(
  (ful) => {
    console.log('Connected successfully');
    // connected = true;
    // console.log(ful);
    var database = ful;
    ipcRenderer.on('clipboard', async (event, arg) => {
      console.log(arg); // prints "pong"
      // gettags = await new GetTags('', a/rg);
      // console.log(await new GetTags('', arg));

      new GetTags(database, arg);
      // console.log(tags.getTags());
      // var test = gettags.getTest();

      // console.log(gettags.getTest());
      // console.log(clipboardy.readSync());
    });
  },
  (rej) => {
    console.log("Couldn't connect to database.");
    console.log(rej);
    connected = false;
  }
);
// console.log(connected);
// if (connected) {
// ipcRenderer.on('clipboard', async (event, arg) => {
//   console.log(arg); // prints "pong"
//   // gettags = await new GetTags('', a/rg);
//   // console.log(await new GetTags('', arg));

//   new GetTags(database, arg);
//   // console.log(tags.getTags());
//   // var test = gettags.getTest();

//   // console.log(gettags.getTest());
//   // console.log(clipboardy.readSync());
// });
// }

export default function App() {
  return <h3>WIP</h3>;
}
