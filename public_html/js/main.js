(function() {

    enchant();


    const game = new Game(640, 320);



    game.fps = 24;
    game.keybind('Z'.charCodeAt(0), 'shot');
    game.keybind(' '.charCodeAt(0), 'enter');
    game.keybind('Q'.charCodeAt(0), 'quit');


    game.restart = function() {
        console.log('[debug] restart...');
        while(this.currentScene != this.rootScene) {
            this.popScene();
        }

        let titleScene = new TitleScene(this);
        this.pushScene(titleScene);
    }

    game.onload = function() {
        console.log('[debug] onload...')
        this.rootScene.backgroundColor = '#7ecef4';
        this.restart();
    }

    game.start();

    const TitleScene = Class.create(Scene, {
        initialize: function(_game) {
            console.log('[debug] initialize TitleScene...')
            Scene.call(this);


            let label = new Label('Title');
            
            this.addChild(label);

            this.addEventListener('enterbuttondown', function() {
                let connectScene = new ConnectScene(_game);
                _game.replaceScene(connectScene);
            })
        }
    });

    const ConnectScene = Class.create(Scene, {
        initialize: function(_game) {
            console.log('[debug] initialize ConnectScene...');
            Scene.call(this);

            let label = new Label('Connect');
            this.addChild(label);

            this.connected = true;

            this.addEventListener('enterframe', function() {
                if (this.connected) {
                    let gameScene = new GameScene(_game);
                    _game.replaceScene(gameScene);
                }
            })
        }
    })

    const GameScene = Class.create(Scene, {
        initialize: function(_game) {
            console.log('[debug] initialize GameScene...');
            Scene.call(this);


            let label = new Label('Game');
            this.addChild(label);


            this.gameover = false;


            this.addEventListener('quitbuttondown', function() {
                this.gameover = true;
            })

            this.addEventListener('enterframe', function() {
                if (this.gameover) {
                    let resultScene = new ResultScene(_game);
                    _game.replaceScene(resultScene);
                }
            })
        }
    })

    const ResultScene = Class.create(Scene,  {
        initialize: function(_game) {
            console.log('[debug] initialize ResultScene...')
            Scene.call(this);


            let label = new Label('Result');
            this.addChild(label);


            this.addEventListener('quitbuttondown', function() {
                // to title;
                _game.restart();
            })
        }
    })

})();