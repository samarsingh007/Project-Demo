#!/bin/bash

# Define the ports to target
TARGET_PORTS=(3050 5050)  # Add more ports as needed

# Function to kill processes running on specific ports
kill_ports() {
  for PORT in "${TARGET_PORTS[@]}"; do
    echo "Checking for processes on port $PORT..."
    PID=$(lsof -t -i:$PORT)
    if [ -n "$PID" ]; then
      echo "Killing process $PID on port $PORT..."
      kill -9 $PID
    else
      echo "No process running on port $PORT."
    fi
  done
}

# Kill processes on target ports
kill_ports

sleep 10
NODE_APP_DIR="/home/samarpra/Project-Demo/Frontend"  # Replace with your Node.js app directory
echo "Changing directory to $NODE_APP_DIR..."
cd "$NODE_APP_DIR" || { echo "Failed to change directory to $NODE_APP_DIR"; exit 1; }

# Run the Node.js application
echo "Starting Frontend application..."
npm run build
nohup npm run deploy > frontend.log 2>&1 & 

# Change directory to the Node.js application directory
NODE_APP_DIR="/home/samarpra/Project-Demo/Backend"  # Replace with your Node.js app directory
echo "Changing directory to $NODE_APP_DIR..."
cd "$NODE_APP_DIR" || { echo "Failed to change directory to $NODE_APP_DIR"; exit 1; }

# Run the Node.js application
echo "Starting Backend application..."
nohup npm run start > backend.log 2>&1 &  # Adjust to the correct command to start your Node app

# Activate Conda environment and run Uvicorn
CONDA_ENV="ai4behavior"  # Replace with your Conda environment name

echo "Activating Conda environment: $CONDA_ENV..."
source $(conda info --base)/etc/profile.d/conda.sh
conda activate $CONDA_ENV

# Keep the script running to prevent it from exiting immediately
echo "DONE!!! WAIT few seconds and app should be running." 
