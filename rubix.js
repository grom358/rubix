var Cube = (function() {
    const FACELET_ORDER = ['u', 'l', 'f', 'r', 'b', 'd'];

    function getFacelets($cube) {
        var facelets = [];
        for (var i = 0, n = FACELET_ORDER.length; i < n; i++) {
            var f = FACELET_ORDER[i];
            for (var j = 1; j <= 9; j++) {
                var facelet = $cube.find('.facelet.' + f + j).get(0);
                facelets.push(facelet);
            }
        }
        return $(facelets);
    }

    function getCubelets($cube) {
        var cubelets = [];
        for (var i = 1; i <= 26; i++) {
            var cubelet = $cube.find('.cubelet' + i).get(0);
            cubelets.push(cubelet);
        }
        return $(cubelets);
    }

    const faceletRegex = /facelet (\w+)/;

    function Cube(selector) {
        this.moveStack = [];
        this.$cube = $(selector);
        this.$facelets = getFacelets(this.$cube);
        this.$facelets.each(function() {
            var $facelet = $(this);
            var match = faceletRegex.exec($facelet.attr('class'));
            if (match) {
                $facelet.data('facelet', match[1]);
            }
        });
        this.$cubelets = getCubelets(this.$cube);
        this.$faceletView = $('.facelet-view');
        this.isMoving = false;
        this.$cube.on('next-move', function() {
            animateNextMove(cube);
        });
    }

    function animateNextMove(cube) {
        if (cube.isMoving) {
            return;
        }
        var move = cube.moveStack.shift();
        if (!move) {
            cube.isMoving = false;
            return;
        }
        cube.isMoving = true;
        animateMove(cube, move);
    }

    function swapFacelets($a, $b, facelet) {
        var $temp = $a.children(facelet).children().detach();
        $b.children(facelet).children().appendTo($a.children(facelet));
        $b.children(facelet).append($temp);
    }

    function swapCubelets($a, $b) {
        swapFacelets($a, $b, '.back');
        swapFacelets($a, $b, '.front');
        swapFacelets($a, $b, '.up');
        swapFacelets($a, $b, '.down');
        swapFacelets($a, $b, '.right');
        swapFacelets($a, $b, '.left');
    }

    function cwR($cubelets, n) {
        $cubelets.each(function() {
            var $cubelet = $(this);
            var $temp = $cubelet.children('.front').children().detach();
            $cubelet.children('.down').children().appendTo($cubelet.children('.front'));
            $cubelet.children('.back').children().appendTo($cubelet.children('.down'));
            $cubelet.children('.up').children().appendTo($cubelet.children('.back'));
            $temp.appendTo($cubelet.children('.up'));
        });

        /*
          Looking at R face (so top right corner is z2):

          # n = 1:
          06 03 00
          07 04 01
          08 05 02

          # n = 2:
          x = 2    |  x = 1
          13 07 01 | 12 06 00
          15 09 03 | 14 08 02
          17 11 05 | 16 10 04

          # n = 3:
          x = 2    | x = 1    |  x = 0
          20 11 02 | 19 10 01 | 18 09 00
          23 14 05 | 22 13 04 | 21 12 03
          26 17 08 | 25 16 07 | 24 15 06
        */

        for (var i = 0; i < n; i++) {
            // Corners.
            var $c = $cubelets.eq(i);
            swapCubelets($c, $cubelets.eq(2 * n + i));
            swapCubelets($c, $cubelets.eq(8 * n + i));
            swapCubelets($c, $cubelets.eq(6 * n + i));

            // Edges.
            $c = $cubelets.eq(n + i);
            swapCubelets($c, $cubelets.eq(5 * n + i));
            swapCubelets($c, $cubelets.eq(7 * n + i));
            swapCubelets($c, $cubelets.eq(3 * n + i));
        }
    }

    function ccwR($cubelets, n) {
        $cubelets.each(function() {
            var $cubelet = $(this);
            var $temp = $cubelet.children('.back').children().detach();
            $cubelet.children('.down').children().appendTo($cubelet.children('.back'));
            $cubelet.children('.front').children().appendTo($cubelet.children('.down'));
            $cubelet.children('.up').children().appendTo($cubelet.children('.front'));
            $temp.appendTo($cubelet.children('.up'));
        });

        for (var i = 0; i < n; i++) {
            // Corners.
            var $c = $cubelets.eq(i);
            swapCubelets($c, $cubelets.eq(6 * n + i));
            swapCubelets($c, $cubelets.eq(8 * n + i));
            swapCubelets($c, $cubelets.eq(2 * n + i));

            // Edges.
            $c = $cubelets.eq(n + i);
            swapCubelets($c, $cubelets.eq(3 * n + i));
            swapCubelets($c, $cubelets.eq(7 * n + i));
            swapCubelets($c, $cubelets.eq(5 * n + i));
        }
    }

    function cwU($cubelets, n) {
        $cubelets.each(function() {
            var $cubelet = $(this);
            var $temp = $cubelet.children('.front').children().detach();
            $cubelet.children('.right').children().appendTo($cubelet.children('.front'));
            $cubelet.children('.back').children().appendTo($cubelet.children('.right'));
            $cubelet.children('.left').children().appendTo($cubelet.children('.back'));
            $temp.appendTo($cubelet.children('.left'));
        });

        /*
          Looking at U face:

          # n = 1:
          00 01 02
          03 04 05
          06 07 08

          # n = 2:
          y = 0    | y = 1
          00 01 02 | 03 04 05
          06 07 08 | 09 10 11
          12 13 14 | 15 16 17

          # n = 3:
          y = 0    | y = 1    | y = 2
          00 01 02 | 03 04 05 | 06 07 08
          09 10 11 | 12 13 14 | 15 16 17
          18 19 20 | 21 22 23 | 24 25 26
        */
        for (var i = 0; i < n; i++) {
            // Corners.
            var $c = $cubelets.eq(3 * i);
            swapCubelets($c, $cubelets.eq(2 + 3 * i));
            swapCubelets($c, $cubelets.eq(2 + 3 * i + 6 * n));
            swapCubelets($c, $cubelets.eq(6 * n + 3 * i));

            // Edges.
            $c = $cubelets.eq(1 + 3 * i);
            swapCubelets($c, $cubelets.eq(2 + 3 * n + 3 * i));
            swapCubelets($c, $cubelets.eq(1 + 6 * n + 3 * i));
            swapCubelets($c, $cubelets.eq(3 * n + 3 * i));
        }
    }

    function ccwU($cubelets, n) {
        $cubelets.each(function() {
            var $cubelet = $(this);
            var $temp = $cubelet.children('.back').children().detach();
            $cubelet.children('.right').children().appendTo($cubelet.children('.back'));
            $cubelet.children('.front').children().appendTo($cubelet.children('.right'));
            $cubelet.children('.left').children().appendTo($cubelet.children('.front'));
            $temp.appendTo($cubelet.children('.left'));
        });

        for (var i = 0; i < n; i++) {
            // Corners.
            var $c = $cubelets.eq(3 * i);
            swapCubelets($c, $cubelets.eq(6 * n + 3 * i));
            swapCubelets($c, $cubelets.eq(2 + 3 * i + 6 * n));
            swapCubelets($c, $cubelets.eq(2 + 3 * i));

            // Edges.
            $c = $cubelets.eq(1 + 3 * i);
            swapCubelets($c, $cubelets.eq(3 * n + 3 * i));
            swapCubelets($c, $cubelets.eq(1 + 6 * n + 3 * i));
            swapCubelets($c, $cubelets.eq(2 + 3 * n + 3 * i));
        }
    }

    function cwF($cubelets, n) {
        $cubelets.each(function() {
            var $cubelet = $(this);
            var $temp = $cubelet.children('.up').children().detach();
            $cubelet.children('.left').children().appendTo($cubelet.children('.up'));
            $cubelet.children('.down').children().appendTo($cubelet.children('.left'));
            $cubelet.children('.right').children().appendTo($cubelet.children('.down'));
            $temp.appendTo($cubelet.children('.right'));
        });

        /*
          Looking at F face:

          # n = 1:
          00 01 02
          03 04 05
          06 07 08

          # n = 2:
          z = 0    | z = 1
          09 10 11 | 00 01 02
          12 13 14 | 03 04 05
          15 16 17 | 06 07 08

          # n = 3:
          z = 0    | z = 1    | z = 2
          18 19 20 | 09 10 11 | 00 01 02
          21 22 23 | 12 13 14 | 03 04 05
          24 25 26 | 15 16 17 | 06 07 08
        */
        for (var i = 0; i < n; i++) {
            // Corners.
            var $c = $cubelets.eq(9 * i);
            swapCubelets($c, $cubelets.eq(2 + 9 * i));
            swapCubelets($c, $cubelets.eq(8 + 9 * i));
            swapCubelets($c, $cubelets.eq(6 + 9 * i));

            // Edges.
            $c = $cubelets.eq(1 + 9 * i);
            swapCubelets($c, $cubelets.eq(5 + 9 * i));
            swapCubelets($c, $cubelets.eq(7 + 9 * i));
            swapCubelets($c, $cubelets.eq(3 + 9 * i));
        }
    }

    function ccwF($cubelets, n) {
        $cubelets.each(function() {
            var $cubelet = $(this);
            var $temp = $cubelet.children('.up').children().detach();
            $cubelet.children('.right').children().appendTo($cubelet.children('.up'));
            $cubelet.children('.down').children().appendTo($cubelet.children('.right'));
            $cubelet.children('.left').children().appendTo($cubelet.children('.down'));
            $temp.appendTo($cubelet.children('.left'));
        });

        for (var i = 0; i < n; i++) {
            // Corners.
            var $c = $cubelets.eq(9 * i);
            swapCubelets($c, $cubelets.eq(6 + 9 * i));
            swapCubelets($c, $cubelets.eq(8 + 9 * i));
            swapCubelets($c, $cubelets.eq(2 + 9 * i));

            // Edges.
            $c = $cubelets.eq(1 + 9 * i);
            swapCubelets($c, $cubelets.eq(3 + 9 * i));
            swapCubelets($c, $cubelets.eq(7 + 9 * i));
            swapCubelets($c, $cubelets.eq(5 + 9 * i));
        }
    }

    function rotateCublets($cubelets, n, axis, cw) {
        switch (axis) {
        case 'Z':
            cw ? cwR($cubelets, n) : ccwR($cubelets, n);
            break;
        case 'Y':
            cw ? cwU($cubelets, n) : ccwU($cubelets, n);
            break;
        case 'X':
            cw ? cwF($cubelets, n) : ccwF($cubelets, n);
            break;
        }
    }

    function updateFaceletView(cube) {
        cube.$cube.find('.facelet').each(function() {
            var $facelet = $(this);
            var $fv = cube.$faceletView.find('.' + $facelet.data('facelet'));
            $facelet.children().clone().appendTo($fv.empty());
        });
    }

    function animateRotation(cube, $cubelets, n, axis, cw, rotateDirection, currentTime) {
        var functionName = "rotate" + axis;
        var rotateDirection = cw ? -1 : 1;
        if (axis === 'X') {
            rotateDirection *= -1;
        }
        $cubelets.animate({
            rotation: rotateDirection * 90
        }, {
            easing: 'linear',
            duration: 'slow',
            step: function(now) {
                var style = functionName + '(' + now + 'deg)';
                this.style.transform = this.style.transform.replace(/rotate.\(\S+\)/, style);
            },
            complete: function() {
                $(this).css('rotation', 0); // reset rotation.
                var style = functionName + '(0deg)';
                this.style.transform = this.style.transform.replace(/rotate.\(\S+\)/, style);
            },
        }).promise().done(function() {
            rotateCublets($cubelets, n, axis, cw);
            updateFaceletView(cube);
            cube.isMoving = false;
            cube.$cube.trigger('next-move');
        });
    }

    function doMove(cube, move, applyMove) {
        switch (move) {
        case "U":
            return applyMove(cube.$cube.find('.cubelet.y0'), 1, 'Y', true);
        case "U'":
            return applyMove(cube.$cube.find('.cubelet.y0'), 1, 'Y', false);
        case "D":
            return applyMove(cube.$cube.find('.cubelet.y2'), 1, 'Y', false);
        case "D'":
            return applyMove(cube.$cube.find('.cubelet.y2'), 1, 'Y', true);
        case "E":
            return applyMove(cube.$cube.find('.cubelet.y1'), 1, 'Y', false);
        case "E'":
            return applyMove(cube.$cube.find('.cubelet.y1'), 1, 'Y', true);
        case "u":
            return applyMove(cube.$cube.find('.cubelet.y0, .cubelet.y1'), 2, 'Y', true);
        case "u'":
            return applyMove(cube.$cube.find('.cubelet.y0, .cubelet.y1'), 2, 'Y', false);
        case "d":
            return applyMove(cube.$cube.find('.cubelet.y1, .cubelet.y2'), 2, 'Y', false);
        case "d'":
            return applyMove(cube.$cube.find('.cubelet.y1, .cubelet.y2'), 2, 'Y', true);
        case "R":
            return applyMove(cube.$cube.find('.cubelet.x2'), 1, 'Z', true);
        case "R'":
            return applyMove(cube.$cube.find('.cubelet.x2'), 1, 'Z', false);
        case "L":
            return applyMove(cube.$cube.find('.cubelet.x0'), 1, 'Z', false);
        case "L'":
            return applyMove(cube.$cube.find('.cubelet.x0'), 1, 'Z', true);
        case "M":
            return applyMove(cube.$cube.find('.cubelet.x1'), 1, 'Z', false);
        case "M'":
            return applyMove(cube.$cube.find('.cubelet.x1'), 1, 'Z', true);
        case "r":
            return applyMove(cube.$cube.find('.cubelet.x1, .cubelet.x2'), 2, 'Z', true);
        case "r'":
            return applyMove(cube.$cube.find('.cubelet.x1, .cubelet.x2'), 2, 'Z', false);
        case "l":
            return applyMove(cube.$cube.find('.cubelet.x0, .cubelet.x1'), 2, 'Z', false);
        case "l'":
            return applyMove(cube.$cube.find('.cubelet.x0, .cubelet.x1'), 2, 'Z', true);
        case "F":
            return applyMove(cube.$cube.find('.cubelet.z0'), 1, 'X', true);
        case "F'":
            return applyMove(cube.$cube.find('.cubelet.z0'), 1, 'X', false);
        case "B":
            return applyMove(cube.$cube.find('.cubelet.z2'), 1, 'X', false);
        case "B'":
            return applyMove(cube.$cube.find('.cubelet.z2'), 1, 'X', true);
        case "S":
            return applyMove(cube.$cube.find('.cubelet.z1'), 1, 'X', true);
        case "S'":
            return applyMove(cube.$cube.find('.cubelet.z1'), 1, 'X', false);
        case "f":
            return applyMove(cube.$cube.find('.cubelet.z0, .cubelet.z1'), 2, 'X', true);
        case "f'":
            return applyMove(cube.$cube.find('.cubelet.z0, .cubelet.z1'), 2, 'X', false);
        case "b":
            return applyMove(cube.$cube.find('.cubelet.z1, .cubelet.z2'), 2, 'X', false);
        case "b'":
            return applyMove(cube.$cube.find('.cubelet.z1, .cubelet.z2'), 2, 'X', true);
        case "X":
            return applyMove(cube.$cube.find('.cubelet'), 3, 'Z', true);
        case "X'":
            return applyMove(cube.$cube.find('.cubelet'), 3, 'Z', false);
        case "Y":
            return applyMove(cube.$cube.find('.cubelet'), 3, 'Y', true);
        case "Y'":
            return applyMove(cube.$cube.find('.cubelet'), 3, 'Y', false);
        case "Z":
            return applyMove(cube.$cube.find('.cubelet'), 3, 'X', true);
        case "Z'":
            return applyMove(cube.$cube.find('.cubelet'), 3, 'X', false);
        }
    }

    function animateMove(cube, move) {
        return doMove(cube, move, function($cubelets, n, axis, cw) {
            return animateRotation(cube, $cubelets, n, axis, cw, Date.now());
        });
    }

    function fastMove(cube, move) {
        doMove(cube, move, function($cubelets, n, axis, cw) {
            rotateCublets($cubelets, n, axis, cw);
        });
        updateFaceletView(cube);
    }

    function parse(moves){
        var allowed = ["U","u","R","r","D","d","L","l","F","f","B","b","M","E","S","X","Y","Z","2","'"];

        // Clean unnecessary moves
        moves = moves
            .replace(/\(/gm,"")
            .replace(/\)/gm,"")
            .replace(/\[/gm,"")
            .replace(/\]/gm,"")
            .replace(/\n/gm," ");

        // Replace old algorithm notation
        // Fw, Bw, Rw, Lw, Uw, Dw
        moves = moves
            .replace(/Fw/gm, "f")
            .replace(/Bw/gm, "b")
            .replace(/Rw/gm, "r")
            .replace(/Lw/gm, "l")
            .replace(/Uw/gm, "u")
            .replace(/Dw/gm, "d")
            .replace(/x/gm, "X")
            .replace(/y/gm, "Y")
            .replace(/z/gm, "Z");

        var m = moves.split(" ");
        var parsed = [];
        for(var i = 0; i < m.length; i++){
            var move = m[i];

            // Sanity check max length
            if(move.length == 0 || move.length > 3)
                continue;

            // Sanity check move notation
            var sane = true;
            for (var j = 0; j < move.length; j++) {
                var segment = move[j];
                if ($.inArray(segment, allowed) < 0) {
                    sane = false;
                    break;
                }
            }

            if (!sane)
                continue;

            // Check for numeric moves like U2 and B2
            // Transform into separate moves U2 => U U
            var repeat = move[1];
            if ($.isNumeric(repeat)) {
                move = move.replace(move[1], "");
                while (repeat--) {
                    parsed.push(move);
                }
            } else {
                parsed.push(move);
            }
        }

        return parsed;
    }

    Cube.prototype.execute = function(moves) {
        this.moveStack.push.apply(this.moveStack, parse(moves));
        this.$cube.trigger('next-move');
    }

    Cube.prototype.fastMove = function(moves) {
        var moves = parse(moves);
        for (var i = 0, n = moves.length; i < n; i++) {
            fastMove(this, moves[i]);
        }
    }

    const stickerColorRegex = /sticker (\w+)/;

    function getFaceletColor($facelet) {
        var match = stickerColorRegex.exec($facelet.children('.sticker').attr('class'));
        if (!match) {
            return;
        }
        return match[1][0];
    }

    Cube.prototype.get = function() {
        var colors = [];
        this.$facelets.each(function() {
            colors.push(getFaceletColor($(this)));
        });
        return colors.join('');
    }

    const colors = ["yellow", "red", "green", "orange", "blue", "white"];

    Cube.prototype.reset = function() {
        this.$cube.find('.facelet').children().removeClass(colors);
        this.$cube.find('.facelet.up').children().addClass("yellow");
        this.$cube.find('.facelet.left').children().addClass("red");
        this.$cube.find('.facelet.front').children().addClass("green");
        this.$cube.find('.facelet.right').children().addClass("orange");
        this.$cube.find('.facelet.back').children().addClass("blue");
        this.$cube.find('.facelet.down').children().addClass("white");
        updateFaceletView(cube);
    }

    function charToColor(c) {
        switch(c) {
        case "y": return "yellow";
        case "r": return "red";
        case "g": return "green";
        case "o": return "orange";
        case "b": return "blue";
        case "w": return "white";
        default: return "";
        }
    }

    Cube.prototype.set = function(str) {
        for (var i = 0; i < 54; i++) {
            var color = charToColor(str[i]);
            this.$facelets.eq(i).children().removeClass(colors);
            this.$facelets.eq(i).children().addClass(color);
        }
        updateFaceletView(cube);
    }

    // generate sequence of scambles
    function scramble(seqlen) {
        // append set of moves along an axis to current sequence in order
        function appendmoves(sq, axsl, tl, la) {
            for (var sl = 0; sl < tl; sl++) {    // for each move type
                if (axsl[sl]) {                  // if it occurs
                    var q = axsl[sl] - 1;

                    // get semi-axis of this move
                    var sa = la;
                    if (sl + sl + 1 >= tl) { // if on rear half of this axis
                        sa += 3; // get semi-axis (i.e. face of the move)
                        q = 2 - q; // opposite direction when looking at that face
                    }
                    // store move
                    var move = "DLBURF".charAt(sa);
                    if (q != 0) move += " 2'".charAt(q);
                    sq[sq.length] = move;
                }
            }
        }

        // tl = number of allowed moves (twistable layers) on axis
        //      -- middle layer ignored
        var tl = 2;
        //set up bookkeeping
        var axsl = new Array(tl); // movement of each slice/movetype on this axis
        var axam = [0, 0, 0]; // number of slices moved each amount
        var la = -1; // last axis moved

        // initialise this scramble
        var seq = [];
        // reset slice/direction counters
        for (var i=0; i < tl; i++) axsl[i] = 0;
        axam[0] = axam[1] = axam[2] = 0;
        var moved = 0;

        // while generated sequence not long enough
        while (seq.length + moved < seqlen) {
            var ax, sl, q;
            do {
                // choose a random axis
                ax = Math.floor(Math.random() * 3);
                // choose a random move type on that axis
                sl = Math.floor(Math.random() * tl);
                // choose random amount
                q = Math.floor(Math.random() * 3);
            } while (ax == la || axsl[sl] != 0); // loop until have found an unused movetype

            // if now on different axis, dump cached moves from old axis
            if (ax != la) {
                appendmoves(seq, axsl, tl, la);
                // reset slice/direction counters
                for (var i=0; i < tl; i++) axsl[i] = 0;
                axam[0] = axam[1] = axam[2] = 0;
                moved = 0;
                // remember new axis
                la = ax;
            }

            // adjust counters for this move
            axam[q]++; // adjust direction count
            moved++;
            axsl[sl] = q + 1; // mark the slice has moved amount
        }

        // dump the last few moves
        appendmoves(seq, axsl, tl, la);

        return seq.join(' ');
    }

    Cube.prototype.scramble = function() {
        var moves = scramble(30);
        console.log(moves);
        this.fastMove(moves);
    }

    return Cube;
}());

var cube = null;
$(function() {
    cube = new Cube('.cube');

    $('.actions input').click(function() {
        var move = $(this).val();
        cube.execute(move);
    });

    $('.actions .scramble').click(function() {
        cube.scramble();
    });

    $('.actions .reset').click(function() {
        cube.reset();
    });
});
