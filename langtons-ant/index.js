var BOX_SIZE = 5
  , STAGE_WIDTH = 640
  , STAGE_HEIGHT = 480
  , NUM_CELLS = {width:STAGE_WIDTH/BOX_SIZE, height:STAGE_HEIGHT/BOX_SIZE}
  , SPEED = 10
  , PAUSED = true
  , GENERATION = 0

  , RIGHT=0, DOWN=1, LEFT=2, UP=3
  , DIRS = {R:1, L:-1}

  , STATE_COLORS = $('#colors').text().split('\n')
  , RULES = $('#rules').val().toUpperCase()

var stage = new Kinetic.Stage({
   container: 'board'
  ,width: STAGE_WIDTH
  ,height: STAGE_HEIGHT
})


var layers = {
   gridLines: new Kinetic.Layer
  ,gridState: new Kinetic.Layer
  ,ant: new Kinetic.Layer
}
_.each(_.values(layers), stage.add.bind(stage))




//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//~~ Go, lassie, go!

function start() {
  drawGridLines()
  update(true)
}
setTimeout(start, 10)

function update(first) {
  !first && updateAnt()

  $('#generation').html(GENERATION++)
  drawAnt()
  PAUSED || setTimeout(update, SPEED)
}

function updateAnt() {
  var state = 0|_grid[[_ant.x, _ant.y].join(',')]
  _ant.dir = _turn(RULES[state], _ant)

  _flip(_ant.x, _ant.y)
  _move(_ant)
}



//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//~~ Draw Things

var gridLines=[], glcolor='#f9f9f9'
function drawGridLines() {
  _erase(gridLines)

  for (var row=0; row<NUM_CELLS.height; row++) {
    gridLines.push(new Kinetic.Rect({
       x: 0
      ,y: row * BOX_SIZE
      ,width: STAGE_WIDTH
      ,height: 1
      ,fill: glcolor
    }))
  }

  for (var col=0; col<NUM_CELLS.width; col++) {
    gridLines.push(new Kinetic.Rect({
       x: col * BOX_SIZE
      ,y: 0
      ,width: 1
      ,height: STAGE_HEIGHT
      ,fill: glcolor
    }))
  }

  _addAll(layers.gridLines, gridLines)
}

var _grid={'4,5':1}, grid={}

var _ant={x:30, y:30, dir:LEFT}
function drawAnt() {
  _ant.group && _erase([_ant.group])

  var _x = _ant.x * BOX_SIZE
    , _y = _ant.y * BOX_SIZE

  _ant.group = new Kinetic.Group({x:_x,y:_y})

  _ant.group.add(new Kinetic.Rect({
     x:0, y:0, width:BOX_SIZE, height:BOX_SIZE
    ,fill: '#c00'
  }))

  _addAll(layers.ant, [_ant.group])
}




//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// ~~ Helper functions

var _slice = Array.prototype.slice
function _erase() {
  _slice.call(arguments).forEach(function (a) {
    a.forEach(function(o){ o.remove && o.remove(); delete o })
    a.length = 0
  })
}

function _addAll(layer) {
  _slice.call(arguments).slice(1).forEach(function(a) {
    a.forEach(function(o){ layer.add(o) })
  })
  layer.draw()
}

function _cell(x, y, color) {
  return new Kinetic.Rect({
     x: x * BOX_SIZE
    ,y: y * BOX_SIZE
    ,width: BOX_SIZE
    ,height: BOX_SIZE
    ,fill: color
  })
}

function _turn(dir, ant) {
  return ((40 + ant.dir) + DIRS[dir]) % 4
}

function _rotation(dir) { return 90 * dir }

function _move(ant) {
  return !!~[UP,DOWN].indexOf(ant.dir)
    ? ant.y -= (ant.dir - 2)
    : ant.x -= (ant.dir - 1)
}

function _flip(x,y) {
  var coord = [x,y].join(',')
  _grid[coord] = ((_grid[coord]|0) + 1) % STATE_COLORS.length
  _drawCell(x,y)
}

function _drawCell(x,y) {
  var coord = [x,y].join(',')
  if (! grid[coord]) {
    grid[coord] = new Kinetic.Rect({
       x: x * BOX_SIZE
      ,y: y * BOX_SIZE
      ,height: BOX_SIZE
      ,width: BOX_SIZE
    })
    layers.gridState.add(grid[coord])
  }

  grid[coord].setFill(STATE_COLORS[_grid[coord]])
  layers.gridState.draw()
}




//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//~~ UI Events

function RESET(ax, ay) {
  var x = ax||30, y = ay||30
  _erase(_.values(grid), [_ant.group]); 
  _grid={}, grid={}, _ant={x:ax, y:ay, dir:LEFT};
  _.values(layers).forEach(function(l){ l.draw() });
  GENERATION = 0;
  update(true)
}

$('#pause').on('click', function(){ PAUSED = true })
$('#go').on('click', function(){ PAUSED = false;update() })
$('#clear').on('click', RESET)
$('#speed').on('change', function() { SPEED = 502 - ($(this).val()|0) })

$('#colors, #rules').on('keydown', function() { PAUSED = true })
$('#colors, #rules').on('keyup', _.debounce(function(){ PAUSED = false }, 1000))

$('#colors').on('keyup', function() { STATE_COLORS = $(this).val().split('\n') })
$('#rules').on('keyup', function() { RULES = $(this).val().toUpperCase() })

$('#board').on('click', function(evt) {
  if (! PAUSED) return;
  var x = evt.offsetX / BOX_SIZE
    , y = evt.offsetY / BOX_SIZE

  RESET(x,y)
})

$('#gencolors').on('click', function() {
  var num = prompt('How many?')|0
  var colors = []

  while (colors.length < num) {
    var scheme = new ColorScheme;
    scheme.from_hue(Date.now() % 255).scheme('contrast').variation('pastel')
    colors = colors.concat(scheme.colors())
  }

  colors.unshift('fff')
  colors = _.map(colors, function(c){ return '#' + c })
  $('#colors').text(colors.slice(0, num).join('\n')).trigger('keyup')
})

