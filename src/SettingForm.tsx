import React from 'react';
import ConfigSettingForm from './ConfigSettingForm';
import SettingTagsForm from './TagsSettings';

interface ICommonSetting {
  key: string;
  name: string;
  value: string | string[] | boolean;
  type: string;
  hidden: boolean;
}
interface ITag {
  key: string;
  toReturn: string;
  fromSite: string[];
  folder: string;
  visible: boolean;
  checkFolder: boolean;
}
interface IProps {
  settings: ICommonSetting[] | ITag[];
  setSettings: (
    settings?: ICommonSetting[] | ITag[],
    setting?: ICommonSetting | ITag
  ) => void;
  getUpdatedSettings: () => void; // ? should it return a value?
}

interface IState {
  forms: JSX.Element[];
}

export default class SettingForm extends React.Component<IProps, IState> {
  constructor(props) {
    super(props);
    //
    this.state = { forms: [] };
  }

  // componentDidUpdate(prevProps, prevState) {
  //   if (prevProps != this.props) {
  //     ;
  //     if (!this.props.settings) return;

  //     if (this.props.settings.findIndex((el) => el.fromSite) > 0)
  //       this.updateTags();
  //   }
  // }

  componentDidMount() {
    if (!this.props.settings) return;

    if (this.props.settings.findIndex((el) => el.fromSite) < 0)
      this.updateCommonSettings();
    else this.updateTags();
  }

  setTag(setting: ICommonSetting, oldKey: string) {
    this.props.setSettings(undefined, setting, oldKey);
  }

  setSetting(setting: ICommonSetting) {
    this.props.setSettings(undefined, setting);
  }

  removeSetting(index: number) {
    const obj = this.props.settings;
    obj.splice(index, 1);
    this.props.setSettings(obj);
  }

  removeTag2(index: number) {
    const obj = this.state.forms;
    obj.splice(index, 1);
    this.setState({ forms: obj });
    this.forceUpdate();
  }

  updateTags() {
    const test = this.state.forms;
    test.push(
      <button
        key="BUTTON"
        type="button"
        className="settings tags button"
        onClick={() => {
          // const tags = this.props.settings;

          const blank: ITag = {
            key: '',
            toReturn: '',
            fromSite: [''],
            folder: '',
            visible: true,
            checkFolder: true,
          };
          const tags = [];
          this.props.settings.map((val) => {
            if (val !== null) tags.push(val);
          });

          if (tags.findIndex((el) => el.key === '') < 0) {
            tags.push(blank);
            // this.setSetting(tags);
            this.props.setSettings(tags);
            // ;
            // this.setState({ forms: [] });
            const tempForms = this.state.forms;
            tempForms.push(
              <SettingTagsForm
                key={Date.now()}
                setting={blank}
                setSetting={this.setTag.bind(this)}
                removeSetting={this.removeSetting.bind(this)}
                removeTag={this.props.removeTag}
                removeTag2={this.removeTag2.bind(this)}
                index={this.props.settings.length - 1}
              />
            );
            // this.updateTags();
            // this.setState({ settings: tags });
            this.forceUpdate();
          }
        }}
      >
        Add Tag
      </button>
    );
    this.setState({ forms: test });
    // this.setState({ forms: [] });
    for (let i = 0; i < this.props.settings.length; i += 1) {}
    this.props.settings.map((value, index) => {
      this.setState(function (prevState) {
        const currentForms = prevState.forms;
        const setting: ITag = {
          key: value.key,
          toReturn: value.toReturn,
          fromSite: value.fromSite,
          folder: value.folder,
          visible: value.visible,
          checkFolder: value.checkFolder,
        };
        currentForms.push(
          <SettingTagsForm
            key={value.key + Date.now()}
            setting={setting}
            setSetting={this.setTag.bind(this)}
            removeSetting={this.removeSetting.bind(this)}
            removeTag={this.props.removeTag}
            removeTag2={this.removeTag2.bind(this)}
            index={index}
          />
        );
        return { forms: currentForms };
      });
    });
  }

  updateCommonSettings() {
    this.props.settings.map((value) => {
      this.setState(function (prevState) {
        const currentForms = prevState.forms;
        const setting: ICommonSetting = {
          key: value.key,
          name: value.name,
          value: value.value,
          type: value.type,
          hidden: value.hidden,
        };
        currentForms.push(
          <ConfigSettingForm
            key={value.key}
            setting={setting}
            setSetting={this.setSetting.bind(this)}
            removeSetting={this.removeSetting.bind(this)}
          />
        );

        return { forms: currentForms };
      });
    });
  }

  render() {
    return (
      <div
        className={`settings parent ${
          this.props.settings &&
          this.props.settings.findIndex((el) => el.fromSite) < 0
            ? 'common'
            : 'tags'
        }`}
      >
        {this.state.forms}
      </div>
    );
  }
}
