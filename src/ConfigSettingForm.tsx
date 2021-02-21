import { faMinusSquare, faPlusSquare } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Checkbox } from '@material-ui/core';

import React from 'react';
import InputColor from 'react-input-color';

const { dialog } = require('electron').remote;

interface Setting {
  key: string;
  name: string;
  value: string | string[] | boolean;
  type: string;
  hidden: boolean;
}

interface IProps {
  setting: Setting;
  setSetting: (setting: Setting) => void;
  removeSetting: (index: number) => void;
}

interface IState {
  //!
}

export default class SettingForm extends React.Component<IProps, IState> {
  constructor(props) {
    super(props);
    this.filePathInput = React.createRef();
  }

  arrayChange(index: number, value: string) {
    const obj = this.props.setting;
    obj.value[index] = value;
    this.props.setSetting(obj);
    this.forceUpdate();
  }

  removeArray(index: number) {
    const obj = this.props.setting;
    obj.value.splice(index, 1);
    this.props.setSetting(obj);
    this.forceUpdate();
  }

  addArray() {
    const obj = this.props.setting;
    obj.value.push('');
    this.props.setSetting(obj);
    this.forceUpdate();
  }

  textChange(value) {
    const obj = this.props.setting;
    obj.value = value;
    this.props.setSetting(obj);
    this.forceUpdate();
  }

  renderArrays() {
    return (
      <div className="commonSetting parent" style={{ display: 'grid' }}>
        <div>{this.props.setting.name}</div>
        {this.props.setting.value.map((value, index) => (
          <div key={index} className="setting array">
            <input
              className="settingTagInput arrays"
              type="input"
              key={index}
              value={value}
              onChange={(e) => {
                this.arrayChange(index, e.target.value);
              }}
            />
            <span
              className="removeFromArray cursorPointer"
              type="button"
              key={`button${index}`}
              onClick={() => {
                this.removeArray(index);
              }}
            >
              <FontAwesomeIcon
                className="fontAwesome modernButton"
                icon={faMinusSquare}
              />
            </span>
          </div>
        ))}
        <span
          type="button"
          className="addToArray cursorPointer"
          onClick={() => {
            this.addArray();
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

  renderCheckBox() {
    return (
      <form className="commonSetting parent checkbox">
        <div className="setting title">{this.props.setting.name}</div>
        <Checkbox
          style={{ width: '16px' }}
          className="fontAwesome modernButton"
          key={this.props.setting.name}
          checked={this.props.setting.value}
          onChange={(e) => this.textChange(e.target.checked)}
        />
      </form>
    );
  }

  renderTextField() {
    return (
      <form className="commonSetting parent">
        <div className="setting title">{this.props.setting.name}</div>
        <input
          className="settingTagInput "
          value={this.props.setting.value}
          onChange={(e) => this.textChange(e.target.value)}
        />
      </form>
    );
  }

  renderColor() {
    return (
      <form className="commonSetting parent">
        <div className="setting title">{this.props.setting.name}</div>

        <InputColor
          initialValue={this.props.setting.value}
          onChange={(e) => this.textChange(e.hex)}
          key={this.props.setting.name}
        />
      </form>
    );
  }

  renderFilePicker() {
    return (
      <div className="filePicker">
        <div className="setting title">{this.props.setting.name}</div>
        <input
          ref={this.filePathInput}
          className="settingTagInput"
          type="text"
          value={this.props.setting.value}
          onChange={(e) => this.textChange(e.target.value)}
        />
        <button
          type="button"
          onClick={async () => {
            try {
              const file = await dialog.showOpenDialog({
                defaultPath: this.filePathInput.current.value,
                properties: ['openDirectory'],
              });
              if (!file.canceled) {
                this.filePathInput.current.value = file.filePaths[0];
                this.textChange(file.filePaths[0]);
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
  }

  render() {
    if (
      this.props.setting.type === 'array' ||
      Array.isArray(this.props.setting.value)
    ) {
      return this.renderArrays();
    }
    if (
      this.props.setting.type === 'checkbox' ||
      typeof this.props.setting.value === 'boolean'
    ) {
      return this.renderCheckBox();
    }
    if (this.props.setting.type === 'filePicker') {
      return this.renderFilePicker();
    }
    if (this.props.setting.type === 'color') {
      return this.renderColor();
    }
    return this.renderTextField();
  }
}
