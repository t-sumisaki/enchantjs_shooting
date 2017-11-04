(function () {

    enchant();

    const PLAYER_ASSET_PATH = './img/chara1.png';
    const MONSTER_ASSET_PATH = './img/monster/bigmonster1.gif';
    const SHOT_ASSET_PATH = './img/icon1.png';


    const game = new Game(640, 320);

    game.fps = 24;
    game.keybind('Z'.charCodeAt(0), 'shot');
    game.keybind(' '.charCodeAt(0), 'enter');
    game.keybind('Q'.charCodeAt(0), 'quit');


    game.preload(PLAYER_ASSET_PATH);
    game.preload(MONSTER_ASSET_PATH);
    game.preload(SHOT_ASSET_PATH);

    game.players = [];
    game.monsters = [];

    game.addPlayer = function(_player) {
        let _index = this.players.indexOf(_player);
        if (_index < 0) {
            this.players.push(_player);
        }
    }

    game.removePlayer = function(_player) {
        let _index = this.players.indexOf(_player);
        if (_index > -1) {
            this.players.splice(_index, 1);
        }
    }

    game.addMonster = function(_monster) {
        let _index = this.monsters.indexOf(_monster);
        if (_index < 0) {
            this.monsters.push(_monster);
        }
    }

    game.removeMonster = function(_monster) {
        let _index = this.monsters.indexOf(_monster);
        if (_index > -1) {
            this.monsters.splice(_index, 1);
        }
    }

    game.restart = function () {
        console.log('[debug] restart...');
        while (this.currentScene != this.rootScene) {
            this.popScene();
        }

        let titleScene = new TitleScene(this);
        this.pushScene(titleScene);
    }

    game.onload = function () {
        console.log('[debug] onload...')
        this.rootScene.backgroundColor = '#7ecef4';
        this.restart();
    }

    game.start();

    const TitleScene = Class.create(Scene, {
        initialize: function (_game) {
            console.log('[debug] initialize TitleScene...')
            Scene.call(this);


            let label = new Label('Title');

            this.addChild(label);

            this.addEventListener('enterframe', function() {

            });
            this.addEventListener('enterbuttondown', function () {
                let connectScene = new ConnectScene(_game);
                _game.replaceScene(connectScene);
            })
        }
    });

    const ConnectScene = Class.create(Scene, {
        initialize: function (_game) {
            console.log('[debug] initialize ConnectScene...');
            Scene.call(this);

            let label = new Label('Connect');
            this.addChild(label);

            this.connected = true;

            this.addEventListener('enterframe', function () {
                if (this.connected) {
                    let gameScene = new GameScene(_game);
                    _game.replaceScene(gameScene);
                }
            })
        }
    })

    const GameScene = Class.create(Scene, {
        initialize: function (_game) {
            console.log('[debug] initialize GameScene...');
            Scene.call(this);

            this.gameover = false;

            let player = new Player(_game);
            this.addChild(player);
            _game.addPlayer(player);


            let monster = new Monster(_game);
            this.addChild(monster);
            _game.addMonster(monster);

            let lifebar = new LifeBar(monster, 10, 10);
            this.addChild(lifebar)



            this.addEventListener('quitbuttondown', function () {
                this.gameover = true;
            })

            this.addEventListener('enterframe', function () {
                if (_game.players.length == 0 || _game.monsters.length == 0) {
                    
                    this.gameover = true;
                }

                if (this.gameover) {
                    let resultScene = new ResultScene(_game);
                    _game.pushScene(resultScene);
                }
            })
        }
    })

    const ResultScene = Class.create(Scene, {
        initialize: function (_game) {
            console.log('[debug] initialize ResultScene...')
            Scene.call(this);


            let label = new Label('Result');
            this.addChild(label);


            this.addEventListener('quitbuttondown', function () {
                // to title;
                _game.restart();
            })
        }
    })


    const AActor = Class.create(Group, {
        initialize: function (_params) {
            Group.call(this);

            _params = _params || {};

            this.width = _params.width || 0;
            this.height = _params.height || 0;

            if (_params.image) {
                this._image = new Sprite(_params.image.width, _params.image.height);
                this._image.image = _params.image.asset;
                this._image.frame = _params.image.frame || 0;

                if (_params.image.animate) {
                    this._image.frame = _params.image.animate.frames[0];
                    this._image.animframes = _params.image.animate.frames;
                    this._image.step = _params.image.animate.step || 0;
                } else {
                    this._image.frame = _params.image.frame || 0;
                }

                if (_params.width != _params.image.width || _params.height != _params.image.height) {
                    this._image.scale(_params.width / _params.image.width , _params.height / _params.image.height);
                }

                this.addChild(this._image);
            }

            if (_params.collision) {

                this._collision = new Sprite(_params.collision.width, _params.collision.height);

                let _cOffset = _params.collision.offset || { x: 0, y: 0 };

                this._collision.moveTo(
                    (this._image.width / 2 - this._collision.width / 2) + _cOffset.x,
                    (this._image.height / 2 - this._collision.height / 2) + _cOffset.y);

                this._collision.backgroundColor = 'blue';
                this._collision.opacity = 0.3;
                this._collision.visible = _params.collision.debug || false;
                console.log(this._collision.visible);

                this.addChild(this._collision);
            }

            this.isIntersect = function (self) {
                let _collision = self._collision || self._image;
                return function (_other) {
                    let _otherCollision = _other._collision || _other._image;
                    return _collision.intersect(_otherCollision);
                }
            }(this);

            this.isAnyIntersect = function (self) {
                return function (_others) {
                    for (let _o of _others) {
                        if (self.isIntersect(_o)) {
                            return true;
                        }
                    }
                    return false;
                }
            }(this);

            this.animate = function (self) {
                let _frame = 0;
                let _cnt = 0

                return function (push = 1) {
                    _cnt += push;
                    if (_cnt % self.step == 0) {
                        _cnt = 0;
                        _frame = (_frame + 1) % self.animframes.length;
                        self.frame = self.animframes[_frame];
                    }
                }
            }(this._image);

            this.remove = function(_game) {
                _game.currentScene.removeChild(this);
                delete this;
            };

            this.add = function(_game) {
                _game.currentScene.addChild(this);
            }
        }
    });


    const Player = Class.create(AActor, {
        initialize: function (_game) {
            AActor.call(this, {
                width: 32,
                height: 32,
                image: {
                    width: 32,
                    height: 32,
                    asset: _game.assets[PLAYER_ASSET_PATH],
                    animate: {
                        frames: [0, 1, 0, 2],
                        step: 3
                    }
                },
                collision: {
                    width: 16,
                    height: 16,
                    debug: true
                }
            });

            this.x = 100;
            this.y = 100;
            this.hp = 3;
            this.speed = 6;
            this.recast = {
                normal: { max: 2, current: 0 }
            }

            this.socket = {
                shot: { x: this.width / 2, y: this.height / 2 }
            }

            this.shot = function(self) {
                return function(type) {

                    if (self.recast[type].current == 0) {
                        // 射撃する
                        let bullet = new PlayerBullet(_game, self)

                        bullet.add(_game);
                        console.log('shot: type=' + type);
                        self.recast[type].current = self.recast[type].max;
                    }
                }

            }(this);

            this.cooldown = function(self) {
                return function() {
                    for (let _r in self.recast) {
                        if (self.recast[_r].current > 0) {
                            --self.recast[_r].current;
                        }
                    }
                }
            }(this);

            this.onApplyDamage = function(damage) {
                this.hp -= damage;
                if (this.hp <= 0) {
                    _game.removePlayer(this);
                }
            }

            this.addEventListener('enterframe', function () {

                let vx = 0;
                let vy = 0;
                if (_game.input.up) {
                    vy -= this.speed;
                }
                if (_game.input.down) {
                    vy += this.speed;
                }
                if (_game.input.left) {
                    vx -= this.speed;
                }
                if (_game.input.right) {
                    vx += this.speed;
                }
                if (this.x + vx + this.width < _game.width && this.x + vx > 0) {
                    this.x += vx;
                }
                if (this.y + vy + this.height < _game.height && this.y + vy > 0) {
                    this.y += vy;
                }

                if (_game.input.shot) {
                    this.shot('normal');
                }

                this.animate();
                this.cooldown();
            });
        }
    });

    const Monster = Class.create(AActor, {
        initialize: function(_game) {

            AActor.call(this, {
                width: 200,
                height: 200,
                image: {
                    width: 80,
                    height: 80,
                    asset: _game.assets[MONSTER_ASSET_PATH],
                    animate: {
                        frames: [2, 3, 4, 3],
                        step: 6
                    }
                },
                collision: {
                    width: 160,
                    height: 160,
                    debug: true
                }
            });

            this.x = 400;
            this.y = 100;

            this.hp = 100;
            this.defaulthp = 100;

            this.recast = {
                normal: { max: 12, current: 0 }
            }

            this.cooldown = function(self) {
                return function() {
                    for (let _r in self.recast) {
                        if (self.recast[_r].current > 0) {
                            --self.recast[_r].current;
                        }
                    }
                }
            }(this);

            this.onApplyDamage = function(damage) {
                this.hp -= damage;
                if (this.hp <= 0) {
                    _game.removeMonster(this);
                }
            }

            this.addEventListener('enterframe', function() {
                this.shot('normal');
                this.animate();
                this.cooldown();
            })

            this.shot = function(self) {
                return function(type) {
                    
                    if (self.recast[type].current == 0) {
                        let _from = {
                            x: self.x,
                            y: self.y
                        }
                        let _rad = Math.PI;
                        let _index = Math.floor(Math.random() * _game.players.length);
                        console.log(_index);
                        let _target = _game.players[_index];

                        if (_target) {
                            let _to = {
                                x: _target.x + _target.width / 2,
                                y: _target.y + _target.height / 2
                            }
                            _rad = getRadian(_from, _to);
                            console.log(_rad);
                        }

                        // 射撃する
                        let bullet;
                        bullet = new MonsterBullet(_game, self, _from, _rad);
                        bullet.add(_game);

                        bullet = new MonsterBullet(_game, self, _from, _rad + (15 * Math.PI / 180));
                        bullet.add(_game);

                        bullet = new MonsterBullet(_game, self, _from, _rad + (-15 * Math.PI / 180));
                        bullet.add(_game);

                        self.recast[type].current = self.recast[type].max;
                    }
                }

            }(this);

        }
    });

    const Bullet = Class.create(AActor, {
        initialize: function(_game, _x, _y, _direction, _options) {

            _options = _options || {}

            AActor.call(this, {
                width: _options.width || 16,
                height: _options.height || 16,
                image: {
                    width: 16,
                    height: 16,
                    asset: _game.assets[SHOT_ASSET_PATH],
                    frame: 3
                },
                collision: {
                    width: _options.width || 16,
                    height: _options.height || 16,
                    debug: true
                }
            })

            this.x = _x;
            this.y = _y;
            this.direction = _direction;
            this.speed = _options.speed;
            this.power = _options.power || 1;

            this.addEventListener('enterframe', function() {

                this.x += this.speed * Math.cos(this.direction);
                this.y += this.speed * Math.sin(this.direction);

                if (this.x < 0 || this.x > _game.width || this.y < 0 || this.y > _game.height) {
                    this.remove(_game);
                }
            })
        }
    });

    const PlayerBullet = Class.create(Bullet, {
        initialize: function(_game, _player, _offset) {
            _offset = _offset || {x: 0, y: 0};
            Bullet.call(this, _game, _player.x + _offset.x, _player.y + _offset.y, 0, {
                width: 16,
                height: 4,
                speed: 15,
                power: 1,
            });

            this.addEventListener('enterframe', function() {
                for (let _m of _game.monsters) {
                    if (this.isIntersect(_m)) {
                        console.log('[player]hit');
                        _m.onApplyDamage(this.power);
                        this.remove(_game);
                    }
                }
            })
        }
    });

    const MonsterBullet = Class.create(Bullet, {
        initialize: function(_game, _monster, _start, _rad) {
            Bullet.call(this, _game, _start.x, _start.y, _rad, {
                width: 8,
                height: 8,
                speed: 6,
                power: 1,
            });
            this.addEventListener('enterframe', function() {
                for (let _m of _game.players) {
                    if (this.isIntersect(_m)) {
                        console.log('isIntersect');
                        _m.onApplyDamage(this.power);
                        this.remove(_game);
                    }
                }
            })
        }
    });


    const LifeBar = Class.create(Entity, {
        initialize: function(_target, x, y) {
            Entity.call(this);
            this.width = 500;
            this.height = 30;
            this.backgroundColor = 'blue';
            this.x = x;
            this.y = y;

            this.defaultWidth = 500;

            this.addEventListener('enterframe', function() {
                this.width = this.defaultWidth * (_target.hp / _target.defaulthp);
                console.log(this.width);
            })
        }
    });
    function getRadian(_from, _to) {
        let _pX = _to.x - _from.x;
        let _pY = _to.y - _from.y;
        console.log(_pX, _pY)
        if (_pY > 0) {
            return Math.acos(_pX / Math.sqrt(Math.pow(_pX, 2) + Math.pow(_pY, 2)));
        } else {
            return -1 * Math.acos(_pX / Math.sqrt(Math.pow(_pX, 2) + Math.pow(_pY, 2)));
        }
    }
})();