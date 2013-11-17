Crafty.init(800, 600, 'game');

var levels_to_init = [1, 2]
var levels = {};

// This defines the basics of a wall.
Crafty.c("Wall", {
  init: function() {
    this.addComponent('Color');
    this.color('#999');
    this.attr({ w: 10, h: 10 });
  },
});

// This defines the basics of the end level area.
Crafty.c("Goal", {
  init: function() {
    this.addComponent('Color');
    this.color('#963');
    this.attr({ w: 10, h: 10 });
  },
});

// This is what the covers most of the map
Crafty.c("Fog", {
  init: function() {
    this.addComponent('Color');
    this.color('#444');
    this.attr({ w: 10, h: 10 });
  },
});

// Normal Ground
Crafty.c("Blank", {
  init: function() {
    this.addComponent('Color');
    this.color('#D3D3D3');
    this.attr({ w: 10, h: 10 });
  },
});

// This scene is called when the game starts
Crafty.scene("init", function() {
  Crafty.background('#444');
  Crafty.e("2D, DOM, Text")
      .attr({ x: 0, y: 300, w: 800, h: 300 })
      .textColor('#FFFFFF')
      .textFont({ size: '40px', weight: 'bold' })
      .css({ "text-align": "center" })
      .text("Loading...");

  goto_level(levels_to_init[0]);
});

// This is the final scene
Crafty.scene("end", function() {
  Crafty.background('#444');
  Crafty.e("2D, DOM, Text")
      .attr({ x: 0, y: 300, w: 800, h: 300 })
      .textColor('#FFFFFF')
      .textFont({ size: '40px', weight: 'bold' })
      .css({ "text-align": "center" })
      .text("The End?");
});

// This function provides a loading screen as we download the level definition.
function goto_level(lvl) {
  Crafty.scene("loading_" + lvl, function() {
  Crafty.background('#444');
  Crafty.e("2D, DOM, Text")
      .attr({ x: 0, y: 300, w: 800, h: 300 })
      .textColor('#FFFFFF')
      .textFont({ size: '40px', weight: 'bold' })
      .css({ "text-align": "center" })
      .text("Loading...");

    levels[lvl] = [];
    jQuery.get('maps/level.' + lvl + '.txt', function(data) {
      var lines = $(data.split('\n'));
      $(lines).each(function(y) {
        if (levels[lvl][y] == null) {
          levels[lvl][y] = [];
        }

        $(lines[y].split('')).each(function(x) {
          levels[lvl][y][x] = lines[y].split('')[x];
        });
      });
      build_level(lvl);
      Crafty.scene("level_" + lvl);
    }, "text");
  });
  Crafty.scene("loading_" + lvl);
}

// This draws a level and sets up the player character
function build_level(lvl) {
  Crafty.scene("level_" + lvl, function() {
    Crafty.background('#D3D3D3');

    for (x = 0; x < 80; x++) {
      for (y = 0; y < 60; y++) {
        Crafty.e("2D, DOM, Fog").attr({ x: x*10, y: y*10});
      }
    }

    // Dot / User
    Crafty.e("2D, DOM, Color, Fourway, Collision")
      .color('#ccff66')
      .attr({ x: 10, y: 10, w: 10, h: 10 })
      .fourway(4)
      // Collision for pologons larger than element are broken: https://github.com/craftyjs/Crafty/issues/412
      .collision()
      .bind('EnterFrame', function () {
        // This is constantly firing, 24/7
      })
      .onHit('Goal', function(hits) {
          var index = jQuery.inArray(lvl, levels_to_init);
          if (index >= 0) {
            goto_level(levels_to_init[index + 1]);
          } else {
            Crafty.scene("end");
          }
      })
      .bind('Moved', function(from) {
        // We can't use onHit with wall because we need to stop movement.
        if (this.hit('Wall')) {
          this.attr({x: from.x, y: from.y});
        }
      })
      .onHit('Fog', function(fog_hits) {
        $(fog_hits).each(function() {
          el = this.obj
          el.removeComponent('Fog');
          el.addComponent(should_be(el._x/10, el._y/10, lvl));
        });
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

// Automatically start the loading scene.
Crafty.scene("init");
