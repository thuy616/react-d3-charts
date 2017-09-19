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
import HorizonalBarChart from '../../components/HorizonalBarChart';
import { prepareData } from '../../helpers';
import ChartWrapper from '../../components/ChartWrapper';
import H2 from '../../components/H2';
import H3 from '../../components/H3';


export default class HomePage extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function

  constructor(props) {
    super(props);
    this.state = {
      data: null,
      selectedAppID: null,
      selectedBuildKey: null,
      preparingData: false,
      error: null
    };
  }

  handleFileSelect(e) {
    this.setState({
      preparingData: true
    });
    const file = e.target.files[0];
    Papa.parse(file, {
      delimiter: '\t',
      header: true,
      complete: results => {
        const raw = results.data;
        const data = prepareData(raw, 'appID', 'meanSendingRateKbps');
        if (Object.keys(data.groupObjs).length > 0 && Object.keys(data.builds).length > 0) {
          this.setState({
            data: data,
            preparingData: false,
            selectedAppID: Object.keys(data.groupObjs)[0],
            selectedBuildKey: Object.keys(data.builds)[0],
            error: null
          });
        } else {
          this.setState({
            preparingData: false,
            error: 'Invalid CSV',
            data: null,
            selectedAppID: null,
            selectedBuildKey: null
          })
        }

      }
    });
  }

  handleAppIDChange(e) {
    this.setState({
      selectedAppID: e.target.value
    });
  }

  handleBuildKeyChange(e) {
    this.setState({
      selectedBuildKey: e.target.value
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
        {this.state.preparingData === true && (
          <div className="ball-pulse">
            <div>{null}</div>
            <div>{null}</div>
            <div>{null}</div>
          </div>
        )}
        {this.state.error && (
          <div className="alert alert-danger"><strong>Error!</strong> {this.state.error}</div>
        )}
        {this.state.data && (
          <div className="outer-container">
            <div className="inner-container">
              <H2>Group by appID</H2>
              <form>
                <div className="form-group">
                  <label>Select AppID :</label>
                  <select className="form-control select-appID" onChange={this.handleAppIDChange.bind(this)}>
                    {Object.keys(this.state.data.groupObjs).map(appID => (<option key={appID}>{appID}</option>))}
                  </select>
                </div>
              </form>
              <ChartWrapper>
                <H3>Distribution of "meanSendingRateKbps"</H3>
                <HistogramChart
                  values={this.state.data.groupObjs[this.state.selectedAppID].values}
                  metrics={this.state.data.groupObjs[this.state.selectedAppID].metrics}
                  xLabel="meanSendingRateKbps"
                  imposedMax={2000}
                />
              </ChartWrapper>
              <ChartWrapper>
                <H3>Distribution of "mediaTypes"</H3>
                <HorizonalBarChart
                  data={this.state.data.groupObjs[this.state.selectedAppID].mediaTypes}
                  xLabel="count"
                  yLabel="mediaType"
                />
              </ChartWrapper>
              <ChartWrapper>
                <H3>Distribution of all appIDs</H3>
                <BoxAndViolinChart
                  data={this.state.data}
                  xGroup="appID"
                  yValue="meanSendingRateKbps"
                />
              </ChartWrapper>
            </div>

            <div className="inner-container">
              <H2>Group by (buildName,buildVer)</H2>
              <form>
                <div className="form-group">
                  <label>Select (buildName,buildVer):</label>
                  <select className="form-control select-appID" onChange={this.handleBuildKeyChange.bind(this)}>
                    {Object.keys(this.state.data.builds).map(buildKey => <option key={buildKey}>{buildKey}</option>)}
                  </select>
                </div>
              </form>
              <ChartWrapper>
                {/* HistogramChart */}
                <H3>Distribution of "meanSendingRateKbps"</H3>
                <HistogramChart
                  values={this.state.data.builds[this.state.selectedBuildKey].values}
                  metrics={this.state.data.builds[this.state.selectedBuildKey].metrics}
                  xLabel="meanSendingRateKbps"
                  imposedMax={2000}
                />
              </ChartWrapper>
            </div>
          </div>
        )}
      </div>
    );
  }
}
