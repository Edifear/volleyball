(function() {
    var i, canvas, ctx, w, h, intervalID;
    canvas = $('#surface')[0];
    ctx = canvas.getContext("2d");
    w = canvas.width;
    h = canvas.height;
    var drawFrame = (function(ctx) {
        return function() {
            ctx.strokeStyle = 'DarkGrey';
            ctx.strokeRect(0.5, 0.5, w - 1, h - 1);
        };
    })(ctx);
    var getBalls = function() {
        var draw = function(ctx) {
            var i, b;
            for (i = 0; i < this.length; i += 1) {
                b = this[i];
                ctx.strokeStyle = 'SeaGreen';
                ctx.fillStyle = 'Chartreuse';
                ctx.beginPath();
                ctx.arc(b.center.x, b.center.y, b.radius, 0, Math.PI * 2, true);
                ctx.fill();
                ctx.stroke();
            }
        };
        var move = function() {
            var i, b;
            for (i = 0; i < this.length; i += 1) {
                b = this[i];
                b.center.x += b.velocity.x;
                b.center.y += b.velocity.y;
            }
        };
        var isCollision = function(b, c) {
            var dx = b.center.x - c.center.x;
            var dy = b.center.y - c.center.y;
            var dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < b.radius + c.radius) {
                return true;
            }
            return false;
        };

        // http://en.m.wikipedia.org/wiki/Elastic_collision
        // http://en.m.wikipedia.org/wiki/Dot_product
        var resolveCollision = function(b, c) {


            var vector = function(p1, p2) {
                return {
                    x: p1.x - p2.x,
                    y: p1.y - p2.y
                };
            };
            var length = function(v) {
                return Math.sqrt(v.x * v.x + v.y * v.y);
            };
            var dot = function(v1, v2) {
                return v1.x * v2.x + v1.y + v2.y;
            };
            var normalize = function(v) {
                var len = length(v);
                return {
                    x: v.x / len,
                    y: v.y / len
                };
            };

            var dn = vector(b.center, c.center);

            // The distance between the balls
            var delta = length(dn);

            // The normal vector of the collision plane
            dn = normalize(dn);

            // The tangential vector of the collision plane
            var dt = {
                x: dn.y,
                y: -dn.x
            };

            // avoid division by zero
            if (delta === 0) {
                c.center.x += 0.01;
            }

            //the masses of the two balls
            var m1 = b.mass;
            var m2 = c.mass;
            var M = m1 + m2;

            // minimum translation distance to push balls apart
            var mt = {
                x: dn.x * (b.radius + c.radius - delta),
                y: dn.y * (b.radius + c.radius - delta)
            };

            // push the balls apart proportional to their mass
            b.center = {
                x: b.center.x + mt.x * m2 / M,
                y: b.center.y + mt.y * m2 / M
            };

            c.center = {
                x: c.center.x - mt.x * m1 / M,
                y: c.center.y - mt.y * m1 / M
            };

            // the velocity vectors of the balls before the collision
            var v1 = b.velocity;
            var v2 = c.velocity;

            // split the velocity vector of the first ball into a normal and a tangential
            // component in respect of the collision plane
            var v1n = {
                x: dn.x * dot(v1, dn),
                y: dn.y * dot(v1, dn)
            };
            var v1t = {
                x: dt.x * dot(v1, dt),
                y: dt.y * dot(v1, dt)
            };

            // split the velocity vector of the second ball into a normal and a tangential
            // component in respect of the collision plane
            var v2n = {
                x: dn.x * dot(v2, dn),
                y: dn.y * dot(v2, dn)

            };
            var v2t = {
                x: dt.x * dot(v2, dt),
                y: dt.y * dot(v2, dt)
            };

            // calculate new velocity vectors of the balls, the tangential component stays
            // the same, the normal component changes analog to the  1-Dimensional case
            b.velocity = {
                x: v1t.x + dn.x * ((m1 - m2) / M * length(v1n) + 2 * m2 / M * length(v2n)),
                y: v1t.y + dn.y * ((m1 - m2) / M * length(v1n) + 2 * m2 / M * length(v2n))
            };
            c.velocity = {
                x: v2t.x - dn.x * ((m2 - m1) / M * length(v2n) + 2 * m1 / M * length(v1n)),
                y: v2t.y - dn.y * ((m2 - m1) / M * length(v2n) + 2 * m1 / M * length(v1n))
            };
        };

        var applyForce = function() {
            var i, j, b, c, tx, ty;
            for (i = 0; i < this.length; i += 1) {
                b = this[i];
                for (j = i + 1; j < this.length; j += 1) {
                    c = this[j];
                    if (isCollision(b, c)) {
                        resolveCollision(b, c);
                    }
                }
                if (b.center.x + b.radius > w || b.center.x - b.radius < 0) {
                    b.velocity.x = -b.velocity.x;
                }
                if (b.center.y + b.radius > h || b.center.y - b.radius < 0) {
                    b.velocity.y = -b.velocity.y;
                }
            }
        };

        var addABall = function() {
            this.push({
                radius: 10,
                mass: 10,
                center: {
                    x: w / 4 + Math.random() * w / 2,
                    y: h / 4 + Math.random() * w / 2
                },
                velocity: {
                    x: -5 + Math.random() * 10,
                    y: -5 + Math.random() * 10
                }
            });
        };
        var balls = [];
        balls.move = move;
        balls.draw = draw;
        balls.applyForce = applyForce;
        balls.addABall = addABall;
        return balls;
    };
    var balls = getBalls();
    for (i = 0; i < 5; i += 1) {
        balls.addABall();
    }
    intervalID = setInterval(function() {
        balls.applyForce();
        balls.move();
        ctx.clearRect(0, 0, w, h);
        drawFrame();
        balls.draw(ctx);
    }, 33);

})();