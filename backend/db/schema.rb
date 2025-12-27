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

ActiveRecord::Schema[7.1].define(version: 2025_12_27_173241) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "bays", force: :cascade do |t|
    t.bigint "shop_id", null: false
    t.decimal "hourly_rate"
    t.text "description"
    t.boolean "available"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["shop_id"], name: "index_bays_on_shop_id"
  end

  create_table "booking_tools", force: :cascade do |t|
    t.bigint "booking_id", null: false
    t.bigint "tool_id", null: false
    t.integer "quantity"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["booking_id"], name: "index_booking_tools_on_booking_id"
    t.index ["tool_id"], name: "index_booking_tools_on_tool_id"
  end

  create_table "bookings", force: :cascade do |t|
    t.bigint "bay_id", null: false
    t.bigint "user_id"
    t.datetime "start_time"
    t.datetime "end_time"
    t.decimal "total_price"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "guest_name"
    t.string "guest_email"
    t.index ["bay_id"], name: "index_bookings_on_bay_id"
    t.index ["user_id"], name: "index_bookings_on_user_id"
  end

  create_table "shops", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.string "name"
    t.string "location"
    t.text "description"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.boolean "active"
    t.index ["user_id"], name: "index_shops_on_user_id"
  end

  create_table "tools", force: :cascade do |t|
    t.bigint "shop_id", null: false
    t.string "name"
    t.text "description"
    t.decimal "hourly_rate"
    t.boolean "available"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["shop_id"], name: "index_tools_on_shop_id"
  end

  create_table "users", force: :cascade do |t|
    t.string "email"
    t.string "password_digest"
    t.integer "role"
    t.string "name"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  add_foreign_key "bays", "shops"
  add_foreign_key "booking_tools", "bookings"
  add_foreign_key "booking_tools", "tools"
  add_foreign_key "bookings", "bays"
  add_foreign_key "bookings", "users"
  add_foreign_key "shops", "users"
  add_foreign_key "tools", "shops"
end
