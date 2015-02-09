class Game < ActiveRecord::Base
    has_many :players

    # state: string
    #           config, joining, drafting, dwellings, bonus, active, complete
    #
    # hexes: json 2D array of hex objects (terrain, key, structure (player id, type)). FE knows
    #           how to build the board from this array.
    #
    # rounds: json array objects (id, phase)
    #           ids are strings of the form cultName:bonus (ex: water:spade). FE can determine from
    #           ids which round tile it is and what the specific bonuses are.
    #           water:priests, fire:power, air:spades, water:spades, air:workers, fire:workers,
    #           earth:coins, earth:spades
    #           phase is an integer from 0-4
    #           0 - Round has not yet begun
    #           1 - Round is active an in income phase
    #           2 - Round is active and in actions phase
    #           3 - Round is active and in cleanup phase
    #           4 - Round is complete
    #
    # cults: json object, keys are cult names (ex: earth, fire) and values are objects with keys track
    #           and advances.
    #           track: 2D arrays of length 10. Each position stores an array ids of players on that position.
    #           advances: array of length 4 representing which player is on which advance space. FE tracks
    #           the number of advances represented by each array position (3, 2, 2, 2)
    #
    # keys: json array of integers. values represent how many victory points this key gains. FE can determine
    #       from that value what the other bonus from this tile is.
    #
    # favorTiles : json object { cultName: [3, 3, 2, 2, 1, 1] } where the numbers in the array represent
    #              the number of spaces up the cult track the bonus gives. FE can determine from that what
    #              the other bonus is.
    #
    # bonuses : json object {id: integer} - the id is one of the ids listed below, representing the benefits
    #              for each of the 3 stages separated by colons, and the value is the number of the coins on
    #              the bonus.
    #          priests::
    #          workers,power::
    #          coins::
    #          power:shipping:
    #          coins:spade:
    #          coins:cult:
    #          coins::dwelling
    #          workers::tradingHouse
    #          workers::stronghold,sanctuary
end
