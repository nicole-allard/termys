# encoding: UTF-8
# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 20150209045912) do

  create_table "games", force: :cascade do |t|
    t.string   "state"
    t.integer  "active_player_id"
    t.text     "blocking_players"
    t.text     "board"
    t.text     "rounds"
    t.text     "cults"
    t.text     "keys"
    t.text     "favors"
    t.text     "bonuses"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "players", force: :cascade do |t|
    t.integer  "game_id",             null: false
    t.string   "name",                null: false
    t.string   "faction"
    t.integer  "turn_position"
    t.integer  "victory_points"
    t.integer  "coins"
    t.text     "power"
    t.integer  "workers"
    t.integer  "priests"
    t.integer  "num_keys"
    t.text     "supply"
    t.integer  "shipping_value"
    t.integer  "land_skipping_value"
    t.text     "income"
    t.string   "bonus"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "players", ["game_id"], name: "index_players_on_game_id"
  add_index "players", ["name"], name: "index_players_on_name"

end
