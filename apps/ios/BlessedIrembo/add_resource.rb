#!/usr/bin/env ruby
require 'xcodeproj'

project_path = ARGV[0] || 'BlessedIrembo.xcodeproj'
project = Xcodeproj::Project.open(project_path)
target = project.targets.first

# Check if file exists in resources already
if target.resources_build_phase.files.any? { |f| f.file_ref && f.file_ref.path == 'map_style.json' }
  puts "map_style.json is already in resources."
  exit
end

# Find or create group
main_group = project.main_group['BlessedIrembo']
app_group = main_group['App'] || main_group.new_group('App')

# Add file ref
file_ref = app_group.new_file('map_style.json')

# Add to target
target.resources_build_phase.add_file_reference(file_ref)

project.save
puts "Added map_style.json to bundle resources!"
