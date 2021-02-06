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
import { FixedSizeList as List } from 'react-window';
import Table from './Table';
import Pages from './Pages';
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
// var settings.getSync('tags') = settings.getSync('tags');
Database().then(
  (ful: any) => {
    console.log('Connected successfully');

    database = ful;
    loadLastQueries(database, 100).then(
      (ful) => {
        // document.getElementsByTagName('body')[0].ba
        // console.log
        // console.log(images.length);
        // console.log(Math.floor(Math.random() * ful.length));
        // console.log(ful[Math.floor(Math.random() * ful.length)]);
        // var filePath = path
        //   .join(
        //     workingDirectory,
        //     ful[Math.floor(Math.random() * ful.length)].folder,
        //     ful[Math.floor(Math.random() * ful.length)].fileName
        //   )
        //   .replace(/\\/g, '/');
        // console.log(filePath);
        // //E:\istir\Drive\Media\reddit\qt\other\__mayoi_sakyu_vgaming__48d5f39678e1335329666182531a6b35.jpg
        // document.body.style.backgroundImage = 'url(' + filePath + ')';
        // randomBackground(ful);
        // console.log(filesToLoad);
      },
      (err) => {
        console.log(err);
      }
    );
    // new LoadLocalFiles(database);
    ipcRenderer.on('clipboard', async (_event: any, arg: string) => {
      // console.log(arg);

      var getTags = await new GetTags();

      // tables.push(<TableRow pathName="TEST" />);
      ////////////////////////////////////////////////////////////////////////////////
      await getTags.init(database, arg);
      var interval = setInterval(() => {
        if (getTags.dl != undefined) {
          clipboard.writeText('');
          clearInterval(interval);
          var path = getTags.filePath;
          // listA.push('zzz');
          // console.log(path);
          // console.log('UNSHIFT');
          // tables.push(
          //   <TableRow
          //     pathName={path}
          //     fileName={getTags.fileName}
          //     tags={getTags.tags}
          //     folder={getTags.folderName}
          //   />
          // );

          // const data =[{pathName:"asd",tags:["asd","zxc"]}]
          // console.log(images);
          // console.log(images);
          // var duplicate = false;
          for (let i = 0; i < images.length; i++) {
            // const element = images[i];
            // console.log(images[i].pathName);
            if (images[i].pathName == path) {
              // console.log(images);
              // console.log(images[i].pathName);
              // console.log(i);
              images.splice(i, 1);
              // console.log(images);
              // duplicate = true;
              // images[i].tags = getTags.tags;
            }
          }
          // console.log(
          //   images.indexOf({
          //     pathName: path,
          //     fileName: getTags.fileName,
          //     folder: getTags.folderName,
          //   })
          // );
          // console.log(images);
          // if (images.includes({pathName:path,fileName:getTags.fileName,folder:getTags.folderName})) {

          // }
          // if (!duplicate) {
          images.unshift({
            pathName: path,
            fileName: getTags.fileName,
            tags: getTags.tags,
            folder: getTags.folderName,
            url: getTags.urlString,
          });
          // images = new Set(images);
          // console.log(images);
          // }
        }
      }, 500);
    });
    async function loadLastQueries(database: any, limit: number) {
      var query = 'SELECT * FROM files ORDER BY ID DESC LIMIT ' + limit;

      var [rows] = await database.execute(query);
      // for (let i = 0; i < rows.length; i++) {
      //   filesToLoad.push(rows[i].folder);
      // }
      await rows.map((item: any) => {
        // console.log(item);
        var filePath = path.join(workingDirectory, item.folder, item.fileName);
        fs.access(filePath, fs.constants.R_OK, (err: Error) => {
          if (!err) {
            // tablesLoaded.push(
            //   <TableRow
            //     pathName={filePath}
            //     fileName={item.fileName}
            //     tags={item.Tags.split(', ')}
            //     folder={item.folder}
            //   />
            // );

            images.push({
              pathName: filePath,
              fileName: item.fileName,
              tags: item.Tags.split(', '),
              folder: item.folder,
              url: item.url,
            });
            // filesToLoad.push(filePath);
          }
        });
      });
      // console.log(filesToLoad);
      // return rows;
      // }
      return new Promise((resolve, reject) => {
        resolve(rows);
      });
    }
  },
  (rej) => {
    console.log("Couldn't connect to database.");
    console.log(rej);
  }
);

function randomBackground(picker: []) {
  let random = Math.floor(Math.random() * picker.length);
  var tags = picker[random].Tags.split(', ');
  if (tags.includes('Rating: Explicit')) {
    //TODO: change later!
    randomBackground(picker);
  } else {
    // console.log(picker[random]);
    var filePath = path.join(
      workingDirectory,
      picker[random].folder,
      picker[random].fileName
    );
    filePath = filePath.replace(/\\/g, '/');
    // console.log(filePath);
    //E:\istir\Drive\Media\reddit\qt\other\__mayoi_sakyu_vgaming__48d5f39678e1335329666182531a6b35.jpg
    fs.access(filePath, fs.constants.R_OK, (err: Error) => {
      if (!err) {
        document.body.style.backgroundImage = 'url(' + filePath + ')';
      } else {
        randomBackground(picker);
      }
    });
  }
}
async function refreshItem(fileName: string, folder: string) {
  var query =
    'SELECT * FROM files WHERE fileName="' +
    fileName +
    '" AND folder="' +
    folder +
    '"';
  var [rows] = await database.query(query);
  return rows[0].Tags.split(', ');
}
async function modifyItem(
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
  await database.query(query);
  function normalizeTags(tagArr: string[]) {
    return tagArr.join(', ');
  }
}

function deleteItemFromDatabase(fileName: string, folderName: string) {
  //  async function deleteRecord() {
  var queryDeleteRow =
    'DELETE FROM files WHERE fileName = "' +
    fileName +
    '" AND folder ="' +
    folderName +
    '"';
  database.execute(queryDeleteRow);
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

// function Table(props: any) {
//   // const [selected, setSelected] = useState(null);
//   //initialize columns, probably could just not add it later on
//   const columns = React.useMemo(
//     () => [
//       {
//         Header: 'Images',
//         accessor: 'col1', // accessor is the "key" in the data
//       },
//       {
//         Header: 'Other Data',
//         accessor: 'col2',
//       },
//     ],
//     []
//   );
//   //initialize data from imageData from props
//   function normalizeName(arr: string[]) {
//     let tempArr = [];
//     for (let i = 0; i < props.showableTags2.length; i++) {
//       const element = props.showableTags2[i];
//       if (element.shown) {
//         if (arr.includes(element.fromSite)) {
//           if (!tempArr.includes(element.returnValue)) {
//             tempArr.push(element.returnValue);
//           }
//           // console.log(element.returnValue);
//         }
//       }
//       // console.log(element);
//     }
//     // console.log(arr);
//     // console.log(arr);
//     // console.log(props.showableTags);
//     // let tempArr = [];
//     // for (let i = 0; i < props.showableTags.length; i++) {
//     //   // console.log(props.showableTags[i]);
//     //   for (let j = 0; j < props.showableTags[i][1].length; j++) {
//     //     // console.log(props.showableTags[i][1][j]);
//     //     if (arr.includes(props.showableTags[i][1][j])) {
//     //       tempArr.push(props.showableTags[i][1][j]);
//     //       // tempArr.push(arr[arr.indexOf(props.showableTags[i][1][j])]);
//     //     }
//     //   }
//     // }
//     // tempArr.length == 0 ? tempArr.push('other') : '';
//     return tempArr.join(', ');
//   }

//   const data = React.useMemo(
//     () =>
//       props.imageData.map(
//         (item: {
//           pathName: any;
//           fileName: React.ReactNode;
//           tags: string[];
//           folder: React.ReactNode;
//         }) => ({
//           col1: (
//             <LazyLoadImage className="tableImg" src={item.pathName} />
//             // <div>
//             //   <LazyLoadImage className="tableImgBg" src={item.pathName} />
//             // </div>
//           ),
//           col2: (
//             <div className="tableCell">
//               {' '}
//               <div className="fileName">{item.fileName}</div>
//               {'  '}
//               <div className="tagName">{normalizeName(item.tags)}</div>
//               <div className="folderName">{item.folder}</div>
//             </div>
//           ),
//         })
//       ),
//     undefined
//   );
//   //row onclick -> prop callback

//   function handleRowClick(e: any) {
//     for (
//       let i = 0;
//       i < document.getElementsByClassName('tableRow').length;
//       i++
//     ) {
//       const element = document.getElementsByClassName('tableRow')[i];
//       element.className = 'tableRow';
//     }
//     // console.log(e);
//     document
//       .getElementsByClassName('tableRow')
//       [e.id].classList.toggle('selectedRow');
//     props.handleClick(e);
//   }

//   //initialize table and render it
//   const { getTableProps, getTableBodyProps, rows, prepareRow } = useTable({
//     columns,
//     data,
//   });

//   // render() {
//   // const Row = ({ index, style }) => (
//   //   <div className={index % 2 ? 'ListItemOdd' : 'ListItemEven'} style={style}>
//   //     {/* Row {index} */}
//   //     {/* <img src={props.imageData[index].pathName} /> */}
//   //     <LazyLoadImage
//   //       className="tableImg"
//   //       src={props.imageData[index].pathName}
//   //     />
//   //   </div>
//   // );
//   return (
//     // apply the table props
//     // <div
//     //   style={{
//     //     height: document.getElementsByTagName('body')[0].clientHeight,
//     //     overflowY: 'auto',
//     //   }}
//     //   className="divbeforetabletemp"
//     // >
//     /* <SimpleBar forceVisible="y" autoHide={false} style={{ maxHeight: 300 }}>
//         {[...Array(50)].map((x, i) => (
//           <p key={i} className="odd">
//             Some content
//           </p>
//         ))} */
//     <div className="divbeforetabletemp">
//       <SimpleBarReact
//         style={{
//           top: 30,
//           maxHeight: '100vh',
//         }}
//       >
//         {/* <List
//           height={500}
//           itemCount={props.imageData.length}
//           itemSize={200}
//           width={900}
//         >
//           {Row}
//         </List> */}

//         <table className="globalTable" {...getTableProps()}>
//           <tbody {...getTableBodyProps()}>
//             {rows.map(
//               (row: {
//                 getRowProps: () => JSX.IntrinsicAttributes &
//                   React.ClassAttributes<HTMLTableRowElement> &
//                   React.HTMLAttributes<HTMLTableRowElement>;
//                 cells: any[];
//               }) => {
//                 // Prepare the row for display
//                 prepareRow(row);
//                 return (
//                   // Apply the row props
//                   <tr
//                     className="tableRow"
//                     onClick={() => {
//                       handleRowClick(row);
//                     }}
//                     onDoubleClick={() => {
//                       //TODO
//                       currImage = images[row.id].pathName;
//                       // <FullscreenImage image={images[row.id].pathName} />;
//                     }}
//                     onContextMenu={() => {
//                       handleRowClick(row);
//                       const menu = new Menu();
//                       menu.append(
//                         new MenuItem({
//                           label: 'Show in Explorer',
//                           click: () => {
//                             // clipboard.writeImage(images[row.id].pathName);
//                             shell.showItemInFolder(images[row.id].pathName);
//                           },
//                         })
//                       );
//                       menu.append(
//                         new MenuItem({
//                           label: 'Copy image',
//                           click: () => {
//                             clipboard.writeImage(images[row.id].pathName);
//                           },
//                         })
//                       );
//                       menu.append(
//                         new MenuItem({
//                           label: 'Show all Tags',
//                           click: () => {
//                             // clipboard.writeImage(images[row.id].pathName);
//                             // shell.showItemInFolder(images[row.id].pathName);
//                           },
//                         })
//                       );
//                       menu.append(
//                         new MenuItem({
//                           label: 'Delete',
//                           click: () => {
//                             // console.log(images);
//                             // (async () => {
//                             //   await trash('E:/test.txt');
//                             // })();

//                             let response = dialog
//                               .showMessageBox(
//                                 BrowserWindow.getFocusedWindow(),
//                                 {
//                                   buttons: ['Yes', 'No'],
//                                   message: 'Delete?',
//                                   title: 'Are you sure?',
//                                 }
//                               )
//                               .then((result) => {
//                                 if (result.response === 0) {
//                                   fs.unlink(images[row.id].pathName, (err) => {
//                                     throw err;
//                                   });
//                                   deleteItemFromDatabase(
//                                     images[row.id].fileName,
//                                     images[row.id].folder
//                                   );
//                                   images.splice(row.id, 1);
//                                 }
//                               });
//                             // if (response == 0) {
//                             //   console.log('XD');
//                             // }
//                             // console.log(response);

//                             // // fs.rm(images[row.id].pathName, (err) => {
//                             // //   throw err;
//                             // // });

//                             // images.splice(row.id, 1);
//                             // console.log(row);
//                           },
//                         })
//                       );
//                       menu.append(
//                         new MenuItem({
//                           label: 'Open site',
//                           click: () => {
//                             if (images[row.id].url != '') {
//                               console.log(images[row.id].url);
//                             }
//                             // clipboard.writeImage(images[row.id].pathName);
//                             // shell.showItemInFolder(images[row.id].pathName);
//                           },
//                         })
//                       );
//                       menu.popup();
//                     }}
//                     {...row.getRowProps()}
//                   >
//                     {
//                       // Loop over the rows cells
//                       row.cells.map(
//                         (cell: {
//                           getCellProps: () => JSX.IntrinsicAttributes &
//                             React.ClassAttributes<HTMLTableDataCellElement> &
//                             React.TdHTMLAttributes<HTMLTableDataCellElement>;
//                           render: (arg0: string) => React.ReactNode;
//                         }) => {
//                           // Apply the cell props
//                           return (
//                             <td {...cell.getCellProps()}>
//                               {
//                                 // Render the cell contents
//                                 cell.render('Cell')
//                               }
//                             </td>
//                           );
//                         }
//                       )
//                     }
//                   </tr>
//                 );
//               }
//             )}
//           </tbody>
//         </table>
//         {/* {[...Array(50)].map((x, i) => (
//           <p key={i} className="odd">
//             Some content
//           </p>
//         ))} */}
//       </SimpleBarReact>
//     </div>
//   );
// }
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
      // throw e;
      //WELL WELL WELL
      //this weird syntax is because <input> gives weird checked boolean (basically NOT)
      //so !e.target.checked is then the target IS currently checked
      //then I just set "checked" state to "checked" - currently toggled item
      // console.log(this.props.row.tags);
      // console.log(this.state.checked);
      // console.log(this.props.tags);
      // var currTag = [''];
      // for (let i = 0; i < this.props.tags.length; i++) {
      //   if (this.props.tags[i][0] == e.target.value) {
      //     // console.log("yeep");
      //     // console.log(this.props.tags[i]);
      //     for (let j = 0; j < this.props.tags[i].length; j++) {
      //       // console.log(this.state.checked);
      //       // console.log(this.props.tags[i][j]);
      //       for (let k = 0; k < this.props.tags[i][j].length; k++) {
      //         // console.log(this.props.tags[i][j][k]);
      //         if (this.state.checked.includes(this.props.tags[i][j][k])) {
      //           currTag.push(this.props.tags[i][j][k]);
      //         }
      //       }
      //       // if (this.state.checked.includes(this.props.tags[i][j])) {
      //       //   // console.log(this.props.tags[i][j]);
      //       // }
      //     }
      //   }
      // }

      let currTag = [];
      for (let i = 0; i < this.props.tagsDictionary.length; i++) {
        const element = this.props.tagsDictionary[i];
        // console.log(e.target.value);
        // console.log(element);
        if (element.returnValue === e.target.value && element.shown) {
          // console.log(element.fromSite);
          if (!currTag.includes(element.fromSite)) {
            currTag.push(element.fromSite);
          }
        }
        // if (arr.includes(element.fromSite)) {
        //   if (!tempArr.includes(element.returnValue)) {
        //     tempArr.push(element.returnValue);
        //   }
        //   // console.log(element.returnValue);
      }

      // console.log(e.target.value);
      var foundTag = this.props.tagsDictionary.find(
        (el) => el.returnValue === e.target.value
      );
      // console.log(foundTag);

      // console.log(element);
      // console.log(this.state.checked);
      // console.log(currTag);
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
      // if (!e.target.checked) {
      //   //TODO: make it so currTag is an array and newState removes that array from itself
      //   for (let i = 0; i < currTag.length; i++) {
      //     if (this.state.checked.includes(currTag[i])) {
      //       let index = this.state.checked.indexOf(currTag[i]);
      //       let newState = this.state.checked;
      //       newState.splice(index, 1);
      //       // console.log(newState);
      //       this.setState({ checked: newState });
      //     }
      //     //here is almost the same but if item isn't togged I add it to "checked" state
      //   }
      // }
      // console.log(e.target.value);

      // console.log(

      // );
      if (e.target.checked) {
        if (!this.state.checked.includes(foundTag.fromSite)) {
          let newState = this.state.checked;

          newState.push(foundTag.fromSite);
          // newState.push(e.target.value);
          this.setState({ checked: newState });
        }
      }
      modifyItem(
        this.props.row.fileName,
        this.props.row.folder,
        this.props.row.folder,
        this.state.checked
      );
    }
    // modifyItem()
    // console.log(this.state.checked)
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

class FullscreenImage extends React.Component {
  constructor(props) {
    super(props);
    this.state = { show: false, manual: true, render: true };
  }
  componentDidUpdate() {
    if (this.state.show != this.props.show && this.state.manual == true) {
      this.setState({ show: this.props.show });
      this.setState({ manual: false });
    }
  }

  render() {
    // if (this.state.render === false) {
    //   return null;
    // }
    return (
      <div
        onClick={() => {
          // this.setState({ show: false });
          currImage = '';
          // this.setState({ manual: false });
          // this.setState({ render: false });
        }}
        className={`fullscreenDiv ${currImage != '' ? 'visible' : 'hidden'}`}
      >
        <img
          className="fullscreenImg"
          // src={this.state.show ? this.props.image : ''}
          src={currImage}
        ></img>
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
    //probably need to change? but maybe not, not sure how it will work when finished
    this.timerID = setInterval(() => {
      // if (this.state.images.length != this.state.imgCount) {
      //this fucks everything up :(
      this.setState({
        currRow:
          this.state.currRowID >= 0
            ? this.state.images[this.state.currRowID]
            : null,
      });
      this.forceUpdate();
      // this.setState({ imgCount: this.state.images.length });
      // console.log(this.state.images);
      // console.log(this.state.currRow);
      // }
      //   this.setState({ images: images });
      //TODO: but fix this..., maybe componentshouldupdate?
      // this.forceUpdate();
      // this.shouldComponentUpdate();
      // }
      // console.log(this.state.images.length);
      // console.log('upd');
    }, 10);
  }
  // shouldComponentUpdate(nextProps, nextState) {
  //   console.log('????');
  //   return false;
  //   // return true;
  // }

  componentDidUpdate() {
    // console.log(this.state.images);
  }
  handleTableClick(e: { id: React.ReactText }) {
    // console.log(this.state.currRow);
    // console.log(e.id);
    // console.log(this.state.images);
    // refreshItem(
    //   this.state.images[e.id].fileName,
    //   this.state.images[e.id].folder
    // ).then((ful) => {
    //   console.log(ful);
    // });
    // console.log(this.state.tags);
    this.setState({ currRowID: e.id });
    this.setState({ currRow: this.state.images[this.state.currRowID] });
  }
  render() {
    return (
      <div>
        <ConfigButton forceUpdate={this.refreshTags.bind(this)} />
        <FullscreenImage show={true} image={this.state.currRow?.pathName} />
        {/* <Table
          handleClick={this.handleTableClick.bind(this)}
          imageData={this.state.images}
          showableTags={this.state.tags}
          showableTags2={this.state.tagDictionary}
        /> */}
        <Pages
          handleClick={this.handleTableClick.bind(this)}
          imageData={this.state.images}
          showableTags={this.state.tags}
          showableTags2={this.state.tagDictionary}
          database={database}
          workingDir={workingDirectory}
        />
        <TagPicker
          tags={this.state.tags}
          tagsDictionary={this.state.tagDictionary}
          row={this.state.currRow}
        />
      </div>
    );
  }
}
export default App;
