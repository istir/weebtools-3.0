import React from 'react';

class ProgressBar extends React.Component {
  constructor(props) {
    super(props);

    // this.state = {
    //   maxWidth: 200,
    //   currWidth: 200,
    // };
    this.state = { currWidth: 0 };
  }

  //   componentDidUpdate() {
  //   componentDidUpdate(prevProps, prevState) {
  //     let curr = Math.round((this.props.maxWidth * this.props.percentage) / 100);
  //     if (this.props.percentage == 100) {
  //       //   console.log('full');
  //       //   this.timerID = setTimeout(() => {
  //       //     this.setState({ currWidth: 0 });
  //       //   }, 5000);
  //     }
  //     // console.log(this.props.percentage + ' ' + this.state.currWidth);
  //     if (prevState.currWidth != curr && !this.props.shouldStop) {
  //       //   if (this.timerID) {
  //       //     clearInterval(this.timerID);
  //       //   }
  //       //   console.log(this.props.percentage);
  //       this.setState({ currWidth: curr });
  //       //   this.forceUpdate();
  //     }
  //   }
  render() {
    return (
      <div className="progress parent">
        <div
          style={{
            width: (this.props.shouldStop ? 0 : this.props.percentage) + '%',
          }}
          className="progress value"
        ></div>
        <div
          style={{
            opacity: `${
              this.props.percentage > 0 && !this.props.shouldStop ? '1' : 0
            }`,
          }}
          className="progress textbox"
        >
          {this.props.percentage + '%'}
        </div>
      </div>
    );
  }
}
export default ProgressBar;
