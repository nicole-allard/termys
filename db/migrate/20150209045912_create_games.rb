class CreateGames < ActiveRecord::Migration
  def change
    create_table :games do |t|
      t.string :state
      t.integer :active_player_id
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
