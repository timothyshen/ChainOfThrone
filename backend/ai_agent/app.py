import logging
import os
from datetime import datetime
from logging.handlers import RotatingFileHandler

from flask import Flask, jsonify, request
from flask_cors import CORS

from bot import Agent

app = Flask("bot_service")
CORS(app)  # Enable CORS for all routes

if not os.path.exists("logs"):
    os.makedirs("logs")

file_handler = RotatingFileHandler("logs/api.log", maxBytes=10240, backupCount=10)
file_handler.setFormatter(
    logging.Formatter(
        "%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]"
    )
)
file_handler.setLevel(logging.INFO)
app.logger.addHandler(file_handler)
app.logger.setLevel(logging.INFO)
app.logger.info("Bot Service")


@app.route("/api/health", methods=["GET"])
def health_check():
    """Health check endpoint"""
    return jsonify({"status": "healthy", "timestamp": datetime.utcnow().isoformat()})


@app.route("/api/initiate", methods=["POST"])
def bot_initiate():
    data = request.get_json()
    agent = Agent(data["contract_addr"])
    agent.play()


@app.errorhandler(404)
def not_found_error(error):
    return jsonify({"error": "Resource not found"}), 404


@app.errorhandler(500)
def internal_error(error):
    app.logger.error(f"Server Error: {error}")
    return jsonify({"error": "Internal server error"}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=False)
