// eslint-disable-next-line no-use-before-define
import React, { RefObject } from 'react';

interface Props {
  show: boolean;
  shouldShow: (value: boolean) => void;
  image: string;
}

class FullscreenImage extends React.Component<Props> {
  reference: RefObject<HTMLDivElement>;

  constructor(props) {
    super(props);
    this.reference = React.createRef();
  }

  componentDidUpdate() {
    if (this.reference.current != null) {
      // this timeout might be a bad idea
      setTimeout(() => {
        this.reference.current.focus();
      }, 100);
    }
  }

  render() {
    return (
      <div
        ref={this.reference}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            this.props.shouldShow(false);
          }
        }}
        onClick={() => {
          this.props.shouldShow(false);
        }}
        className={`fullscreenDiv ${
          this.props.image !== undefined && this.props.show
            ? 'visible'
            : 'hidden'
        }`}
      >
        <img
          alt="Fullscreen"
          className="fullscreenImg"
          src={this.props.image}
        />
      </div>
    );
  }
}
export default FullscreenImage;
