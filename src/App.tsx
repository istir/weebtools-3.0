import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import icon from '../assets/icon.svg';
import GetTags from './GetTags';
import { useTable } from 'react-table';
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
var imageTags = [];

var images = [];
var database;
Database().then(
  (ful) => {
    console.log('Connected successfully');

    database = ful;
    loadLastQueries(database, 5).then(
      () => {
        // console.log(filesToLoad);
      },
      (err) => {
        console.log(err);
      }
    );
    // new LoadLocalFiles(database);
    ipcRenderer.on('clipboard', async (event, arg) => {
      // console.log(arg); // prints "pong"

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
          // tables.push(
          //   <TableRow
          //     pathName={path}
          //     fileName={getTags.fileName}
          //     tags={getTags.tags}
          //     folder={getTags.folderName}
          //   />
          // );

          // const data =[{pathName:"asd",tags:["asd","zxc"]}]
          images.unshift({
            pathName: path,
            fileName: getTags.fileName,
            tags: getTags.tags,
            folder: getTags.folderName,
          });
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
            });
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

function Table(props) {
  // const [selected, setSelected] = useState(null);
  //initialize columns, probably could just not add it later on
  const columns = React.useMemo(
    () => [
      {
        Header: 'Images',
        accessor: 'col1', // accessor is the "key" in the data
      },
      {
        Header: 'Other Data',
        accessor: 'col2',
      },
    ],
    []
  );
  //initialize data from imageData from props
  const data = React.useMemo(() =>
    props.imageData.map((item) => ({
      col1: <LazyLoadImage className="tableImg" src={item.pathName} />,
      col2: item.fileName,
    }))
  );
  //row onclick -> prop callback
  function handleRowClick(e) {
    props.handleClick(e);
  }

  //initialize table and render it
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = useTable({ columns, data });

  // render() {

  return (
    // apply the table props
    <div>
      <table {...getTableProps()}>
        {/* <thead>
          {
            // Loop over the header rows
            headerGroups.map((headerGroup) => (
              // Apply the header row props
              <tr {...headerGroup.getHeaderGroupProps()}>
                {
                  // Loop over the headers in each row
                  headerGroup.headers.map((column) => (
                    // Apply the header cell props
                    <th {...column.getHeaderProps()}>
                      {
                        // Render the header
                        column.render("Header")
                      }
                    </th>
                  ))
                }
              </tr>
            ))
          }
        </thead> */}
        {/* Apply the table body props */}
        <tbody {...getTableBodyProps()}>
          {
            // Loop over the table rows
            rows.map((row) => {
              // Prepare the row for display
              prepareRow(row);
              return (
                // Apply the row props
                <tr
                  onClick={() => {
                    handleRowClick(row);
                  }}
                  {...row.getRowProps()}
                >
                  {
                    // Loop over the rows cells
                    row.cells.map((cell) => {
                      // Apply the cell props
                      return (
                        <td {...cell.getCellProps()}>
                          {
                            // Render the cell contents
                            cell.render('Cell')
                          }
                        </td>
                      );
                    })
                  }
                </tr>
              );
            })
          }
        </tbody>
      </table>
    </div>
  );
}

// class Table extends React.Component {
//   constructor(props) {
//     super(props);
//     this.timer;
//     this.tableLocal = [];
//     this.tableLength = 0;
//   }
//   componentDidMount() {
//     this.timer = setInterval(() => {
//       // console.log(tables.length);
//       // console.log(this.tableLength);
//       if (tablesLoaded.length > this.tableLength) {
//         this.tableLocal.push(tablesLoaded);
//         this.tableLength = tablesLoaded.length;
//         this.forceUpdate();
//       }
//       if (tablesLoaded.length + tables.length > this.tableLength) {
//         this.tableLocal.unshift(tables);
//         // this.tableLength = tablesLoaded.length + tables.length;
//         tables = [];
//         this.forceUpdate();
//       }
//     }, 10);
//   }
//   componentWillUnmount() {
//     clearInterval(this.timer);
//     // console.log('unmount');
//   }

//   componentDidUpdate() {
//     // console.log('updated');
//   }

//   render() {
//     return (
//       <div>
//         <table className="globalTable">{this.tableLocal}</table>
//       </div>
//     );
//   }
// }

class TagPicker extends React.Component {
  constructor(props) {
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
  handleChanging(e) {
    //WELL WELL WELL
    //this weird syntax is because <input> gives weird checked boolean (basically NOT)
    //so !e.target.checked is then the target IS currently checked
    //then I just set "checked" state to "checked" - currently toggled item
    // console.log(this.props.row.tags);
    // console.log(this.state.checked);
    // console.log(this.props.tags);
    var currTag = [''];
    for (let i = 0; i < this.props.tags.length; i++) {
      if (this.props.tags[i][0] == e.target.value) {
        // console.log("yeep");
        // console.log(this.props.tags[i]);
        for (let j = 0; j < this.props.tags[i].length; j++) {
          // console.log(this.state.checked);
          // console.log(this.props.tags[i][j]);
          for (let k = 0; k < this.props.tags[i][j].length; k++) {
            // console.log(this.props.tags[i][j][k]);
            if (this.state.checked.includes(this.props.tags[i][j][k])) {
              currTag.push(this.props.tags[i][j][k]);
            }
          }
          // if (this.state.checked.includes(this.props.tags[i][j])) {
          //   // console.log(this.props.tags[i][j]);
          // }
        }
      }
    }
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
    //   if (this.state.checked.includes(currTag)) {
    //     let index = this.state.checked.indexOf(currTag);
    //     let newState = this.state.checked;
    //     newState.splice(index, 1);
    //     // console.log(newState);
    //     this.setState({ checked: newState });
    //   }
    //   //here is almost the same but if item isn't togged I add it to "checked" state
    // } else
    if (e.target.checked) {
      if (!this.state.checked.includes(e.target.value)) {
        let newState = this.state.checked;
        newState.push(e.target.value);
        this.setState({ checked: newState });
      }
    }
    modifyItem(
      this.props.row.fileName,
      this.props.row.folder,
      this.props.row.folder,
      this.state.checked
    );
    console.log(this.props.row.fileName);
    // modifyItem()
    // console.log(this.state.checked)
  }

  render() {
    //fill <Checkbox/> list
    // this.checkboxes = this.props.tags.map((value) => (
    //   <Checkbox
    //     key={value}
    //     shouldCheck={
    //       this.state.checked.length > 0
    //         ? this.state.checked.includes(value)
    //         : false
    //     }
    //     value={value}
    //     change={this.handleChanging.bind(this)}
    //   />
    // ));
    this.checkboxes = [];
    for (let i = 0; i < this.props.tags.length; i++) {
      let value = this.props.tags[i];
      var check = false;
      if (this.state.checked.length > 0) {
        for (let j = 0; j < value[1].length; j++) {
          // console.log(value[0] + " '" + value[1][j] + "'");
          if (this.state.checked.includes(value[1][j])) {
            check = true;
            break;
          }
        }
      }
      this.checkboxes.push(
        <Checkbox
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
    // this.checkboxes = this.props.tags.map((value) =>(
    //   // {{if (this.state.checked.length>0) {
    //   //   for (let i = 0; i < value[1].length; i++) {
    //   //     console.log(value[1][i])
    //   //   }
    //   // }}}
    //   // ()=>{
    //   //   console.log(value[1][1])
    //   // }

    //     <Checkbox
    //       key={value[1]}
    //       shouldCheck={
    //         this.state.checked.length > 0
    //           ? this.state.checked.includes(value[1][0])
    //           : false
    //       }
    //       value={value[0]}
    //       text={value[1][0]}
    //       change={this.handleChanging.bind(this)}
    //     />
    //   )
    // );
    return <div className="listItems">{this.checkboxes}</div>;
  }
}
// var tagPicker = <TagPicker />;
class Checkbox extends React.Component {
  constructor(props) {
    super(props);
    // this.state = { checked: false, manual: false };
    // // if (this.props.test != null) {
    // //   let temp = this.props.test.includes(this.props.value);
    // //   this.setState({ checked: temp });
    // // }
    // this.setState({ manual: !this.props.initial });
    // this.setState({ checked: this.props.shouldCheck });
  }
  /**
  componentDidMount() {
    // console.log("mount");
    // this.setState({ checked: this.props.shouldCheck });
  }

  componentDidUpdate() {}

  changed(e) {
    // console.log(this.state.checked);
    // this.setState({ checked: !this.state.checked });
    // if (this.props.item != null && this.state.manual) {
    //   // console.log();
    //   if (this.state.checked != this.props.shouldCheck) {
    //     // this.props.change(
    //     //   this.props.item.pathName,
    //     //   this.state.checked,
    //     //   this.props.value
    //     // );
    //     console.log("aa");
    //   }
    // }
    // console.log(e);
    // console.log(this.props.value);
    // console.log(this.state.checked);
    // console.log(e.target.checked);
    // if (!e.target.checked) {
    // this.setState({ checked: true });
    // console.log(this.state.checked);
    // console.log(e.target.checked);
    // }
  }
  
  */
  // click() {
  //   if (this.state.checked != this.props.shouldCheck) {
  //     console.log("zx");
  //   }
  // }
  render() {
    // console.log(this.props.test);
    return (
      <div>
        <input
          // onChange={this.changed.bind(this)}
          onChange={this.props.change}
          // onClick={this.ch()}
          key="input"
          type="checkbox"
          value={this.props.value}
          checked={this.props.shouldCheck}
        ></input>
        <div>{this.props.value}</div>
      </div>
    );
  }
}

class App extends React.Component {
  constructor(props) {
    super(props);

    var tempTags = [];
    for (let i = 0; i < Config.tags.length; i++) {
      let test = [Config.tags[i].toReturn];
      let test1 = [];
      for (let j = 0; j < Config.tags[i].fromSite.length; j++) {
        test1.push(Config.tags[i].fromSite[j]);
      }
      test.push(test1);
      tempTags.push(test);
    }
    this.state = {
      tags: tempTags,
      currRow: null,
      images: images,
    };
    // this.state = {
    //   images: simulateImageData(),
    //   tags: [''],
    //   currRow: null,
    // };
  }
  componentDidMount() {
    //probably need to change? but maybe not, not sure how it will work when finished
    this.timerID = setInterval(() => {
      // if (this.state.images.length != images.length) {
      //   this.setState({ images: images });
      //TODO: but fix this..., maybe componentshouldupdate?
      this.forceUpdate();
      // }
      // console.log(this.state.images.length);
      // console.log('upd');
    }, 500);
  }
  componentDidUpdate() {
    // console.log(this.state.images);
  }
  handleTableClick(e) {
    this.setState({ currRow: this.state.images[e.id] });
  }
  render() {
    return (
      <div>
        <Table
          handleClick={this.handleTableClick.bind(this)}
          imageData={this.state.images}
        />
        <TagPicker tags={this.state.tags} row={this.state.currRow} />
      </div>
    );
  }
}
export default App;
