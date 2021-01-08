import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import icon from '../assets/icon.svg';
import GetTags from './GetTags';

import Database from './Database';
import { url } from 'inspector';
import Config from './config.json';
import Sidebar from 'react-sidebar';
const fileUrl = require('file-url');
const fs = require('fs');
const { ipcRenderer } = window.require('electron');
var listA: any = ['a'];
// var gettags;
var connected: boolean = false;
var tables = [];
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

      var getTags = await new GetTags();

      var test;
      test = await getTags.init(database, arg);
      // tables.push(<TableRow pathName="TEST" />);
      ////////////////////////////////////////////////////////////////////////////////
      var interval = setInterval(() => {
        if (getTags.dl != undefined) {
          clearInterval(interval);
          console.log(getTags.dl);
          var path = getTags.filePath;
          // listA.push('zzz');
          // console.log(path);
          tables.push(
            <TableRow
              pathName={path}
              fileName={getTags.fileName}
              tags={getTags.tags}
              folder={getTags.folderName}
            />
          );
        }
      }, 500);
      // setTimeout(async () => {
      //   //this is a piece of shit, change it immediately!!!!!!!
      //   // console.log(getTags.filePath);

      //   var path = getTags.filePath;
      //   // listA.push('zzz');
      //   // console.log(path);
      //   tables.push(<TableRow pathName={path} />);
      // }, 5000);
      /////////////////////////////////////////////////////////////////////////////////
      // getTags.on
      // getTags.getDownloadInfo().then(
      //   (fulfilled) => {
      //     console.log(fulfilled);
      //   },
      //   (err) => {
      //     console.log(err);
      //   }
      // );
      // console.log(getTags);
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
class TableRow extends React.Component {
  url: string = '';
  tags: string = 'other';
  constructor(props) {
    super(props);
    this.url = fileUrl(this.props.pathName);
    var tempTags: string[] = [];
    console.log(this.props.tags);
    for (let i = 0; i < Config.tags.length; i++) {
      for (let j = 0; j < Config.tags[i].fromSite.length; j++) {
        if (
          Config.tags[i].visible &&
          this.props.tags.includes(Config.tags[i].fromSite[j])
        ) {
          tempTags.push(Config.tags[i].toReturn);
        }
      }
    }
    this.tags = tempTags.join(', ').length > 0 ? tempTags.join(', ') : 'other';

    // console.log(this.url);
  }
  render() {
    return (
      <tr
        className="tableDiv"
        // style={{
        //   width:
        //     document.getElementsByClassName('listItems').length > 0
        //       ? document.getElementsByTagName('body')[0].clientWidth -
        //         document.getElementsByClassName('listItems')[0]
        //           .clientWidth +
        //         'px'
        //       : '100%',
        // }}
      >
        <td style={{ width: '200px' }}>
          <img className="tableImg" src={this.url}></img>
        </td>
        <td className="tableCell">
          <div className="fileName">{this.props.fileName}</div>
          {'  '}
          <div className="tagName">{this.tags}</div>
          <div className="folderName">{this.props.folder}</div>{' '}
        </td>
      </tr>
    );
  }
}

// var listTest = [
//   ['asd', 'zzz'],
//   ['bds', 'zxc'],
//   ['qwe', 'asdqw'],
// ];
// class TableRow extends React.Component {
//   constructor(props) {
//     super(props);

//     this.listItem = this.props.check.map((item) => (
//       <td>
//         {' '}
//         <tr>{`${item[0]}`}</tr>
//         <tr>{` ${item[1]}`}</tr>
//       </td>
//     ));
//   }
//   // componentDidMount() {
//   //   setInterval(() => {
//   //     this.forceUpdate();
//   //   }, 1000);
//   // }

//   render() {
//     return <tr>{this.listItem}</tr>;
//   }
// }

class Table extends React.Component {
  constructor(props) {
    super(props);
    this.timer;
  }
  componentDidMount() {
    this.timer = setInterval(() => {
      this.forceUpdate();
    }, 1000);
  }
  componentWillUnmount() {
    clearInterval(this.timer);
    // console.log('unmount');
  }
  render() {
    return <table className="globalTable">{tables}</table>;
  }
}

class TagPicker extends React.Component {
  checkboxes: any = [];
  constructor(props) {
    super(props);
    // this.data = [
    //   { value: 'apple', label: 'Apple' },
    //   { value: 'orange', label: 'Orange' },
    //   { value: 'banana', label: 'Banana', checked: true }, // check by default
    // ];
    this.checkboxes = Config.tags.map((value) =>
      // console.log(index + value.toReturn);

      value.visible ? (
        <div>
          <input
            type="checkbox"
            name={value.toReturn}
            value={value.toReturn}
          ></input>
          <div>{value.toReturn}</div>
        </div>
      ) : (
        ''
      )
    );
  }
  handleCheckChange() {}
  render() {
    return <div className="listItems">{this.checkboxes}</div>;
  }
}

class App extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div>
        <Table check={listA} />
        <TagPicker />
      </div>
    );
  }
}
export default App;
