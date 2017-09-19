import React from 'react';
import PropTypes from 'prop-types';

type Props = {
  data: PropTypes.array.isRequired,
  xScale: PropTypes.func.isRequired,
  yScale: PropTypes.func.isRequired,
  height: PropTypes.func.isRequired,
  colorScale: PropTypes.func.isRequired
}

export default ({
  data,
  xScale,
  yScale,
  height,
  colorScale
}: Props) => {
  let scaledX = xScale(data.x);
  let scaledY = yScale(data.y);
  let barWidth = xScale(data.dx + data.x) - xScale(data.x) + - 1;

  console.log('barWidth: ', barWidth);

  return barWidth > 0 ? (
    <g
      className="histogram-bar"
      style={{
        transform: `translate(${scaledX}px, ${scaledY}px)`
      }}>
      <rect width={barWidth} height={height - scaledY} style={{fill: `${colorScale(data.y)}`}} />
      <text className="histogram-bar-text" dy={'0.75em'} y={6} x={barWidth / 2} textAnchor="middle">{data.y > 0 ? data.y : null}</text>
    </g>
  ) : null;
};
