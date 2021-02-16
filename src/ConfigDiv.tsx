// eslint-disable-next-line no-use-before-define
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog, faTimes } from '@fortawesome/free-solid-svg-icons';
import settings from 'electron-settings';
import { Checkbox } from '@material-ui/core';
import SimpleBarReact from 'simplebar-react';
import { CSSTransition } from 'react-transition-group';

settings.configure({ prettify: true });

/* INTERFACES */
interface ConfigPaneState {
  listObjects: any;
  changedListObject: any;
  // workingPathState: string;
  commonSettingItems: any;
  showModal: boolean;
}
interface ConfigPaneProps {
  // shown: boolean;
  setVisibility: (isVisible: boolean) => void;
  forceUpdate: () => void;
  settings;
}
interface CommonConfigToSave {
  name: string;
  value: string;
}
interface ConfigToSave {
  key: string;

  toReturn: string;
  fromSite: string[];
  folder: string;
  visible: boolean;
  checkFolder: boolean;
}
type ConfigToSaveList = Array<ConfigToSave>;

interface PopupPanelProps {
  // eslint-disable-next-line no-use-before-define
  contents: TagToAdd;
  hide: () => void;
}
interface SettingsItemProps {
  name: string;
  // valueToSetTo: string;
  keyProp;
  value: string;
  valueShouldBeArray: boolean;
  itemChanged: (
    masterKey: string,
    key: string,
    name: string,
    value: string[]
  ) => void;
}

interface TagToAddProps {
  onSave: (value) => void;
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
interface TagProps {
  keyProp: string;
  toReturn: string;
  fromSite: string[];
  folder: string;
  visible: boolean;
  checkFolder: boolean;
  // checkedChanged(event: any): Function;
  // textChanged(event: any): Function;
  itemChanged: (
    masterKey: string,
    key: string,
    name: string,
    value: string[]
  ) => void;
  toDelete: (value) => void;
}
interface TagState {
  render: boolean;
}
interface ConfigButtonState {
  shown: boolean;
}
interface ConfigButtonProps {
  settings;
  forceUpdate: () => void;
}

/* COMPONENTS */
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
  checkIfArray(target) {
    if (this.props.valueShouldBeArray) {
      return target.split(/[ ,]+/);
    }
    return target;
  }

  itemChange(e) {
    // console.log(this.props.keyProp);
    this.props.itemChanged(
      'commonSettings',
      this.props.keyProp,
      'value',
      this.checkIfArray(e.target.value)
    );
  }

  render() {
    return (
      <div>
        <div className="cursorNormal notSelectable">{this.props.name}</div>
        <input
          className="settingTagInput "
          key={this.props.name}
          type="text"
          defaultValue={this.props.value}
          onChange={this.itemChange.bind(this)}
        />{' '}
      </div>
    );
  }
}
class Tag extends React.Component<TagProps, TagState> {
  checkedChangedBound: (value) => void;

  constructor(props) {
    super(props);
    this.state = { render: true };
    this.checkedChangedBound = this.checkedChanged.bind(this);
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

  toDelete(e) {
    this.setState({ render: false });
    // console.log(this.props.keyProp);
    this.props.toDelete(this.props.keyProp);
  }

  render() {
    return this.state.render ? (
      <div className="settingTag">
        <button
          type="button"
          onClick={this.toDelete.bind(this)}
          className="tagDelete"
        >
          <FontAwesomeIcon icon={faTimes} />
        </button>
        <div>
          <div className="cursorNormal notSelectable">Key</div>
          <input
            className="settingTagInput"
            name="key"
            type="text"
            readOnly
            defaultValue={this.props.keyProp}
            onChange={this.textChanged.bind(this)}
          />{' '}
          <div className="toReturnSetting cursorNormal notSelectable">
            To Return
          </div>
          <input
            className="settingTagInput"
            name="toReturn"
            type="text"
            defaultValue={this.props.toReturn}
            onChange={this.textChanged.bind(this)}
          />{' '}
          <div className="cursorNormal notSelectable">From Site</div>
          <input
            className="settingTagInput"
            name="fromSite"
            type="text"
            defaultValue={this.props.fromSite.join(', ')}
            onChange={this.textChanged.bind(this)}
          />{' '}
          <div className="cursorNormal notSelectable">Folder</div>
          <input
            className="settingTagInput"
            name="folder"
            type="text"
            defaultValue={this.props.folder}
            onChange={this.textChanged.bind(this)}
          />{' '}
          <div className="cursorNormal notSelectable">Visible</div>
          <Checkbox
            // className="settingTagCheckbox"
            name="visible"
            // type="checkbox"
            defaultChecked={this.props.visible}
            onChange={this.checkedChangedBound}
          />{' '}
          <div className="cursorNormal notSelectable">Check Folder</div>
          <Checkbox
            name="checkFolder"
            // type="checkbox"
            defaultChecked={this.props.checkFolder}
            onChange={this.checkedChangedBound}
          />{' '}
        </div>
      </div>
    ) : (
      ''
    );
  }
}
function PopupPanel(props: PopupPanelProps) {
  // class PopupPanel extends React.Component<PopupPanelProps> {
  // constructor(props) {
  // super(props);
  // }

  // render() {
  return (
    <div className="popupPanel">
      <button type="button" className="closeAddModal" onClick={props.hide}>
        <FontAwesomeIcon icon={faTimes} />
      </button>
      <div>{props.contents}</div>
    </div>
  );
  // }
}

class ConfigPane extends React.Component<ConfigPaneProps, ConfigPaneState> {
  itemChangedBound: (
    masterKey: string,
    key: string,
    name: string,
    value: string[]
  ) => void;

  tagToDeleteBound: (e) => void;

  commonSettings;

  addObjectBound: (value) => void;

  hideAddBound: () => void;

  constructor(props) {
    super(props);
    this.commonSettings = settings.getSync('commonSettings');
    this.state = {
      listObjects: null,
      changedListObject: null,
      // workingPathState: '',
      commonSettingItems: null,
      showModal: false,
    };
    this.itemChangedBound = this.itemChanged.bind(this);
    this.tagToDeleteBound = this.tagToDelete.bind(this);
    this.addObjectBound = this.addObject.bind(this);
    this.hideAddBound = this.hideAdd.bind(this);
  }

  componentDidMount() {
    if (this.props.settings) {
      const obj = this.props.settings.map((value) => (
        <Tag
          key={value.key}
          keyProp={value.key}
          toReturn={value.toReturn}
          fromSite={value.fromSite}
          folder={value.folder}
          visible={value.visible}
          checkFolder={value.checkFolder}
          // checkedChanged={this.checkedChanged.bind(this)}
          // textChanged={this.textChanged.bind(this)}
          itemChanged={this.itemChangedBound}
          toDelete={this.tagToDeleteBound}
        />
      ));

      const changedTags: ConfigToSaveList = [];
      const commonSettings = [];

      if (this.commonSettings) {
        const objCommon = this.commonSettings.map((value) => (
          <SettingsItem
            name={value.name}
            key={value.key}
            keyProp={value.key}
            valueShouldBeArray={Array.isArray(value.value)}
            // value={this.state.workingPathState}
            value={value.value}
            itemChanged={this.itemChangedBound}
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

          for (let i = 0; i < this.commonSettings.length; i += 1) {
            const value = this.commonSettings[i];
            // const obj: CommonConfigToSave = {
            //   key: value.key,
            //   name: value.name,
            //   value: value.value,
            // };
            commonSettings.push({
              key: value.key,
              name: value.name,
              value: value.value,
            });
          }
          for (let i = 0; i < this.props.settings.length; i += 1) {
            const value = this.props.settings[i];
            // const obj: ConfigToSave = {
            //   key: value.key,
            //   toReturn: value.toReturn,
            //   fromSite: value.fromSite,
            //   folder: value.folder,
            //   visible: value.visible,
            //   checkFolder: value.checkFolder,
            // };
            changedTags.push({
              key: value.key,
              toReturn: value.toReturn,
              fromSite: value.fromSite,
              folder: value.folder,
              visible: value.visible,
              checkFolder: value.checkFolder,
            });
          }
          const something = { commonSettings, tags: changedTags };
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
        throw new Error('no commonSettings');
      }

      // if (!settings.hasSync('workingPath')) {
      //   throw 'XD';
      // }
    } else {
      throw new Error('NO TAGS');
    }
  }

  tagToDelete(e) {
    const obj = this.state.changedListObject;
    const found = obj.tags.find((el) => el.key === e);
    obj.tags.splice(obj.tags.indexOf(found), 1);
  }

  closePane(): void {
    // ASK QUESTION IF U WANT TO CLOSE IF NOT SAVED
    this.props.forceUpdate();
    this.props.setVisibility(false);
    window.location.reload(); // TODO: <-find better way to do it
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
    const found = this.state.changedListObject[masterKey].find(
      (element) => element.key === key
    );

    if (name === 'fromSite') {
      found[name] = value.split(', ');
    } else {
      found[name] = value;
    }
  }

  addObject(value) {
    // console.log(value);
    const listObject = this.state.listObjects;
    // listObject.splice(2, 1);
    listObject.push(
      <Tag
        keyProp={value.key}
        toReturn={value.toReturn}
        fromSite={value.fromSite}
        folder={value.folder}
        visible={value.visible}
        checkFolder={value.checkFolder}
        toDelete={this.toDelete}
        // checkedChanged={this.checkedChanged.bind(this)}
        // textChanged={this.textChanged.bind(this)}
        itemChanged={this.itemChangedBound}
      />
      // <div>TEST</div>
    );
    const listObj = this.state.changedListObject;
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

  showAdd() {
    this.setState({ showModal: true });
  }

  hideAdd() {
    this.setState({ showModal: false });
  }

  render() {
    return (
      <div
        // className={`settingsBG ${this.props.shown ? '' : 'hidden'}`}
        className="settingsBG"
        // onClick={this.closePane.bind(this)}
        // onClick={this.closePane.bind(this)}
      >
        <div
          onKeyDown={(e) => {
            e.stopPropagation();
          }}
          role="none"
          onClick={(e) => {
            e.stopPropagation();
          }}
          className="settingsPane"
        >
          <CSSTransition
            in={this.state.showModal}
            timeout={200}
            classNames="tagToAddModalContent"
            unmountOnExit
          >
            <PopupPanel
              contents={<TagToAdd onSave={this.addObjectBound} />}
              hide={this.hideAddBound}
            />
          </CSSTransition>
          <button
            type="button"
            className="closeButtonPane"
            onClick={this.closePane.bind(this)}
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
          <SimpleBarReact
            style={{
              maxHeight: '100%',
              width: '100%',
              borderRadius: '15px',
              padding: '10px',
            }}
          >
            <div className="settingsList">
              {this.state.commonSettingItems}
              <h3
                className="cursorNormal notSelectable"
                style={{ gridColumnStart: 1, gridColumnEnd: 2 }}
              >
                Tags
              </h3>
              <div className="tagObj">{this.state.listObjects}</div>
              <button
                type="button"
                className="saveButton"
                style={{ gridColumnStart: 2, gridColumnEnd: 5 }}
                onClick={this.saveConfig.bind(this)}
              >
                Save
              </button>

              {/* <CSSTransition
                in={this.state.shown}
                timeout={200}
                classNames="settingPane"
                unmountOnExit
              > */}

              {/* <TagToAdd onSave={this.addObject.bind(this)} /> */}

              {/* <button onClick={this.setState({ showModal: true })}>Add</button> */}
              <button type="button" onClick={this.showAdd.bind(this)}>
                Add
              </button>

              {/* <Popup trigger={<button> Add </button>} modal> */}

              {/* </Popup> */}
            </div>
          </SimpleBarReact>
        </div>
      </div>
    );
  }
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
    const { value } = this.state;
    // console.log(value);
    if (value.fromSite.includes(', ')) {
      value.fromSite = value.fromSite.split(', ');
    } else {
      value.fromSite = [value.fromSite];
    }

    this.setState({ value });
    // console.log(this.state.value);
    // console.log(value);
    this.props.onSave(this.state.value);
  }

  onChangeText(e) {
    const obj = this.state.value;
    // console.log(obj[e.target.name]);
    obj[e.target.name] = e.target.value;
    this.setState({ value: obj });
    // console.log(e.target.value, e.target.name);
    // console.log(this.state.value);
  }

  onChangeCheckbox(e) {
    const obj = this.state.value;
    // console.log(obj[e.target.name]);
    obj[e.target.name] = e.target.checked;
    this.setState({ value: obj });
    // console.log(e.target.value, e.target.name);
    // console.log(this.state.value);
  }

  render() {
    return (
      <div className="tagToAddModal">
        <div>Key</div>
        <input
          name="key"
          type="text"
          onChange={this.onChangeText.bind(this)}
          // readOnly={true}
          // defaultValue={this.props.keyProp}
          // onChange={this.textChanged.bind(this)}
        />{' '}
        <div className="toReturnSetting">To Return</div>
        <input
          name="toReturn"
          type="text"
          onChange={this.onChangeText.bind(this)}
          // defaultValue={this.props.toReturn}
          // onChange={this.textChanged.bind(this)}
        />{' '}
        <div>From Site</div>
        <input
          name="fromSite"
          type="text"
          onChange={this.onChangeText.bind(this)}
          // defaultValue={this.props.fromSite.join(', ')}
          // onChange={this.textChanged.bind(this)}
        />{' '}
        <div>Folder</div>
        <input
          name="folder"
          type="text"
          onChange={this.onChangeText.bind(this)}
          // defaultValue={this.props.folder}
          // onChange={this.textChanged.bind(this)}
        />{' '}
        <div>Visible</div>
        <input
          name="visible"
          type="checkbox"
          onChange={this.onChangeCheckbox.bind(this)}
          // defaultChecked={this.props.visible}
          // onChange={this.checkedChanged.bind(this)}
        />{' '}
        <div>Check Folder</div>
        <input
          name="checkFolder"
          type="checkbox"
          onChange={this.onChangeCheckbox.bind(this)}
          // defaultChecked={this.props.checkFolder}
          // onChange={this.checkedChanged.bind(this)}
        />{' '}
        <button type="button" onClick={this.onSave.bind(this)}>
          Save
        </button>
      </div>
    );
  }
}
class ConfigButton extends React.Component<
  ConfigButtonProps,
  ConfigButtonState
> {
  setVisibilityBound: (value: boolean) => void;

  constructor(props) {
    super(props);
    this.state = { shown: false };
    this.setVisibilityBound = this.setVisibility.bind(this);
  }

  setVisibility(isVisible: boolean): void {
    this.setState({ shown: isVisible });
  }

  show() {
    this.setVisibility(true);
  }

  render() {
    return (
      <div>
        <button
          type="button"
          onClick={this.show.bind(this)}
          className="settingsIcon"
        >
          <FontAwesomeIcon icon={faCog} />
        </button>

        <CSSTransition
          in={this.state.shown}
          timeout={200}
          classNames="settingPane"
          unmountOnExit
        >
          <ConfigPane
            settings={this.props.settings}
            setVisibility={this.setVisibilityBound}
            forceUpdate={this.props.forceUpdate}
          />
        </CSSTransition>
      </div>
    );
  }
}
export default ConfigButton;
