class CreatePlayers < ActiveRecord::Migration
  def change
    create_table :players do |t|
      t.integer :game_id, index: true, null: false
      t.string :name, index: true, null: false
      t.string :faction
      t.integer :victory_points
      t.integer :coins
      t.text :power
      t.integer :workers
      t.integer :priests
      t.text :supply
      t.integer :shipping_value
      t.integer :land_skipping_value
      t.text :income

      t.timestamps
    end
  end
end
