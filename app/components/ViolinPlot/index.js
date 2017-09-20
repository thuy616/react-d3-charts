import React from 'react';
import PropTypes from 'prop-types';
import d3 from 'd3';

type Props = {
  cName: PropTypes.string.isRequired, // column name, i.e. unique appID
  color: PropTypes.string.isRequired,
  groupHeight: PropTypes.object.isRequired,
  imposedMax: PropTypes.number.isRequired,
  values: PropTypes.array.isRequired,
  xScale: PropTypes.func.isRequired, // x scale of the entire chart
  yScale: PropTypes.func.isRequired, // y scale of the entire chart
}

export default ({
  cName,
  color,
  groupHeight,
  imposedMax,
  values,
  xScale,
  yScale
}: Props) => {
  let numBins = Math.ceil(Math.sqrt(values.length));
  if (numBins > 30) {
    numBins = 30;
  }

  let histogramData = d3.layout.histogram().bins(numBins).frequency(1)(values);
  const bottomBound = yScale(cName) + groupHeight.bottom;
  const topBound = yScale(cName) + groupHeight.top;
  const height = bottomBound - topBound;

  const x = xScale.copy();
  const y = d3.scale.linear()
            .range([0, height / 2])
            .domain([0, Math.max(imposedMax, d3.max(histogramData, d => d.y))])
            .clamp(true);

  const area = d3.svg.area().interpolate('basis')
               .x(d => x(d.x))
               .y0(d => y(d.y))
               .y1(d => y(-d.y));
  const areaFill = area(histogramData);
  return (
    <g className="violinPlot">
      <g style={{ transform: `translateY(${topBound + height / 2}px)`}}>
        <path className="area" d={areaFill} style={{fill: `${color}`}} />
      </g>
      <g style={{ transform: `translateY(${topBound + height / 2}px) scale(1, -1)`}}>
        <path className="area" d={areaFill} style={{fill: `${color}`}} />
      </g>
    </g>
  );
};
