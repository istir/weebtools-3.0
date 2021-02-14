// eslint-disable-next-line no-use-before-define
import React from 'react';
// import Config from './config.json';
import settings from 'electron-settings';
import { Checkbox } from '@material-ui/core';
import ConfigButton from './ConfigDiv';
import SearchButton from './Search';
import Database from './Database';
import Pages from './Pages';
import FullscreenImage from './FullscreenImage';
import ProgressBar from './ProgressBar';

interface IcommonSettings {
  key: string;
  name: string;
  value: string;
}

let workingDirectory = settings.getSync('commonSettings');

workingDirectory = workingDirectory.find((el) => el.key === 'workingPath')
  .value;

interface TagProps {
  key: string;
  returnValue: string;
  fromSite: string;
  folder: string;
  shown: boolean;
  checkFolder: boolean;
}

interface CheckBoxProps {
  change: any;
  value: string;
  // text: string;
  shouldCheck: boolean;
}

function CheckboxComponent(props: CheckBoxProps) {
  return (
    <div>
      <Checkbox
        onChange={props.change}
        key="input"
        value={props.value}
        checked={props.shouldCheck}
      />
      <div className="checkboxText">{props.value}</div>
    </div>
  );
}
interface IShortTagObj {
  fromSite: string;
  returnValue: string;
  shown: boolean;
}
interface TagPickerState {
  checked: string[];
  row: any;
}
interface TagPickerProps {
  row: any;
  tags: string[];
  tagsDictionary: IShortTagObj[];
  refresh: () => void;
  database: import('mysql2/promise').Connection;
}
class TagPicker extends React.Component<TagPickerProps, TagPickerState> {
  checkboxes: JSX.Element[];

  handleChangingBound: (e) => void;

  constructor(props: TagPickerProps) {
    super(props);

    this.state = { checked: [''], row: this.props.row };
    // initialize list of <Checkbox/>
    this.checkboxes = [];
    this.handleChangingBound = this.handleChanging.bind(this);
  }

  componentDidUpdate() {
    // doing some weird, but ultimately it lets me change state by toggling things and other good things too
    if (this.state.row !== this.props.row) {
      this.setState({ row: this.props.row });
      this.setState({ checked: this.props.row.tags });
    }
  }

  handleChanging(e: { target: { value: any; checked: any } }) {
    // console.log(e);
    if (this.props.row != null) {
      const currTag = [];
      for (let i = 0; i < this.props.tagsDictionary.length; i += 1) {
        const element = this.props.tagsDictionary[i];
        if (element.returnValue === e.target.value && element.shown) {
          if (!currTag.includes(element.fromSite)) {
            currTag.push(element.fromSite);
          }
        }
      }

      const foundTag = this.props.tagsDictionary.find(
        (el) => el.returnValue === e.target.value
      );
      if (!e.target.checked) {
        // TODO: make it so currTag is an array and newState removes that array from itself
        for (let i = 0; i < currTag.length; i += 1) {
          if (this.state.checked.includes(currTag[i])) {
            const index = this.state.checked.indexOf(currTag[i]);

            // this.setState((state, props) => {
            //   const newState = state.checked;
            //   newState.splice(index, 1);
            //   console.log(newState);
            //   return {
            //     checked: newState,
            //   };
            // });

            const newState = this.state.checked;
            newState.splice(index, 1);
            // console.log(newState);
            this.setState({ checked: newState });
          }
          // here is almost the same but if item isn't togged I add it to "checked" state
        }
      }
      if (e.target.checked) {
        if (!this.state.checked.includes(foundTag.fromSite)) {
          // this.setState(function (prevState) {
          //   const newState = prevState.checked;
          //   newState.push(foundTag.fromSite);
          //   console.log(newState);
          //   return { checked: newState };
          // });
          const newState = this.state.checked;

          newState.push(foundTag.fromSite);
          // newState.push(e.target.value);
          this.setState({ checked: newState });
        }
      }
      this.modifyItem(
        this.props.row.fileName,
        this.props.row.folder,
        this.props.row.folder,
        this.state.checked
      );
    }
    // modifyItem()
    // console.log(this.state.checked)
    this.props.refresh();
  }

  async refreshItem(fileName: string, folder: string) {
    const query = `SELECT * FROM files WHERE fileName="${fileName}" AND folder="${folder}"`;
    const [rows] = await this.props.database.query(query);
    return rows[0].Tags.split(', ');
  }

  async modifyItem(
    oldName: string,
    oldFolder: string,
    newFolder: string,
    newTags: string[]
  ) {
    function normalizeTags(tagArr: string[]) {
      return tagArr.join(', ');
    }
    const query = `UPDATE files SET folder="${newFolder}",Tags="${normalizeTags(
      newTags
    )}" where fileName="${oldName}" AND folder="${oldFolder}"`;
    await this.props.database.query(query);
  }

  deleteItemFromDatabase(fileName: string, folderName: string) {
    //  async function deleteRecord() {
    const queryDeleteRow = `DELETE FROM files WHERE fileName = "${fileName}" AND folder ="${folderName}"`;
    this.props.database.execute(queryDeleteRow);
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
    // fill <Checkbox/> list

    this.checkboxes = [];
    for (let i = 0; i < this.props.tags.length; i += 1) {
      const value = this.props.tags[i];
      let check = false;
      if (this.state.checked.length > 0) {
        for (let j = 0; j < value[1].length; j += 1) {
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
          // text={value[1][0]}
          change={this.handleChangingBound}
        />
      );
    }

    return <div className="listItems">{this.checkboxes}</div>;
  }
}
// var tagPicker = <TagPicker />;

interface IAppProps {}
interface IAppState {
  tags: string[];
  currRow: {
    fileName: string;
    pathName: string;
    tags: string[];
    folder: string;
    url: string;
  };
  tagDictionary: IShortTagObj[];
  database: import('mysql2/promise').Connection;
  showFullscreen: boolean;
  searchFor: string;
  progressBarPercentage: number;
  progressShouldMinimize: boolean;
}

class App extends React.Component<IAppProps, IAppState> {
  refreshTagsBound: () => void;

  setSearchBound: (value: string) => void;

  clickFullscreenImageBound: (value: boolean) => void;

  handleTableClickBound: (id: number, imageData) => void;

  refreshBound: () => void;

  setProgressBarPercentageBound: (value: number) => void;

  settingsTags;

  timerID: NodeJS.Timeout;

  constructor(props) {
    super(props);
    this.settingsTags = settings.getSync('tags');
    this.state = {
      tags: this.getTags(),
      currRow: null,
      tagDictionary: this.getTagDictionary(),
      database: null,
      showFullscreen: false,
      searchFor: '',
      progressBarPercentage: 0,
      progressShouldMinimize: false,
    };

    this.refreshTagsBound = this.refreshTags.bind(this);
    this.setSearchBound = this.setSearch.bind(this);
    this.clickFullscreenImageBound = this.clickFullscreenImage.bind(this);
    this.handleTableClickBound = this.handleTableClick.bind(this);
    this.refreshBound = this.refresh.bind(this);
    this.setProgressBarPercentageBound = this.setProgressBarPercentage.bind(
      this
    );
  }

  componentDidMount() {
    Database()
      .then(
        (ful: any) => {
          // eslint-disable-next-line no-console
          // console.log('connected');
          // console.log(ful);
          this.setState({ database: ful });
          return ful;
        },
        (rej: any) => {
          // eslint-disable-next-line no-console
          console.log('error');
          return rej;
        }
      )
      .catch((error) => {
        // eslint-disable-next-line no-console
        console.error(error);
      });
  }

  getTagDictionary() {
    const tagObj: IShortTagObj[] = [];
    for (let i = 0; i < this.settingsTags.length; i += 1) {
      for (let j = 0; j < this.settingsTags[i].fromSite.length; j += 1) {
        tagObj.push({
          fromSite: this.settingsTags[i].fromSite[j],
          returnValue: this.settingsTags[i].toReturn,
          shown: this.settingsTags[i].visible,
        });
        // console.log(stt[i].fromSite[j] + ' ' + stt[i].toReturn);
      }
    }
    return tagObj;
  }

  getTags() {
    const tempTags = [];
    for (let i = 0; i < this.settingsTags.length; i += 1) {
      if (this.settingsTags[i].visible) {
        const test = [this.settingsTags[i].toReturn];
        const test1 = [];
        for (let j = 0; j < this.settingsTags[i].fromSite.length; j += 1) {
          test1.push(this.settingsTags[i].fromSite[j]);
        }
        test.push(test1);
        tempTags.push(test);
      }
    }
    return tempTags;
  }

  setSearch(value: string) {
    this.setState({ searchFor: value });
    // console.log(this.state.searchFor);
  }

  setProgressBarPercentage(value: number) {
    let currentValue: number = value;
    if (currentValue > 1) {
      currentValue = 1;
    } else if (currentValue < 0) {
      currentValue = 0;
    }
    const newValue = Math.round(currentValue * 100);
    if (this.state.progressShouldMinimize) {
      this.setState({ progressShouldMinimize: false });
    }

    if (
      Math.abs(newValue - this.state.progressBarPercentage) > 10 ||
      (newValue < 1 && newValue !== this.state.progressBarPercentage) ||
      newValue === 100
    ) {
      // console.log(newValue);
      if (this.timerID) {
        clearInterval(this.timerID);
      }
      this.setState({ progressBarPercentage: newValue });
    }
    if (newValue === 100) {
      this.timerID = setTimeout(() => {
        // this.setState({ currWidth: 0 });
        this.setState({ progressShouldMinimize: true });
      }, 5000);
    }
    // console.log();
    // this.state.progressBarPercentage
    // console.log(this.state.progressBarPercentage);
  }

  clickFullscreenImage(value) {
    this.setState({ showFullscreen: value });
  }

  refresh() {
    this.forceUpdate();
  }

  handleTableClick(id: number, imageData: any) {
    // this.setState({ currRowID: id });
    this.setState({ currRow: imageData });
  }

  refreshTags() {
    this.forceUpdate();

    this.setState({ tags: this.getTags() });
    this.setState({ tagDictionary: this.getTagDictionary() });
  }

  render() {
    return (
      <div>
        {/* <div className="icon">
          {' '} */}
        <ConfigButton
          settings={this.settingsTags}
          forceUpdate={this.refreshTagsBound}
        />
        <SearchButton
          currentSearch={this.state.searchFor}
          setSearch={this.setSearchBound}
        />
        {/* </div> */}
        <ProgressBar
          shouldStop={this.state.progressShouldMinimize}
          percentage={this.state.progressBarPercentage}
        />

        <FullscreenImage
          show={this.state.showFullscreen}
          shouldShow={this.clickFullscreenImageBound}
          image={this.state.currRow?.pathName}
        />

        <Pages
          handleClick={this.handleTableClickBound}
          doubleClick={this.clickFullscreenImageBound}
          showableTags={this.state.tags}
          showableTags2={this.state.tagDictionary}
          database={this.state.database}
          workingDir={workingDirectory}
          searchFor={this.state.searchFor}
          refresh={this.refreshBound}
          setProgressBarPercentage={this.setProgressBarPercentageBound}
        />
        <TagPicker
          tags={this.state.tags}
          tagsDictionary={this.state.tagDictionary}
          row={this.state.currRow}
          database={this.state.database}
          refresh={this.refreshBound}
        />
      </div>
    );
  }
}
export default App;
