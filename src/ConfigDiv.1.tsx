// eslint-disable-next-line no-use-before-define
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCog,
  faTimes,
  faPlus,
  faMinus,
  faPlusSquare,
  faMinusSquare,
} from '@fortawesome/free-solid-svg-icons';
import settings from 'electron-settings';
import { Checkbox } from '@material-ui/core';
import SimpleBarReact from 'simplebar-react';
import { CSSTransition } from 'react-transition-group';
import { PRIORITY_HIGHEST } from 'constants';
import InputColor from 'react-input-color';
import  fs  from 'fs';
import ModalOwn from './Modal';

const { dialog, app } = require('electron').remote;

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
  commonSettings: [{ key: string; name: string; value: string | string[] }];
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
  type: string;
  isCheckbox: boolean;
  valueShouldBeArray: boolean;
  itemChanged: (
    masterKey: string,
    key: string,
    name: string,
    value: string[],
    type: string,
    hidden: boolean
  ) => void;
  hidden?: boolean;
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
interface ISettingsItemState {
  values: string;
  element: JSX.Element;
}
/* COMPONENTS */
class SettingsItem extends React.Component<
  SettingsItemProps,
  ISettingsItemState
> {
  filePathInput;

  constructor(props) {
    super(props);
    // this.state = {
    //   valueArr: this.props.value,
    //   arrays: [],
    //   element: this.initializeElement(),
    // };
    // this.test;
    // console.log(this.state.valueArr);

    this.state = { values: this.props.value, element: null };
    this.filePathInput = React.createRef();
  }

  componentDidMount() {
    this.initializeElement();
  }

  // componentDidUpdate(props, state) {
  //   if (state.values !== this.state.values) {
  //     console.log(this.state.values);
  //   }
  // }

  setColor(e) {
    this.props.itemChanged(
      'commonSettings',
      this.props.keyProp,
      'value',
      e.hex,
      this.props.type,
      this.props.hidden
      // this.checkIfArray(e.target.value)
    );
  }

  arrayChange(value, id) {
    const toChange = this.state.values;
    toChange[id] = value;
    this.setState({ values: toChange });

    this.props.itemChanged(
      'commonSettings',
      this.props.keyProp,
      'value',
      // this.handleValue(e.target),
      value,
      this.props.type,
      this.props.hidden
      // this.checkIfArray(e.target.value)
    );
  }

  textChange(e) {
    this.props.itemChanged(
      'commonSettings',
      this.props.keyProp,
      'value',
      // this.handleValue(e.target),
      e.target.value,
      this.props.type,
      this.props.hidden
      // this.checkIfArray(e.target.value)
    );
  }

  itemChange(e) {
    // console.log(this.props.hidden);
    this.props.itemChanged(
      'commonSettings',
      this.props.keyProp,
      'value',
      // this.handleValue(e.target),
      e.target.checked,
      this.props.type,
      this.props.hidden
      // this.checkIfArray(e.target.value)
    );
  }

  initializeElement() {
    // console.log(this.props);
    if (this.props.isCheckbox) {
      this.setState({ element: this.renderCheckbox() });
    } else if (this.props.type === 'color') {
      this.setState({ element: this.renderColor() });
    } else if (this.props.valueShouldBeArray) {
      this.setState({ element: this.renderArrayField() });
    } else if (this.props.type === 'filePicker') {
      this.setState({ element: this.renderFilePicker() });
    } else {
      this.setState({ element: this.renderTextField() });
    }
  }

  renderArrayField() {
    return (
      <div style={{ display: 'grid' }}>
        {this.state.values.map((value, index) => {
          // console.log(value);
          return (
            <div key={index} className="setting array">
              <input
                className="settingTagInput arrays"
                key={this.props.name}
                name={this.props.name}
                type={this.props.type}
                value={value}
                onChange={(e) => {
                  let currValues=this.state.values;
                  currValues[index]=e.target.value
                  this.setState({ values:currValues });
                  this.initializeElement();
                }}
              />
              <span
                className="removeFromArray cursorPointer"
                type="button"
                key={index}
                onClick={(e) => {
                  this.state.values.splice(index, 1);
                  this.initializeElement();
                  // e.stopPropagation()
                }}
              >
                <FontAwesomeIcon
                // name={index}

                  className="fontAwesome modernButton"
                  icon={faMinusSquare}
                />
              </span>
            </div>
          );
        })}
        <span
          className="addToArray cursorPointer"
          type="button"
          onClick={() => {
            this.state.values.push('');
            this.initializeElement();
          }}
        >
          <FontAwesomeIcon
            className="fontAwesome modernButton"
            icon={faPlusSquare}
          />
        </span>
      </div>
    );

    // arrayField
    //  arrayChild
    //  arrayChild
  }

  renderFilePicker() {
    return (
      <div className="filePicker">
        {/* {this.renderTextField()} */}
        <input
          ref={this.filePathInput}
          className="settingTagInput"
          key={this.props.name}
          type={this.props.type}
          defaultValue={this.state.values}
          onChange={this.textChange.bind(this)}
        />
        <button
          type="button"
          onClick={async () => {
            // console.log(
            try {
              const file = await dialog.showOpenDialog({
                defaultPath: this.filePathInput.current.value,
                properties: ['openDirectory'],
              });
              // );
              // console.log('dialog', file);
              if (!file.canceled) {
                this.filePathInput.current.value = file.filePaths[0];

                // console.log(file.filePaths[0]); // this.initializeElement(); // this.setState({ values: file.filePaths[0] });
                this.props.itemChanged(
                  'commonSettings',
                  this.props.keyProp,
                  'value',
                  // this.handleValue(e.target),
                  file.filePaths[0],
                  this.props.type,
                  this.props.hidden
                  // this.checkIfArray(e.target.value)
                );
              }
            } catch (err) {
              throw err;
            }
          }}
        >
          ...
        </button>
      </div>
    );
    // console.log(
    //   dialog.showOpenDialog({ properties: ['openFile', 'multiSelections'] })
    // );
  }

  renderTextField() {
    return (
      <input
        className="settingTagInput "
        key={this.props.name}
        type={this.props.type}
        defaultValue={this.state.values}
        onChange={this.textChange.bind(this)}
      />
    );
  }

  renderColor() {
    return (
      <InputColor
        initialValue={this.state.values}
        onChange={this.setColor.bind(this)}
        // onChange={this.itemChange.bind(this)}
        key={this.props.name}
      />
    );
  }

  renderCheckbox() {
    return (
      <Checkbox
        style={{ width: '16px' }}
        className="fontAwesome modernButton"
        key={this.props.name}
        defaultChecked={this.state.values}
        onChange={this.itemChange.bind(this)}
      />
    );
  }

  render() {
    return (
      <div
        className={`commonSetting parent ${
          this.props.isCheckbox ? 'checkbox' : 'textField'
        }`}
        style={{ display: this.props.hidden ? 'none' : '' }}
      >
        <div>{this.props.name}</div>
        {this.state.element}
      </div>
    );
  }
}
class Tag extends React.Component<TagProps, TagState> {
  checkedChangedBound: (value) => void;

  constructor(props) {
    super(props);
    this.state = { render: true,element:[] };
    this.checkedChangedBound = this.checkedChanged.bind(this);
  }

componentDidMount() {
  this.setState({ element: this.renderArrayField() });

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
  
  renderArrayField() {
    return (
      <div style={{ display: 'grid' }}>

        {this.props.fromSite.map((value, index) => {
          // console.log(value);
          return (
            <div key={index} className="setting array">
              <input
                className="settingTagInput arrays"
                key={this.props.keyProp}
                name={this.props.keyProp}
                type="input"
                value={value}
                
                onChange={(e) => {
                  // let currValues = this.props.fromSite;
                  // currValues[index]=e.target.value
                  console.log(e.target.name)
                  this.props.itemChanged(
                    'tags',
                    this.props.keyProp,
                    'fromSite',
                    e.target.value
                  );
                  
                  // this.setState({ value:currValues});
                  this.setState({ element: this.renderArrayField() });
                }}
              />
              <span
                className="removeFromArray cursorPointer"
                type="button"
                key={index}
                name={index}
                onClick={(e) => {
                  this.props.fromSite.splice(index, 1);
                  this.setState({ element: this.renderArrayField() });
                }}
              >
                <FontAwesomeIcon
                  className="fontAwesome modernButton"
                  icon={faMinusSquare}
                />
              </span>
            </div>
          );
        })}
        <span
          className="addToArray cursorPointer"
          type="button"
          onClick={() => {
            this.props.fromSite.push('');
            this.setState({ element: this.renderArrayField() });
            // this.initializeElement();
          }}
        >
          <FontAwesomeIcon
            className="fontAwesome modernButton"
            icon={faPlusSquare}
          />
        </span>
      </div>
    );


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
          {this.state.element}
          {/* <input
            className="settingTagInput"
            name="fromSite"
            type="text"
            defaultValue={this.props.fromSite.join(', ')}
            onChange={this.textChanged.bind(this)}
          />{' '} */}
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
    if (this.props.commonSettings) {
      this.commonSettings = this.props.commonSettings;
    } else {
      this.commonSettings = settings.getSync('commonSettings');
    }

    this.state = {
      listObjects: null,
      changedListObject: null,
      // workingPathState: '',
      commonSettingItems: null,
      showModal: false,
      settings
    };
    this.itemChangedBound = this.itemChanged.bind(this);
    this.tagToDeleteBound = this.tagToDelete.bind(this);
    this.addObjectBound = this.addObject.bind(this);
    this.hideAddBound = this.hideAdd.bind(this);
  }

  // componentDidUpdate() {
  //   if(this.state.settings) {
      
  //   }
    
  // }
  
  componentDidMount() {
    if (this.props.settings) {
      // this.setState({settings:this.props.settings})
      
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
        const objCommon = this.commonSettings.map((value) => {
          // console.log('COMMON', value);
          return (
            <SettingsItem
              name={value.name}
              key={value.key}
              keyProp={value.key}
              isCheckbox={typeof value.value === 'boolean'}
              valueShouldBeArray={Array.isArray(value.value)}
              hidden={value.hidden}
              type={value.type}
              // value={this.state.workingPathState}
              value={value.value}
              itemChanged={this.itemChangedBound}
            />
          );
        });

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
              type:value.type
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

    if (this.props.setVisibility) {
      this.props.setVisibility(false);
    }
    // console.log(this.props);

    // window.location.reload(); // TODO: <-find better way to do it
  }

  closeModal() {
    this.setState({ showError: false });
  }

  saveConfig(): void {
    const found = this.state.changedListObject.commonSettings.find(
      (el) => el.key === 'workingPath'
    ).value;

    console.log(this.state.changedListObject.commonSettings);
    console.log(found)
    if (!fs.existsSync(found)) {
      console.log("????")
      this.setState({
        showError: true,
        buttons: ['OK'],
        title: 'Directory not found',
        message: `Directory ${found} does not exists`,
      });
      return;
      // fs.mkdirSync();
    }

    console.log('SAVED!\nNew Config:', this.state.changedListObject);
    // console.log(settings.file());
    settings.setSync(this.state.changedListObject);
    this.props.forceUpdate();
  }

  itemChanged(
    masterKey: string,
    key: string,
    name: string,
    value: string[],
    type: string,
    hidden: boolean
  ): void {
    const found = this.state.changedListObject[masterKey].find(
      (element) => element.key === key
    );
console.log(found,name,value)
    // if (name === 'fromSite') {
    //   found[name] = value.split(', ');
    // } else {
      console.log(this.state.listObjects)
      console.log(found[name])
      found[name] = value;
    // }
    found.type = type;

    found.hidden = hidden;
    
    // this.state.
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
               {this.state.buttons!==undefined? <ModalOwn
          show={this.state.showError}
          close={this.closeModal.bind(this)}
          buttons={this.state.buttons}
          title={this.state.title}
          message={this.state.message}
        />:""}
        <div
          onKeyDown={(e) => {
            e.stopPropagation();
          }}
          role="none"
          onClick={(e) => {
            e.stopPropagation();
          }}
          className="settingsPane moving"
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
              <div className="settingsList commonSettings">
                {this.state.commonSettingItems}
              </div>
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
      },element:[]
    };
    // this.setState({ element: this.renderArrayField() });
  }
  componentDidMount() {
    this.setState({ element: this.renderArrayField() });
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
  
  
  renderArrayField() {
    return (
      <div style={{ display: 'grid' }}>

        {this.state.value.fromSite.map((value, index) => {
          // console.log(value);
          return (
            <div key={index} className="setting array">
              <input
                className="settingTagInput arrays"
                key={this.props.name}
                name={this.props.name}
                type={this.props.type}
                value={value}
                onChange={(e) => {
                  let currValues = this.state.value;
                  currValues.fromSite[index]=e.target.value
                  this.setState({ value:currValues});
                  this.setState({ element: this.renderArrayField() });
                }}
              />
              <span
                className="removeFromArray cursorPointer"
                type="button"
                key={index}
                name={index}
                onClick={(e) => {
                  this.state.value.fromSite.splice(index, 1);
                  this.setState({ element: this.renderArrayField() });
                }}
              >
                <FontAwesomeIcon
                  className="fontAwesome modernButton"
                  icon={faMinusSquare}
                />
              </span>
            </div>
          );
        })}
        <span
          className="addToArray cursorPointer"
          type="button"
          onClick={() => {
            this.state.value.fromSite.push('');
            this.setState({ element: this.renderArrayField() });
            // this.initializeElement();
          }}
        >
          <FontAwesomeIcon
            className="fontAwesome modernButton"
            icon={faPlusSquare}
          />
        </span>
      </div>
    );


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
        {this.state.element}
        {/* <input
          name="fromSite"
          type="text"
          onChange={this.onChangeText.bind(this)}
          // defaultValue={this.props.fromSite.join(', ')}
          // onChange={this.textChanged.bind(this)}
        />{' '} */}
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
// export default ConfigButton;
export { ConfigButton, ConfigPane };
