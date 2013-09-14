/*
 * The map builder tool is a complex application composed by several modules.
 ^ Among them, the most important is the map editor. The map editor is rendered
 * upon an extended version of the Hadron main isometric render engine
 * inlcuding extensions for specific aiding gizmos.
 */
define(function(require) {
  'use strict';

  var S = require('hadron/scaffolding'),
      MapEditor = require('editors/MapEditor'),
      Game = require('hadron/Game');

  var gfx = require('hadron/gfx/GraphicSystem');

  function MapBuilderTool() { }

  MapBuilderTool.prototype.init = function() {
    this.setupEditor();
    this.setupControl();
    this.setupInfoArea();
    this.setupPanels();
  };

  MapBuilderTool.prototype.setupEditor = function() {
    var self = this;
    var mapEditor = new MapEditor(),
        mapEditorWindow = mapEditor.getMapEditorBuffer(),
        mapEditorSimulation;

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
    window.addEventListener('keypress', function(evt) {
      var keyCode = evt.keyCode || evt.which;
      if ('t'.charCodeAt(0) === keyCode) {
        self.mapEditor.doTestScenario({
          getSprite: function(spriteId) {
            return document.querySelector('#tile-palette img[data-sprite-id="' + spriteId + '"]');
          }
        });
      }
    });
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

  MapBuilderTool.prototype.setupPanels = function() {
    var tilePalette = document.getElementById('tile-palette');
    S.theObject(this).has('tilePalette', new Panel(tilePalette, this.mapEditor.metrics.H_DIAGONAL));
  };

  MapBuilderTool.prototype.updateViewport = function() {
    var newWidth = document.documentElement.offsetWidth,
        newHeight = document.documentElement.clientHeight;

    // maximize canvas
    this.mapEditorWindow.width = newWidth;
    this.mapEditorWindow.height = newHeight;

    this.mapEditor.resizeWindow(newWidth, newHeight);
  };

  var spriteId = 0;
  function Panel(panel, imageWidth) {
    S.theObject(this)
      .has('panel', panel)
      .has('pinButton', panel.querySelector('.pin'))
      .has('addTileButton', panel.querySelector('.add-tile'))
      .has('addTileInput', panel.querySelector('.add-tile + input'))
      .has('imageWidth', imageWidth);

    this.pinButton.addEventListener('click', this.togglePin.bind(this));
    this.addTileButton.addEventListener('click', this.selectFile.bind(this));
    this.addTileInput.addEventListener('change', this.addImages.bind(this));
  }

  Panel.prototype.togglePin = function(evt) {
    this.panel.classList.toggle('pinned');
  };

  Panel.prototype.selectFile = function(evt) {
    this.addTileInput.click();
  };

  Panel.prototype.addImages = function(evt) {
    var self = this;
    var files = [].slice.call(evt.target.files, 0), img, li, p, tileList,
        pathComponents,
        fragment = document.createDocumentFragment();

    files.forEach(function(file) {
      img = document.createElement('img');
      img.src = window.URL.createObjectURL(file);
      img.dataset.spriteId = spriteId++;
      img.width = self.imageWidth;
      p = document.createElement('p');
      p.textContent = file.name;
      p.classList.add('file-name');
      li = document.createElement('li');
      li.appendChild(img);
      li.appendChild(p);
      fragment.appendChild(li);
    });

    tileList = this.panel.querySelector('.tile-list');
    tileList.appendChild(fragment);
  };

  return MapBuilderTool;
});
