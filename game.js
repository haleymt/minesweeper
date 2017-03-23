(function () {
  if (typeof Minesweeper === "undefined") {
    window.Minesweeper = {};
  }

  var getRandomBoard = function() {
    var board = new Array(100);
    var bombs = getRandomUniqueIntegers(10, 100);

    for (var idx = 0; idx < board.length; idx++) {
      var numNearby = 0;
      var tileCoord = indexToCoordinate(idx);
      var isBomb = bombs.indexOf(idx) > -1;

      _.map(bombs, (bombIdx) => {
        var bombCoord = indexToCoordinate(bombIdx);
        if (isAdjacent(tileCoord, bombCoord)) {
          numNearby += 1;
        }
      });

      board[idx] = { hidden: true, num: numNearby, coord: tileCoord, bomb: isBomb, idx };
    }

    return board;
  }

  var getRandomUniqueIntegers = function(num, max) {
    var array = [];

    while (array.length < num) {
      var integer = getRandomInteger(0, max);

      if (array.indexOf(integer) < 0) {
        array.push(integer);
      }
    }

    return array;
  }

  var getRandomInteger = function(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
  }

  var isAdjacent = function(coord1, coord2) {
    return Math.abs(coord1[0] - coord2[0]) < 2 && Math.abs(coord1[1] - coord2[1]) < 2;
  }

  var indexToCoordinate = function(index, width=10) {
    var x = index % width;
    var y = Math.ceil((index + 1) / width) - 1;

    return [x, y];
  }

  var Game = window.Minesweeper.Game = function () {
    this.isWon = false;
    this.isLost = false;
    this.flagging = false;
    this.flagsRemaining = 10;
    this.board = getRandomBoard();
    this.renderBoard();
  }

  Game.prototype.renderBoard = function() {
    _.map(this.board, function(tile) {
      var button = $('<button></button>').addClass('tile').attr('id', tile.idx);
      $('#board').append(button);
    });

    this.addEventListeners();
  }

  Game.prototype.addEventListeners = function() {
    $('.tile').click(function(e) {
      this.handleTileClick(e);
    }.bind(this));

    $('#flag').click(function(e) {
      if (this.flagging) {
        this.flagging = false;
        $(e.target).removeClass('active');
      } else {
        this.flagging = true;
        $(e.target).addClass('active');
      }
    }.bind(this));
  }

  Game.prototype.handleTileClick = function(e) {
    e.preventDefault();
    var id = $(e.target).attr('id');
    if (this.flagging && !this.board[id].flagged) {
      $(e.target).text('F');
      this.board[id].flagged = true;
      this.flagsRemaining--;
      $('#won').html(this.flagsRemaining);
    } else if (this.board[id].flagged) {
      this.board[id].flagged = false;
      $(e.target).text('');
      this.flagsRemaining++;
      $('#won').html(this.flagsRemaining);
    } else if (this.board[id].bomb) {
      this.lose();
    } else {
      this.board[id].hidden = false;
      if (this.board[id].num < 1) {
        this.board = this.checkAdjacentTiles(this.board[id], this.board);
      }
      this.revealTile(this.board[id]);

      if (this.gameIsWon()) {
        this.win();
      }
    }
  }

  Game.prototype.revealTile = function(tile) {
    $('#' + tile.idx).replaceWith(function() {
      var text = '<div>';

      if (tile.bomb) {
        text += '*';
      } else if (tile.num && !this.isWon && !this.isLost) {
        text += tile.num;
      }

      text += '</div>';

      return $(text).addClass('tile').attr('id', tile.idx);
    });
  }

  Game.prototype.lose = function() {
    this.isLost = true;
    _.map(this.board, (tile) => this.revealTile(tile));
    $('#won').html(':(');
  }

  Game.prototype.win = function() {
    this.isWon = true;
    _.map(this.board, (tile) => this.revealTile(tile));
    $('#won').html(':)');
  }

  Game.prototype.getAdjacentTiles = function(tile) {
    var adjacent = [];
    for (var i = 0; i < this.board.length; i++) {
      if (this.board[i].idx !== tile.idx && isAdjacent(this.board[i].coord, tile.coord)) {
        adjacent.push(this.board[i]);
      }
    }

    return adjacent;
  }

  Game.prototype.checkAdjacentTiles = function(tile, board) {
    var tiles = this.getAdjacentTiles(tile);

    for (var i = 0; i < tiles.length; i++) {
      if (board[tiles[i].idx].num === 0 && board[tiles[i].idx].hidden) {
        board[tiles[i].idx].hidden = false;
        board = this.checkAdjacentTiles(board[tiles[i].idx], board);
      }

      board[tiles[i].idx].hidden = false;
      this.revealTile(board[tiles[i].idx]);
    }

    return board;
  }

  Game.prototype.gameIsWon = function() {
    var board = this.board;
    var filtered = _.filter(board, function(tile) { return tile.hidden; });

    return filtered && filtered.length === 10 && this.flagsRemaining === 0;
  }
})();
