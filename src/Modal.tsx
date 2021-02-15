import React from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import { ButtonBaseProps } from '@material-ui/core';
// import '@material-ui/core/styles';

interface IProps {
  show: boolean;
  close: () => void;
  context: (reason: boolean) => void;
  buttons: string[];
  title: string;
  message: string;
}
interface IState {
  agreeingButton: number;
}
class ModalOwn extends React.Component<IProps, IState> {
  agreeBound: () => void;

  disagreeBound: () => void;

  buttons: ButtonBaseProps[] = [];

  constructor(props) {
    super(props);
    // console.log(props);
    this.state = { agreeingButton: 0 };
    this.agreeBound = this.agree.bind(this);
    this.disagreeBound = this.disagree.bind(this);
  }

  componentDidUpdate(prevProps, prevState) {
    // console.log(this.props.context);
    if (prevProps.buttons !== this.props.buttons) {
      this.buttons = [];
      for (let i = 0; i < this.props.buttons.length; i += 1) {
        if (i === 0) {
          this.buttons.unshift(
            <Button
              key={this.props.buttons[i]}
              onClick={this.agreeBound}
              color="primary"
              autoFocus
            >
              {this.props.buttons[i]}
            </Button>
          );
        } else {
          this.buttons.unshift(
            <Button
              key={this.props.buttons[i]}
              onClick={this.disagreeBound}
              color="secondary"
            >
              {this.props.buttons[i]}
            </Button>
          );
        }
      }
    }
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
    // this.setState({ open: false });
    this.props.close();
  }

  render() {
    return (
      <div>
        <Dialog
          maxWidth="md"
          open={this.props.show}
          onClose={this.disagreeBound}
        >
          <DialogTitle id="alert-dialog-title">{this.props.title}</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              {this.props.message}
            </DialogContentText>
          </DialogContent>
          <DialogActions>{this.buttons}</DialogActions>
        </Dialog>
      </div>
    );
  }
}
export default ModalOwn;
