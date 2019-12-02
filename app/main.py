import os
from flask import Flask, render_template
from flask_socketio import SocketIO

import base64
import io
import json
from PIL import Image

from layoutCalculation import *

app = Flask(__name__)
# app.config['SECRET_KEY'] = 'supersecretkey'
socketio = SocketIO(app)

@app.route('/')
def root_route():
    return render_template("index.html")

@socketio.on('connect')
def on_connect():
    print('Client connected')

@socketio.on('disconnect')
def on_disconnect():
    print('Client disconnected')

@socketio.on('camera_frame')
def handle_my_custom_event(inJson, methods=['POST']):
    val = inJson['framedata'].split(',')[1]
    imgData = base64.b64decode(val)
    img = Image.open(io.BytesIO(imgData))
    width, height = img.size
    socketio.emit('response_message', getPanelPositions())

def try_get_env(name):
    try:
        val = os.environ[name]
        return val
    except:
        return None

if __name__ == '__main__':
    debug = try_get_env('AHCI_DEV')
    if debug is None:
        debug = False
    else:
        debug = bool(debug)
    
    port = try_get_env('AHCI_PORT')
    if port is None:
        port = 8080
    else:
        port = int(port)

    use_reloader = try_get_env('AHCI_USE_RELOADER')
    if use_reloader is None:
        use_reloader = False
    else:
        use_reloader = bool(use_reloader)

    print('Starting server')
    socketio.run(app, host='0.0.0.0', debug=debug, port=port, use_reloader=use_reloader)
