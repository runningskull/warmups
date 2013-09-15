var POINTS = []
  , _skeleton = {circles:[], lines:[]}
  , _connectors = {circles:[], lines:[], points:[]}
  , _slice = Array.prototype.slice

var MAX_POINTS = 5
  , SKELETON_LINE_WIDTH = 3
  , SKELETON_RADIUS = SKELETON_LINE_WIDTH + 4
  , CONNECTOR_RADIUS = SKELETON_LINE_WIDTH + 2
  
var stage = new Kinetic.Stage({
   container: 'board'
  ,width: 640
  ,height: 480
})

var layers = {
   skeleton: new Kinetic.Layer()
  ,connectors: new Kinetic.Layer()
  ,curve: new Kinetic.Layer()
}


Object.keys(layers).forEach(function(l){ stage.add(layers[l]) })



$('#board').on('click', function(evt) {
  if (POINTS.length == MAX_POINTS) {
    POINTS.shift()
    _skeleton.circles.shift().remove()
  }

  var x=evt.offsetX, y=evt.offsetY

  POINTS.push([x, y])

  drawSkeleton()
  drawConnectors(POINTS, 0, 1.0 * $('#time').val())
})

$('#bp').on('click', function(evt) {
  evt.preventDefault()
  _circles.forEach(function(c){ c.remove() })
})

$('#time').on('change', function(evt) {
  var time = 1.0 * $('#time').val()
  drawConnectors(POINTS, 0, time)
  drawCurvePoints(time)
})


function drawSkeleton() {
  _erase(_skeleton.lines, _skeleton.circles)

  POINTS.forEach(function(p) {
    _skeleton.circles.push(new Kinetic.Circle({
        x: p[0]
       ,y: p[1]
       ,radius: SKELETON_RADIUS
       ,fill: '#eee'
    }))
  })

  if (POINTS.length > 1) {
    for (var i=0, len=POINTS.length; i < len-1; i++) {
      _skeleton.lines.push(new Kinetic.Line({
         points: [POINTS[i], POINTS[i+1]]
        ,strokeWidth: SKELETON_LINE_WIDTH
        ,stroke: '#eee'
      }))
    }
  }

  _addAll(layers.skeleton,
          _skeleton.lines, _skeleton.circles)
}

function drawConnectors(points, level, time) {
  _connectors.circles[level] || (_connectors.circles.push([]))
  _connectors.lines[level] || (_connectors.lines.push([]))
  _connectors.points[level] || (_connectors.points.push([]))

  _erase(_connectors.circles[level],
         _connectors.lines[level],
         _connectors.points[level])

  for (var i=0, len=points.length; i < len-1; i++) {
    var p1=points[i], p2=points[i+1]
      , x = p1[0] + ((p2[0] - p1[0]) * time)
      , y = p1[1] + ((p2[1] - p1[1]) * time)

    _connectors.points[level].push([x,y])
    _connectors.circles[level].push(new Kinetic.Circle({
       x: x
      ,y: y
      ,fill: '#0ff'
      ,radius: CONNECTOR_RADIUS
    }))
  }
  
  for (var j=0, len=_connectors.points[level].length; j < len-1; j++) {
    _connectors.lines[level].push(new Kinetic.Line({
       points: [_connectors.points[level][j], _connectors.points[level][j+1]]
      ,stroke: '#0ff'
      ,strokeWidth: 1
    }))
  }

  _addAll(layers.connectors,
          _connectors.circles[level], _connectors.lines[level])

  if (level < POINTS.length-3)
    drawConnectors(_connectors.points[level], level+1, time);
}

function drawCurvePoints(time) {
  var n = POINTS.length - 3
  for (var i=0, len=_connectors.points[n].length; i < len-1; i++) {
    var p1=_connectors.points[n][i], p2=_connectors.points[n][i+1]
      , x = p1[0] + (p2[0] - p1[0]) * time
      , y = p1[1] + (p2[1] - p1[1]) * time

    layers.curve.add(new Kinetic.Circle({
       radius: 2
      ,x: x
      ,y: y
      ,fill: '#000'
    }))

    layers.curve.draw()
  }
}



function _erase() {
  _slice.call(arguments).forEach(function (a) {
    a.forEach(function(o){ o.remove && o.remove() })
    a.length = 0
  })
}

function _addAll(layer) {
  _slice.call(arguments).slice(1).forEach(function(a) {
    a.forEach(function(o){ layer.add(o) })
  })
  layer.draw()
}

