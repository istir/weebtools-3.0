import React from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import { ButtonBaseProps } from '@material-ui/core';
// import '@material-ui/core/styles';
import { CSSTransition } from 'react-transition-group';
import DialogOwn from './Dialog';

interface IProps {
  show: boolean;
  close: () => void;
  context: (reason: boolean) => void;
  buttons: string[];
  title: string;
  message: string;
}
interface IState {
  maxWidth: 'normal' | 'medium' | 'big';
}
class ModalOwn extends React.Component<IProps, IState> {
  agreeBound: () => void;

  disagreeBound: () => void;

  buttons: ButtonBaseProps[] = [];

  buttonsHTML: React.ButtonHTMLAttributes<HTMLButtonElement>[] = [];

  constructor(props) {
    super(props);
    this.state = { maxWidth: 'big' };
    this.agreeBound = this.agree.bind(this);
    this.disagreeBound = this.disagree.bind(this);
  }

  componentDidUpdate(prevProps) {
    if (prevProps !== this.props) {
      this.buttonsHTML = [];
      for (let i = 0; i < this.props.buttons.length; i += 1) {
        if (i === 0) {
          this.buttonsHTML.unshift(
            this.createPrimaryButton(this.props.buttons[i])
          );
        } else {
          this.buttonsHTML.unshift(
            this.createSecondaryButton(this.props.buttons[i])
          );
        }
      }
    }
  }

  createPrimaryButton(text: string) {
    return (
      <button
        type="button"
        key={text}
        onClick={this.agreeBound}
        className="primary"
        // autoFocus
      >
        {text}
      </button>
    );
  }

  createSecondaryButton(text: string) {
    return (
      <button
        type="button"
        key={text}
        onClick={this.disagreeBound}
        className="secondary"
      >
        {text}
      </button>
    );
  }

  agree() {
    if (this.props.context != null) {
      this.props.context(true);
    }
    this.close();
  }

  disagree() {
    if (this.props.context != null) {
      this.props.context(false);
    }

    this.close();
  }

  close() {
    this.props.close();
  }

  render() {
    return (
      <CSSTransition
        in={this.props.show}
        timeout={200}
        classNames="fade"
        unmountOnExit
      >
        <div onClick={this.props.close} className="settingsBG dialog ">
          <div
            onClick={(e) => {
              e.stopPropagation();
            }}
            className={`dialog open parent moving cursorAuto scaleFade ${this.state.maxWidth}`}
          >
            <div className="dialog title text">{this.props.title}</div>
            <div className="dialog message text">{this.props.message}</div>
            {/* {console.log(this.buttonsHTML)} */}
            <div className="dialog buttons">
              {this.buttonsHTML.length > 0
                ? this.buttonsHTML
                : this.createPrimaryButton('OK')}
            </div>
          </div>
        </div>
      </CSSTransition>
    );
  }
}
export default ModalOwn;
