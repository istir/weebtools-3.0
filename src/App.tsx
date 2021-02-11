import React from 'react';
import GetTags from './GetTags';
import { useTable } from 'react-table';
import Database from './Database';
// import Config from './config.json';
import settings from 'electron-settings';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { Checkbox } from '@material-ui/core';
import SimpleBarReact from 'simplebar-react';
import { refresh } from 'electron-debug';
import { clipboard } from 'electron';
import ConfigButton from './ConfigDiv';
import SearchButton from './Search';
import { FixedSizeList as List } from 'react-window';
import Table from './Table';
import Pages from './Pages';
import FullscreenImage from './FullscreenImage';
// import { BrowserWindow } from 'electron/main';
// import { shell } from 'electron/common';
const { remote } = require('electron');
const { Menu, MenuItem } = remote;
const { dialog } = require('electron').remote;
const { BrowserWindow } = require('electron').remote;
const { shell } = require('electron');
// import { Menu } from 'electron';
// import 'simplebar/dist/simplebar.min.css';
const fs = require('fs');
const { ipcRenderer } = window.require('electron');
const path = require('path');
// var gettags;
// const trash = require('trash');
var currImage: string = '';
var images: Object[] = [];
var database: any;
var workingDirectory = settings.getSync('commonSettings');
workingDirectory = workingDirectory.find((el) => el.key === 'workingPath')
  .value;
interface TagPickerState {
  checked: string[];
  row: any;
}
interface TagPickerProps {
  row: any;
  tags: string[];
}
class TagPicker extends React.Component<TagPickerProps, TagPickerState> {
  checkboxes: JSX.Element[];
  constructor(props: TagPickerProps) {
    super(props);
    this.state = { checked: [''], row: this.props.row };
    //initialize list of <Checkbox/>
    this.checkboxes = [];
  }
  componentDidUpdate() {
    //doing some weird, but ultimately it lets me change state by toggling things and other good things too
    if (this.state.row != this.props.row) {
      this.setState({ row: this.props.row });
      this.setState({ checked: this.props.row.tags });
    }
  }
  handleChanging(e: { target: { value: any; checked: any } }) {
    // console.log(e);
    if (this.props.row != null) {
      let currTag = [];
      for (let i = 0; i < this.props.tagsDictionary.length; i++) {
        const element = this.props.tagsDictionary[i];
        if (element.returnValue === e.target.value && element.shown) {
          if (!currTag.includes(element.fromSite)) {
            currTag.push(element.fromSite);
          }
        }
      }

      var foundTag = this.props.tagsDictionary.find(
        (el) => el.returnValue === e.target.value
      );
      if (!e.target.checked) {
        //TODO: make it so currTag is an array and newState removes that array from itself
        for (let i = 0; i < currTag.length; i++) {
          if (this.state.checked.includes(currTag[i])) {
            let index = this.state.checked.indexOf(currTag[i]);
            let newState = this.state.checked;
            newState.splice(index, 1);
            // console.log(newState);
            this.setState({ checked: newState });
          }
          //here is almost the same but if item isn't togged I add it to "checked" state
        }
      }
      if (e.target.checked) {
        if (!this.state.checked.includes(foundTag.fromSite)) {
          let newState = this.state.checked;

          newState.push(foundTag.fromSite);
          // newState.push(e.target.value);
          this.setState({ checked: newState });
        }
      }
      this.modifyItem(
        this.props.row.fileName,
        this.props.row.folder,
        this.props.row.folder,
        this.state.checked
      );
    }
    // modifyItem()
    // console.log(this.state.checked)
    this.props.refresh();
  }

  async refreshItem(fileName: string, folder: string) {
    var query =
      'SELECT * FROM files WHERE fileName="' +
      fileName +
      '" AND folder="' +
      folder +
      '"';
    var [rows] = await this.props.database.query(query);
    return rows[0].Tags.split(', ');
  }
  async modifyItem(
    oldName: string,
    oldFolder: string,
    newFolder: string,
    newTags: string[]
  ) {
    var query =
      'UPDATE files SET folder="' +
      newFolder +
      '",Tags="' +
      normalizeTags(newTags) +
      '" where fileName="' +
      oldName +
      '" AND folder="' +
      oldFolder +
      '"';
    await this.props.database.query(query);
    function normalizeTags(tagArr: string[]) {
      return tagArr.join(', ');
    }
  }

  deleteItemFromDatabase(fileName: string, folderName: string) {
    //  async function deleteRecord() {
    var queryDeleteRow =
      'DELETE FROM files WHERE fileName = "' +
      fileName +
      '" AND folder ="' +
      folderName +
      '"';
    this.props.database.execute(queryDeleteRow);
    // console.log(rows);
    //   return new Promise((resolved, rejected) => {
    //     if (rows.affectedRows >= 1) {
    //       // console.log('YEP');
    //       resolved(true);
    //     } else {
    //       rejected(false);
    //     }
    //   });
    // }
  }

  render() {
    //fill <Checkbox/> list

    this.checkboxes = [];
    for (let i = 0; i < this.props.tags.length; i++) {
      let value = this.props.tags[i];
      var check = false;
      // console.log(value);
      if (this.state.checked.length > 0) {
        for (let j = 0; j < value[1].length; j++) {
          // console.log(value[0] + " '" + value[1][j] + "'");
          if (this.state.checked.includes(value[1][j])) {
            check = true;
            break;
          }
        }
      }
      // console.log(value[1][0]);
      this.checkboxes.push(
        <CheckboxComponent
          key={value[1]}
          // shouldCheck={
          //   this.state.checked.length > 0
          //     ? this.state.checked.includes(value[1][0])
          //     : false
          // }
          shouldCheck={check}
          value={value[0]}
          text={value[1][0]}
          change={this.handleChanging.bind(this)}
        />
      );
    }

    return <div className="listItems">{this.checkboxes}</div>;
  }
}
// var tagPicker = <TagPicker />;
interface CheckBoxProps {
  change: any;
  value: string;
  text: string;
  shouldCheck: boolean;
}
interface CheckBoxState {}

class CheckboxComponent extends React.Component<CheckBoxProps, CheckBoxState> {
  constructor(props: CheckBoxProps) {
    super(props);
  }

  render() {
    // console.log(this.props.test);
    return (
      <div
      // onClick={(e) => {
      //   console.log(e.target.parentNode);
      //   console.log(e);
      // }}
      >
        <Checkbox
          // onChange={this.changed.bind(this)}
          onChange={this.props.change}
          // onChange={(e) => {
          //   console.log(e);
          // }}
          // onClick={this.ch()}
          key="input"
          value={this.props.value}
          checked={this.props.shouldCheck}
        />
        <div className="checkboxText">{this.props.value}</div>
      </div>
    );
  }
}

class App extends React.Component {
  constructor(props: {} | Readonly<{}>) {
    super(props);

    this.state = {
      tags: this.getTags(),
      currRow: null,
      images: images,
      imgCount: 0,
      currRowID: -1,
      tagDictionary: this.getTagDictionary(),
      database: null,
      showFullscreen: false,
      searchFor: '',
    };
  }

  getTagDictionary() {
    let tagObj = [];
    var stt = settings.getSync('tags');
    for (let i = 0; i < stt.length; i++) {
      for (let j = 0; j < stt[i].fromSite.length; j++) {
        tagObj.push({
          fromSite: stt[i].fromSite[j],
          returnValue: stt[i].toReturn,
          shown: stt[i].visible,
        });
        // console.log(stt[i].fromSite[j] + ' ' + stt[i].toReturn);
      }
    }
    return tagObj;
  }

  getTags() {
    var tempTags = [];
    for (let i = 0; i < settings.getSync('tags').length; i++) {
      if (settings.getSync('tags')[i].visible) {
        let test = [settings.getSync('tags')[i].toReturn];
        let test1 = [];
        for (let j = 0; j < settings.getSync('tags')[i].fromSite.length; j++) {
          test1.push(settings.getSync('tags')[i].fromSite[j]);
        }
        test.push(test1);
        tempTags.push(test);
      }
    }
    return tempTags;
  }
  refreshTags() {
    this.forceUpdate();

    this.setState({ tags: this.getTags() });
    this.setState({ tagDictionary: this.getTagDictionary() });
  }

  componentDidMount() {
    Database().then(
      (ful: any) => {
        console.log('connected');
        // console.log(ful);
        this.setState({ database: ful });
      },
      (rej: any) => {
        console.log('error');
      }
    );
  }

  componentDidUpdate() {
    // console.log(this.state.images);
  }
  handleTableClick(id, imageData) {
    this.setState({ currRowID: id });
    this.setState({ currRow: imageData });
  }

  refresh() {
    this.forceUpdate();
  }
  clickFullscreenImage(value) {
    this.setState({ showFullscreen: value });
  }
  setSearch(value) {
    this.setState({ searchFor: value });
    // console.log(this.state.searchFor);
  }
  render() {
    return (
      <div>
        {/* <div className="icon">
          {' '} */}
        <ConfigButton forceUpdate={this.refreshTags.bind(this)} />
        <SearchButton
          currentSearch={this.state.searchFor}
          setSearch={this.setSearch.bind(this)}
        />
        {/* </div> */}

        <FullscreenImage
          show={this.state.showFullscreen}
          shouldShow={this.clickFullscreenImage.bind(this)}
          // image={
          //   'E:\\istir\\Drive\\Media\\reddit\\qt\\azur lane\\__z46_and_z46_azur_lane_drawn_by_semimarusemi__e4e5e92bef5190c1f8c72c61dfab5b70.png'
          // }
          image={this.state.currRow?.pathName}
        />
        {/* <Table
          handleClick={this.handleTableClick.bind(this)}
          imageData={this.state.images}
          showableTags={this.state.tags}
          showableTags2={this.state.tagDictionary}
        /> */}
        <Pages
          handleClick={this.handleTableClick.bind(this)}
          // imageData={this.state.images}
          doubleClick={this.clickFullscreenImage.bind(this)}
          showableTags={this.state.tags}
          showableTags2={this.state.tagDictionary}
          database={this.state.database}
          workingDir={workingDirectory}
          searchFor={this.state.searchFor}
          refresh={this.refresh.bind(this)}
        />
        <TagPicker
          tags={this.state.tags}
          tagsDictionary={this.state.tagDictionary}
          row={this.state.currRow}
          database={this.state.database}
          refresh={this.refresh.bind(this)}
        />
      </div>
    );
  }
}
export default App;
