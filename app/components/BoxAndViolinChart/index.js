import React, { Component } from 'react';
import PropTypes from 'prop-types';
import d3 from 'd3';
import _ from 'lodash';
import SVGWithMargin from '../SVGWithMargin';
import ViolinPlot from '../ViolinPlot';
import BoxPlot from '../BoxPlot';


/**
* helper functions
*/
function formatAsFloat(d) {
  if (d % 1 !== 0) {
    return d3.format('.2f')(d);
  }
  return d3.format('.0f')(d);
}

// values is sorted
function calculateMetrics(values) {
  const metrics = {
    max: d3.max(values),
    quartile3: d3.quantile(values, 0.75),
    median: d3.median(values),
    mean: d3.mean(values),
    quartile1: d3.quantile(values, 0.25),
    min: d3.min(values),
    upperOuterFence: null,
    upperInnerFence: null,
    lowerInnterFence: null,
    lowerOuterFence: null,
    iqr: null,
  };

  metrics.iqr = metrics.quartile3 - metrics.quartile1;
  // the inner fences are the closest value to the IQR without going past it (assumes sorted lists)
  const LIF = metrics.quartile1 - (1.5 * metrics.iqr);
  const UIF = metrics.quartile3 + (1.5 * metrics.iqr);
  for (let i = 0; i <= values.length; i += 1) {
    if (values[i] < LIF) {
      continue;
    }
    if (!metrics.lowerInnerFence && values[i] >= LIF) {
      metrics.lowerInnerFence = values[i];
      continue;
    }
    if (values[i] > UIF) {
      metrics.upperInnerFence = values[i - 1];
      break;
    }
  }

  metrics.lowerOuterFence = metrics.quartile1 - (3 * metrics.iqr);
  metrics.upperOuterFence = metrics.quartile3 + (3 * metrics.iqr);
  if (!metrics.lowerInnerFence) {
    metrics.lowerInnerFence = metrics.min;
  }
  if (!metrics.upperInnerFence) {
    metrics.upperInnerFence = metrics.max;
  }
  return metrics;
}

function prepareData(chart) {
  let currentX;
  let currentY;

  // Group the values using xGroup
  chart.data.map(entry => {
    currentX = entry[chart.xGroup]; // which is appID in this particular chart
    currentY = entry[chart.yValue]; // which is meanSendingRateKbps
    // ignore conversation that cannot be measured
    if (currentY !== '') {
      if (chart.groupObjs.hasOwnProperty(currentX)) {
        // coerced to number with "+"
        chart.groupObjs[currentX].values.push(+currentY);
      } else {
        chart.groupObjs[currentX] = {};
        chart.groupObjs[currentX].values = [+currentY];
      }
    }
  });

  // remove appID with less than 20 measurements
  chart.groupObjs = _.pickBy(chart.groupObjs, group => group.values.length >= 20);

  Object.keys(chart.groupObjs).map(cName => {
    chart.groupObjs[cName].values.sort(d3.ascending);
    chart.groupObjs[cName].metrics = {};
    chart.groupObjs[cName].metrics = calculateMetrics(chart.groupObjs[cName].values);
  });
}

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
    dataset: PropTypes.array.isRequired,
    height: PropTypes.number,
    margin: PropTypes.object,
    width: PropTypes.number, // optional because responsiveness
    xGroup: PropTypes.string.isRequired,
    yValue: PropTypes.string.isRequired,
  }

  static defaultProps = {
    height: 600,
    margin: { top: 60, right: 60, bottom: 60, left: 60 },
    width: 3000,
  }

  render() {
    const { dataset, xGroup, yValue, height, width, margin } = this.props;
    let chart = {};
    const colorFunc = d3.scale.category20();
    // axes labels:
    const yLabel = yValue;


    // const trueWidth = width - (margin.left + margin.riight);
    // const trueHeight = height - (margin.top + margin.bottom);

    chart.yFormatter = formatAsFloat;
    chart.data = dataset;

    chart.xGroup = xGroup;
    chart.yValue = yValue;
    chart.groupObjs = {};
    chart.objs = {mainDiv: null, chartDiv: null, g: null, xAxis: null, yAxis: null};
    prepareData(chart);

    const imposedMax = 2000;
    const trueMax = d3.max(_.map(chart.data, d => +d[yValue]));
    let max = imposedMax > trueMax ? trueMax : imposedMax;
    const domain = [0, max]; // coerce to number value e.g. 5 instead of string "5"
    const yScale = d3.scale.linear()
                   .domain(domain)
                   .range([height, 0])
                   .clamp(true);
    const xScale = d3.scale.ordinal().domain(Object.keys(chart.groupObjs)).rangeBands([0, width]);

    // build axes
    const xAxis = d3.svg.axis().scale(xScale).orient('bottom').tickSize(5);
    const yAxis = d3.svg.axis()
                .scale(yScale)
                .orient('left')
                .tickFormat(chart.yFormatter)
                .outerTickSize(0)
                .innerTickSize(-width + (margin.right + margin.left));
    return (
      <div style={{ height: `${height + margin.top + margin.bottom}px`, width: `${width + margin.left + margin.right}px`, marginTop: '10px' }}>
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
          {Object.keys(chart.groupObjs).map(cName => {
            const values = chart.groupObjs[cName].values;
            const metrics = chart.groupObjs[cName].metrics;

            return (
              <g className="violinBoxGroup" key={cName}>

                {/* Draw violin plots */}
                <ViolinPlot
                  cName={cName}
                  values={values}
                  metrics={metrics}
                  xScale={xScale}
                  yScale={yScale}
                  imposedMax={max}
                  groupWidth={calculateGroupWidth(100, xScale)}
                />

                {/* Draw box plots */}
                <BoxPlot
                  cName={cName}
                  values={values}
                  metrics={metrics}
                  xScale={xScale}
                  yScale={yScale}
                  groupWidth={calculateGroupWidth(30, xScale)}
                  color={colorFunc(cName)}
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
