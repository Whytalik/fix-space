#!/bin/bash
set -e

Xvfb :99 -screen 0 1024x768x16 &
export DISPLAY=:99
sleep 1

exec uvicorn main:app --host 0.0.0.0 --port "${PORT:-8000}"
