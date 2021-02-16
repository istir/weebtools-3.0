import React from 'react';
import SimpleBarReact from 'simplebar-react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { useTable } from 'react-table';
import fs from 'fs';
import { clipboard } from 'electron';
import ModalOwn from './Modal';

const { remote } = require('electron');

const { Menu, MenuItem } = remote;
const { BrowserWindow } = require('electron').remote;
const { shell } = require('electron');

function Table(props: any) {
  const [show, setShow] = React.useState(false);
  const [render, setRender] = React.useState(false);
  const [context, setContext] = React.useState(null);
  const [workingElement, setWorkingElement] = React.useState(null);
  const [title, setTitle] = React.useState('');
  const [message, setMessage] = React.useState('');
  const [buttons, setButtons] = React.useState(['OK']);
  const context1 = null;
  // console.log(show);
  // const [selected, setSelected] = useState(null);
  // initialize columns, probably could just not add it later on
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

  async function contextShow(value: {
    context?: (value: boolean) => void;
    title?: string;
    message: string;
    buttons: string[];
  }) {
    if (!value.context) {
      setContext(null);
    } else {
      setContext(value.context);
    }
    if (!value.title) {
      setTitle('');
    } else {
      setTitle(value.title);
    }
    setButtons(value.buttons);
    setMessage(value.message);

    setShow(true);
  }
  function contextClose() {
    setShow(false);
    // setTimeout
  }
  function response(value: boolean) {
    // I ran out of ideas, don't cringe if you're reading this code, I couldn't pass a function to state and that state to <Modal/> as a prop so it is what it is
    if (value) {
      switch (context) {
        case 'delete':
          contextDelete();
          break;

        default:
          break;
      }
    }
  }
  function contextDelete() {
    fs.unlink(props.imageData[workingElement].pathName, (err) => {
      if (err) throw err;
    });
    props.delete(
      props.imageData[workingElement].fileName,
      props.imageData[workingElement].folder
    );
    props.imageData.splice(workingElement, 1);
  }

  function contextMenu(row) {
    handleRowClick(row);
    const menu = new Menu();
    menu.append(
      new MenuItem({
        label: 'Show in Explorer',
        click: () => {
          // clipboard.writeImage(images[row.id].pathName);
          shell.showItemInFolder(props.imageData[row.id].pathName);
        },
      })
    );
    menu.append(
      new MenuItem({
        label: 'Copy image',
        click: () => {
          clipboard.writeImage(props.imageData[row.id].pathName);
        },
      })
    );
    menu.append(
      new MenuItem({
        label: 'Show all Tags',
        click: () => {
          contextShow({
            title: 'Tags',
            message: props.imageData[row.id].tags.join(', '),
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
          setWorkingElement(row.id);
          contextShow({
            title: 'Delete?',
            context: 'delete',
            message: `This action will delete \n ${
              props.imageData[row.id].fileName
            }`,
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
          if (props.imageData[row.id].url != '') {
            // console.log(props.imageData[row.id].url);
            shell.openExternal(props.imageData[row.id].url);
          }
          // clipboard.writeImage(images[row.id].pathName);
          // shell.showItemInFolder(images[row.id].pathName);
        },
      })
    );
    menu.popup();
  }

  // initialize data from imageData from props
  function normalizeName(arr: string[]) {
    const tempArr = [];
    for (let i = 0; i < props.showableTags2.length; i++) {
      const element = props.showableTags2[i];
      if (element.shown) {
        if (arr.includes(element.fromSite)) {
          if (!tempArr.includes(element.returnValue)) {
            tempArr.push(element.returnValue);
          }
          // console.log(element.returnValue);
        }
      }
      // console.log(element);
    }
    0 ? tempArr.push('other') : '';
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
            <LazyLoadImage
              className="tableImg notSelectable"
              src={item.pathName}
            />
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
  // row onclick -> prop callback

  function handleRowClick(e: any) {
    for (
      let i = 0;
      i < document.getElementsByClassName('tableRow').length;
      i++
    ) {
      const element = document.getElementsByClassName('tableRow')[i];
      element.className = 'tableRow cursorPointer';
    }
    // console.log(e);
    document
      .getElementsByClassName('tableRow')
      [e.id].classList.toggle('selectedRow');
    props.handleClick(e);
  }

  // initialize table and render it
  const { getTableProps, getTableBodyProps, rows, prepareRow } = useTable({
    columns,
    data,
  });

  // render() {
  // const Row = ({ index, style }) => (
  //   <div className={index % 2 ? 'ListItemOdd' : 'ListItemEven'} style={style}>
  //     {/* Row {index} */}
  //     {/* <img src={props.imageData[index].pathName} /> */}
  //     <LazyLoadImage
  //       className="tableImg"
  //       src={props.imageData[index].pathName}
  //     />
  //   </div>
  // );
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
    <div className="divbeforetabletemp ">
      <SimpleBarReact
        style={{
          top: 30,
          maxHeight: '100vh',
        }}
      >
        {/* <List
            height={500}
            itemCount={props.imageData.length}
            itemSize={200}
            width={900}
          >
            {Row}
          </List> */}

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
                // console.log(row);
                return (
                  // Apply the row props
                  <tr
                    key={row.id}
                    className="tableRow  cursorPointer"
                    onClick={() => {
                      handleRowClick(row);
                    }}
                    onDoubleClick={() => {
                      // TODO
                      // currImage = props.imageData[row.id].pathName;
                      props.doubleClick(true);
                      // <FullscreenImage image={images[row.id].pathName} />;
                    }}
                    onContextMenu={() => {
                      contextMenu(row);
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
            {props.loadMore}
          </tbody>
        </table>

        {/* {[...Array(50)].map((x, i) => (
            <p key={i} className="odd">
              Some content
            </p>
          ))} */}
      </SimpleBarReact>

      <ModalOwn
        show={show}
        close={contextClose}
        context={response}
        buttons={buttons}
        title={title}
        message={message}
      />
    </div>
  );
}

export default Table;
