import React, { Component } from 'react';
import PropTypes from 'prop-types';
import d3 from 'd3';
import _ from 'lodash';
import SVGWithMargin from '../SVGWithMargin';
import ViolinPlot from '../ViolinPlot';
import BoxPlot from '../BoxPlot';
import { formatAsFloat } from '../../helpers';

function calculateGroupWidth(boxWidth, xScale) {
  // use the boxWidth size (as percentage of possible width) and calculate the actual pixel width to use
  let boxSize = { left: null, right: null, middle: null };
  const width = xScale.rangeBand() * (boxWidth / 100);
  const padding = (xScale.rangeBand() - width) / 2;
  boxSize.middle = xScale.rangeBand() / 2;
  boxSize.left = padding;
  boxSize.right = boxSize.left + width;
  return boxSize;
}

class BoxAndViolinChart extends Component {

  static propTypes = {
    data: PropTypes.object.isRequired,
    height: PropTypes.number,
    margin: PropTypes.object,
    width: PropTypes.number, // optional because responsiveness
    yValue: PropTypes.string.isRequired,
  }

  static defaultProps = {
    height: 600,
    margin: { top: 60, right: 60, bottom: 60, left: 60 },
    width: 3000,
  }

  constructor(props) {
    super(props);
    this.state = {
      showViolinPlot: false
    };
  }

  handleShowViolinBtnClick() {
    let currentState = this.state.showViolinPlot;
    this.setState({
      showViolinPlot: !currentState
    });
  }

  render() {
    const { data, yValue, height, width, margin } = this.props;
    const colorFunc = d3.scale.category20();
    // axes labels:
    const yLabel = yValue;
    const yFormatter = formatAsFloat;

    const imposedMax = 2000;
    const trueMax = d3.max(_.map(data.rawData, d => +d[yValue]));
    let max = imposedMax > trueMax ? trueMax : imposedMax;
    const domain = [0, max]; // coerce to number value e.g. 5 instead of string "5"
    const yScale = d3.scale.linear()
                   .domain(domain)
                   .range([height, 0])
                   .clamp(true);
    const xScale = d3.scale.ordinal().domain(Object.keys(data.groupObjs)).rangeBands([0, width]);

    // build axes
    const xAxis = d3.svg.axis().scale(xScale).orient('bottom').tickSize(5);
    const yAxis = d3.svg.axis()
                .scale(yScale)
                .orient('left')
                .tickFormat(yFormatter)
                .outerTickSize(0)
                .innerTickSize(-width + (margin.right + margin.left));
    return (
      <div style={{ height: `${height + margin.top + margin.bottom}px`, width: `${width + margin.left + margin.right}px`, marginTop: '10px' }}>
        <button className="btn btn-default" onClick={this.handleShowViolinBtnClick.bind(this)}>Show/Hide Violin Plot</button>
        <SVGWithMargin
          className="svgContainer"
          contentContainerBackgroundRectClassName="contentContainerBackgroundRect"
          contentContainerGroupClassName="svgContentContainer"
          height={height}
          margin={margin}
          width={width}>
          {/* Draw Axes, ticks and labels */}
          <g
            className="xAxis"
            ref={node => d3.select(node).call(xAxis)}
            style={{
              transform: `translateY(${height}px)`,
            }}
          />
          <g className="yAxis" ref={node => d3.select(node).call(yAxis)}>
            <text className="axisLabel" textAnchor="end" y={6} dy={'-4em'} transform="rotate(-90)">{yLabel}</text>
          </g>
          {Object.keys(data.groupObjs).map(cName => {
            const values = data.groupObjs[cName].values;
            const metrics = data.groupObjs[cName].metrics;

            return (
              <g className="violinBoxGroup" key={cName}>

                {this.state.showViolinPlot &&
                  <ViolinPlot
                    cName={cName}
                    values={values}
                    xScale={xScale}
                    yScale={yScale}
                    imposedMax={max}
                    groupWidth={calculateGroupWidth(100, xScale)}
                    color="#b5b5b5"
                  />
                }

                {/* Draw box plots */}
                <BoxPlot
                  cName={cName}
                  values={values}
                  metrics={metrics}
                  xScale={xScale}
                  yScale={yScale}
                  groupWidth={calculateGroupWidth(30, xScale)}
                  color={colorFunc(cName)}
                  xLabel={yValue}
                />
              </g>
            );

          })}

        </SVGWithMargin>
      </div>
    );
  }

}

export default BoxAndViolinChart;
