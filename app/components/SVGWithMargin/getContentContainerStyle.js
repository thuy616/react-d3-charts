type Params = {
  margin: Object,
};

export default function getContentContainerStyle({
  margin,
}: Params) {

  return {
    transform: `translate(${margin.left}px, ${margin.top}px)`,
  };
}
