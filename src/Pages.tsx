import React from 'react';
import Table from './Table';
import GetTags from './GetTags';
import settings from 'electron-settings';

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
  handleClick(event: any): Function;
  imageData: any;
  showableTags: any;
  showableTags2: any;
  database: any;
  workingDir: string;
}

interface PaginationProps {
  currentPage: number;
  maxPages: number;
}
class Pagination extends React.Component<PaginationProps> {
  constructor(props) {
    super(props);
  }
  componentDidMount() {}
  render() {
    return (
      <tr className="loadMore">
        <td>
          <button onClick={this.props.loadItems}>Load More</button>
        </td>
      </tr>
    );
  }
}

class Pages extends React.Component<Props, State> {
  constructor(props) {
    super(props);
    // this.props.database.execute(query) <= zmiana strony
    // this.props.database.execute("SELECT COUNT(*) from files") = maxPages = this/itemsPerPage
    console.log(settings.getSync('commonSettings'));
    var itemsToLoad = settings
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
      var query = 'SELECT COUNT(*) AS solution from files';
      var [rows] = await this.props.database.execute(query);
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
      let items = this.state.pageItems;
      items.unshift({
        pathName: path,
        fileName: name,
        tags: tags,
        folder: folder,
        url: url,
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

  componentDidMount() {
    ipcRenderer.on('clipboard', async (_event: any, arg: string) => {
      // console.log(arg);

      var getTags = await new GetTags();

      // tables.push(<TableRow pathName="TEST" />);
      ////////////////////////////////////////////////////////////////////////////////
      await getTags.init(
        this.props.database,
        arg,
        this.isDownloadedCallback.bind(this)
      );
    });

    this.timerID = setInterval(() => {
      console.log(this.props.database);
      if (this.props.database !== null) {
        clearInterval(this.timerID);
        this.getRowCount();
        this.loadItems();
        // console.log(this.state.maxPages);
        console.log(this.props.imageData);
        // this.props.refresh();
        this.forceUpdate();
      }
    }, 10);
  }
  async loadItems() {
    if (this.props.database !== null) {
      // var offset = Math.round(this.state.itemsPerPage * this.state.currentPage);
      var offset =
        this.state.pageItems != null ? this.state.pageItems.length : 0;
      var limit = this.state.itemsPerPage;
      if (this.state.pageItems === null) {
        this.state.pageItems = [];
      }
      console.log(offset);
      // async function loadLastQueries(database: any, limit: number) {
      var query =
        'SELECT * FROM files ORDER BY ID DESC LIMIT ' + offset + ',' + limit;

      var [rows] = await this.props.database.execute(query);
      // for (let i = 0; i < rows.length; i++) {
      //   filesToLoad.push(rows[i].folder);
      // }
      // console.log(rows);
      await rows.map((item: any) => {
        // console.log(item);
        var filePath = path.join(
          this.props.workingDir,
          item.folder,
          item.fileName
        );
        fs.access(filePath, fs.constants.R_OK, (err: Error) => {
          if (!err) {
            let items = this.state.pageItems;

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
