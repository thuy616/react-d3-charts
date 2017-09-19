import React from 'react';
import PropTypes from 'prop-types';
import d3 from 'd3';
import SVGWithMargin from '../SVGWithMargin';
import Bar from './Bar';

type Props = {
  height: PropTypes.number,
  width: PropTypes.number,
  data: PropTypes.array.isRequired,
  yLabel: PropTypes.string.isRequired,
  margin: PropTypes.object
}

export default ({
  height = 300,
  width = 800,
  data,
  yLabel,
  margin = { top: 60, right: 60, bottom: 60, left: 60 }
}: Props) => {
  const colorScale = d3.scale.category20c();
  // prepare data as array
  let aData = [];
  Object.keys(data).map(key => {
    aData.push({
      name: key,
      value: data[key]
    });
  });


  const max = d3.max(aData, d => d.value + 50); // +50 so that the longest bar won't touch the left wall of the chart svg

  const x = d3.scale.linear().range([0, width]).domain([0, max]);
  const y = d3.scale.ordinal().rangeRoundBands([height, 0], 0.5).domain(aData.map(d => d.name));

  const yAxis = d3.svg.axis().scale(y).tickSize(0).orient('left');

  return (
    <SVGWithMargin
      className="svgContainer"
      contentContainerBackgroundRectClassName="contentContainerBackgroundRect"
      contentContainerGroupClassName="svgContentContainer"
      height={height}
      margin={margin}
      width={width}>

      <g
        className="yAxis"
        ref={node => d3.select(node).call(yAxis)}>
        <text className="axisLabel" textAnchor="end" x={12} y={0} dy={'-2em'} transform="rotate(-90)">{yLabel}</text>
      </g>

      {aData.map((d, i) =>
        <Bar
          key={i}
          data={d}
          xScale={x}
          yScale={y}
          colorScale={colorScale}
        />
      )}

    </SVGWithMargin>
  );
};
