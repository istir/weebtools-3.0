import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faTimes } from '@fortawesome/free-solid-svg-icons';

class SearchButton extends React.Component {
  constructor(props) {
    super(props);
    this.input = React.createRef();
    this.button = React.createRef();
  }
  show() {}
  submit(e) {
    e.preventDefault();
    // console.log(e);
    var value = this.input.current.value;
    // if (value.length > 0) {
    //   console.log(value);
    this.props.setSearch(value);
    // }
    this.input.current.value = '';
    this.input.current.blur();
    this.button.current.blur();
  }
  //   componentDidUpdate(prevProps, prevState) {
  //     if (this.props.currentSearch != '') {
  //     }
  //   }
  render() {
    return (
      <div className="search element">
        <button
          onClick={this.show.bind(this)}
          className={`search icon ${
            this.props.currentSearch !== '' ? 'active' : ''
          }`}
        >
          <FontAwesomeIcon icon={faSearch} />
        </button>
        <div className={`search clear `}>
          <button
            ref={this.button}
            className={`icon ${
              this.props.currentSearch !== '' ? 'active' : ''
            }`}
            onClick={(e) => {
              // console.log(e);
              this.props.setSearch('');
              this.input.current.blur();
              this.button.current.blur();
            }}
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
        <form
          style={{ position: 'relative', zIndex: 10, borderRadius: 30 }}
          onSubmit={this.submit.bind(this)}
        >
          {' '}
          <input
            spellCheck="false"
            ref={this.input}
            className="searchInput"
            type="text"
          />
        </form>
      </div>
    );
  }
}
export default SearchButton;
