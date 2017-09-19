import React from 'react';
import PropTypes from 'prop-types';
import SVGWithMargin from '../SVGWithMargin';
import Bar from './Bar';

type Props = {
  width: PropTypes.number,
  height: PropTypes.number,
  values: PropTypes.array.isRequired,
  margin: PropTypes.object,
  metrics: PropTypes.object.isRequired,
  color: PropTypes.string,
  xLabel: PropTypes.string,
  imposedMax: PropTypes.number.isRequired
}

export default({
  width = 800,
  height = 400,
  values,
  margin = {top: 20, right: 60, bottom: 60, left: 60},
  metrics,
  color = 'steelblue',
  xLabel,
  imposedMax
}: Props) => {
  let max = d3.max(values);
  const min = d3.min(values);
  if (max > imposedMax) {
    max = imposedMax;
  }
  const x = d3.scale.linear().domain([min, max]).range([0, width]);

  // calculate number of bins
  let numBins = Math.max(Math.round(2 * (metrics.iqr / Math.pow(values.length, 1 / 3))), 50);
  if (numBins > 50) {
    numBins = 50; // enforced max bins to be 100
  }
  const data = d3.layout.histogram().bins(x.ticks(numBins))(values);
  const yMax = d3.max(data, d => d.y);
  const yMin = d3.min(data, d => d.y);
  const colorScale = d3.scale.linear()
                    .domain([yMin, yMax])
                    .range([d3.rgb(color).brighter(), d3.rgb(color).darker()]);
  const y = d3.scale.linear()
            .domain([0, yMax])
            .range([height, 0]);
  const xAxis = d3.svg.axis()
                .scale(x)
                .orient('bottom');

  return (
    <SVGWithMargin
      className="svgContainer"
      contentContainerBackgroundRectClassName="contentContainerBackgroundRect"
      contentContainerGroupClassName="svgContentContainer"
      height={height}
      margin={margin}
      width={width}>

      <g
        className="xAxis"
        ref={node => d3.select(node).call(xAxis)}
        style={{
          transform: `translateY(${height}px)`,
        }}>
        <text className="axisLabel" textAnchor="end" x={width / 2} y={0} dy="4.5em" style={{transform: 'rotate(0)'}} >{xLabel}</text>
      </g>

      {data.map((d, i) => (
        <Bar
          key={i}
          data={d}
          xScale={x}
          yScale={y}
          height={height}
          colorScale={colorScale}
        />
      ))}

    </SVGWithMargin>
  );
};
