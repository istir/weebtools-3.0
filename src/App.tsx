import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import icon from '../assets/icon.svg';
import GetTags from './GetTags';

import Database from './Database';
import { url } from 'inspector';
import Config from './config.json';
import Sidebar from 'react-sidebar';
import LoadLocalFiles from './LoadLocalFiles';
import { LazyLoadImage } from 'react-lazy-load-image-component';
// import { Table } from '@material-ui/core';
const fileUrl = require('file-url');
const fs = require('fs');
const { ipcRenderer } = window.require('electron');
const path = require('path');
var listA: any = ['a'];
// var gettags;
var connected: boolean = false;
var tables = [];
var tablesLoaded = [];
var filesToLoad: string[] = [];
Database().then(
  (ful) => {
    console.log('Connected successfully');

    var database = ful;
    loadLastQueries(database, 1000).then(
      () => {
        // console.log(filesToLoad);
      },
      (err) => {
        console.log(err);
      }
    );
    // new LoadLocalFiles(database);
    ipcRenderer.on('clipboard', async (event, arg) => {
      console.log(arg); // prints "pong"

      var getTags = await new GetTags();

      var test;
      test = await getTags.init(database, arg);
      // tables.push(<TableRow pathName="TEST" />);
      ////////////////////////////////////////////////////////////////////////////////
      var interval = setInterval(() => {
        if (getTags.dl != undefined) {
          clearInterval(interval);
          var path = getTags.filePath;
          // listA.push('zzz');
          // console.log(path);
          // console.log('UNSHIFT');
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
    });
    async function loadLastQueries(database: any, limit: number) {
      var query = 'SELECT * FROM files ORDER BY ID DESC LIMIT ' + limit;

      var [rows] = await database.execute(query);
      // for (let i = 0; i < rows.length; i++) {
      //   filesToLoad.push(rows[i].folder);
      // }
      rows.map((item) => {
        // console.log(item);
        var filePath = path.join(
          Config.workingPath,
          item.folder,
          item.fileName
        );
        fs.access(filePath, fs.constants.R_OK, (err) => {
          if (!err) {
            tablesLoaded.push(
              <TableRow
                pathName={filePath}
                fileName={item.fileName}
                tags={item.Tags.split(', ')}
                folder={item.folder}
              />
            );
            // filesToLoad.push(filePath);
          }
        });
      });
      // console.log(filesToLoad);
      // return rows;
      // }
    }
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
  focused: bool = false;
  constructor(props) {
    super(props);
    // this.url = fileUrl(this.props.pathName);
    // console.log('PROP:' + this.props.pathName);
    // console.log('PROP2' + this.props.fileName);
    var tempTags: string[] = [];
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
  handleClick() {
    if (this.focused) {
      this.focused = false;
    } else {
      this.focused = true;
    }
    console.log(this.focused);
  }
  render() {
    return (
      <tr
        onClick={this.handleClick.bind(this)}
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
          <LazyLoadImage
            className="tableImg"
            src={fileUrl(this.props.pathName)}
          />
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
    this.tableLocal = [];
    this.tableLength = 0;
  }
  componentDidMount() {
    this.timer = setInterval(() => {
      // console.log(tables.length);
      // console.log(this.tableLength);
      if (tablesLoaded.length > this.tableLength) {
        this.tableLocal.push(tablesLoaded);
        this.tableLength = tablesLoaded.length;
        this.forceUpdate();
      }
      if (tablesLoaded.length + tables.length > this.tableLength) {
        this.tableLocal.unshift(tables);
        this.tableLength = tablesLoaded.length + tables.length;
        this.forceUpdate();
      }
    }, 1000);
  }
  componentWillUnmount() {
    clearInterval(this.timer);
    // console.log('unmount');
  }

  componentDidUpdate() {
    // console.log('updated');
  }

  render() {
    return (
      <div>
        <table className="globalTable">{this.tableLocal}</table>
      </div>
    );
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
