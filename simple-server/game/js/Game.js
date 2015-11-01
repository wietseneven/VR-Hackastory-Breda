(function ( ManicGame, DepressedGame, PlayerChooser, ThreeDeeWorld ) {

    var dl = document.location;
    var socketServer = dl.origin;

    var socket = io( socketServer );

    var $gameContainer = $('#app');

    var Game = {

        setup: function () {

            socket.on('reset', Game.handleReset );
            socket.on('playertaken', Game.handlePlayerTaken );

            socket.on('lost', Game.handleLost );
            socket.on('won', Game.handleWon );

            // When choosing backup chooser
            ThreeDeeWorld.create();

            Game.createChooser();
        },

        createChooser: function () {

            // BACKUP

            //$gameContainer.append( ''.concat(
            //    '<h1>Choose your player</h1>',
            //    '<button id="manic">Man</button>',
            //    '<button id="depressed">Woman</button>'
            //) );
            //
            //// For now, clicking on a button above automatically starts the game
            //// by emitting the 'start' event.
            //// When merging both worlds emitting the 'start' event should depend
            //// on both players having clicked a button
            //
            //$('#manic' ).on('click', function () {
            //
            //    $gameContainer.hide();
            //
            //    ThreeDeeWorld.create();
            //
            //    ManicGame.setup( socket );
            //    socket.emit('login', 'manic');
            //});
            //
            //$('#depressed' ).on('click', function () {
            //
            //    $gameContainer.hide();
            //
            //    ThreeDeeWorld.create();
            //
            //    DepressedGame.setup( socket );
            //    socket.emit('login', 'depressed');
            //});

            // Use the 3D Chooser
            PlayerChooser.setup( socket );

            // Or choose on straight away
            //    DepressedGame.setup( socket );
            //    socket.emit('login', 'depressed');

        },

        createIntro: function () {
            // Intro movie? Animated Gif? 3D world?
        },

        createOutro: function () {

        },

        handleLost: function () {

        },

        handlePlayerTaken: function ( playerName ) {
            $('#'+ playerName ).hide(); // hide the button option
        },

        handleReset: function () {

        },

        handleWon: function () {

        }
    };


    /****************************/
    Game.setup();

})( window.ManicGame, window.DepressedGame, window.PlayerChooser, window.ThreeDeeWorld );