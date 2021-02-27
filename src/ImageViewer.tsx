import React from 'react';

interface IProps {
  visible: boolean;
  src: string;
  setVisibility: (visible: boolean) => void;
}

interface IState {
  currentScale: number;
  moveStart: { x: number; y: number };
  moveBy: { x: number; y: number };
  currentTransform: { x: number; y: number };
  moving: boolean;
  zoomToFit: boolean;
}
export default class ImageViewer extends React.Component<IProps, IState> {
  imageRef: React.RefObject<HTMLImageElement>;

  constructor(props: IProps) {
    super(props);
    //
    this.imageRef = React.createRef();
    this.state = {
      currentScale: 1,
      moveStart: { x: 0, y: 0 },
      moveBy: { x: 0, y: 0 },
      currentTransform: { x: 0, y: 0 },
      moving: false,
      zoomToFit: false,
    };
  }

  componentDidUpdate() {
    // console.log(this.props.src);
    setTimeout(() => {
      this.imageRef.current?.focus();
    }, 100);
  }

  hide() {
    this.props.setVisibility(false);
    this.setState({
      currentScale: 1,
      currentTransform: { x: 0, y: 0 },
      moveBy: { x: 0, y: 0 },
      moveStart: { x: 0, y: 0 },
    });
  }

  actualSize() {
    this.setState({
      currentScale: 1,
      currentTransform: { x: 0, y: 0 },
      moveBy: { x: 0, y: 0 },
      moveStart: { x: 0, y: 0 },
    });
  }

  zoomToFit() {
    if (this.state.zoomToFit) {
      this.setState({
        currentScale: 1,
      });
    }

    this.setState({ zoomToFit: !this.state.zoomToFit });
  }

  zoom(e: any) {
    function changeScaleState(currentZoom: number, zoom: number) {
      let zoom1 = zoom;
      if (currentZoom < 1) {
        zoom1 = zoom / 2;
      }
      const newZoom = currentZoom + zoom1;
      if (newZoom > 0.1 && newZoom <= 3) {
        return newZoom;
      }
      return currentZoom;
    }

    if (e.deltaY > 0) {
      this.setState(function (prevState) {
        return { currentScale: changeScaleState(prevState.currentScale, -0.1) };
      });
    } else if (e.deltaY < 0) {
      this.setState(function (prevState) {
        return { currentScale: changeScaleState(prevState.currentScale, 0.1) };
      });
    }
  }

  render() {
    return (
      <div
        role="button"
        tabIndex={-1}
        onKeyDown={() => {
          // if (!this.state.moving) {
          //   // e.preventDefault();
          //   this.hide();
          // } else {
          //   this.setState({ moving: false });
          // }
        }}
        onClick={() => {
          if (!this.state.moving) {
            // e.preventDefault();
            this.hide();
          } else {
            this.setState({ moving: false });
          }
        }}
        onMouseDown={(e) => {
          if (e.button === 0 || 1) {
            this.imageRef.current?.classList.add('dragging');
            this.setState({ moveStart: { x: e.clientX, y: e.clientY } });
          }

          e.preventDefault();
        }}
        onMouseUp={(e) => {
          if (e.button === 0 || 1) {
            this.imageRef.current?.classList.remove('dragging');
            this.setState({
              currentTransform: {
                x: this.state.moveBy.x,
                y: this.state.moveBy.y,
              },
            });
          }
        }}
        onWheel={(e) => {
          this.setState({ zoomToFit: false });
          this.zoom(e);
        }}
        onMouseLeave={(e) => {
          this.imageRef.current?.classList.remove('dragging');
          this.setState({
            currentTransform: {
              x: this.state.moveBy.x,
              y: this.state.moveBy.y,
            },
          });
        }}
        onMouseMove={(e) => {
          if (this.imageRef.current?.classList.contains('dragging')) {
            const scale = 1;
            if (!this.state.moving) {
              this.setState({ moving: true });
            }
            this.setState({
              moveBy: {
                x:
                  (this.state.currentTransform.x +
                    e.clientX -
                    this.state.moveStart.x) *
                  scale,
                y:
                  (this.state.currentTransform.y +
                    e.clientY -
                    this.state.moveStart.y) *
                  scale,
              },
            });
          }
        }}
        className={`image parent ${
          this.props.src === undefined || !this.props.visible
            ? 'hidden'
            : 'shown'
        }`}
      >
        <div
          onClick={this.hide.bind(this)}
          className="overlay scale"
        >{`${Math.round(this.state.currentScale * 100)}%`}</div>
        <div
          className="imageParent"
          style={{
            transform: `translate(${this.state.moveBy.x}px, ${this.state.moveBy.y}px)`,
          }}
        >
          <img
            onKeyDown={(e) => {
              if (e.code === 'Escape') {
                this.hide();
              }
              if (e.code === 'Space') {
                // this.zoomToFit();
                this.actualSize();
              }
              if (e.key === 'f') {
              }
              //   ;
              e.preventDefault();
              // TODO:somehow add space/esc/f keys
            }}
            tabIndex={0}
            draggable={false}
            alt="Fullscreen"
            style={{
              width: `${this.state.zoomToFit ? '100vw' : 'min-content'}`,
              height: `${this.state.zoomToFit ? '100vh' : 'min-content'}`,
              transform: `scale(${this.state.currentScale})`,
            }}
            ref={this.imageRef}
            src={this.props.src}
          />
        </div>
      </div>
    );
  }
}
