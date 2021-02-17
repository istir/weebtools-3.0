/* eslint-disable react/prefer-stateless-function */
// eslint-disable-next-line no-use-before-define
import { clipboard, shell } from 'electron';
import fileUrl from 'file-url';
import React from 'react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import SimpleBarReact from 'simplebar-react';
import fs from 'fs';
import ModalOwn from './Modal';

const { remote } = require('electron');

const { Menu, MenuItem } = remote;
interface IelementJSON {
  pathName: string;
  fileName: string;
  tags: string[];
  folder: string;
  url: string;
}
interface IshowableTag {
  fromSite: string;
  returnValue: string;
  shown: boolean;
}
interface Props {
  items;
  showableTags: IshowableTag[];
  handleClick: (id: number) => void;
  doubleClick: (value: boolean) => void;
  delete: (fileName: string, folderName: string,shouldKeepInDatabase:boolean, indexToDeleteFromState?: number) => void;
}

interface State {
  currentItems: JSX.Element[];
  selected: number | null;
  context: (value: boolean) => void;
  title: string;
  message: string;
  buttons: string[];
  show: boolean;
  workingElement: number | null;
  displayType: string;
}
class GridImageComponent extends React.Component<Props, State> {
  handleRowClickBound: (e) => void;

  allRows: React.RefObject<HTMLDivElement>;

  contextMenuBound: (id: number) => void;

  contextCloseBound: () => void;

  constructor(props) {
    super(props);

    this.state = {
      currentItems: [],
      selected: null,
      context: null,
      title: '',
      message: '',
      buttons: ['OK'],
      show: false,
      workingElement: null,
      displayType: 'grid',
    };
    this.allRows = React.createRef();
    this.handleRowClickBound = this.handleRowClick.bind(this);
    this.contextMenuBound = this.contextMenu.bind(this);
    this.contextCloseBound = this.contextClose.bind(this);
  }

  componentDidUpdate(prevProps, prevState) {
    const items = [];
    if (prevProps !== this.props) {
      // console.log(this.state.currentItems)
      if (this.state.selected != null) {
        this.handleClass(this.state.selected);
      }
      this.props.items?.map((el: IelementJSON, index: number) => {
        items.push(
          this.addItem(el.pathName, el.fileName, el.tags, el.folder, index)
        );
        return true;
      });
      this.setState({ currentItems: items });
      // console.log(this.props.items);
    }
  }

  contextShow(value: {
    context?: (value: boolean) => void;
    title?: string;
    message: string;
    buttons: string[];
  }) {
    if (!value.context) {
      // setContext(null);
      this.setState({ context: null });
    } else {
      this.setState({ context: value.context });
    }
    if (!value.title) {
      this.setState({ title: '' });
    } else {
      this.setState({ title: value.title });
      // setTitle(value.title);
    }
    this.setState({ buttons: value.buttons });
    this.setState({ message: value.message });

    this.setState({ show: true });
  }

  contextClose() {
    this.setState({ show: false });
    // setShow(false);
    // setTimeout
  }

  contextDelete(value: boolean) {
    if (value) {
      fs.unlink(this.props.items[this.state.workingElement].pathName, (err) => {
        if (err) throw err;
      });
      this.props.delete(
        this.props.items[this.state.workingElement].fileName,
        this.props.items[this.state.workingElement].folder,
        false,
        this.state.workingElement
      );
      // this.props.items.splice(this.state.workingElement, 1);
      const test = this.state.currentItems;
      test.splice(this.state.workingElement, 1);
      this.setState({ currentItems: test });
    }
    this.forceUpdate();
  }

  contextMenu(id: number) {
    this.handleRowClick(id);
    const menu = new Menu();
    menu.append(
      new MenuItem({
        label: 'Show in Explorer',
        click: () => {
          // clipboard.writeImage(images[row.id].pathName);
          shell.showItemInFolder(this.props.items[id].pathName);
        },
      })
    );
    menu.append(
      new MenuItem({
        label: 'Copy image',
        click: () => {
          clipboard.writeImage(this.props.items[id].pathName);
        },
      })
    );
    menu.append(
      new MenuItem({
        label: 'Show all Tags',
        click: () => {
          this.contextShow({
            title: 'Tags',
            message: this.props.items[id].tags.join(', '),
            buttons: ['OK'],
          });
          // setShow(true);
          // setContext(null);
          // response = callback()?
          // clipboard.writeImage(images[row.id].pathName);
          // shell.showItemInFolder(images[row.id].pathName);
        },
      })
    );
    menu.append(
      new MenuItem({
        label: 'Delete',
        click: () => {
          // setWorkingElement(id);
          this.setState({ workingElement: id });
          this.contextShow({
            title: 'Delete?',
            context: this.contextDelete.bind(this),
            message: `This action will delete \n ${this.props.items[id].fileName}`,
            buttons: ['Delete', 'Cancel'],
          });

          // console.log(images);
          // (async () => {
          //   await trash('E:/test.txt');
          // })();
        },
      })
    );
    menu.append(
      new MenuItem({
        label: 'Open site',
        click: () => {
          if (this.props.items[id].url !== '') {
            // console.log(props.imageData[row.id].url);
            shell.openExternal(this.props.items[id].url);
          }
          // clipboard.writeImage(images[row.id].pathName);
          // shell.showItemInFolder(images[row.id].pathName);
        },
      })
    );
    menu.popup();
  }

  addItem(pathname, name, tags, folder, id, url?) {
    for (let i = 0; i < this.state.currentItems.length; i+=1) {
      if(this.state.currentItems[i].key===pathname) {
        // console.log(this.state.currentItems[i].key,pathname)
        // this.props.delete("","",true,i)
      }
    }
    
    const item = (
      <div
        onDoubleClick={() => {
          this.props.doubleClick(true);
        }}
        onContextMenu={() => {
          this.contextMenuBound(id);
        }}
        role="button"
        tabIndex={0}
        onKeyDown={() => {
          this.handleRowClickBound(id);
        }}
        onClick={() => {
          this.handleRowClickBound(id);
        }}
        key={pathname}
        className="gridImg element notSelectable cursorPointer"
      >
        <LazyLoadImage className="gridImg tableImg" src={fileUrl(pathname)} />
        <div className="gridImg description">
          <div className="gridImg text fileName">{name}</div>
          <div className="gridImg text tagName">{this.normalizeName(tags)}</div>
          <div className="gridImg text folderName">{folder}</div>
        </div>
      </div>
    );
    return item;
  }

  normalizeName(arr: string[]) {
    const tempArr = [];
    for (let i = 0; i < this.props.showableTags.length; i += 1) {
      const element = this.props.showableTags[i];
      if (element.shown) {
        if (arr.includes(element.fromSite)) {
          if (!tempArr.includes(element.returnValue)) {
            tempArr.push(element.returnValue);
          }
        }
      }
    }
    0 ? tempArr.push('other') : '';
    return tempArr.join(', ');
  }

  handleClass(id: number) {
    
    // if (this.state.currentItems[id] !== undefined) {
    //   console.log(this.state.currentItems[id])
    //   for (let i = 0; i < this.state.currentItems.length; i += 1) {
    //     // this.state.currentItems[i].classList.remove('selectedRow');
    //     this.state.currentItems[i].className="aaa"
    //   }
    //   this.state.currentItems[id].classList.add('selectedRow');
    // }
    
    /**OLD CODE */
    if (this.allRows.current.children[id] !== undefined) {
      for (let i = 0; i < this.allRows.current.children.length; i += 1) {
        this.allRows.current.children[i].classList.remove('selectedRow');
      }
      this.allRows.current.children[id].classList.add('selectedRow');
    } 
  }

  handleRowClick(id: number) {
    // console.log(this.ref.current);
    this.handleClass(id);
    this.setState({ selected: id });
    this.props.handleClick(id);
    // for (
    //   let i = 0;
    //   i < document.getElementsByClassName('tableRow').length;
    //   i++
    // ) {
    //   const element = document.getElementsByClassName('tableRow')[i];
    //   element.className = 'tableRow cursorPointer';
    // }
    // // console.log(e);
    // document
    //   .getElementsByClassName('tableRow')
    //   [e.id].classList.toggle('selectedRow');
    // props.handleClick(e);
  }

  render() {
    return (
      <div>
        <SimpleBarReact
          style={{
            width: 'calc(100% - 180px)',
            top: 30,
            maxHeight: 'calc(100vh - 30px)',
          }}
        >
          <div
            ref={this.allRows}
            className={`gridImg parent ${this.props.display}`}
          >
            {this.state.currentItems}
          </div>
          {this.props.loadMore}
        </SimpleBarReact>
        <ModalOwn
          show={this.state.show}
          close={this.contextCloseBound}
          context={this.state.context}
          buttons={this.state.buttons}
          title={this.state.title}
          message={this.state.message}
        />
      </div>
    );
  }
}
export default GridImageComponent;
