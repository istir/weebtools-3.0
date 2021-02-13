import React from 'react';
import settings from 'electron-settings';
import Table from './Table';
import GetTags from './GetTags';

const fs = require('fs');
const path = require('path');

const { ipcRenderer } = window.require('electron');

interface State {
  itemsPerPage: number;
  maxPages: number;
  currentPage: number;
  pageItems: Object[];
}
interface Props {
  handleClick: (event) => void;
  imageData: any;
  showableTags: any;
  showableTags2: any;
  database: any;
  workingDir: string;
}

interface PaginationProps {
  loadItems: (shouldSearch: boolean) => void;
}

const Pagination = function (props: PaginationProps) {
  return (
    <tr className="loadMore">
      <td>
        <button type="button" onClick={props.loadItems}>
          Load More
        </button>
      </td>
    </tr>
  );
};

class Pages extends React.Component<Props, State> {
  constructor(props) {
    super(props);
    // this.props.database.execute(query) <= zmiana strony
    // this.props.database.execute("SELECT COUNT(*) from files") = maxPages = this/itemsPerPage
    // console.log(settings.getSync('commonSettings'));
    const itemsToLoad = settings
      .getSync('commonSettings')
      .find((el) => el.key === 'itemsToLoad').value;

    this.state = {
      itemsPerPage: itemsToLoad,
      maxPages: null,
      currentPage: 0,
      pageItems: null,
      currentRowID: null,
    };
  }

  async getRowCount() {
    // console.log(this.props.database);
    try {
      const query = 'SELECT COUNT(*) AS solution from files';
      const [rows] = await this.props.database.execute(query);
      this.setState({
        maxPages: Math.ceil(rows[0].solution / this.state.itemsPerPage),
      });
    } catch (ex) {
      console.log(ex);
    }
  }

  isDownloadedCallback(done, path, name, tags, folder, url) {
    if (done) {
      console.log('...');
      // console.log(this.state.pageItems);
      const items = this.state.pageItems;
      items.unshift({
        pathName: path,
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

  handleTableClick(e) {
    this.setState({ currentRowID: e.id });
    this.props.handleClick(e.id, this.state.pageItems[e.id]);
    // this.forceUpdate();
  }

  componentDidUpdate(prevState, prevProps) {
    if (prevState.searchFor != this.props.searchFor) {
      // this.state.pageItems=
      this.setState({ pageItems: [{}] });
      this.loadItems(true);
    }
    // console.log(prevState.searchFor);
    // console.log(this.props.searchFor);
    // this.loadItems();
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
      // console.log(this.props.database);
      if (this.props.database !== null) {
        clearInterval(this.timerID);
        this.getRowCount();
        this.loadItems(false);
        // console.log(this.state.maxPages);
        // console.log(this.props.imageData);
        // this.props.refresh();
        this.forceUpdate();
      }
    }, 10);
  }

  handleSearchQuery() {
    let toTrim = this.props.searchFor;
    let name = '';
    let folder = '';
    let tags = '';
    let requireName = false;
    let requireFolder = false;
    let requireTag = false;

    // name:p0 folder: other tags:"keqing",stockings
    toTrim = toTrim.toLowerCase();

    const namePos = toTrim.indexOf('name:');
    const folderPos = toTrim.indexOf('folder:');
    const tagsPos = toTrim.indexOf('tags:');

    const arr = [namePos, folderPos, tagsPos];

    arr.sort(function (a, b) {
      return a - b;
    });
    const arrNew = [
      toTrim.substring(arr[0], arr[1]),
      toTrim.substring(arr[1], arr[2]),
      toTrim.substring(arr[2]),
    ];
    for (let j = 0; j < arrNew.length; j++) {
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
        var tagsArr = tags.split(',');
        // for (let i = 0; i < tagsArr.length; i++) {
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
    if (name == '"%%"' && folder == '"%%"' && tags == '"%%"') {
      name = `"%${toTrim}%"`;
      folder = `"%${toTrim}%"`;
      tags = `"%${toTrim}%"`;
    }
    // console.log('name ' + name, 'folder ' + folder, 'tags ' + tags);
    let query = 'SELECT * FROM files ';
    let i = 0;
    if (requireTag) {
      i > 0 ? (query += 'and ') : (query += 'WHERE ');
      const andOr = ' and ';
      for (let k = 0; k < tagsArr.length; k++) {
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
          currValue[2] == '!' ? 'NOT LIKE ' : 'LIKE '
        }${currValue.replace('!', '')}`;
        i++;
      }
      // query += 'Tags LIKE ' + tags;
    }
    if (requireName) {
      i > 0 ? (query += ' and ') : (query += 'WHERE ');
      query += `fileName LIKE ${name}`;
      i++;
    }
    if (requireFolder) {
      i > 0 ? (query += ' and ') : (query += 'WHERE ');
      query += `folder LIKE ${folder}`;
      i++;
    }
    if (i == 0) {
      query += `WHERE Tags LIKE "%${toTrim}%" or fileName LIKE "%${toTrim}%" or folder LIKE "%${toTrim}%" `;
    }
    // console.log(query);
    return query;
  }

  async loadItems(shouldSearch) {
    if (this.props.database !== null) {
      let offset =
        this.state.pageItems != null ? this.state.pageItems.length : 0;
      if (shouldSearch === true) {
        // this.setState({ pageItems: null });
        this.setState({ pageItems: [] });
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

      const limit = this.state.itemsPerPage;
      if (this.state.pageItems === null) {
        this.state.pageItems = [];
      }
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
      // for (let i = 0; i < rows.length; i++) {
      //   filesToLoad.push(rows[i].folder);
      // }
      // console.log(rows);
      await rows.map((item: any) => {
        // console.log(item);
        const filePath = path.join(
          this.props.workingDir,
          item.folder,
          item.fileName
        );
        fs.access(filePath, fs.constants.R_OK, (err: Error) => {
          if (!err) {
            const items = this.state.pageItems;

            items.push({
              pathName: filePath,
              fileName: item.fileName,
              tags: item.Tags.split(', '),
              folder: item.folder,
              url: item.url,
            });
            this.setState({ pageItems: items });
            // filesToLoad.push(filePath);
          }
        });
      });
      // console.log(filesToLoad);
      // return rows;
      // }
      this.props.refresh();
    }
  }

  render() {
    return this.state.pageItems === null ? (
      ''
    ) : (
      <div>
        {/* <Pagination
          maxPages={this.state.maxPages}
          currentPage={this.state.currentPage}
        /> */}
        <Table
          handleClick={this.handleTableClick.bind(this)}
          // imageData={this.props.imageData}
          imageData={this.state.pageItems}
          showableTags={this.props.showableTags}
          showableTags2={this.props.showableTags2}
          doubleClick={this.props.doubleClick}
          loadMore={<Pagination loadItems={this.loadItems.bind(this)} />}
        >
          {/* <Pagination /> */}
        </Table>
      </div>
    );
  }
}

export default Pages;
