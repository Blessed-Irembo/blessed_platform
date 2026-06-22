#!/usr/bin/env ruby

# Script to add new Swift files to the Xcode project
# This uses xcodeproj gem to manipulate the .pbxproj file

require 'xcodeproj'

project_path = ARGV[0] || 'BlessedIrembo.xcodeproj'
project = Xcodeproj::Project.open(project_path)

# Get the main target
target = project.targets.first

# Get the BlessedIrembo group
main_group = project.main_group['BlessedIrembo']

# Files to add
new_files = {
  'Utilities' => [
    'BlessedIrembo/Utilities/MockData.swift',
    'BlessedIrembo/Utilities/LocationManager.swift'
  ],
  'ViewModels' => [
    'BlessedIrembo/ViewModels/PharmacyMapViewModel.swift'
  ],
  'Views/User' => [
    'BlessedIrembo/Views/User/UserMapView.swift',
    'BlessedIrembo/Views/User/QuickDetailsSheet.swift',
    'BlessedIrembo/Views/User/PharmacyDetailsView.swift'
  ],
  'Views/Auth' => [
    'BlessedIrembo/Views/Auth/DeleteAccountSheet.swift'
  ]
}

new_files.each do |group_name, files|
  group = main_group[group_name]
  
  files.each do |file_path|
    file_name = File.basename(file_path)
    
    # Check if file already exists in group
    existing_file = group.files.find { |f| f.path == file_name }
    
    unless existing_file
      # Add file to group
      file_ref = group.new_reference(file_name)
      
      # Add file to target
      target.add_file_references([file_ref])
      
      puts "Added #{file_name} to #{group_name}"
    else
      puts "#{file_name} already exists in #{group_name}"
    end
  end
end

# Save the project
project.save

puts "\nProject updated successfully!"
