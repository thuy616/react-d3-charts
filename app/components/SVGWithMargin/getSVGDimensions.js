type Params = {
  height: number,
  margin: Object | number,
  width: number,
};

export default function getSVGDimensions({
  height,
  margin,
  width,
}: Params) {
  const heightWithMargin = height
    + margin.top
    + margin.bottom;
  const widthWithMargin = width
    + margin.left
    + margin.right;

  return {
    height: heightWithMargin,
    width: widthWithMargin,
  };
}
