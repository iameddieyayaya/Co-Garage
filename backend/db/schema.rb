# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[7.1].define(version: 2024_01_01_000004) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "bays", force: :cascade do |t|
    t.bigint "shop_id", null: false
    t.decimal "hourly_rate", precision: 10, scale: 2, null: false
    t.text "description", null: false
    t.boolean "available", default: true, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["shop_id"], name: "index_bays_on_shop_id"
  end

  create_table "bookings", force: :cascade do |t|
    t.bigint "bay_id", null: false
    t.bigint "user_id", null: false
    t.datetime "start_time", null: false
    t.datetime "end_time", null: false
    t.decimal "total_price", precision: 10, scale: 2, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["bay_id", "start_time", "end_time"], name: "index_bookings_on_bay_id_and_start_time_and_end_time"
    t.index ["bay_id"], name: "index_bookings_on_bay_id"
    t.index ["user_id"], name: "index_bookings_on_user_id"
  end

  create_table "shops", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.string "name", null: false
    t.string "location", null: false
    t.text "description", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["user_id"], name: "index_shops_on_user_id"
  end

  create_table "users", force: :cascade do |t|
    t.string "email", null: false
    t.string "password_digest", null: false
    t.integer "role", default: 0, null: false
    t.string "name"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["email"], name: "index_users_on_email", unique: true
  end

  add_foreign_key "bays", "shops"
  add_foreign_key "bookings", "bays"
  add_foreign_key "bookings", "users"
  add_foreign_key "shops", "users"
end
