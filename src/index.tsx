import React from 'react';
import { render } from 'react-dom';
import App from './App';
import './App.global.css';
// import 'simplebar/dist/simplebar.min.css';
// const customTitlebar = require('simplebar/dist/simplebar.min.css');

<link rel="stylesheet" href="css/perfect-scrollbar.css"></link>;

import { Titlebar, Color } from 'custom-electron-titlebar';
var titlebar = new Titlebar({
  backgroundColor: Color.TRANSPARENT,
  // backgroundColor: customTitlebar.Color.fromRgba('0,0,0,0.7'),
});
// titlebar.updateItemBGColor(Color.TRANSPARENT);
// titlebar.updateItemBGColor(new Color(new RGBA(0, 0, 0, 0.7)));
render(<App />, document.getElementById('root'));
