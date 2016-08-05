#!/usr/bin/env bash

sudo rm /etc/supervisor/conf.d/solar.conf
sudo cp conf/supervisord.conf /etc/supervisor/conf.d/solar.conf
sudo supervisorctl reread
sudo supervisorctl update
