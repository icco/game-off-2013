Crafty.init(800, 600, 'game');

var levels_to_init = [1, 2]
var levels = {};

Crafty.c("Wall", {
  init: function() {
    this.color('#999');
    this.attr({ w: 10, h: 10 });
  },
});

Crafty.c("Goal", {
  init: function() {
    this.color('#963');
    this.attr({ w: 10, h: 10 });
  },
});


Crafty.scene("loading", function() {
  Crafty.background('#444');
  Crafty.e("2D, Color, DOM, Text")
      .attr({ x: 0, y: 300, w: 800, h: 300 })
      .textColor('#FFFFFF')
      .textFont({ size: '40px', weight: 'bold' })
      .css({ "text-align": "center" })
      .text("Loading...");

  $(levels_to_init).each(function(indx, val) {
    levels[val] = [];
    jQuery.get('/maps/level.' + val + '.txt', function(data) {
      var lines = $(data.split('\n'));
      $(lines).each(function(y) {
        if (levels[val][y] == null) {
          levels[val][y] = [];
        }

        $(lines[y].split('')).each(function(x) {
          levels[val][y][x] = lines[y].split('')[x];
        });
      });

      build_level(val);
      Crafty.scene("level_1");
    }, "text");
  });
});

Crafty.scene("end", function() {
  Crafty.background('#444');
  Crafty.e("2D, Color, DOM, Text")
      .attr({ x: 0, y: 300, w: 800, h: 300 })
      .textColor('#FFFFFF')
      .textFont({ size: '40px', weight: 'bold' })
      .css({ "text-align": "center" })
      .text("The End?");
});

// Automatically start the loading scene.
Crafty.scene("loading");

function build_level(lvl) {
  Crafty.scene("level_" + lvl, function() {
    Crafty.background('#444');

    // Builds outer walls
    for (x = 0; x < 800; x++) {
      Crafty.e("2D, Color, DOM, Wall, Solid").attr({ x: x, y: 0 });
      Crafty.e("2D, Color, DOM, Wall, Solid").attr({ x: x, y: 590 });
    }

    for (y = 0; y < 600; y++) {
      Crafty.e("2D, Color, DOM, Wall, Solid").attr({ x: 0, y: y });
      Crafty.e("2D, Color, DOM, Wall, Solid").attr({ x: 790, y: y });
    }

    var lines = levels[lvl];
    $(lines).each(function(y) {
      $(lines[y]).each(function(x) {
        if (lines[y][x] == '#') {
          Crafty.e("2D, Color, DOM, Wall, Solid").attr({ x: ((x)*10), y: ((y)*10) });
        }

        if (lines[y][x] == '!') {
          Crafty.e("2D, Color, DOM, Goal, Solid").attr({ x: ((x)*10), y: ((y)*10) });
        }
      });
    });

    // Dot
    Crafty.e("2D, DOM, Color, Fourway, Collision")
      .color('#ccff66')
      .attr({ x: 10, y: 10, w: 10, h: 10 })
      .fourway(4)
      .collision()
      .bind('EnterFrame', function () {
        // This is constantly firing, 24/7
      })
      .bind('Moved', function(from) {
        if (this.hit('Wall')) {
          this.attr({x: from.x, y: from.y});
        }

        if (this.hit('Goal')) {
          console.log(jQuery.inArray(lvl+1, levels_to_init));
          if (jQuery.inArray(lvl+1, levels_to_init) >= 0) {
            Crafty.scene("level_" + (lvl + 1));
          } else {
            Crafty.scene("end");
          }
        }
      });
  });
}
