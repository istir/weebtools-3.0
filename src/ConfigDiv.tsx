import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog, faTimes } from '@fortawesome/free-solid-svg-icons';
import settings from 'electron-settings';
// import Config from './config.json';
import { Checkbox } from '@material-ui/core';
import SimpleBarReact from 'simplebar-react';
import { Console } from 'console';
import { CSSTransition } from 'react-transition-group';
import { common } from '@material-ui/core/colors';
import Popup from 'reactjs-popup';
settings.configure({ prettify: true });
interface ConfigPaneState {
  listObjects: any;
  changedListObject: any;
  workingPathState: string;
}
interface ConfigPaneProps {
  // shown: boolean;
  setVisibility(isVisible: boolean): void;
}
interface ConfigToSave {
  key: string;
  toReturn: string;
  fromSite: string[];
  folder: string;
  visible: boolean;
  checkFolder: boolean;
}
interface ConfigToSaveList extends Array<ConfigToSave> {}
class ConfigPane extends React.Component<ConfigPaneProps, ConfigPaneState> {
  constructor(props) {
    super(props);
    this.state = {
      listObjects: null,
      changedListObject: null,
      workingPathState: '',
      commonSettingItems: null,
    };

    // this.setState({settings.})

    // this.TEST = '';
    // this workingPath = commonKey.find((el) => el.key === 'workingPath');
  }

  componentDidMount() {
    if (settings.hasSync('tags')) {
      let obj = settings.getSync('tags').map((value) => (
        // <SettingsItem name={value.toReturn} value={value.fromSite} />
        <Tag
          keyProp={value.key}
          toReturn={value.toReturn}
          fromSite={value.fromSite}
          folder={value.folder}
          visible={value.visible}
          checkFolder={value.checkFolder}
          // checkedChanged={this.checkedChanged.bind(this)}
          // textChanged={this.textChanged.bind(this)}
          itemChanged={this.itemChanged.bind(this)}
        />
      ));
      // var something = [];
      var changedTags: ConfigToSaveList = [];
      var commonSettings = [];
      // something.push({ key: 'workingPath', workingPath: Config.workingPath });
      // changedObj.push({ workingPath: Config.workingPath });
      // var commonSettings = [];
      // for (let i = 0; i < Object.keys(Config).length - 1; i++) {
      //   // const element = Config[i];
      //   let obj = {
      //     key: 'workingPath',
      //     value: Config.workingPath,
      //   };
      //   // console.log(Config[i]);
      //   commonSettings.push(obj);
      // }

      if (settings.hasSync('commonSettings')) {
        var commonKey = settings.getSync('commonSettings');

        var objCommon = commonKey.map((value) => (
          <SettingsItem
            name={value.name}
            key={value.key}
            keyProp={value.key}
            // value={this.state.workingPathState}
            value={value.value}
            itemChanged={this.itemChanged.bind(this)}
          />
        ));

        // if (settings.hasSync('commonSettings.workingPath')) {
        // } else {
        //   throw 'no workingPath';
        // }
        // this.setState({
        //   workingPath: commonKey.find((el) => el.key === 'workingPath').value,
        // });

        // var workingPath = commonKey.find((el) => el.key === 'workingPath');
        // console.log(workingPath);
        // this.TEST = workingPath.value;
        // console.log(this.state.workingPathState);
        // console.log(thi);
        try {
          // var commonSettings = [
          //   { key: 'workingPath', value: this.state.workingPathState },
          // ];

          for (let i = 0; i < settings.getSync('commonSettings').length; i++) {
            var value = settings.getSync('commonSettings')[i];
            let obj: ConfigToSave = {
              key: value.key,
              name: value.name,
              value: value.value,
            };
            commonSettings.push(obj);
          }

          for (let i = 0; i < settings.getSync('tags').length; i++) {
            var value = settings.getSync('tags')[i];
            let obj: ConfigToSave = {
              key: value.key,
              toReturn: value.toReturn,
              fromSite: value.fromSite,
              folder: value.folder,
              visible: value.visible,
              checkFolder: value.checkFolder,
            };
            changedTags.push(obj);
          }
          var something = { commonSettings: commonSettings, tags: changedTags };
          // something.push({ tags: changedObj });
          // console.log(something);
          // let changedObj = Config.tags.map((value) => {
          //   {
          //     key: value.toReturn;
          //     toReturn: value.toReturn;
          //     fromSite: value.fromSite;
          //     folder: value.folder;
          //     visible: value.visible;
          //     checkFolder: value.checkFolder;
          //   }
          // });
          // this.setState({ workingPathState: workingPath.value });
          // console.log(this.state.workingPathState);
          this.setState({ changedListObject: something });
          this.setState({ commonSettingItems: objCommon });
          // console.log(this.state.changedListObject);
          // let obj = Object.keys(Config).map((value) => (
          //   // console.log(value);
          //   <li>{value}</li>
          // ));

          this.setState({ listObjects: obj });

          // console.log(workingPath);
        } catch (err) {
          throw err;
        }
      } else {
        throw 'no commonSettings';
      }

      // if (!settings.hasSync('workingPath')) {
      //   throw 'XD';
      // }
    } else {
      throw 'NO TAGS';
    }
  }

  closePane(): void {
    //ASK QUESTION IF U WANT TO CLOSE IF NOT SAVED
    this.props.forceUpdate();
    this.props.setVisibility(false);
  }

  saveConfig(): void {
    console.log('SAVED!\nNew Config:', this.state.changedListObject);
    // console.log(settings.file());
    settings.setSync(this.state.changedListObject);
  }

  itemChanged(
    masterKey: string,
    key: string,
    name: string,
    value: string[]
  ): void {
    // console.log(key, name, value);

    // console.log(Object.entries(this.state.changedListObject));
    // console.log(this.state.changedListObject['tags']);
    // console.log(masterKey);
    // console.log(this.state.changedListObject[masterKey]);
    // console.log(this.state.changedListObject[masterKey]);
    var found = this.state.changedListObject[masterKey].find(
      // (element) => console.log(element)
      (element) => element.key === key
    );
    // console.log(found);
    // console.log(value);
    if (name == 'fromSite') {
      found[name] = value.split(', ');
    } else {
      found[name] = value;
    }
  }
  addObject(value) {
    // console.log(value);
    var listObject = this.state.listObjects;
    // listObject.splice(2, 1);
    listObject.push(
      <Tag
        keyProp={value.key}
        toReturn={value.toReturn}
        fromSite={value.fromSite}
        folder={value.folder}
        visible={value.visible}
        checkFolder={value.checkFolder}
        // checkedChanged={this.checkedChanged.bind(this)}
        // textChanged={this.textChanged.bind(this)}
        itemChanged={this.itemChanged.bind(this)}
      />
      // <div>TEST</div>
    );
    var listObj = this.state.changedListObject;
    listObj.tags.push({
      key: value.key,
      toReturn: value.toReturn,
      fromSite: value.fromSite,
      folder: value.folder,
      visible: value.visible,
      checkFolder: value.checkFolder,
    });
    this.setState({ listObjects: listObject });
    this.setState({ changedListObject: listObj });
  }
  render() {
    return (
      <div
        // className={`settingsBG ${this.props.shown ? '' : 'hidden'}`}
        className="settingsBG"
        onClick={this.closePane.bind(this)}
      >
        <div
          onClick={(e) => {
            e.stopPropagation();
          }}
          className="settingsPane"
        >
          <button
            className="closeButtonPane"
            onClick={this.closePane.bind(this)}
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
          <SimpleBarReact
            style={{
              maxHeight: '100%',
              width: '100%',
            }}
          >
            <Popup trigger={<button> Add </button>} modal>
              <PopupPanel
                contents={<TagToAdd onSave={this.addObject.bind(this)} />}
              />
            </Popup>
            {/* <div>{this.state.newListObjects}</div> */}
            {/* <div>
              <div>{this.state.listObjects}</div>
              <div>{this.state.newListObjects}</div>
            </div> */}
            <div className="settingsList">
              {this.state.commonSettingItems}
              <h3 style={{ gridColumnStart: 1, gridColumnEnd: 2 }}>Tags</h3>
              <button
                className="saveButton"
                style={{ gridColumnStart: 2, gridColumnEnd: 5 }}
                onClick={this.saveConfig.bind(this)}
              >
                Save
              </button>

              {/* {this.state.listObjects}
                {this.state.newListObjects} */}
              {/* <div>{this.state.newListObjects}</div> */}
              <div className="tagObj">{this.state.listObjects}</div>
            </div>
          </SimpleBarReact>
        </div>
      </div>
    );
  }
}

interface PopupPanelProps {
  contents: React.FC;
}
class PopupPanel extends React.Component<PopupPanelProps> {
  constructor(props) {
    super(props);
  }

  render() {
    return <div className="popupPanel">{this.props.contents}</div>;
  }
}

interface SettingsItemProps {
  name: string;
  // valueToSetTo: string;
  value: string;
}
class SettingsItem extends React.Component<SettingsItemProps> {
  constructor(props) {
    super(props);
  }

  // itemChanged(
  //   masterKey: string,
  //   key: string,
  //   name: string,
  //   value: string[]
  // ): void {
  itemChange(e) {
    // console.log(this.props.keyProp);
    this.props.itemChanged(
      'commonSettings',
      this.props.keyProp,
      'value',
      e.target.value
    );
  }
  render() {
    return (
      <div>
        <div>{this.props.name}</div>
        <input
          key={this.props.name}
          type="text"
          defaultValue={this.props.value}
          onChange={this.itemChange.bind(this)}
        ></input>{' '}
      </div>
    );
  }
}

interface TagToAddProps {
  onSave(value): Function;
}
interface TagToAddState {
  value: {
    key: string;
    toReturn: string;
    fromSite: string[];
    folder: string;
    visible: boolean;
    checkFolder: boolean;
  };
}
class TagToAdd extends React.Component<TagToAddProps, TagToAddState> {
  // keyProp={value.key}
  // toReturn={value.toReturn}
  // fromSite={value.fromSite}
  // folder={value.folder}
  // visible={value.visible}
  // checkFolder={value.checkFolder}

  constructor(props) {
    super(props);
    this.state = {
      value: {
        key: '',
        toReturn: '',
        fromSite: [''],
        folder: '',
        visible: false,
        checkFolder: false,
      },
    };
  }
  onSave() {
    let value = this.state.value;
    // console.log(value);
    if (value.fromSite.includes(', ')) {
      value.fromSite = value.fromSite.split(', ');
    } else {
      value.fromSite = [value.fromSite];
    }

    this.setState({ value: value });
    // console.log(this.state.value);
    // console.log(value);
    this.props.onSave(this.state.value);
  }
  onChangeText(e) {
    let obj = this.state.value;
    // console.log(obj[e.target.name]);
    obj[e.target.name] = e.target.value;
    this.setState({ value: obj });
    // console.log(e.target.value, e.target.name);
    // console.log(this.state.value);
  }
  onChangeCheckbox(e) {
    let obj = this.state.value;
    // console.log(obj[e.target.name]);
    obj[e.target.name] = e.target.checked;
    this.setState({ value: obj });
    // console.log(e.target.value, e.target.name);
    // console.log(this.state.value);
  }

  render() {
    return (
      <div>
        <div>Key</div>
        <input
          name={'key'}
          type="text"
          onChange={this.onChangeText.bind(this)}
          // readOnly={true}
          // defaultValue={this.props.keyProp}
          // onChange={this.textChanged.bind(this)}
        ></input>{' '}
        <div className="toReturnSetting">To Return</div>
        <input
          name={'toReturn'}
          type="text"
          onChange={this.onChangeText.bind(this)}
          // defaultValue={this.props.toReturn}
          // onChange={this.textChanged.bind(this)}
        ></input>{' '}
        <div>From Site</div>
        <input
          name={'fromSite'}
          type="text"
          onChange={this.onChangeText.bind(this)}
          // defaultValue={this.props.fromSite.join(', ')}
          // onChange={this.textChanged.bind(this)}
        ></input>{' '}
        <div>Folder</div>
        <input
          name={'folder'}
          type="text"
          onChange={this.onChangeText.bind(this)}
          // defaultValue={this.props.folder}
          // onChange={this.textChanged.bind(this)}
        ></input>{' '}
        <div>Visible</div>
        <input
          name={'visible'}
          type="checkbox"
          onChange={this.onChangeCheckbox.bind(this)}
          // defaultChecked={this.props.visible}
          // onChange={this.checkedChanged.bind(this)}
        ></input>{' '}
        <div>Check Folder</div>
        <input
          name={'checkFolder'}
          type="checkbox"
          onChange={this.onChangeCheckbox.bind(this)}
          // defaultChecked={this.props.checkFolder}
          // onChange={this.checkedChanged.bind(this)}
        ></input>{' '}
        <button onClick={this.onSave.bind(this)}>Save</button>
      </div>
    );
  }
}
interface TagProps {
  keyProp: string;
  toReturn: string;
  fromSite: string[];
  folder: string;
  visible: boolean;
  checkFolder: boolean;
  // checkedChanged(event: any): Function;
  // textChanged(event: any): Function;
  itemChanged(
    masterKey: string,
    key: string,
    name: string,
    value: string[]
  ): Function;
}
class Tag extends React.Component<TagProps> {
  constructor(props) {
    super(props);
  }

  textChanged(e) {
    // console.log('tags', this.props.keyProp, e.target.name, e.target.value);
    this.props.itemChanged(
      'tags',
      this.props.keyProp,
      e.target.name,
      e.target.value
    );
  }
  checkedChanged(e) {
    // console.log(e.target.checked);
    this.props.itemChanged(
      'tags',
      this.props.keyProp,
      e.target.name,
      e.target.checked
    );
  }
  render() {
    return (
      <div className="settingTag">
        <div>Key</div>
        <input
          name={'key'}
          type="text"
          readOnly={true}
          defaultValue={this.props.keyProp}
          onChange={this.textChanged.bind(this)}
        ></input>{' '}
        <div className="toReturnSetting">To Return</div>
        <input
          name={'toReturn'}
          type="text"
          defaultValue={this.props.toReturn}
          onChange={this.textChanged.bind(this)}
        ></input>{' '}
        <div>From Site</div>
        <input
          name={'fromSite'}
          type="text"
          defaultValue={this.props.fromSite.join(', ')}
          onChange={this.textChanged.bind(this)}
        ></input>{' '}
        <div>Folder</div>
        <input
          name={'folder'}
          type="text"
          defaultValue={this.props.folder}
          onChange={this.textChanged.bind(this)}
        ></input>{' '}
        <div>Visible</div>
        <input
          name={'visible'}
          type="checkbox"
          defaultChecked={this.props.visible}
          onChange={this.checkedChanged.bind(this)}
        ></input>{' '}
        <div>Check Folder</div>
        <input
          name={'checkFolder'}
          type="checkbox"
          defaultChecked={this.props.checkFolder}
          onChange={this.checkedChanged.bind(this)}
        ></input>{' '}
      </div>
    );
  }
}
interface ConfigButtonState {
  shown: boolean;
  popupShown: boolean;
}
interface ConfigButtonProps {}
class ConfigButton extends React.Component<
  ConfigButtonProps,
  ConfigButtonState
> {
  constructor(props) {
    super(props);
    this.state = { shown: false, popupShown: true };
  }
  show() {
    this.setVisibility(true);
  }
  setVisibility(isVisible: boolean): void {
    this.setState({ shown: isVisible });
  }

  render() {
    return (
      <div>
        <button onClick={this.show.bind(this)} className="settingsIcon">
          <FontAwesomeIcon icon={faCog} />
        </button>
        {/* 
        <CSSTransition
          in={this.state.popupShown}
          timeout={200}
          classNames="popupPanel"
          unmountOnExit
        >
          <PopupPanel contents={<TagToAdd />} />
        </CSSTransition> */}

        <CSSTransition
          in={this.state.shown}
          timeout={200}
          classNames="settingPane"
          unmountOnExit
        >
          <ConfigPane
            setVisibility={this.setVisibility.bind(this)}
            forceUpdate={this.props.forceUpdate}
          />
        </CSSTransition>
      </div>
    );
  }
}
export default ConfigButton;
