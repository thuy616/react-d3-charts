## Visualizations of webRTC data
[Sample Data Link](https://drive.google.com/file/d/0B38wZT7eTdJQT1RIMzE3WTRJdTA/view?usp=sharing)

## Stacks
- React + d3
- Based on [react-boilerplate](https://github.com/react-boilerplate/react-boilerplate)

## Charts
1. Box plot (and violin plot) for comparing the distribution of "meanSendingRateKbps" for all appIDs.
You can show/hide the violin plots. Because the distribution curves are not very nice for the sample data set, I hide the violin plots by default.
2. Histogram of distribution of "meanSendingRateKbps" group by "appID", selected by user
3. Bar chart for media types group by "appID", the bar length represents the number of media types.
4. Histogram of distribution of "meanSendingRateKbps" group by unique "buildName,buildVer", selected by user

## Deployment
I have deployed 2 versions of the charts:
- Version 1 with vertical box plot: https://react-d3-charts.herokuapp.com/
I didn't realize at first that the number of appIDs is quite large, so if the appIDs are on the x-axis, the chart will be very wide. It is therefore better to have the appIDs on the y-axis and the user can scroll down more naturally.
- Version 2 with horizontal box plot: https://react-d3-charts-v2.herokuapp.com/

## Run Locally
```yarn install```
```npm run start```
The local web server will be at: http://localhost:3000
