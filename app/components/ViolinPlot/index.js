import React from 'react';
import PropTypes from 'prop-types';
import d3 from 'd3';

function calculateNumberOfBins(metrics, valuesLength) {
  const iqr = metrics.iqr;
  const numBins = Math.max(Math.round(2 * (iqr / Math.pow(valuesLength, 1 / 3))), 50);
  return numBins;
}

type Props = {
  cName: PropTypes.string.isRequired, // column name, i.e. unique appID
  color: PropTypes.string.isRequired,
  groupWidth: PropTypes.object.isRequired,
  imposedMax: PropTypes.number.isRequired,
  metrics: PropTypes.object.isRequired,
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
  metrics,
  xScale,
  yScale
}: Props) => {
  // dynamically calculate number of Bins
  // instead of using uniformly number of bins
  let histogramData = d3.layout.histogram().bins(calculateNumberOfBins(metrics, values.length)).frequency(0)(values);
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
      <g style={{transform: `rotate(90,0,0) translate(0, ${-leftBound}) scale(1, -1)`}}>
        <path className="area" d={areaFill} style={{fill: `${color}`}} />
        <path className="line" d={linePath} style={{ stroke: '#000', strokeWidth: '2px'}} />
      </g>
      {/* right */}
      <g style={{transform: `rotate(90,0,0), translate(0, ${-rightBound})`}}>
        <path className="area" d={areaFill} style={{fill: 'rgba(255,165,0,0.5)'}} />
        <path className="line" d={linePath} style={{fill: 'red', opacity: '.5'}} />
      </g>
    </g>
  );
};
