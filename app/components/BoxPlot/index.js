import React from 'react';
import PropTypes from 'prop-types';


// function calculateOutliers(values, metrics) {
//   let extremes = [];
//   let outliers = [];
//
//   const out = { value: v };
//
//   values.map(v => {
//     if (v < metrics.lowerInnerFence) {
//       if (v < metrics.lowerOuterFence) {
//         extremes.push(out);
//       } else {
//         outliers.push(out);
//       }
//     } else if (v > metrics.upperInnerFence) {
//       if (v > metrics.upperOuterFence) {
//         extremes.push(out);
//       } else {
//         outliers.push(out);
//       }
//     }
//   });
//
//   return {
//     outliers,
//     extremes
//   }
// }

type Props = {
  cName: PropTypes.string.isRequired,
  color: PropTypes.string.isRequired,
  groupWidth: PropTypes.object.isRequired,
  metrics: PropTypes.object.isRequired,
  xScale: PropTypes.func.isRequired,
  yScale: PropTypes.func.isRequired,
}

export default ({
  cName,
  color,
  groupWidth,
  metrics,
  xScale,
  yScale,
}: Props) => {

  const leftBound = xScale(cName) + groupWidth.left;
  const rightBound = xScale(cName) + groupWidth.right;
  const middle = xScale(cName) + groupWidth.middle;

  let tempMetrics = {};
  Object.keys(metrics).map(key => {
    tempMetrics[key] = null;
    tempMetrics[key] = yScale(metrics[key]);
  });

  // render box
  return (
    <g className="boxPlot">
      <rect
        className="box"
        x={leftBound}
        width={rightBound - leftBound}
        y={tempMetrics.quartile3}
        height={-tempMetrics.quartile3 + tempMetrics.quartile1}
        rx={1}
        ry={1}
        style={{ fill: `${color}` }}
      />
      <line
        className="median"
        x1={leftBound}
        x2={rightBound}
        y1={tempMetrics.median}
        y2={tempMetrics.median}
      />
      <circle
        className="medianCircle"
        r={3}
        cx={middle}
        cy={tempMetrics.median}
      />
      <line
        className="upperWhiskerFence"
        x1={leftBound}
        x2={rightBound}
        y1={tempMetrics.upperInnerFence}
        y2={tempMetrics.upperInnerFence}
        style={{ stroke: `${color}` }}
      />
      <line
        className="upperWhiskerLine"
        x1={middle}
        x2={middle}
        y1={tempMetrics.quartile3}
        y2={tempMetrics.upperInnerFence}
        style={{ stroke: `${color}` }}
      />
      <line
        className="lowerWhiskerFence"
        x1={leftBound}
        x2={rightBound}
        y1={tempMetrics.lowerInnerFence}
        y2={tempMetrics.lowerInnerFence}
        style={{ stroke: `${color}` }}
      />
      <line
        className="lowerWhiskerLine"
        x1={middle}
        x2={middle}
        y1={tempMetrics.quartile1}
        y2={tempMetrics.lowerInnerFence}
        style={{ stroke: `${color}` }}
      />

    </g>
  );
};
