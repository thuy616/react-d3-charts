import React from 'react';
import getContentContainerStyle from './getContentContainerStyle';
import getSVGDimensions from './getSVGDimensions';

type Props = {
  children: React$Element | React$Element[],
  contentContainerBackgroundRectClassName: ?string,
  contentContainerGroupClassName: ?string,
  height: number,
  margin: Object,
  width: number,
};

export default ({
  children,
  contentContainerBackgroundRectClassName,
  contentContainerGroupClassName,
  height,
  margin,
  width,
  ...rest
}: Props) => (
  <svg
    {...rest}
    {...getSVGDimensions({
      height,
      margin,
      width,
    })}>
    <g
      className={contentContainerGroupClassName}
      style={getContentContainerStyle({ margin })}>
      {!!contentContainerBackgroundRectClassName && (
        <rect
          className={contentContainerBackgroundRectClassName}
          height={height}
          width={width}
          x={0}
          y={0}
        />
      )}
      {children}
    </g>
  </svg>
);
