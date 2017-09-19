import _ from 'lodash';

// values is sorted array
const calculateMetrics = (values) => {
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
};

/**
* e.g. xGroup = 'appID', yValue = 'meanSendingRateKbps'
* group by appID with values of meanSendingRateKbps
*/
export const prepareData = (rawData, xGroup, yValue) => {
  let data = {
    rawData: rawData,
    groupObjs: {},
    builds: {}
  };
  rawData.map(entry => {

    // meanSendingRateKbps
    let y = entry[yValue];

    // group by appID
    let x = entry[xGroup];

    // group by buildName, buildVer
    let buildKey = `${entry.buildName},${entry.buildVer}`;

    // aggregate mediaType
    let mediaType = entry.mediaType;

    // ignore when Y doesn't have any value
    if (data.groupObjs.hasOwnProperty(x)) {
      if (y) {
        data.groupObjs[x].values.push(+y);
      }
      switch (mediaType) {
        case 'audio':
          data.groupObjs[x].mediaTypes.audio += 1;
          break;
        case 'video':
          data.groupObjs[x].mediaTypes.video += 1;
          break;
        default:
          data.groupObjs[x].mediaTypes.unknown += 1;
          break;
      }
    } else {
      data.groupObjs[x] = {};
      data.groupObjs[x].values = [];
      if (y) {
        data.groupObjs[x].values.push(+y);
      }
      data.groupObjs[x].mediaTypes = {
        audio: 0,
        video: 0,
        unknown: 0
      };
    }

    if (y) {
      if (data.builds.hasOwnProperty(buildKey)) {
        data.builds[buildKey].values.push(+y);
      } else {
        data.builds[buildKey] = {};
        data.builds[buildKey].values = [+y];
      }
    }
  });

  // remove appID with less than 20 measurements
  data.groupObjs = _.pickBy(data.groupObjs, group => group.values.length >= 20);

  // calculateMetrics for appID groups
  Object.keys(data.groupObjs).map(cName => {
    data.groupObjs[cName].values.sort(d3.ascending);
    data.groupObjs[cName].metrics = {};
    data.groupObjs[cName].metrics = calculateMetrics(data.groupObjs[cName].values);
  });

  // calculate metrics for (buildName, buildVer) groups
  Object.keys(data.builds).map(buildKey => {
    data.builds[buildKey].values.sort(d3.ascending);
    data.builds[buildKey].metrics = {};
    data.builds[buildKey].metrics = calculateMetrics(data.builds[buildKey].values);
  });

  return data;
};

// export const calculateOutliers = (values, metrics) => {
//   let extremes = [];
//   let outliers = [];
//
//   values.map(v => {
//     const out = { value: v };
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
//   };
// };
