const { layout } = require("./graph")
const { _makePathFromPoints } = require("./patterns/svg")
const PW = require("patternweb")
const p = require("./patterns")
const _ = require("lodash")
const _fp = require("lodash/fp")
const graph = PW.Graph();
const Β = graph.add;
const db = {};

const snabbdom = require("snabbdom");
const patch = snabbdom.init([
  require("snabbdom/modules/attributes").default,
  // require('snabbdom/modules/class').default, // makes it easy to toggle classes
  // require('snabbdom/modules/props').default, // for setting properties on DOM elements
  // require('snabbdom/modules/style').default, // handles styling on elements with support for animations
  require('snabbdom/modules/eventlisteners').default, // attaches event listeners
]);
const h = require("snabbdom/h").default;

const container = document.getElementById("app");

function nodeRan(id) {
  console.log(`${id} just ran and stored ${JSON.stringify(db[id])}`)
}
// graph.events.on('run', nodeRan)

const dimensions = {
  width: 3000,
  height: 3000,
  roofOffset: 0,
  wallHeight: 2000,
  finWidth: 250
}


// points of graph
Β("dimensions", p.core.repeater, { IN: dimensions })

Β("getFinWidth", p.lodash.get, { OBJECT: "dimensions>OUT", PATH: "finWidth" })
Β("halfFinWidth", p.lodash.divide, { DIVIDEND: "getFinWidth>VALUE", DIVISOR: 2 })
Β("minusHalfFinWidth", p.math.flipFlop, { NUMBER: "halfFinWidth>QUOTIENT" })

Β("makeCorePoints", p.wren.makeCorePoints, { DIMENSIONS: "dimensions>OUT" })

Β("outerPoints", p.clipper.offset, { POINTS: "makeCorePoints>POINTS", DELTA: "halfFinWidth>QUOTIENT", MITER_LIMIT: 10, SCALE: 100 })
Β("mainPoints", p.clipper.offset, { POINTS: "makeCorePoints>POINTS", DELTA: 0, MITER_LIMIT: 10, SCALE: 100 })
Β("innerPoints", p.clipper.offset, { POINTS: "makeCorePoints>POINTS", DELTA: "minusHalfFinWidth>RESULT", MITER_LIMIT: 10, SCALE: 100 })

// points of graph

// fin points

Β("loopedMainPoints", p.list.loopifyInPairs, { ARRAY: "makeCorePoints>POINTS" })
Β("edgePoints", p.wren.edgePoints, {})
Β("mapEdgePoints", p.lodash.map, { COLLECTION: "makeCorePoints>POINTS", ITERATEE: "edgePoints>FN" })

// fin points

Β("log", p.core.log, { INPUT: "outerPoints>POINTS" })

Β("svg", p.snabbdom.h, { NAME: "svg", OBJECT: { attrs: { width: 200 }}, CHILDREN: "outerPath>VNODE" })

Β("pathFromOuterPoints", p.svg.makePathFromPoints, { POINTS: "outerPoints>POINTS", CLOSED: false })
Β("makeObject", p.svg.makePathFromPoints, { POINTS: "outerPoints>POINTS", CLOSED: false })

Β("outerPath", p.snabbdom.h, { NAME: "path", "OBJECT": { attrs: { d: "pathFromOuterPoints>PATH" }} })
Β("html", p.snabbdom.toHTML, { VNODE: "svg>VNODE" })

Β("log2", p.core.log, { INPUT: "html>HTML" })
// Β("save", p.fs.writeFile, { FILENAME: "output.svg", DATA: "html>HTML" })

// console.log(_.zipObjectDeep(['attrs.d'], ["something"]))
// console.log(_.concat(1))
// const wrap = item => [item];
// _fp.flow(
//   wrap,
//   _fp.zipObjectDeep(['attrs.d']),
//   console.log
// )("something")

function handleNodeClick(event, node) {
  console.log(JSON.stringify(db[node.elm.id], null, 2))
}

const {nodes, edges} = layout(graph)
const nodeElements = Object.keys(nodes).map(key => {
  const node = nodes[key]
  return h("g", { on: { click: handleNodeClick }, attrs: { id: key, transform: `translate(${node.x}, ${node.y})` }}, [
    h("circle", { attrs: { r: node.width/2 }}),
    h("text", { attrs: { x: 20 }}, key)
  ])
})

const edgeElements = edges.map(points => h("path", { attrs: { d: _makePathFromPoints(points, false) }}))

const graphData = nodeElements.concat(edgeElements)

function render() {
  vnode = patch(vnode, view(graphData));
}
const view = data => h("svg", { attrs: { id: "svg" } }, data);
let vnode = patch(container, view(graphData));

// console.time("debug")
graph.run(db, function() {
  // console.log('done')
  // console.timeEnd("debug")
})