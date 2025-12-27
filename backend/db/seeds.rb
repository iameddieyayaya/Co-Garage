# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).

puts "🌱 Seeding database..."

# --- Users ---
alice = User.find_or_create_by!(email: "alice@example.com") do |user|
  user.name = "Alice Garage"
  user.password = "password123"
  user.password_confirmation = "password123"
  user.role = :owner
end

puts "✅ User: #{alice.email}"

# --- Shops ---
shop = Shop.find_or_create_by!(user: alice) do |s|
  s.name = "Alice’s Garage"
  s.location = "San Diego, CA"
  s.description = "DIY auto garage with rentable bays and tools."
  s.active = true
end
puts "✅ Shop: #{shop.name}"

# --- Bays ---
bays_data = [
  { description: "Lift bay with professional tools", hourly_rate: 30, available: true },
  { description: "Open bay without lift", hourly_rate: 20, available: true }
]

bays_data.each do |bay_attrs|
  shop.bays.find_or_create_by!(description: bay_attrs[:description]) do |bay|
    bay.hourly_rate = bay_attrs[:hourly_rate]
    bay.available = bay_attrs[:available]
  end
end
puts "✅ Bays created for #{shop.name}"

# --- Tools ---
tools_data = [
  { name: "Jack Stand", description: "Heavy-duty jack stand", hourly_rate: 5, available: true },
  { name: "Impact Wrench", description: "Electric impact wrench", hourly_rate: 10, available: true },
  { name: "Torque Wrench", description: "Precision torque wrench", hourly_rate: 7, available: true }
]

tools_data.each do |tool_attrs|
  shop.tools.find_or_create_by!(name: tool_attrs[:name]) do |tool|
    tool.description = tool_attrs[:description]
    tool.hourly_rate = tool_attrs[:hourly_rate]
    tool.available = tool_attrs[:available]
  end
end
puts "✅ Tools created for #{shop.name}"

# --- Sample Booking ---
bay = shop.bays.first
tool = shop.tools.first

booking = Booking.create!(
  bay: bay,
  start_time: 1.day.from_now,
  end_time: 1.day.from_now + 2.hours,
  guest_name: "John Doe",
  guest_email: "john@example.com",
  total_price: bay.hourly_rate * 2
)

# Rent a tool with the booking
BookingTool.find_or_create_by!(booking: booking, tool: tool, quantity: 1)
puts "✅ Sample booking created for guest #{booking.guest_name} with bay #{bay.description} and tool #{tool.name}"

puts "🌱 Seeding complete!"