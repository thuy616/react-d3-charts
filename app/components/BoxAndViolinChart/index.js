import React, { Component } from 'react';
import PropTypes from 'prop-types';
import d3 from 'd3';
import _ from 'lodash';
import SVGWithMargin from '../SVGWithMargin';
import ViolinPlot from '../ViolinPlot';
import BoxPlot from '../BoxPlot';
import { formatAsFloat } from '../../helpers';

function calculateGroupHeight(boxHeight, yScale) {
  // use the boxWidth size (as percentage of possible width) and calculate the actual pixel width to use
  let boxSize = { top: null, bottom: null, middle: null };
  const height = yScale.rangeBand() * (boxHeight / 100);
  const padding = (yScale.rangeBand() - height) / 2;
  boxSize.middle = yScale.rangeBand() / 2;
  boxSize.top = padding;
  boxSize.bottom = boxSize.top + height;
  return boxSize;
}

class BoxAndViolinChart extends Component {

  static propTypes = {
    data: PropTypes.object.isRequired,
    height: PropTypes.number,
    margin: PropTypes.object,
    valueName: PropTypes.string.isRequired,
    width: PropTypes.number, // optional because responsiveness
  }

  static defaultProps = {
    height: 3000,
    margin: { top: 60, right: 60, bottom: 60, left: 60 },
    width: 800,
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
    const { data, valueName, height, width, margin } = this.props;
    const colorFunc = d3.scale.category20();
    // axes labels:
    const xLabel = valueName;
    const yFormatter = formatAsFloat;

    const imposedMax = 1800;
    const trueMax = d3.max(_.map(data.rawData, d => +d[valueName]));
    let max = imposedMax > trueMax ? trueMax : imposedMax;
    const domain = [0, max]; // coerce to number value e.g. 5 instead of string "5"
    const xScale = d3.scale.linear()
                   .domain(domain)
                   .range([0, width])
                   .clamp(true);
    const yScale = d3.scale.ordinal().domain(Object.keys(data.groupObjs)).rangeBands([0, height]);

    // build axes
    const yAxis = d3.svg.axis().scale(xScale).orient('top').tickSize(5);
    const xAxis = d3.svg.axis()
                .scale(yScale)
                .orient('left')
                .tickFormat(yFormatter)
                .outerTickSize(0)
                .innerTickSize(-height + (margin.top + margin.bottom));
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
            ref={node => d3.select(node).call(xAxis)}>
            <text className="axisLabel" textAnchor="middle" x={width / 2} y={0} dy={'-4em'} style={{transform: 'rotate(0deg)'}}>{xLabel}</text>
          </g>
          <g className="yAxis" ref={node => d3.select(node).call(yAxis)} />

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
                    groupHeight={calculateGroupHeight(90, yScale)}
                    color="#808080"
                  />
                }
                <BoxPlot
                  cName={cName}
                  values={values}
                  metrics={metrics}
                  xScale={xScale}
                  yScale={yScale}
                  groupHeight={calculateGroupHeight(30, yScale)}
                  color={colorFunc(cName)}
                  yLabel={valueName}
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
