class CreateGames < ActiveRecord::Migration
  def change
    create_table :games do |t|
      t.string :state
      t.string :config
      t.integer :active_player_id
      t.integer :starting_player_id
      t.text :blocking_players
      t.text :board
      t.text :rounds
      t.text :cults
      t.text :keys
      t.text :favors
      t.text :bonuses

      t.timestamps
    end
  end
end
