import { injectGlobal } from 'styled-components';

/* eslint no-unused-expressions: 0 */
injectGlobal`
  html,
  body {
    height: 100%;
    width: 100%;
    padding-left: 20px;
    padding-top: 20px;
  }

  body {
    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
  }

  body.fontLoaded {
    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
  }

  #app {
    background-color: #fff;
    min-height: 100%;
    min-width: 100%;
  }

  h1 {
    margin-bottom: 20px;
    color: #337ab7;
  }

  .ball-pulse {
    margin: 20px 0;
  }
  .ball-pulse > div {
    background-color: #500c8c;
  }

  .alert {
    margin-top: 20px;
  }
`;
