# -*- mode: ruby -*-
# vi: set ft=ruby :

# Vagrantfile API/syntax version. Don't touch unless you know what you're doing!
VAGRANTFILE_API_VERSION = "2"

  $provisionScript = <<SCRIPT
    #Dependencies for bcrypt are a little insane....
    sudo apt-get install -y python
    sudo apt-get install -y make
    sudo apt-get install -y g++

    #Node & NPM
    sudo apt-get install -y curl
    curl -sL https://deb.nodesource.com/setup | sudo bash -  #We have to install from a newer location, the repo version is too old
    sudo apt-get install -y nodejs
	sudo apt-get install make
	sudo apt-get install g++
    cp -r /vagrant /home/vagrant/todo
	cd /home/vagrant/todo
    npm install
	npm install -g grunt-cli

    #Redis
	cd
    wget http://download.redis.io/releases/redis-2.8.19.tar.gz
    tar xzf redis-2.8.19.tar.gz
    cd redis-2.8.19
    make
    src/redis-server &
SCRIPT


Vagrant.configure(VAGRANTFILE_API_VERSION) do |config|

  # Every Vagrant virtual environment requires a box to build off of.
  config.vm.box = "hashicorp/precise64"

  config.vm.provider "virtualbox" do |v|
    v.customize ["setextradata", :id, "VBoxInternal2/SharedFoldersEnableSymlinksCreate/v-root", "1"]
  end

  #Hosts file plugin
  #To install: vagrant plugin install vagrant-hostsupdater
  #This will let you access the VM at vagrantVM.local once it's up
  config.vm.network :private_network, ip: "192.168.3.10"
  config.vm.hostname = "vagrantVM.local"

  #PROVISIONING: Just use shell. 
  config.vm.provision "shell",
  inline: $provisionScript
end
