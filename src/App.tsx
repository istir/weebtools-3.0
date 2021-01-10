import React from 'react';
import GetTags from './GetTags';
import { useTable } from 'react-table';
import Database from './Database';
import Config from './config.json';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { Checkbox } from '@material-ui/core';
import SimpleBarReact from 'simplebar-react';
import { refresh } from 'electron-debug';
// import 'simplebar/dist/simplebar.min.css';
const fs = require('fs');
const { ipcRenderer } = window.require('electron');
const path = require('path');
// var gettags;

var images: Object[] = [];
var database: any;
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
        //     Config.workingPath,
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
      // console.log(arg); // prints "pong"

      var getTags = await new GetTags();

      // tables.push(<TableRow pathName="TEST" />);
      ////////////////////////////////////////////////////////////////////////////////
      await getTags.init(database, arg);
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
        var filePath = path.join(
          Config.workingPath,
          item.folder,
          item.fileName
        );
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
      Config.workingPath,
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

function Table(props: any) {
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
  function normalizeName(arr: string[]) {
    // console.log(arr);
    // console.log(props.showableTags);
    let tempArr = [];
    for (let i = 0; i < props.showableTags.length; i++) {
      // console.log(props.showableTags[i]);
      for (let j = 0; j < props.showableTags[i][1].length; j++) {
        // console.log(props.showableTags[i][1][j]);
        if (arr.includes(props.showableTags[i][1][j])) {
          tempArr.push(props.showableTags[i][1][j]);

          // tempArr.push(arr[arr.indexOf(props.showableTags[i][1][j])]);
        }
      }
    }
    tempArr.length == 0 ? tempArr.push('other') : '';
    return tempArr.join(', ');
  }

  const data = React.useMemo(
    () =>
      props.imageData.map(
        (item: {
          pathName: any;
          fileName: React.ReactNode;
          tags: string[];
          folder: React.ReactNode;
        }) => ({
          col1: (
            <LazyLoadImage className="tableImg" src={item.pathName} />
            // <div>
            //   <LazyLoadImage className="tableImgBg" src={item.pathName} />
            // </div>
          ),
          col2: (
            <div className="tableCell">
              {' '}
              <div className="fileName">{item.fileName}</div>
              {'  '}
              <div className="tagName">{normalizeName(item.tags)}</div>
              <div className="folderName">{item.folder}</div>
            </div>
          ),
        })
      ),
    undefined
  );
  //row onclick -> prop callback
  function handleRowClick(e: any) {
    for (
      let i = 0;
      i < document.getElementsByClassName('tableRow').length;
      i++
    ) {
      const element = document.getElementsByClassName('tableRow')[i];
      element.className = 'tableRow';
    }
    // console.log(e);
    document
      .getElementsByClassName('tableRow')
      [e.id].classList.toggle('selectedRow');
    props.handleClick(e);
  }

  //initialize table and render it
  const { getTableProps, getTableBodyProps, rows, prepareRow } = useTable({
    columns,
    data,
  });

  // render() {

  return (
    // apply the table props
    // <div
    //   style={{
    //     height: document.getElementsByTagName('body')[0].clientHeight,
    //     overflowY: 'auto',
    //   }}
    //   className="divbeforetabletemp"
    // >
    /* <SimpleBar forceVisible="y" autoHide={false} style={{ maxHeight: 300 }}>
        {[...Array(50)].map((x, i) => (
          <p key={i} className="odd">
            Some content
          </p>
        ))} */
    <div className="divbeforetabletemp">
      <SimpleBarReact
        style={{
          top: 30,
          maxHeight: '100vh',
        }}
      >
        <table className="globalTable" {...getTableProps()}>
          <tbody {...getTableBodyProps()}>
            {rows.map(
              (row: {
                getRowProps: () => JSX.IntrinsicAttributes &
                  React.ClassAttributes<HTMLTableRowElement> &
                  React.HTMLAttributes<HTMLTableRowElement>;
                cells: any[];
              }) => {
                // Prepare the row for display
                prepareRow(row);
                return (
                  // Apply the row props
                  <tr
                    className="tableRow"
                    onClick={() => {
                      handleRowClick(row);
                    }}
                    {...row.getRowProps()}
                  >
                    {
                      // Loop over the rows cells
                      row.cells.map(
                        (cell: {
                          getCellProps: () => JSX.IntrinsicAttributes &
                            React.ClassAttributes<HTMLTableDataCellElement> &
                            React.TdHTMLAttributes<HTMLTableDataCellElement>;
                          render: (arg0: string) => React.ReactNode;
                        }) => {
                          // Apply the cell props
                          return (
                            <td {...cell.getCellProps()}>
                              {
                                // Render the cell contents
                                cell.render('Cell')
                              }
                            </td>
                          );
                        }
                      )
                    }
                  </tr>
                );
              }
            )}
          </tbody>
        </table>
        {/* {[...Array(50)].map((x, i) => (
          <p key={i} className="odd">
            Some content
          </p>
        ))} */}
      </SimpleBarReact>
    </div>
  );
}
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
      // refreshItem(this.props.row.fileName, this.props.row.folder).then(
      //   (ful) => {
      //     console.log(ful);
      //   }
      // );
      // this.setState({
      //   checked: ,
      // });
      // console.log(this.state.checked);
      // console.log(this.props.row.fileName);
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
      <div>
        <Checkbox
          // onChange={this.changed.bind(this)}
          onChange={this.props.change}
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

    var tempTags = [];
    for (let i = 0; i < Config.tags.length; i++) {
      if (Config.tags[i].visible) {
        let test = [Config.tags[i].toReturn];
        let test1 = [];
        for (let j = 0; j < Config.tags[i].fromSite.length; j++) {
          test1.push(Config.tags[i].fromSite[j]);
        }
        test.push(test1);
        tempTags.push(test);
      }
    }
    this.state = {
      tags: tempTags,
      currRow: null,
      images: images,
      imgCount: 0,
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
      // if (this.state.images.length != this.state.imgCount) {
      //this fucks everything up :(
      this.forceUpdate();
      this.setState({ imgCount: this.state.images.length });
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
    console.log(this.state.currRow);
    console.log(e.id);
    // console.log(this.state.images);
    // refreshItem(
    //   this.state.images[e.id].fileName,
    //   this.state.images[e.id].folder
    // ).then((ful) => {
    //   console.log(ful);
    // });
    this.setState({ currRow: this.state.images[e.id] });
  }
  render() {
    return (
      <div>
        <Table
          handleClick={this.handleTableClick.bind(this)}
          imageData={this.state.images}
          showableTags={this.state.tags}
        />

        <TagPicker tags={this.state.tags} row={this.state.currRow} />
      </div>
    );
  }
}
export default App;
