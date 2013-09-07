/*
 * The map builder tool is a complex application composed by several modules.
 ^ Among them, the most important is the map editor. The map editor is rendered
 * upon an extended version of the Hadron main isometric render engine
 * inlcuding extensions for specific aiding gizmos.
 */
define(function(require) {
  'use strict';

  var S = require('hadron/scaffolding'),
      MapEditor = require('models/MapEditor'),
      GDKAssembler = require('GDKAssembler'),
      Game = require('hadron/Game');

  var gfx = require('hadron/gfx/GraphicSystem');

  function MapBuilderTool() { }

  MapBuilderTool.prototype.init = function() {
    this.setupEditor();
    this.setupControl();
    this.setupInfoArea();
  };

  MapBuilderTool.prototype.setupEditor = function() {
    var self = this;
    var mapEditorWindow = gfx.newBuffer('window'),
        mapEditor = new MapEditor(),
        mapEditorSimulation, assembler;

    assembler = new GDKAssembler(mapEditorWindow);
    assembler.assembleModels();

    // Attach the buffer (canvas) to the DOM
    document.getElementById('map-editor-canvas').appendChild(mapEditorWindow);

    // FIXME: look for a better name. Problem can be with Game.
    mapEditorSimulation = new Game({
      rootModel: mapEditor
    });
    mapEditorSimulation.start();

    S.theObject(self)
      .has('mapEditorWindow', mapEditorWindow)
      .has('mapEditor', mapEditor)
      .has('mapEditorSimulation', mapEditorSimulation);

    self.updateViewport();

    mapEditorWindow.onmousemove = updateWindowPointer;

    function updateWindowPointer(evt) {
      var canvas = evt.target;
      var rect = canvas.getBoundingClientRect();
      var canvasCoords = [
        evt.clientX - rect.left,
        evt.clientY - rect.top
      ];
      self.mapEditor.setPointer(canvasCoords);
    };
  };

  MapBuilderTool.prototype.setupControl = function() {
    var self = this;
    window.onresize = this.updateViewport.bind(this);
  };

  MapBuilderTool.prototype.setupInfoArea = function() {
    var self = this;
    var updateFPS, mapEditorInfoArea, fpsHolder, avgFrameTime = 0;
    fpsHolder = document.querySelector('#fps-info + dd');
    updateFPS = setInterval(function() {
      var frameTime = self.mapEditorSimulation.frameTime;
      fpsHolder.textContent = (1000/frameTime).toFixed(1);
    }, 1000);
  };

  MapBuilderTool.prototype.updateViewport = function() {
    var newWidth = document.documentElement.offsetWidth,
        newHeight = document.documentElement.clientHeight;

    // maximize canvas
    this.mapEditorWindow.width = newWidth;
    this.mapEditorWindow.height = newHeight;

    this.mapEditor.resizeWindow(newWidth, newHeight);
  };

  return MapBuilderTool;
});
