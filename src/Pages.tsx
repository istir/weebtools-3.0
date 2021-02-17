// eslint-disable-next-line no-use-before-define
import React from 'react';
import settings from 'electron-settings';
import { Grid } from '@material-ui/core';
import Table from './Table';
import GetTags from './GetTags';
import GridImageComponent from './GridImageComponent';

const fs = require('fs');
const path = require('path');

const { ipcRenderer } = window.require('electron');

interface PaginationProps {
  loadItems: (value) => void;
}

function Pagination(props: PaginationProps) {
  return (
    // <tr className="loadMore">
    //   <td>

    <button
      className="loadMore"
      tabIndex={-1}
      type="button"
      onClick={props.loadItems}
    >
      Load More
    </button>
    //   </td>
    // </tr>
  );
}

interface Props {
  handleClick: (id: number, imageData) => void;
  imageData: any;
  showableTags: any;
  showableTags2: any;
  database: any;
  workingDir: string;
  setProgressBarPercentage: (value: number) => void;
  searchFor: string;
  refresh: () => void;
  doubleClick: (value: boolean) => void;
}
interface State {
  itemsPerPage: number;
  currentRowID: number;
  display: string;
  currentLength: number;
  // maxPages: number;
  // currentPage: number;
  pageItems: [
    {
      pathName: string;
      fileName: string;
      tags: string[];
      folder: string;
      url: string;
    }
  ];
}

class Pages extends React.Component<Props, State> {
  timerID: NodeJS.Timeout;

  handleTableClickBound: (e) => void;

  loadItemsBound: (search: any) => Promise<void>;

  deleteItemFromDatabaseBound: (fileName: string, folderName: string) => void;

  constructor(props) {
    super(props);
    this.deleteItemFromDatabaseBound = this.deleteItemFromDatabase.bind(this);
    this.handleTableClickBound = this.handleTableClick.bind(this);
    this.loadItemsBound = this.loadItems.bind(this);

    this.grids = [];

    const itemsToLoad: number = settings
      .getSync('commonSettings')
      .find((el) => el.key === 'itemsToLoad').value;

    this.state = {
      itemsPerPage: itemsToLoad,
      // maxPages: null,
      // currentPage: 0,
      display: 'grid',
      pageItems: null,
      currentRowID: null,
      currentLength: 0,
    };

    // for (let i = 0; i < 10; i += 1) {
    //   this.grids.push(<GridImageComponent items={this.state.pageItems} />);
    // }
  }

  componentDidMount() {
    ipcRenderer.on('clipboard', async (_event: any, arg: string) => {
      // console.log(arg);

      const getTags = await new GetTags();

      // tables.push(<TableRow pathName="TEST" />);
      /// /////////////////////////////////////////////////////////////////////////////
      await getTags.init(
        this.props.database,
        arg,
        this.isDownloadedCallback.bind(this),
        this.props.setProgressBarPercentage
      );
    });

    this.timerID = setInterval(() => {
      // console.log(this.timerID);
      // console.log(this.props.database);
      if (this.props.database !== null) {
        clearInterval(this.timerID);
        // this.getRowCount();
        this.loadItems(false);
        // console.log(this.state.maxPages);
        // console.log(this.props.imageData);
        // this.props.refresh();
        this.forceUpdate();
      }
    }, 10);
  }

  componentDidUpdate(prevState) {
    if (prevState.searchFor !== this.props.searchFor) {
      // this.state.pageItems=

      this.setState({ pageItems: [] });
      this.loadItems(true);
    }
    // console.log(prevState.searchFor);
    // console.log(this.props.searchFor);
    // this.loadItems();
  }

  handleTableClick(id: number) {
    // this.setState({ currentRowID: e.id });
    // this.props.handleClick(e.id, this.state.pageItems[e.id]);
    // this.forceUpdate();
    this.setState({ currentRowID: id });
    this.props.handleClick(id, this.state.pageItems[id]);
    // this.forceUpdate();
  }

  isDownloadedCallback(done, filePath, name, tags, folder, url) {
    if (done) {
      // console.log(this.state.pageItems);

      const items = this.state.pageItems;
      var indexOf=items.findIndex(index=>index.pathName===filePath)
      if (indexOf!==-1) {
        this.deleteItemFromDatabase("","",true,indexOf)
      }
      // console.log(items.indexOf({
      //   pathName: filePath
      // }))
      items.unshift({
        pathName: filePath,
        fileName: name,
        tags,
        folder,
        url,
      });
      // console.log(items);

      this.setState({
        pageItems: items,
      });

      if (this.state.currentRowID != null) {
        this.props.handleClick(
          this.state.currentRowID,
          this.state.pageItems[this.state.currentRowID]
        );
      }
      this.props.refresh();
    }
  }

  handleSearchQuery() {
    let toTrim = this.props.searchFor;
    let name = '';
    let folder = '';
    let tags = '';
    let requireName = false;
    let requireFolder = false;
    let requireTag = false;
    let tagsArr: string[] = [];
    // name:p0 folder: other tags:"keqing",stockings
    toTrim = toTrim.toLowerCase();

    const namePos = toTrim.indexOf('name:');
    const folderPos = toTrim.indexOf('folder:');
    const tagsPos = toTrim.indexOf('tags:');

    const arr = [namePos, folderPos, tagsPos];

    arr.sort((a, b) => {
      return a - b;
    });
    const arrNew = [
      toTrim.substring(arr[0], arr[1]),
      toTrim.substring(arr[1], arr[2]),
      toTrim.substring(arr[2]),
    ];
    for (let j = 0; j < arrNew.length; j += 1) {
      const value = arrNew[j].trim();

      if (value.includes('name:')) {
        name = value.replace('name:', '').trim();
        requireName = true;
      }
      if (value.includes('folder:')) {
        folder = value.replace('folder:', '').trim();
        requireFolder = true;
      }
      if (value.includes('tags:')) {
        tags = value.replace('tags:', '').trim();
        tagsArr = tags.split(',');
        // for (let i = 0; i < tagsArr.length; i+=1) {
        //   tagsArr[i] = tagsArr[i].trim();
        // }
        // tags = tagsArr.join(', ');
        requireTag = true;
      }
    }

    if (!name.includes('"')) {
      name = `"%${name}%"`;
      // requireName = true;
    }
    if (!folder.includes('"')) {
      folder = `"%${folder}%"`;
    }
    if (!tags.includes('"')) {
      tags = `"%${tags}%"`;
    }
    if (name === '"%%"' && folder === '"%%"' && tags === '"%%"') {
      name = `"%${toTrim}%"`;
      folder = `"%${toTrim}%"`;
      tags = `"%${toTrim}%"`;
    }
    // console.log('name ' + name, 'folder ' + folder, 'tags ' + tags);
    let query = 'SELECT * FROM files ';
    let i = 0;
    if (requireTag) {
      query += i > 0 ? 'and ' : 'WHERE ';
      const andOr = ' and ';
      for (let k = 0; k < tagsArr.length; k += 1) {
        // console.log(tagsArr[k].trim());
        // if(tagsArr[k])
        let currValue = tagsArr[k].trim();
        // console.log(currValue);
        // tags:r18,stockings
        if (currValue[0] === '"' && currValue[currValue.length - 1] === '"') {
          currValue = currValue.replaceAll('"', '');
          // andOr = ' and ';
        } else {
          // andOr = ' or ';
        }
        currValue = `"%${currValue}%"`;
        query += `${i > 0 ? andOr : ''}Tags ${
          currValue[2] === '!' ? 'NOT LIKE ' : 'LIKE '
        }${currValue.replace('!', '')}`;
        i += 1;
      }
      // query += 'Tags LIKE ' + tags;
    }
    if (requireName) {
      query += i > 0 ? ' and ' : 'WHERE ';
      query += `fileName LIKE ${name}`;
      i += 1;
    }
    if (requireFolder) {
      query += i > 0 ? ' and ' : 'WHERE ';
      query += `folder LIKE ${folder}`;
      i += 1;
    }
    if (i === 0) {
      query += `WHERE Tags LIKE "%${toTrim}%" or fileName LIKE "%${toTrim}%" or folder LIKE "%${toTrim}%" `;
    }
    // console.log(query);
    return query;
  }

  async loadItems(shouldSearch) {
    if (this.props.database !== null) {
      // let offset =
      //   this.state.pageItems != null ? this.state.pageItems.length : 0;
      let offset = this.state.currentLength;
      // this.state.currentLength != null ? this.state.currentLength : 0;
      if (shouldSearch === true) {
        // this.setState({ pageItems: null });
        this.setState({
          pageItems: [],
        });
        offset = 0;
      }

      // var offset = Math.round(this.state.itemsPerPage * this.state.currentPage);
      // console.log(this.state.pageItems);
      // var offset = 0;
      // if (this.state.pageItems != null) {
      //   if (this.state.pageItems.length > 0) {
      //     offset = this.state.pageItems.length;
      //   }
      // }

      const limit = parseInt(this.state.itemsPerPage);
      if (this.state.pageItems === null) {
        this.state.pageItems = [];
      }
      this.setState((state) => ({
        currentLength: state.currentLength + limit,
      }));
      // console.log(offset);

      // async function loadLastQueries(database: any, limit: number) {
      // this.handleSearchQuery();
      // return 0;
      const query = `${this.handleSearchQuery()} ORDER BY ID DESC LIMIT ${offset},${limit}`;
      // console.log(query);
      // return 0;
      // var query =
      //   'SELECT * FROM files WHERE Tags LIKE "%' +
      //   this.props.searchFor +
      //   '%" or fileName LIKE "%' +
      //   this.props.searchFor +
      //   '%" or folder LIKE "%' +
      //   this.props.searchFor +
      //   '%" ORDER BY ID DESC LIMIT ' +
      //   offset +
      //   ',' +
      //   limit;

      const [rows] = await this.props.database.execute(query);
      // for (let i = 0; i < rows.length; i+=1) {
      //   filesToLoad.push(rows[i].folder);
      // }
      // console.log(rows);
      await rows.map((item: any, index) => {
        // console.log(item);
        const filePath = path.join(
          this.props.workingDir,
          item.folder,
          item.fileName
        );
        fs.access(filePath, fs.constants.R_OK, (err: Error) => {
          if (!err) {
            const items = this.state.pageItems;
            // if (items[this.state.pageItems.length - 1]?.pathName !== filePath) {
              var indexOf=items.findIndex(index=>index.pathName===filePath)
              if (indexOf!==-1) {
                this.deleteItemFromDatabase("","",true,indexOf)
              }
              // var items.indexOf()
            items.push({
              pathName: filePath,
              fileName: item.fileName,
              tags: item.Tags.split(', '),
              folder: item.folder,
              url: item.url,
            });
            // }

            this.setState({ pageItems: items });
            // filesToLoad.push(filePath);
          }
        });
        // return true;
      });
      // console.log(filesToLoad);
      // return rows;
      // }
      this.props.refresh();
    }
  }

  deleteItemFromDatabase(
    fileName: string,
    folderName: string,
    shouldKeepInDatabase:boolean,
    indexToDeleteFromState?: number,
  ) {
    //  async function deleteRecord() {
      if (!shouldKeepInDatabase) {
        const queryDeleteRow = `DELETE FROM files WHERE fileName = "${fileName}" AND folder ="${folderName}"`;
        this.props.database.execute(queryDeleteRow);
      }

    // console.log(indexToDeleteFromState);
    if (indexToDeleteFromState !== undefined) {
      // console.log('XD');
      const test = this.state.pageItems;
      test.splice(indexToDeleteFromState, 1);
      this.setState({ pageItems: test });
      // this.setState((state) => ({
      //   currentLength: state.currentLength + 1,
      // }));
    }
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
    return (
      <GridImageComponent
        display={this.props.display}
        items={this.state.pageItems}
        showableTags={this.props.showableTags2}
        handleClick={this.handleTableClickBound}
        doubleClick={this.props.doubleClick}
        delete={this.deleteItemFromDatabaseBound}
        loadMore={<Pagination loadItems={this.loadItemsBound} />}
      />
    );

    // return this.state.pageItems === null ? (
    //   ''
    // ) : (
    //   <div>
    //     {/* <Pagination
    //       maxPages={this.state.maxPages}
    //       currentPage={this.state.currentPage}
    //     /> */}
    //     <Table
    //       handleClick={this.handleTableClickBound}
    //       // imageData={this.props.imageData}
    //       imageData={this.state.pageItems}
    //       showableTags={this.props.showableTags}
    //       showableTags2={this.props.showableTags2}
    //       doubleClick={this.props.doubleClick}
    //       delete={this.deleteItemFromDatabaseBound}
    //       loadMore={<Pagination loadItems={this.loadItemsBound} />}
    //     >
    //       {/* <Pagination /> */}
    //     </Table>
    //   </div>
    // );
  }
}

export default Pages;
