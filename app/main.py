import os
from flask import Flask, render_template
from flask_socketio import SocketIO

app = Flask(__name__)
# app.config['SECRET_KEY'] = 'supersecretkey'
socketio = SocketIO(app)

@app.route('/')
def root_route():
    return render_template("index.html")


@socketio.on('my_event')
def handle_my_custom_event(json, methods=['POST']):
    print('received my event: ' + str(json))
    socketio.emit('response_messagee', str(json))


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

    print('Starting sutff')
    socketio.run(app, debug=debug, port=port, use_reloader=use_reloader)
