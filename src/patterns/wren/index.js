function _calculateDefaultPoints({ height, width, wallHeight, roofOffset }) {
  return [
    [0, height],
    [width, height],
    [width, height - wallHeight],
    [width / 2 + roofOffset, 0],
    [0, height - wallHeight]
  ];
}

const makeCorePoints = {
  name: "Wren/MakeCorePoints",
  fn: ({ DIMENSIONS }, done) =>
    done({ POINTS: _calculateDefaultPoints(DIMENSIONS) }),
  inports: ["DIMENSIONS"],
  outports: ["POINTS"]
};

// function _calculate1DFrameEdgePoints(distance, overrides = null) {
//   const defaults = {
//     spacing: 300,
//     minDistance: 200
//   };
//   const config = overrides ? Object.assign(defaults, overrides) : defaults;
//   let result = [];
//   const times = Math.ceil(distance / config.spacing);

//   for (var i = 0; i <= times; i++) {
//     let point;
//     if (i < times / 2) {
//       // add points outwards from start point
//       point = i * config.spacing;
//     } else {
//       // add points inwards from end point
//       point = distance - (times - i) * config.spacing;
//       // if the two points are too close together then 'remove' both of them
//       // and replace them with a new point that is equidistant between them
//       if (point - result[i - 1] < config.minDistance) {
//         result[i - 1] += (point - result[i - 1]) / 2;
//         continue;
//       }
//     }
//     result.push(point);
//   }
//   return result;
// }

// function _calculateFrameEdgePoints([startPoint, endPoint], overrides = null) {
function _calculateFrameEdgePoints(value) {
  return value;
  // const distance = Point.distance(startPoint, endPoint);
  // const pointPositions = _calculate1DFrameEdgePoints(distance, overrides);
  // // return original points because if start or end points are floats they might be modified slightly during
  // // calculations due to floating point precision
  // return [
  //   startPoint,
  //   ...pointPositions
  //     .map(position =>
  //       Point.pointOnLine(position, distance)(startPoint, endPoint)
  //     )
  //     .slice(1, -1),
  //   endPoint
  // ];
}

const edgePoints = {
  name: "Wren/EdgePoints",
  fn: ({}, done) => done({ FN: _calculateFrameEdgePoints }),
  inports: [],
  outports: ["FN"]
};

module.exports = {
  makeCorePoints,
  edgePoints
};
