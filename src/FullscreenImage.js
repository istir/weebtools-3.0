import React from 'react';
class FullscreenImage extends React.Component {
  constructor(props) {
    super(props);
    this.state = { show: false, manual: true, render: true };
  }
  componentDidUpdate() {
    // if (this.state.show != this.props.show && this.state.manual == true) {
    //   this.setState({ show: this.props.show });
    //   this.setState({ manual: false });
    // }
  }

  render() {
    // if (this.state.render === false) {
    //   return null;
    // }
    return this.props.show ? (
      <div
        onClick={() => {
          // this.setState({ show: false });
          //   currImage = '';
          // this.setState({ manual: false });
          // this.setState({ render: false });
          this.props.shouldShow(false);
        }}
        className={`fullscreenDiv ${
          this.props.image != '' ? 'visible' : 'hidden'
        }`}
      >
        <img
          className="fullscreenImg"
          // src={this.state.show ? this.props.image : ''}
          src={this.props.image}
        ></img>
      </div>
    ) : (
      ''
    );
  }
}
export default FullscreenImage;
