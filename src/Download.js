import { React } from 'react';

class Download extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return <div>{this.props.url}</div>;
  }
}
export default Download;
