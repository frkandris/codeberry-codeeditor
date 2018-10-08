#!/bin/bash
ENV=local

# Refresh dependency library.
npm install

# Start app
export NODE_ENV=$ENV && npm start
