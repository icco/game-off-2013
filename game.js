Crafty.init(800, 600, 'game');

var levels_to_init = [1, 2]
var levels = {};

Crafty.c("Wall", {
  init: function() {
    this.addComponent('Color');
    this.color('#999');
    this.attr({ w: 10, h: 10 });
  },
});

Crafty.c("Goal", {
  init: function() {
    this.addComponent('Color');
    this.color('#963');
    this.attr({ w: 10, h: 10 });
  },
});

Crafty.c("Fog", {
  init: function() {
    this.addComponent('Color');
    this.color('#D3D3D3');
    this.attr({ w: 10, h: 10 });
  },
});

Crafty.scene("loading", function() {
  Crafty.background('#444');
  Crafty.e("2D, DOM, Text")
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
  Crafty.e("2D, DOM, Text")
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

    for (x = 0; x < 80; x++) {
      for (y = 0; y < 60; y++) {
        Crafty.e("2D, DOM, Fog").attr({ x: x*10, y: y*10});
      }
    }

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
          if (jQuery.inArray(lvl+1, levels_to_init) >= 0) {
            Crafty.scene("level_" + (lvl + 1));
          } else {
            Crafty.scene("end");
          }
        }

        fog_hits = this.hit('Fog')
        if (fog_hits) {
          $(fog_hits).each(function() {
            el = this.obj
            el.removeComponent('Fog');
            el.addComponent(should_be(el._x/10, el._y/10, lvl));
          });
        }
      });
  });
}

function should_be(x, y, lvl) {
  var lines = levels[lvl];
  var piece = lines[y][x];
  console.log(x, y, piece);

  if (piece == '#') {
    return 'Wall';
  }

  if (piece == '!') {
    return 'Goal';
  }

  if (piece == '.') {
    return 'Blank';
  }
}
