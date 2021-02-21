import {
  faMinusSquare,
  faPlusSquare,
  faWindowClose,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { Checkbox } from '@material-ui/core';

interface ITag {
  key: string;
  toReturn: string;
  fromSite: string[];
  folder: string;
  visible: boolean;
  checkFolder: boolean;
}
interface IProps {
  setting: ITag;
  setSetting: (setting: ITag, oldKey: string) => void;
  removeSetting: (index: number) => void;
}

interface IState {
  deleted: boolean;
}

export default class SettingTagsForm extends React.Component<IProps, IState> {
  constructor(props) {
    super(props);
    this.state = { deleted: false };
  }

  arrayChange(type: string, index: number, value: string) {
    const oldKey = this.props.setting.key;
    const obj = this.props.setting;
    obj[type][index] = value;
    this.props.setSetting(obj, oldKey);
    this.forceUpdate();
  }

  removeArray(type: string, index: number) {
    const obj = this.props.setting;
    obj[type].splice(index, 1);
    this.props.setSetting(obj);
    this.forceUpdate();
  }

  addArray(type: string) {
    const oldKey = this.props.setting.key;
    const obj = this.props.setting;
    obj[type].push('');
    this.props.setSetting(obj, oldKey);
    this.forceUpdate();
  }

  textChange(type: string, value: string | boolean) {
    const oldKey = this.props.setting.key;
    // oldKey = oldKey === undefined ? '' : oldKey;
    const obj = this.props.setting;
    obj[type] = value;
    // console.log(oldKey);
    this.props.setSetting(obj, oldKey);
    this.forceUpdate();
  }

  renderArrays(type: string, valueArr: string[]) {
    return (
      <div className="tagSettings parent" style={{ display: 'grid' }}>
        {valueArr.map((value, index) => (
          <div
            key={index}
            style={{
              width: '-webkit-fill-available',
              display: 'grid',
              gridTemplateColumns: 'auto min-content',
            }}
          >
            <input
              className="settingTagInput arrays tag"
              key={index}
              value={value}
              onChange={(e) => {
                this.arrayChange(type, index, e.target.value);
              }}
            />
            <span
              className="removeFromArray cursorPointer"
              type="button"
              key={`button${index}`}
              onClick={() => {
                this.removeArray(type, index);
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
          className="addToArray cursorPointer"
          type="button"
          onClick={() => {
            this.addArray(type);
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

  renderCheckBox(type: string, value: boolean) {
    return (
      <Checkbox
        style={{ width: '16px' }}
        className="fontAwesome modernButton"
        checked={value}
        onChange={(e) => this.textChange(type, e.target.checked)}
      />
    );
  }

  renderTextField(type: string, value: string) {
    return (
      <input
        className="settingTagInput "
        value={value}
        onChange={(e) => this.textChange(type, e.target.value)}
      />
    );
  }

  render() {
    if (this.state.deleted) {
      return '';
    }
    return (
      <div className="settings tags">
        <span
          className="removeTag cursorPointer"
          type="button"
          onClick={() => {
            this.props.removeTag(this.props.setting.key);
            this.setState({ deleted: true });
            this.forceUpdate();
          }}
        >
          <FontAwesomeIcon
            className="fontAwesome modernButton"
            icon={faWindowClose}
          />
        </span>
        <div>
          <div className="setting title">Key</div>
          {this.renderTextField('key', this.props.setting.key)}
        </div>
        <div>
          <div className="setting title">To Return</div>
          {this.renderTextField('toReturn', this.props.setting.toReturn)}
        </div>
        <div>
          <div className="setting title">From Site</div>
          {this.renderArrays('fromSite', this.props.setting.fromSite)}
        </div>
        <div>
          <div className="setting title">Folder</div>
          {this.renderTextField('folder', this.props.setting.folder)}
        </div>
        <div
          style={{ display: 'grid', gridTemplateColumns: 'auto min-content' }}
        >
          <div className="setting title">Visible</div>
          {this.renderCheckBox('visible', this.props.setting.visible)}
        </div>
        <div
          style={{ display: 'grid', gridTemplateColumns: 'auto min-content' }}
        >
          <div className="setting title">Check Folder</div>
          {this.renderCheckBox('checkFolder', this.props.setting.checkFolder)}
        </div>
      </div>
    );

    // if (
    //   this.props.setting.type === 'array' ||
    //   Array.isArray(this.props.setting.value)
    // ) {
    //   return this.renderArrays();
    // }
    // if (
    //   this.props.setting.type === 'checkbox' ||
    //   typeof this.props.setting.value === 'boolean'
    // ) {
    //   return this.renderCheckBox();
    // }
    // return this.renderTextField();
  }
}
