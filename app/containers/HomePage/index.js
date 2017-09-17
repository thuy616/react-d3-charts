/*
 * HomePage
 *
 * This is the first thing users see of our App, at the '/' route
 *
 * NOTE: while this component should technically be a stateless functional
 * component (SFC), hot reloading does not currently support SFCs. If hot
 * reloading is not a necessity for you then you can refactor it and remove
 * the linting exception.
 */

import React from 'react';
import { FormattedMessage } from 'react-intl';
import messages from './messages';
import Papa from 'papaparse';
import Dropzone from 'react-dropzone';

export default class HomePage extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function

  constructor(props) {
    super(props);
    this.state = {
      data: null
    };
  }

  handleFileSelect(evt) {
    console.log('handleFileSelect');
    const file = evt.target.files[0];
    Papa.parse(file, {
      delimiter: "\t",
      header: true,
      complete: (results, file) => {
        console.log('parsing complete:', results);
        this.setState({
          data: results
        });
      }
    });
  }

  render() {
    return (
      <div>
        <h1>
          <FormattedMessage {...messages.header} />
        </h1>
        <div>
          <button className="btn btn-primary">Click Me!</button>
        </div>
        <div>
          <input type="file" name="files" onChange={this.handleFileSelect.bind(this)}/>
        </div>
      </div>
    );
  }
}
