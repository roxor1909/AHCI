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

if __name__ == '__main__':
    socketio.run(app, debug=True, port=8080)
