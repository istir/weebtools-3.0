import React from 'react';
import SimpleBarReact from 'simplebar-react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { useTable } from 'react-table';
const { remote } = require('electron');
const { Menu, MenuItem } = remote;
const { BrowserWindow } = require('electron').remote;
const { shell } = require('electron');
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
    let tempArr = [];
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
    // console.log(arr);
    // console.log(arr);
    // console.log(props.showableTags);
    // let tempArr = [];
    // for (let i = 0; i < props.showableTags.length; i++) {
    //   // console.log(props.showableTags[i]);
    //   for (let j = 0; j < props.showableTags[i][1].length; j++) {
    //     // console.log(props.showableTags[i][1][j]);
    //     if (arr.includes(props.showableTags[i][1][j])) {
    //       tempArr.push(props.showableTags[i][1][j]);
    //       // tempArr.push(arr[arr.indexOf(props.showableTags[i][1][j])]);
    //     }
    //   }
    // }
    // tempArr.length == 0 ? tempArr.push('other') : '';
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
    <div className="divbeforetabletemp">
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
                return (
                  // Apply the row props
                  <tr
                    className="tableRow"
                    onClick={() => {
                      handleRowClick(row);
                    }}
                    onDoubleClick={() => {
                      //TODO
                      // currImage = props.imageData[row.id].pathName;
                      props.doubleClick(true);
                      // <FullscreenImage image={images[row.id].pathName} />;
                    }}
                    onContextMenu={() => {
                      handleRowClick(row);
                      const menu = new Menu();
                      menu.append(
                        new MenuItem({
                          label: 'Show in Explorer',
                          click: () => {
                            // clipboard.writeImage(images[row.id].pathName);
                            shell.showItemInFolder(
                              props.imageData[row.id].pathName
                            );
                          },
                        })
                      );
                      menu.append(
                        new MenuItem({
                          label: 'Copy image',
                          click: () => {
                            clipboard.writeImage(
                              props.imageData[row.id].pathName
                            );
                          },
                        })
                      );
                      menu.append(
                        new MenuItem({
                          label: 'Show all Tags',
                          click: () => {
                            // clipboard.writeImage(images[row.id].pathName);
                            // shell.showItemInFolder(images[row.id].pathName);
                          },
                        })
                      );
                      menu.append(
                        new MenuItem({
                          label: 'Delete',
                          click: () => {
                            // console.log(images);
                            // (async () => {
                            //   await trash('E:/test.txt');
                            // })();
                            return 0;
                            let response = dialog
                              .showMessageBox(
                                BrowserWindow.getFocusedWindow(),
                                {
                                  buttons: ['Yes', 'No'],
                                  message: 'Delete?',
                                  title: 'Are you sure?',
                                }
                              )
                              .then((result) => {
                                if (result.response === 0) {
                                  fs.unlink(
                                    props.imageData[row.id].pathName,
                                    (err) => {
                                      throw err;
                                    }
                                  );
                                  deleteItemFromDatabase(
                                    props.imageData[row.id].fileName,
                                    props.imageData[row.id].folder
                                  );
                                  props.imageData.splice(row.id, 1);
                                }
                              });
                            // if (response == 0) {
                            //   console.log('XD');
                            // }
                            // console.log(response);

                            // // fs.rm(images[row.id].pathName, (err) => {
                            // //   throw err;
                            // // });

                            // images.splice(row.id, 1);
                            // console.log(row);
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
    </div>
  );
}

export default Table;
