import React from 'react';
import { render } from 'react-dom';
import { Titlebar, Color, RGBA } from 'custom-electron-titlebar';
import App from './App';
import './App.global.css';

// import 'simplebar/dist/simplebar.min.css';
// const customTitlebar = require('simplebar/dist/simplebar.min.css');

<link rel="stylesheet" href="css/perfect-scrollbar.css" />;
const titlebar = new Titlebar({
  backgroundColor: Color.TRANSPARENT,
  // backgroundColor: new Color(new RGBA(0, 0, 0, .7)),
  menu: null,
  // backgroundColor: customTitlebar.Color.fromRgba('0,0,0,0.7'),
});
// titlebar.updateItemBGColor(Color.TRANSPARENT);
// titlebar.updateItemBGColor(new Color(new RGBA(0, 0, 0, 0.7)));
render(<App />, document.getElementById('root'));
