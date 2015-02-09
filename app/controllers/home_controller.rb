class HomeController < ApplicationController
    # player connects to server, server looks for latest game in db, if game is in
    # progress go to the request to join
    #
    # picking a game back up:
    # check for user id cookie, or prompt for name if no cookie
    #
    # starting a new game:
    # create a new game, save to db, state is config, everything else is null.
    #
    # if a player hits the page while in config mode, send them the game with the
    # config state. browsers will show a message: 'game is being configured, pls
    # wait to join', and start pinging for updates.
    # show first user game config options:
    #  - use preset config (including characters, board state, etc)
    #  - choose characters, random board state
    #  - random characters
    # user's selection will be sent back to server, user will start pinging for
    # updates
    # server will pull the latest game, update state to joining, save board.
    # users who are pinging will get the board with state joining, and ask player
    # to sumit a unique name if they'd like to join. frontend will set a cookie
    # with the player's name (in case of refreshing browsers), and save the name
    # locally.
    # server upon receving request to join will check if game is active or joining.
    # if joining, add players with the given name, but no race or anything, as long
    # as the name is unique. if game is active, do nothing, player will take the place
    # of the existing player.
    # users who are pinging should get updated player list and show the list
    # to the user, along with a 'start now' button.
    # server upon receiving a start now request will check the game config:
    #
    # choose characters:
    # update game state to drafting.
    #
    # random:
    # assign random races to players, pick random bonuses, round scoring tokens.
    # update game state to dwellings.
    #
    # preset:
    # count the number of players, pull up the game state and players for that number,
    # start game: start income phase, and set game state to bonus.
    #
    #
    # drafting:
    # if user's browser receive the game in state drafting, it will check if this player
    # is the earlier player in the player list that doesn't have a race associated, and
    # if so, will show the available races for the user to choose from. otherwise will
    # show the order of players, who is picking, and what has already been picked. once
    # the user submits a selected race, server will update the player's race and generally
    # initialize the player's starting shit. once the last player has a race, the server
    # will change the state to dwellings, and randomly choose a starting player, and give
    # that player a starting player token, and save to the game state the active player.
    #
    # dwelling:
    # if the user's browser receives the game in dwelling mode, it will render the whole
    # game state and show both the starting player and the active player. the active player
    # will have the option to select a space for their first dwelling. other players will
    # receive an error on click. once a user chooses their space, and clicks done, it will
    # submit that player's state and the current board state to the server. the server will
    # save the new board and player states and update the active player to next in clockwise
    # order, until all players have 1 dwelling placed, then will reverse the order, skipping
    # over any special races that have all their starting dwellings out. once all
    # players have placed 2 dwellings, server will check for special races placing additional
    # dwellings, and update the active player appropriately. once the server determines that
    # all players have all their dwellings out, it updates the game state to bonus, updates
    # the active player to the player with the starting token.
    #
    # bonus:
    # if the user's browser receives the game in bonus mode, and the current player is the
    # active player, it will allow the active player to pick one bonus. send the updated
    # board and player state with the bonus to the server. server saves player state and
    # updates active player. once all players have a bonus, starts the income phase.
    #
    # taking a bonus:
    # increase income as necessary, increase shipping if necessary
    #
    # server: starting income phase:
    # create blocking list of players who must complete income, set phase to income,
    # if game state is not yet active, set to active.
    #
    # active:
    # income:
    # browser checks the phase. if income, and player name is in the blocking income list,
    # update player state with income and save updated player state. server will save updated
    # player, and remove player from blocking list. once blocking list is empty, will start
    # actions phase.
    #
    # server: starting actions phase:
    # create a blocking list of players who must pass, set phase to actions, set the active
    # player to the starting player.
    #
    # actions:
    # browser checks the phase. if actions, and player is the active player, allow clicking on
    # things. here's where it gets complicated!
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
