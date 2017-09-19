import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { formatAsFloat } from '../../helpers';

export default class BoxPlot extends Component {

  static propTypes = {
    cName: PropTypes.string.isRequired,
    color: PropTypes.string.isRequired,
    groupWidth: PropTypes.object.isRequired,
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
    const { cName, color, groupWidth, metrics, xScale, yScale } = this.props;
    const leftBound = xScale(cName) + groupWidth.left;
    const rightBound = xScale(cName) + groupWidth.right;
    const middle = xScale(cName) + groupWidth.middle;

    let tempMetrics = {};
    Object.keys(metrics).map(key => {
      tempMetrics[key] = null;
      tempMetrics[key] = yScale(metrics[key]);
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
          x={leftBound}
          width={rightBound - leftBound}
          y={tempMetrics.quartile3}
          height={-tempMetrics.quartile3 + tempMetrics.quartile1}
          rx={1}
          ry={1}
          style={{ fill: `${color}` }}
        />
        <line
          className="median"
          x1={leftBound}
          x2={rightBound}
          y1={tempMetrics.median}
          y2={tempMetrics.median}
        />
        <circle
          className="medianCircle"
          r={3}
          cx={middle}
          cy={tempMetrics.median}
        />
        <line
          className="upperWhiskerFence"
          x1={leftBound}
          x2={rightBound}
          y1={tempMetrics.upperInnerFence}
          y2={tempMetrics.upperInnerFence}
          style={{ stroke: `${color}` }}
        />
        <line
          className="upperWhiskerLine"
          x1={middle}
          x2={middle}
          y1={tempMetrics.quartile3}
          y2={tempMetrics.upperInnerFence}
          style={{ stroke: `${color}` }}
        />
        <line
          className="lowerWhiskerFence"
          x1={leftBound}
          x2={rightBound}
          y1={tempMetrics.lowerInnerFence}
          y2={tempMetrics.lowerInnerFence}
          style={{ stroke: `${color}` }}
        />
        <line
          className="lowerWhiskerLine"
          x1={middle}
          x2={middle}
          y1={tempMetrics.quartile1}
          y2={tempMetrics.lowerInnerFence}
          style={{ stroke: `${color}` }}
        />
      </g>
    );
  }
}
