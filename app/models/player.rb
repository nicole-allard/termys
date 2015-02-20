class Player < ActiveRecord::Base
    belongs_to :game

    # power: json object, from bowl number to amount of power
    #        { 1: 5, 2: 7, 3: 0}
    #
    # supply: json object, from resource name to amount
    #         resources: priests, dwellings, tradingHouses, temples, strongholds, sanctuaries, bridges
    #
    # income: json object, from resource name to amount
    #         resources: coins, power, workers, priests
    #
    # bonus: string (id) - one of the ids listed below, representing the benefits for each of the 3 stages separated by colons
    #          priests::
    #          workers,power::
    #          coins::
    #          power:shipping:
    #          coins:spade:
    #          coins:cult:
    #          coins::dwelling
    #          workers::tradingHouse
    #          workers::stronghold,sanctuary
    #
    # num_keys: the number of town keys a player has acquired. Used to determine how many final positions on the cult tracks
    #           a player may occupy.
end
