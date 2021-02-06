import React from 'react';
import Table from './Table';
const fs = require('fs');
const path = require('path');
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
    // this.state = { pageList: null };
    var pageList = [];
    var maxPages = this.props.maxPages;
    if (maxPages > 10) {
      maxPages = 10;
      for (let i = 0; i < maxPages; i++) {
        pageList.push(<div>{i}</div>);
      }
      pageList.push(<div>{this.props.maxPages}</div>);
    } else {
      for (let i = 0; i < maxPages; i++) {
        pageList.push(<div>{i}</div>);
      }
    }

    this.state = { pageList: pageList };
  }
  componentDidMount() {}
  render() {
    return this.state.pageList !== null && this.props.maxPages !== null ? (
      <div>{this.state.pageList}</div>
    ) : (
      ''
    );
  }
}

class Pages extends React.Component<Props, State> {
  constructor(props) {
    super(props);
    // this.props.database.execute(query) <= zmiana strony
    // this.props.database.execute("SELECT COUNT(*) from files") = maxPages = this/itemsPerPage

    this.state = {
      itemsPerPage: 100,
      maxPages: null,
      currentPage: 0,
      pageItems: null,
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
  componentDidMount() {
    this.timerID = setInterval(() => {
      if (typeof this.props.database !== 'undefined') {
        clearInterval(this.timerID);
        this.getRowCount();
        this.loadItems();
        // console.log(this.state.maxPages);
        console.log(this.props.imageData);
      }
    }, 10);
  }
  async loadItems() {
    var offset = Math.round(this.state.itemsPerPage * this.state.currentPage);
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
    await rows.map((item: any) => {
      // console.log(item);
      var filePath = path.join(
        this.props.workingDir,
        item.folder,
        item.fileName
      );
      fs.access(filePath, fs.constants.R_OK, (err: Error) => {
        if (!err) {
          this.state.pageItems.push({
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
  }

  render() {
    return this.state.pageItems === null ? (
      ''
    ) : (
      <div>
        <Pagination
          maxPages={this.state.maxPages}
          currentPage={this.state.currentPage}
        />
        <Table
          handleClick={this.props.handleClick}
          // imageData={this.props.imageData}
          imageData={this.state.pageItems}
          showableTags={this.props.showableTags}
          showableTags2={this.props.showableTags2}
        />
      </div>
    );
  }
}

export default Pages;
