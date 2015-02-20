require 'digest/md5'
require 'json'

class HomeController < ApplicationController

    def index
        # Pass to the template a mapping of all javascript asset paths to
        # a path with a busting parameter appended. The parameter is an
        # MD5 hash of the file contents, so that individual files will be
        # busted as they are modified, and unmodified files will remain
        # cached. This mapping is passed to requirejs' path config.
        asset_hash = Dir.chdir("app/assets/javascripts") do
             Hash[Dir.glob("**/*.js").map do |filename|
                file = File.open(filename, 'r')
                retval = [filename[0..-4], "#{filename}?bust=#{Digest::MD5.hexdigest(file.read)}"]
                file.close
                retval
            end]
        end

        @asset_hash = asset_hash.to_json
    end

    # Returns the current active game, or creates a new game if an active
    # game does not exist.
    def get_or_create_game
        # Since multiple players may attempt to get_or_create_game at the
        # same time, only allow 1 the possibility of creating a new game.
        Game.connection.execute("BEGIN EXCLUSIVE")

        # Check if the latest game is active. If so, continue that game.
        # Otherwise create a new game.
        # TODO check the state of the game, anything other than complete
        # should be picked back up
        game = Game.last
        if !game || game.state == "complete"
            Game.connection.execute("INSERT INTO games (state) VALUES ('config')")

            # If a new game was created, save the name of the player who did
            # the creation
            player_name = params[:player_name]
        end

        Game.connection.execute("END")

        # Indicates that this player just created a new game. Create a new
        # Player and set it to be the active player in charge of the game
        # configuration stage.
        if player_name
            Game.uncached do
                game = Game.last
            end
            player = Player.create(:name => player_name, :game_id => game.id)
            game.update_attributes(:active_player_id => player.id)
        end

        render :json => {
            :game => game,
            :players => game ? game.players : []
        }
    end

    def get_latest
        game = Game.last
        render :json => {
            :game => game,
            :players => game ? game.players : []
        }
    end

    def update_game
        game = Game.last
        if !game
            err = "No game in progress"
        elsif game.state == "complete"
            err = "Cannot update completed game"
        end

        if err
            return render :json => { :error => err }, :status => 403
        end

        updated_game = JSON::parse(params["game"])
        updated_players = updated_game.delete("players")

        game.update updated_game
        updated_players.each do |player_changes|
            Player.find(player_changes["id"]).update(player_changes)
        end

        return render :json => {
            :game => game,
            :players => game.players
        }
    end

    def join_game
        game = Game.last
        players = game && game.players

        if !game
            err = "No game in progress"
        elsif game.state === "complete"
            err = "Cannot join completed game"
        elsif players && players.length > 5
            err = "Cannot join already full game"
        end

        if err
            return render :json => { :error => err}, :status => 403
        end

        Player.create(:name => params[:name], :game_id => game.id)

        return render :json => {
            :game => game,
            :players => game.players
        }
    end


    # picking a game back up:
    # check for user name cookie, or prompt for name if no cookie
    # (TODO use google auth)
    # some handwaviness here, will worry about rejoining an existing game later
    #
    # starting a new game:
    # all players hitting the page for the first time will check for auth. (a
    # username cookie for now, TODO use google auth). If user is not authenticated,
    # will prompt user to authenticate, (for now this means entering a username),
    # which will set an auth cookie.
    #
    # once a player is authenticated, they'll hit the get or create game endpoint.
    # Assuming no game in progress, the first of the players to try will create
    # the game, set state to config, set self as the active player (configuring
    # player), save to db. other players will continue polling for game and will
    # eventually pull in a game in config state for which they are not the active
    # player, so they'll just keep polling till something changes.
    #
    # config state:
    # when non active players load the game in config mode, show them a
    # message: game is being configured, please wait to join. keep polling till
    # something changes.
    # when the active player loads the game in config mode, show them config
    # options:
    #  - use preset config (including characters, board state, etc)
    #  - randomize all the things
    #  - choose all the things
    # user's selection will update the game config type, set state to joining,
    # save game, continue polling
    #
    # joining state:
    # when players load the game in joining mode, show them a list of players who
    # have joined. if they have not yet joined, show them a button which will send
    # a request to the server to add them to the game. polling users will get updated
    # lists as everybody joins.
    # the active player will also see a button to move to the next step with the players
    # shown as joined. when this is clicked, a turn order will be randomly determine
    # (how is this stored?), a starting player will be randomly determined. The round
    # cards and bonus cards will be chosen (either randomly or using presets stored on
    # the FE based on the number of players). Then the config will be checked to decide
    # what state to go to next:
    #
    # config != random characters:
    # update game state to drafting, set the starting player as the active player,
    # save the game
    #
    # config == randomize:
    # worry about this later, just get preset working right now.
    #
    # drafting state:
    # if the non active player receives the game in drafting mode, it will show them the
    # turn order, and the factions chosen so far. annoyingly, according to the rules we should be
    # showing the board/round cards/bonus cards before players choose faction boards, cause i
    # guess if you're particularly good at the game you can use that info when choosing a faction.
    # not sure how to render all that on one page, may add that stuff in later and assume nobody
    # is good enough at the game yet to utilize that info in this state.
    # if the active player receives the game in drafting mode, it will show them the available
    # factions. these are determined by the game config. If in preset, the set is defined on
    # the FE for each number of players. If not, all factions are available. Remove from this
    # set those that have already been chosen, show all the remaining faction boards so
    # active player can choose one.
    # once faction is chosen, FE will initialize the player model with the faction and all the
    # starting values for that faction (stored on the FE).
    # If this is the last player in turn order (ie: all the players have a faction chosen),
    # change the game state to dwellings, set the active player back to the starting player,
    # save the game. otherwise don't update the game, just save the player changes.
    #
    # dwelling state:
    # when a player receives the game in dwelling mode, it will render the board and show
    # the players in turn order and who is currently active.
    # when the active player clicks on a valid space, the appropriate models will be updated
    # (add a structure of type dwelling to the clicked hex, update player's remaining strctures
    # and income). When the player clicks done, update the active player and save the game.
    # Choosing the player to make active is done as follows: if there are players who do not
    # have their first dwelling placed, choose the next player in turn order. If all players
    # have 1 dwelling placed, choose the next player in reverse turn order (TODO need to handle
    # factions that only start with 1 dwelling. probably that player will still be set to active
    # player, and that player will handle skipping over the second selection phase). TODO how to
    # notify special races who get more than 2 dwellings that it's their turn to place additional
    # dwellings?)
    # Once it's been determined that all dwellings are placed, update the game state to bonus,
    # update the active player to the starting player, save the game.
    #
    # bonus state:
    # still part of the setup, choosing the bonus to start the first round with.
    # when a player receives the game in bonus mode, it will continue to show the board and
    # players in turn order and the active player.
    # the active player will be able to click on one of the bonus tiles to take it. the bonus
    # model knows how to handle being taken by a player (updates income, listens for actions
    # to handle action bonuses, etc). add the bonus to the player, remove it from the game,
    # update the active player. if all players have bonuses, active player becomes starting
    # player, otherwise the next in turn order. if all players have bonuses, sets the game
    # state to active, save the game.
    #
    # active state:
    # when a player receives the game in active state, find the active round/phase and handle
    # it appropriately. some round/phases should be handled only by the active player, others
    # are done in parallel. Each will check when necessary.
    #
    # if no active rounds, the active player will find the earliest round that has not begun
    # and start it. the round model handles marking players as blocking the phase completion
    # and saving the game.
    #
    # if in income mode, all players will update their resources and remove themselves from
    # the phase blocking list, and save the game.
    #
    # if in income mode and there are no blocking players left, the active player will prompt
    # the round to begin the action phase, and save the game.
    #
    # if in actions phase, the active player will be shown the 8 options for types of actions
    # to take.
    #   terraform/build will add buttons to all the empty land hexes on the board. When clicked,
    #   check if hex is indirectly adjacent to an existing structure, or if player has some
    #   exception to that rule. if hex is okay, pop up a modal asking the desired terrain type.
    #   when selected, if cost is greater than number of spades in player's resources, pop up
    #   a modal asking for payment. once paid, or if no payment needed, change space. if space
    #   is now the correct terrain type for the player, pop up a modal offering a dwelling.
    #   if accepted, pop up a modal asking for payment. once paid, add structure to hex.
    #   TODO handle offering power to directly adjacent players. trigger event so that action
    #   bonuses from rounds/bonuses/favor tiles will be called as needed.
    #   TODO should we automically determine if a town was just founded and handle that as
    #   necessary, or should the player need to click something to found the town?
    #
    #
    #
    #
    # increase tracks:
    # add a button somewhere to move 1 up the track. when clicked, pop up a modal that asks for
    # payment. remove costs, increase track, save player board.
    #
    # send a priest to a cult:
    # make the top available spot a button, as well as a +1 button which, when clicked, pop up a modal that asks for payment.
    # remove costs, increase track if possible (check for 10 spot full, enough town keys),
    # possibly get power, save player board and cult board.
    #
    # terraform/build:
    # make all the empty land spaces buttons, when clicked, check if hex is indirectly adjacent to
    # an existing space, or if player has some exception to that rule. pop up a modal asking the desired
    # terrain type. when selected, if cost is greater than number of spades, pop up a modal
    # asking for payment. if cost is less than available spades, leave buttons on empty land spaces,
    # otherwise reove them. remove costs, change space, if space is the right color then add a button to build a dwelling. when clicked,
    # pop up a modal asking for payment. when received, update board, player board, and check all the directly
    # adjacent hexes for opponent structures. send a post to the server with which players can get how
    # much power. check if the current round bonus is for terraforuming or building a dwelling. check if
    # a town was founded. check if player has a favor tile for bonus points.
    #
    # server: offer power
    # make an action over blocker that all the given players must accept or reject the power offering.
    # when a player saves their updated player state, if original player is a cultist, check if the
    # player accepted. if so, add a blocker to action completion for the cultist to advance up a
    # cult track.
    #
    # power offering:
    # if the player has a power offering, pop up a modal explaining the costs, if accepted then
    # update the player state, save.
    #
    # advance up the cult track:
    # if the player has an unused advance up the cult track, pop up a modal asking which track to
    # advance. update player state and save.
    #
    # upgrading a structure:
    # make each structure a button that, when clicked, pops open a modal asking which structure
    # to upgrade to. once one is chosen, open a modal asking for payment. when received, update board,
    # player board, and check all the directly adjacent hexes for opponent structures. send a post to
    # the erver with which players can get how much power. check if the current roud bonus is for
    # the new type of structure. check if a town was founded. check if structure was religion. if
    # so, pop up a modal asking which favor to take. after favor is taken, update the cult board,
    # if town cost favor taken.... check all the structure collections for if a town was founded.
    # check if player has a favor that gives bonus for upgrade.
    #
    # conversions:
    # add a button to allow for conversions. pop open a modal with the possible conversions. update
    # player state.
    #
    # sacrificing power:
    # add a button to allow sacrificing power to move power from 2->3.
    #
    # special actions:
    # building a bridge:
    # make all the water spaces buttons. listen for a click, when clicked, add bridge. save player
    # state and board.
    #
    # taking spades:
    # update the player's spade count. listen for terraforming clicks.
    #
    # taking resources:
    # update player board
    #
    # going up the cult track:
    # pop open the modal asking which track to advance.
    #
    # founding a town: pop up a modal asking which key to take. if witches, give bonus points.
    # check if round bonus for founding a town. update player's key count.
    #
    # passing: return bonus, undo any shipping/income increases. if bonus has return conditions,
    # assign points appropriately
    #
    # user clicks end action:
    # check that there are no spades unused, check that something has changed. alert user otherwise.
    #
    # server: end action:
    # check if player passed (has different bonus). if so, remove player from must pass blocking
    # phase list. if list empty, initiate cleanup phase. if first player to be removed, give
    # player starting player token.
    #
    # initiate cleanup phase: set phase to cleanup. put money on remaining bonuses. create list
    # of players who are blocking cleanup completion.
    #
    # cleanup phase:
    # when the browser detects a cleanup phase, it checks the cult scoring for this round.
    # if applicable, gain the benefits. give user rundown of gainzZz. if spades available,
    # make land hexes buttons allowing terraforming.
    #
end
