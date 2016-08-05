#!/usr/bin/env bash

sudo rm /etc/supervisor/conf.d/solar.conf
sudo cp conf/local/supervisord.conf /etc/supervisor/conf.d/solar.conf
sudo supervisorctl reread
sudo supervisorctl update
