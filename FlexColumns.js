var View = require('famous/core/View');
var Entity = require('famous/core/Entity');
var Modifier = require('famous/core/Modifier');
var Transform = require('famous/core/Transform');
var Transitionable = require('famous/transitions/Transitionable');
var TransitionableTransform = require('famous/transitions/TransitionableTransform');
var Easing = require('famous/transitions/Easing');
var SpecParser = require('famous/core/SpecParser');
var _ = require('underscore');

function FlexColumns(options) {
  View.apply(this, arguments);
  this._states = [];
  this._modifiers = [];
  this._cols = [];
  this._cachedWidth = undefined;

  this.id = Entity.register(this);
}

FlexColumns.DEFAULT_OPTIONS = {
  midAlign: true,
  marginTop: 0,
  gutterCol: 0,
  gutterRow: 0,
  transition: { curve: Easing.outBack, duration: 500 }
};

FlexColumns.prototype = Object.create(View.prototype);
FlexColumns.prototype.constructor = FlexColumns;

FlexColumns.prototype.createCol = function (width) {
  function WidthException(message) {
    this.message = message;
    this.name = "WidthException";
  }
  if (width === undefined)
    throw new WidthException("You must enter a width when you create a column");

  var settings = {
    width: width,
    surfaces: [],
    states: [],
    modifiers: []
  };
  this._cols.push(settings);

  return this;
};


FlexColumns.prototype.addSurfaceToCol = function (colIndex, surface) {
  function SizeException(message) {
     this.message = message;
     this.name = "SizeException";
  }

  var surfaceSize = surface.getSize();
  var surfaceWidth = surfaceSize[0];

  var colObj = this._cols[colIndex];
  if (surfaceWidth > colObj.width) {
    throw new SizeException("Surface width is greater than column width.");
  } else {
    colObj.surfaces.push(surface);
  }
  return this;
};

FlexColumns.prototype.getCol = function (colIndex) {
  return this._cols[colIndex];
};


FlexColumns.prototype.render = function () {
  return this.id;
}

FlexColumns.prototype.commit = function (context) {
  var contextWidth = context.size[0];

  if (this._cachedWidth !== contextWidth) {
    this._cachedWidth = contextWidth;
    this.resizeFlow(contextWidth);
  }

  var specs = [];
  for (var i = 0; i < this._modifiers.length; i++) {
    var modifier = this._modifiers[i];

    var surface = modifier._surface;
    var target = surface.render();

    var spec = modifier.modify(target);
    spec.transform = Transform.multiply4x4(spec.transform, context.transform);
    spec.opacity = context.opacity; //TODO look into a better way to deal with specs.
    specs.push(spec);
  }
  return specs;
};


FlexColumns.prototype.resizeFlow = function (contextWidth) {
  //The goal of this method is to generate a modifier or adjust the transform object on it.
  var _this = this;

  var previousWidth = 0;
  _.each(this._cols, function (colObj, i) {
    var surfaces = colObj.surfaces;
    previousWidth += colObj.width;
    var previousHeight = 0;
    _.each(surfaces, function (surface, j) {
      var position = _calculatePosition.call(this, i, j, surface, colObj, previousWidth, previousHeight, contextWidth);
      previousHeight += surface.getSize()[1];

      if (colObj.modifiers[j] === undefined) {
        var transitionObj = _createState.call(this, position)
        var mod = new Modifier(transitionObj);
        mod._surface = surface;

        colObj.modifiers[j] = mod;
        colObj.states[j] = transitionObj;

        _this._modifiers.push(mod);
        _this._states.push(transitionObj);
      } else {
        _animateModifier.call(this, i,j, position)
      }
    }, _this);
  }, _this);
};

function _calculatePosition (colIndex, rowIndex, surface, colObj, previousWidth, previousHeight, contextWidth) {
  var surfaceSize  = surface.getSize();
  var surfaceWidth = surfaceSize[0];
  var surfaceHeight = surfaceSize[1];


  var x = previousWidth - colObj.width + (colIndex * this.options.gutterCol);
  var y =  previousHeight + (rowIndex * this.options.gutterRow);

  if (this.options.midAlign === true) {
    var midAlign = _calculateMidAlign.call(this, contextWidth);
    x += midAlign;
  }

  y += this.options.marginTop;

  return [x,y,0];
}

function _createState(position) {
  var transitionObj = {
    transform: new TransitionableTransform(Transform.translate.apply(this, position))
  };
  return transitionObj;
}

function _animateModifier(colIndex, rowIndex, position) {
  var colObj = this.getCol(colIndex);
  var transformTransitionable = colObj.states[rowIndex].transform;

  transformTransitionable.halt();
  transformTransitionable.setTranslate(position, this.options.transition);
}

function _calculateMidAlign (contextWidth) {
  var contentWidth = 0;

  for (var i = 0; i < this._cols.length; i += 1) {
    var colObj = this._cols[i];
    contentWidth += colObj.width;
  }
  var midOffset =  (contextWidth - contentWidth) / 2;
  return midOffset;
}

module.exports = FlexColumns;
