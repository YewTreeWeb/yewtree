require 'html-proofer'

task :test do
  options = {
    :cache => {
      :timeframe => '30d'
    },
    :allow_hash_href => true,
    :parallel => {:in_processes => 4},
    :only_4xx => true,
    :url_ignore => [/localhost/, /(twitter|instagram|facebook).com/],
    :verbose => true,
    # disable SSL certificates
    :typhoeus => {
      :ssl_verifypeer => false,
      :ssl_verifyhost => 0,
      timeout: 30
    },
    :assume_extension => true,
    :empty_alt_ignore => true
  }
  HTMLProofer.check_directory('./_site', options).run
end