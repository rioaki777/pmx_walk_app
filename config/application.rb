require_relative "boot"

require "rails/all"

Bundler.require(*Rails.groups)

module PmxWalkApp
  class Application < Rails::Application
    config.load_defaults 7.2
    config.autoload_lib(ignore: %w[assets tasks])
    
    config.assets.paths << Rails.root.join('app', 'assets', 'models')
    config.assets.prefix = "/"

    config.generators do |g|
      g.stylesheets false
      g.javascripts false
      g.helper false
    end

    config.i18n.default_locale = :ja
  end
end