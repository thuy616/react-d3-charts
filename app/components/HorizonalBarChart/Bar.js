import React from 'react';
import PropTypes from 'prop-types';

type Props = {
  data: PropTypes.object.isRequired,
  xScale: PropTypes.func.isRequired,
  yScale: PropTypes.func.isRequired,
  colorScale: PropTypes.func.isRequired
}

export default ({
  data,
  xScale,
  yScale,
  colorScale
}: Props) => {
  return (
    <g className="horizontal-bar">>
      <rect y={yScale(data.name)} height={yScale.rangeBand()} x={0} width={xScale(data.value)} style={{ fill: `${colorScale(data.name)}`}} />
      <text className="horizontal-bar-text" y={yScale(data.name) + yScale.rangeBand() / 2 + 4} x={xScale(data.value) + 25} textAnchor="end">{data.value}</text>
    </g>
  );
};
