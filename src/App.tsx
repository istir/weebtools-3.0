// eslint-disable-next-line no-use-before-define
import React from 'react';
// import Config from './config.json';
import settings from 'electron-settings';
import { Checkbox, Modal } from '@material-ui/core';
import { PRIORITY_HIGHEST } from 'constants';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBorderAll, faTh } from '@fortawesome/free-solid-svg-icons';
import { ConfigButton } from './ConfigDiv';
import SearchButton from './Search';
import Database from './Database';
import Pages from './Pages';
import FullscreenImage from './FullscreenImage';
import ProgressBar from './ProgressBar';
import RandomBackground from './RandomBackground';
import FirstLaunch from './FirstLaunch';
import { common } from '@material-ui/core/colors';
import { resolve } from 'path';
import { ipcRenderer } from 'electron';
import sendAsync from './DatabaseSQLite';
import FindTag from './FindTag';
import ImageViewer from './ImageViewer';

interface IcommonSettings {
  key: string;
  name: string;
  value: string;
}

let commonSettings;

let workingDirectory;

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
  function toggle() {
    props.change(props.value, props.shouldCheck);
  }
  return (
    <div
      onKeyPress={() => {}}
      role="button"
      // tabIndex={0}
      className="notSelectable cursorPointer tagPicker"
      style={{ width: 'fit-content' }}
      onClick={toggle}
      tabIndex={-1}
    >
      <Checkbox
        tabIndex={0}
        onKeyPress={() => {}}
        // onChange={props.change}
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
    this.handleChangingBound = this.handleChangingNew.bind(this);
  }

  componentDidUpdate() {
    // doing some weird, but ultimately it lets me change state by toggling things and other good things too
    if (this.props.row) {
      if (this.state.row !== this.props.row) {
        this.setState({ row: this.props.row });
        this.setState({ checked: this.props.row.tags });
      }
    }
  }

  handleChangingNew(tagToToggle: string, isChecked: boolean) {
    // console.log(e);
    if (this.props.row != null) {
      const currTag = [];
      for (let i = 0; i < this.props.tagsDictionary.length; i += 1) {
        const element = this.props.tagsDictionary[i];

        if (element.returnValue === tagToToggle && element.shown) {
          if (!currTag.includes(element.fromSite)) {
            currTag.push(element.fromSite);
          }
        }
      }

      const foundTag = this.props.tagsDictionary.find(
        (el) => el.returnValue === tagToToggle
      );
      if (isChecked) {
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
      if (!isChecked) {
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
    const rows = await sendAsync(query);
    // const [rows] = await this.props.database.query(query);
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
    await sendAsync(query);
    // await this.props.database.query(query);
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
          shouldCheck={check}
          value={value[0]}
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
  display: string;
  commonSettings: [
    {
      key: string;
      name: string;
      value: string | string[] | boolean;
      type: string;
      hidden: boolean;
    }
  ];
  tagsSettings: [
    {
      key: string;
      toReturn: string;
      fromSite: string[];
      folder: string;
      visible: boolean;
      checkFolder: boolean;
    }
  ];
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
    this.worked = true;

    this.state = {
      worked: false,
      tags: this.getTags(),
      currRow: null,
      tagDictionary: [{ fromSite: '', returnValue: '', shown: false }],
      database: null,
      showFullscreen: false,
      searchFor: '',
      progressBarPercentage: 0,
      progressShouldMinimize: false,
      display: 'grid',
      shouldUpdate: false,
      commonSettings: [],
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
    this.performStartup();
  }

  performStartup() {
    let worked = false;
    console.log('STARTUP');
    try {
      // if (settings.hasSync("commonSettings")) {
      commonSettings = settings.getSync('commonSettings');
      // }
      this.settingsTags = settings.getSync('tags');
      // console.log(this.settingsTags);
      this.setState({ commonSettings: settings.getSync('commonSettings') });
      this.setState({ tagsSettings: settings.getSync('tags') });
      workingDirectory = FindTag(commonSettings, 'key', 'workingPath', 'value');
      // workingDirectory = commonSettings.find((el) => el.key === 'workingPath')
      // .value;
      worked = true;
      //  this.worked=true;
      this.setState({ worked: true });
    } catch (err) {
      worked = false;
      this.setState({ worked: false });

      function formatCommon(
        key: string,
        name: string,
        value: string,
        isArray?,
        visible?
      ) {
        if (isArray) {
          const val = value.split(/[ ,]+/);
          return { key, name, value: val };
        }

        return { key, name, value };
      }
      // commonSettings = { commonSettings: [], tags: [] };
      commonSettings = [
        formatCommon('workingPath', 'Working Directory', ''),
        formatCommon('itemsToLoad', 'Items to load at once', '100'),
        formatCommon('useDanbooruAPI', 'Use Danbooru API', true),
        formatCommon('displayType', 'Display Type', 'grid'),
        formatCommon('randomBGUse', 'Use randomized background', false),
        formatCommon(
          'randomBGTags',
          'Random Background included tags',
          'wallpaper',
          true
        ),
        formatCommon(
          'randomBGNotTags',
          'Random Background disabled Tags',
          'r18',
          true
        ),
        formatCommon('randomBGFolder', 'Random Background Folder', ''),
        formatCommon(
          'randomBGColor',
          'Random Background Color',
          '167, 66, 104,0.5'
        ),
        // formatCommon('firstLaunch', 'First Launch Done', 'true'),
      ];
      settings.set(commonSettings);

      console.error(err);
    }
    if (worked) {
      this.setState({
        tags: this.getTags(),
        currRow: null,
        tagDictionary: this.getTagDictionary(),

        showFullscreen: false,
        searchFor: '',
        progressBarPercentage: 0,
        progressShouldMinimize: false,
        display: commonSettings.find((el) => el.key === 'displayType').value,
      });
    }
    const shouldUse = commonSettings.find((el) => el.key === 'randomBGUse')
      .value;
    // console.log(shouldUse1)
    // if (this.state.database === null) {
    //   Database()
    //     .then(
    //       (ful: any) => {
    //         // eslint-disable-next-line no-console
    //         // console.log('connected');
    //         // console.log(ful);
    //         this.setState({ database: ful });
    //         // const randomBG = new RandomBackground(
    //         //   this.state.database,
    //         //   workingDirectory as string,
    //         //   [],
    //         //   [],
    //         //   'abandon all hope ye who enter here'
    //         // );
    //         // eslint-disable-next-line promise/no-nesting
    //         this.getRandomBg(true);

    //         return ful;
    //       },
    //       (rej: any) => {
    //         // eslint-disable-next-line no-console
    //         console.log('error');
    //         return rej;
    //       }
    //     )
    //     .catch((error) => {
    //       // eslint-disable-next-line no-console
    //       console.error(error);
    //     });
    // } else
    if (shouldUse && document.body.classList.contains('moving')) {
      // console.log("OPCJA 1")
      // console.log("shouldUSE:",shouldUse1)
      this.getRandomBg(true);
    } else if (shouldUse && !document.body.classList.contains('moving')) {
      this.getRandomBg(false);
    } else if (!shouldUse) {
      // console.log("OPCJA 2")
      document.body.classList.add('moving');
      document.body.style.background = null;
      document.body.style.backgroundSize = null;
      document.body.style.backgroundPosition = null;
    }
    // } else if(document.body.classList.contains("moving")){
    //   // document.body.classList.remove('moving');

    //   this.getRandomBg()
    // } else {

    //   const shouldUse = commonSettings.find(
    //     (el) => el.key === 'randomBGUse'
    //   ).value;
    //   console.log(shouldUse)
    //   if (!shouldUse) {
    //     document.body.classList.add('moving');
    //     document.body.style.background = null;
    //     document.body.style.backgroundSize = null
    //     document.body.style.backgroundPosition = null;
    //   }

    // }
    this.setState({ shouldUpdate: true });
    // console.log(this.state.shouldUpdate)
  }
  getRandomBg(setRandom: boolean) {
    try {
      const tags = commonSettings.find((el) => el.key === 'randomBGTags').value;
      const NotTags = commonSettings.find((el) => el.key === 'randomBGNotTags')
        .value;
      const folder = commonSettings.find((el) => el.key === 'randomBGFolder')
        .value;
      const color = commonSettings.find((el) => el.key === 'randomBGColor')
        .value;
      const shouldUse = commonSettings.find((el) => el.key === 'randomBGUse')
        .value;

      if (shouldUse) {
        if (setRandom) {
          const randomBG = new RandomBackground();
          // eslint-disable-next-line promise/no-nesting

          randomBG
            .getCorrectQueries(
              this.state.database,
              workingDirectory as string,
              tags,
              NotTags,
              folder
            )
            .then(() => {
              // console.log("??????")
              const random = randomBG.getRandomBackground();
              if (random.length > 0) {
                document.body.classList.remove('moving');

                document.body.style.background = `linear-gradient( ${color}, ${color} ), ${random}`;
              }

              document.body.style.backgroundSize = 'cover';
              document.body.style.backgroundPosition = 'center';

              // console.log(document.body.style.backgroundColor);
              // document.body.style.boxShadow = `inset 0 0 100vw rgba(0,0,0,${
              //   dimming / 100
              // });`;

              return true;
            })

            .catch((error) => {
              throw error;
            });
        } else {
          document.body.classList.remove('moving');
          let oldImage = document.body.style.backgroundImage.substring(
            document.body.style.backgroundImage.indexOf('url')
          );
          document.body.style.background = `linear-gradient( ${color}, ${color} ), ${oldImage}`;
          document.body.style.backgroundSize = 'cover';
          document.body.style.backgroundPosition = 'center';
        }
      }
    } catch (err) {
      console.error(err);
    }
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
    let tempTags = [];
    if (this.settingsTags !== undefined) {
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
      // console.log(tempTags);
      return tempTags;
    } else {
      return [['', '']];
    }
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

  clickFullscreenImage(value: boolean) {
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
    // console.log("f5")
    this.performStartup();
    // this.performStartup().then((ful)=>{console.log(ful)},(rej)=>console.log(rej))
    this.forceUpdate();
    // this.setState({ tags: this.getTags() });
    // try {
    //   this.setState({ tagDictionary: this.getTagDictionary() });
    // } catch (error) {
    //   console.error(error)
    // }
  }
  setShouldUpdate() {
    this.setState({ shouldUpdate: false });
  }

  setTagsSettings(
    tags?: [
      {
        key: string;
        toReturn: string;
        fromSite: string[];
        folder: string;
        visible: boolean;
        checkFolder: boolean;
      }
    ],
    tag?: {
      key: string;
      toReturn: string;
      fromSite: string[];
      folder: string;
      visible: boolean;
      checkFolder: boolean;
    },
    oldKey?: string
  ) {
    if (tag) {
      this.setState(function (prevState) {
        let settings = prevState.tagsSettings;
        let tags = [];
        settings.map((val) => {
          if (val !== null) tags.push(val);
        });
        let index = tags.findIndex((el) => el.key === oldKey);
        settings[index] = tag;
        return {
          tagSettings: settings,
        };
      });
    } else if (tags) {
      this.setState({ tagsSettings: tags });
    }
  }

  removeTag(
    oldKey: string,
    index: {
      key: string;
      toReturn: string;
      fromSite: string[];
      folder: string;
      visible: boolean;
      checkFolder: boolean;
    }
  ) {
    this.setState(function (prevState) {
      let settings = prevState.tagsSettings;
      // console.log(prevState.tagsSettings)
      let tags = [];
      settings.map((val) => {
        if (val !== null) tags.push(val);
      });
      let index = tags.findIndex((el) => el.key === oldKey);
      console.log(oldKey, index);
      settings[index] = null;

      return {
        tagSettings: settings,
      };
    });

    // let obj = this.state.tagsSettings;
    // console.log("INDEX REM:",index)
    // console.log("LENGTH:",this.state.tagsSettings.length)
    // // obj.splice(index,1)
    // obj.splice(obj.indexOf(index),1)
    // this.setState({tagsSettings:obj})

    console.log('NEW TAGS');
    // console.table(obj)
    console.table(this.state.tagsSettings);
  }

  setCommonSettings(
    settings?: [
      {
        key: string;
        name: string;
        value: string | string[] | boolean;
        type: string;
        hidden: boolean;
      }
    ],
    setting?: {
      key: string;
      name: string;
      value: string | string[] | boolean;
      type: string;
      hidden: boolean;
    }
  ) {
    if (setting) {
      this.setState(function (prevState) {
        let settings = prevState.commonSettings;
        let index = prevState.commonSettings.findIndex(
          (el) => el.key === setting.key
        );

        settings[index] = setting;

        return {
          commonSettings: settings,
        };
      });
    } else if (settings) {
      this.setState({ commonSettings: settings });
    }
  }

  async send(sql) {
    let test = await sendAsync(sql);

    // let test = sendAsync(sql).then((result) => {return result});
    console.log(test);
  }

  render() {
    // return <button onClick={()=>this.send("SELECT * FROM files")}></button>
    try {
      // if (commonSettings.find((el) => el.key === 'firstLaunch').value!=="true") {
      if (!this.state.worked) {
        return <FirstLaunch forceUpdate={this.refreshTagsBound} />;
      }
    } catch (error) {
      return <FirstLaunch forceUpdate={this.refreshTagsBound} />;
    }
    // if (commonSettings.find((el) => el.key === 'firstLaunch').value!=="false") {
    //   return <FirstLaunch/>
    // }
    return (
      <div id="App">
        <button
          type="button"
          className="display"
          onClick={() => {
            this.setState((prevState) => ({
              display: prevState.display === 'grid' ? 'table' : 'grid',
            }));
            // TODO: change this hacky code
            const curr = this.state.display === 'grid' ? 'table' : 'grid';
            // commonSettings
            const tempSettings = commonSettings;
            tempSettings.find((value, index) => {
              if (value.key === 'displayType') {
                // console.log(index);
                value.value = curr;
                return index;
              }
            });
            // commonSettings.find((el, index) => el.key === 'displayType');
            settings.set('commonSettings', tempSettings);
          }}
        >
          <FontAwesomeIcon icon={faBorderAll} />
        </button>
        <ConfigButton
          commonSettings={this.state.commonSettings}
          tagsSettings={this.state.tagsSettings}
          setCommonSettings={this.setCommonSettings.bind(this)}
          setTagsSettings={this.setTagsSettings.bind(this)}
          settings={this.settingsTags}
          removeTag={this.removeTag.bind(this)}
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
        {/* <FullscreenImage
          show={this.state.showFullscreen}
          shouldShow={this.clickFullscreenImageBound}
          image={this.state.currRow?.pathName}
        /> */}
        <ImageViewer
          visible={this.state.showFullscreen}
          src={this.state.currRow?.pathName}
          setVisibility={this.clickFullscreenImageBound}
        />

        <Pages
          handleClick={this.handleTableClickBound}
          doubleClick={this.clickFullscreenImageBound}
          // showableTags={this.state.tags}
          showableTags2={this.state.tagDictionary}
          // database={this.state.database}
          workingDir={workingDirectory}
          shouldUpdate={this.state.shouldUpdate}
          setShouldUpdate={this.setShouldUpdate.bind(this)}
          // deleteFromDatabase={this.deleteite}
          searchFor={this.state.searchFor}
          refresh={this.refreshBound}
          setProgressBarPercentage={this.setProgressBarPercentageBound}
          display={this.state.display}
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
