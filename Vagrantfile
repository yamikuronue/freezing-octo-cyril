# -*- mode: ruby -*-
# vi: set ft=ruby :

# Vagrantfile API/syntax version. Don't touch unless you know what you're doing!
VAGRANTFILE_API_VERSION = "2"

  $provisionScript = <<SCRIPT
    #Node & NPM
    sudo apt-get install -y curl
    curl -sL https://deb.nodesource.com/setup | sudo bash -  #We have to install from a newer location, the repo version is too old
    sudo apt-get install -y nodejs
    cd /vagrant
    npm install
SCRIPT


Vagrant.configure(VAGRANTFILE_API_VERSION) do |config|

  # Every Vagrant virtual environment requires a box to build off of.
  config.vm.box = "hashicorp/precise64"

  # Share an additional folder to the guest VM. The first argument is
  # the path on the host to the actual folder. The second argument is
  # the path on the guest to mount the folder. And the optional third
  # argument is a set of non-required options.
  # config.vm.synced_folder "../data", "/vagrant_data"

  #PROVISIONING: Just use shell. 
  config.vm.provision "shell",
  inline: $provisionScript
end
