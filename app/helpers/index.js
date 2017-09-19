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
    groupObjs: {}
  };
  rawData.map(entry => {
    let x = entry[xGroup];
    let y = entry[yValue];
    // ignore when Y doesn't have any value
    if (y) {
      if (data.groupObjs.hasOwnProperty(x)) {
        data.groupObjs[x].values.push(+y);
      } else {
        data.groupObjs[x] = {};
        data.groupObjs[x].values = [+y];
      }
    }
  });
  // remove appID with less than 20 measurements
  data.groupObjs = _.pickBy(data.groupObjs, group => group.values.length >= 20);
  Object.keys(data.groupObjs).map(cName => {
    data.groupObjs[cName].values.sort(d3.ascending);
    data.groupObjs[cName].metrics = {};
    data.groupObjs[cName].metrics = calculateMetrics(data.groupObjs[cName].values);
  });
  return data;
};
