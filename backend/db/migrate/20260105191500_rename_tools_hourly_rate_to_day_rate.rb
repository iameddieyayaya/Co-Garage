class RenameToolsHourlyRateToDayRate < ActiveRecord::Migration[7.1]
  def change
    rename_column :tools, :hourly_rate, :day_rate
  end
end

