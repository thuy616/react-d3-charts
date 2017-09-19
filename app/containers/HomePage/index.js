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
import BoxAndViolinChart from '../../components/BoxAndViolinChart';
import HistogramChart from '../../components/HistogramChart';
import { prepareData } from '../../helpers';

export default class HomePage extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function

  constructor(props) {
    super(props);
    this.state = {
      data: null,
      selectedAppID: null,
    };
  }

  handleFileSelect(e) {
    const file = e.target.files[0];
    Papa.parse(file, {
      delimiter: '\t',
      header: true,
      complete: results => {
        const raw = results.data;
        const data = prepareData(raw, 'appID', 'meanSendingRateKbps');
        this.setState({
          data: data,
          selectedAppID: Object.keys(data.groupObjs)[0]
        });
      }
    });
  }

  handleAppIDChange(e) {
    this.setState({
      selectedAppID: e.target.value
    });
  }

  render() {

    return (
      <div>
        <h1>
          <FormattedMessage {...messages.header} />
        </h1>
        <div>
          <label className="btn btn-primary">
            Load CSV <input style={{display: 'none'}} type="file" name="files" onChange={this.handleFileSelect.bind(this)} />
          </label>
        </div>
        {this.state.data && (
          <div className="outerContainer">

            <div className="innerContainer">
              <form>
                <div className="form-group">
                  <label>Select AppID :</label>
                  <select className="form-control" onChange={this.handleAppIDChange.bind(this)}>
                    {Object.keys(this.state.data.groupObjs).map(appID => (<option key={appID}>{appID}</option>))}
                  </select>
                </div>
              </form>
              <div>
                {/* Histogram Chart */}
                <HistogramChart
                  values={this.state.data.groupObjs[this.state.selectedAppID].values}
                  metrics={this.state.data.groupObjs[this.state.selectedAppID].metrics}
                  xLabel="meanSendingRateKbps"
                />

              </div>
            </div>

            <div className="innerContainer">
              <BoxAndViolinChart
                data={this.state.data}
                xGroup="appID"
                yValue="meanSendingRateKbps"
              />
            </div>

          </div>
        )}
      </div>
    );
  }
}
