define(function (require) {
  'use strict';

  var T = require('hadron/toolkit'),
      Model = require('hadron/Model'),
      Hexagon = require('Hexagon'),
      HexCell = require('HexCell'),
      FOSSIL_CELL,
      selectDirection;

  // Ad-hoc completely dead (no render / no behaviour) cell
  FOSSIL_CELL = new HexCell([-1, -1], 0, [0,0], false);
  FOSSIL_CELL.render = void 0;
  FOSSIL_CELL.simulate = void 0;

  selectDirection = {
    N: function (cellId) { return [
      cellId[0] - 2,
      cellId[1]
    ]; },
    NE: function (cellId) { return [
      cellId[0] - 1,
      cellId[1] + (1 - cellId[0]%2)
    ]; },
    SE: function (cellId) { return [
      cellId[0] + 1,
      cellId[1] + (1 - cellId[0]%2)
    ]; },
    S: function (cellId) { return [
      cellId[0] + 2,
      cellId[1]
    ]; },
    SW: function (cellId) { return [
      cellId[0] + 1,
      cellId[1] - cellId[0]%2
    ]; },
    NW: function (cellId) { return [
      cellId[0] - 1,
      cellId[1] - cellId[0]%2
    ]; }
  };

  function GameOfLife(side, cellRadius, center) {
    var self = this;
    Model.call(self);

    var BOARD_SIZE = 150,
        START_OF_THE_FILL_AREA = Math.sqrt(3) * cellRadius * (side - 1),
        board = [], cols, rows;

    var background, cells = [];

    setupFrame();
    setupBoard();
    setupInitialConfiguration();

    self.getComponents = getComponents;
    self.getNeighbourhood = getNeighbourhood;

    function getComponents() {
      return [background].concat(cells);
    }

    function getNeighbourhood(cellId) {
      return [
        getNeighbour(cellId, 'N'),
        getNeighbour(cellId, 'NE'),
        getNeighbour(cellId, 'SE'),
        getNeighbour(cellId, 'S'),
        getNeighbour(cellId, 'SW'),
        getNeighbour(cellId, 'NW')
      ];
    };

    function getNeighbour(cellId, direction) {
      direction = direction.toUpperCase();
      var neighbourId = selectDirection[direction](cellId),
          r = neighbourId[0], c = neighbourId[1],
          isOutOfBounds = r < 0 || r >= rows || c < 0 || c >= cols;

      return isOutOfBounds ? FOSSIL_CELL : board[r][c];
    }

    function setupFrame() {
      var board = new Hexagon(BOARD_SIZE, center);
      board.fillColor = 'white';
      board.rotation = Math.PI / 2;
      background = board;
    }

    function setupBoard() {
      var cell, cellId,
          isRowOdd, evenRowStartingX, oddRowStartingX,
          x, y, stepX, stepY;

      cols = side;
      rows = ((side * 2 - 1) * 2) - 1;

      stepX = 3 * cellRadius;
      stepY = Math.sqrt(3)/2 * cellRadius;
      oddRowStartingX = center[0] - (3/2 * cellRadius * (side - 1));
      evenRowStartingX = center[0] - (3/2 * cellRadius * (side - 2));

      y = center[1] - START_OF_THE_FILL_AREA;
      for (var r = 0; r < rows; r++) {
        board[r] = [];
        isRowOdd = (r % 2 === 1);
        x = isRowOdd ? oddRowStartingX : evenRowStartingX;
        for (var c = 0; c < cols; c++) {
          cellId = [r, c];
          cell = isOutOfTheHexagon(r, c) ?
                 FOSSIL_CELL :
                 new HexCell(cellId, 0.9 * cellRadius, [x, y]);
          board[r][c] = cell;
          cells.push(cell);
          x += stepX;
        }
        y += stepY;
      }
    }

    // Consider a hexagon as:
    // A top triangle:     /\
    // A central zone:    |  |
    // A bottom triangle:  \/
    function isOutOfTheHexagon(r, c) {
      var topBoundary, bottomBoundary,
          leftBoundary, rightBoundary,
          isRowEven = (r % 2 === 0),
          middle = (side / 2) - 1;

      return isNotInCentralZone(r, c) &&
             isNotInTopTriangle(r, c) &&
             isNotInBottomTriangle(r, c);

      function isNotInCentralZone(r, c) {
        topBoundary = side - 1;
        bottomBoundary = rows - side;

        if (r < topBoundary || r > bottomBoundary ||
            isRowEven && c === side - 1) {
          return true;
        }
      }

      function isNotInTopTriangle(r, c) {
        var index; // index in the odd/even serie

        if (r >= topBoundary) {
          return true;
        }

        index = isRowEven ? r/2 : (r - 1)/2;
        if (isRowEven) {
          leftBoundary = middle - index;
          rightBoundary = middle + index;
        }
        else {
          leftBoundary = middle - index;
          rightBoundary = (middle + index) + 1;
        }

        return c < leftBoundary || c > rightBoundary;
      }

      function isNotInBottomTriangle(r, c) {
        var equivalentRowForTopTriangle;

        if (r <= bottomBoundary || r === side * 4) {
          return true;
        }

        equivalentRowForTopTriangle = side - (r - bottomBoundary) - 1;
        return isNotInTopTriangle(equivalentRowForTopTriangle, c);
      }
    }

    function setupInitialConfiguration() {
      var cell;
      for (var r = 0, rc = board.length; r < rc; r++) {
        for (var c = 0, cc = board[r].length; c < cc; c++) {
          cell = board[r][c];
          if (cell !== FOSSIL_CELL) {
            cell.alive = Math.random() < 0.5;
          }
        }
      }
    }
  }

  GameOfLife.prototype = Object.create(Model.prototype);
  GameOfLife.prototype.constructor = GameOfLife;

  return GameOfLife;
});
