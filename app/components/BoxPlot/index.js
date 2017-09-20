import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { formatAsFloat } from '../../helpers';

export default class BoxPlot extends Component {

  static propTypes = {
    cName: PropTypes.string.isRequired,
    color: PropTypes.string.isRequired,
    groupHeight: PropTypes.object.isRequired,
    metrics: PropTypes.object.isRequired,
    values: PropTypes.array.isRequired,
    xScale: PropTypes.func.isRequired,
    yScale: PropTypes.func.isRequired,
  }

  constructor(props) {
    super(props);
    this.state = {
      showTooltip: false,
      mousePos: {
        x: 0,
        y: 0
      }
    };
  }

  handleOnMouseOver(e) {
    const { metrics, values } = this.props;
    let tooltip = document.createElement('div');
    tooltip.className = 'tooltip';
    tooltip.style.left = `${e.pageX + 20}px`;
    tooltip.style.top = `${e.pageY + 20}px`;
    tooltip.innerHTML = `
      Count: ${values.length} <br/>
      Max: ${formatAsFloat(metrics.max, 0.1)} <br/>
      Q3: ${formatAsFloat(metrics.quartile3, 0.1)} <br/>
      Median: ${formatAsFloat(metrics.median, 0.1)} <br/>
      Q1: ${formatAsFloat(metrics.quartile1, 0.1)} <br/>
      Min: ${formatAsFloat(metrics.min, 0.1)}
    `;
    document.body.appendChild(tooltip);
  }

  handleOnMouseMove(e) {
    let tooltip = document.getElementsByClassName('tooltip')[0];
    tooltip.style.left = `${e.pageX + 20}px`;
    tooltip.style.top = `${e.pageY + 20}px`;
  }

  handleOnMouseOut() {
    let body = document.body;
    let tooltip = document.getElementsByClassName('tooltip')[0];
    body.removeChild(tooltip);
  }

  render() {
    const { cName, color, groupHeight, metrics, xScale, yScale } = this.props;
    const bottomBound = yScale(cName) + groupHeight.bottom;
    const topBound = yScale(cName) + groupHeight.top;
    const middle = yScale(cName) + groupHeight.middle;


    let tempMetrics = {};
    Object.keys(metrics).map(key => {
      tempMetrics[key] = null;
      tempMetrics[key] = xScale(metrics[key]);
    });

    // render box
    return (
      <g
        className="boxPlot"
        onMouseOver={this.handleOnMouseOver.bind(this)}
        onMouseOut={this.handleOnMouseOut.bind(this)}
        onMouseMove={this.handleOnMouseMove.bind(this)}>
        <rect
          className="box"
          x={tempMetrics.quartile1}
          height={bottomBound - topBound}
          y={bottomBound}
          width={tempMetrics.quartile3 - tempMetrics.quartile1}
          rx={1}
          ry={1}
          style={{ fill: `${color}`, transform: `translateY(${-groupHeight.bottom + groupHeight.top}px)` }}
        />
        <line
          className="median"
          x1={tempMetrics.median}
          x2={tempMetrics.median}
          y1={topBound}
          y2={bottomBound}
        />
        <circle
          className="medianCircle"
          r={3}
          cy={middle}
          cx={tempMetrics.median}
        />
        <line
          className="upperWhiskerFence"
          x1={tempMetrics.upperInnerFence}
          x2={tempMetrics.upperInnerFence}
          y1={topBound}
          y2={bottomBound}
          style={{ stroke: `${color}` }}
        />
        <line
          className="upperWhiskerLine"
          x1={tempMetrics.quartile3}
          x2={tempMetrics.upperInnerFence}
          y1={middle}
          y2={middle}
          style={{ stroke: `${color}` }}
        />
        <line
          className="lowerWhiskerFence"
          x1={tempMetrics.lowerInnerFence}
          x2={tempMetrics.lowerInnerFence}
          y1={topBound}
          y2={bottomBound}
          style={{ stroke: `${color}` }}
        />
        <line
          className="lowerWhiskerLine"
          x1={tempMetrics.quartile1}
          x2={tempMetrics.lowerInnerFence}
          y1={middle}
          y2={middle}
          style={{ stroke: `${color}` }}
        />
      </g>
    );
  }
}
