# frozen_string_literal: true

source "https://rubygems.org"

# Windows and JRuby does not include zoneinfo files, so bundle the tzinfo-data gem
# and associated library.
platforms :windows, :jruby do
  gem "tzinfo", ">= 1", "< 3"
  gem "tzinfo-data"
end

# Performance-booster for watching directories on Windows
gem "wdm", "~> 0.1", :platforms => [:windows]

gem 'bigdecimal'
gem 'jekyll-gist'
gem 'jekyll-feed'
gem 'jekyll-seo-tag'
gem 'jekyll-redirect-from'

gemspec