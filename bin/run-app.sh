#!/usr/bin/env bash

source venv/bin/activate
gunicorn -w 2 --preload -b 127.0.0.1:8001 run:app --log-level=DEBUG --timeout=120