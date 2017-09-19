import React from 'react';
import PropTypes from 'prop-types';
import d3 from 'd3';

type Props = {
  cName: PropTypes.string.isRequired, // column name, i.e. unique appID
  color: PropTypes.string.isRequired,
  groupWidth: PropTypes.object.isRequired,
  imposedMax: PropTypes.number.isRequired,
  values: PropTypes.array.isRequired,
  xScale: PropTypes.func.isRequired, // x scale of the entire chart
  yScale: PropTypes.func.isRequired, // y scale of the entire chart
}

export default ({
  cName,
  color,
  groupWidth,
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
  const leftBound = xScale(cName) + groupWidth.left;
  const rightBound = xScale(cName) + groupWidth.right;
  const trueWidth = (rightBound - leftBound) / 2;

  const x = yScale.copy();
  const y = d3.scale.linear()
            .range([trueWidth, 0])
            .domain([0, Math.max(imposedMax, d3.max(histogramData, d => d.y))])
            .clamp(true);

  const area = d3.svg.area().interpolate('basis')
               .x(d => x(d.x))
               .y0(trueWidth)
               .y1(d => y(d.y));
  const line = d3.svg.line().interpolate('basis').x(d => x(d.x)).y(d => y(d.y));
  const linePath = line(histogramData);
  const areaFill = area(histogramData);
  return (
    <g className="violinPlot">
      {/* left */}
      <g style={{transform: `rotate(90deg) translate(0, ${-leftBound}px) scale(1, -1)`}}>
        <path className="area" d={areaFill} style={{fill: `${color}`}} />
        <path className="line" d={linePath} style={{ stroke: '#b1b1b1', strokeWidth: '1px', color: 'transparent'}} />
      </g>
      {/* right */}
      <g style={{transform: `rotate(90deg) translate(0, ${-rightBound}px)`}}>
        <path className="area" d={areaFill} style={{fill: `${color}`}} />
        <path className="line" d={linePath} style={{ stroke: '#b1b1b1', strokeWidth: '1px', color: 'transparent'}} />
      </g>
    </g>
  );
};
