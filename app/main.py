import os
from flask import Flask, render_template
from flask import jsonify
from flask_socketio import SocketIO

import sys
import base64
import io
import re
import numpy as np
import json
import face_recognition
import datetime
from PIL import Image

from tflite_runtime.interpreter import Interpreter

from layoutCalculation import *
from image_processing import FaceRecognition

import persistence

# Some globals
labels = None
interpreter = None
face_recognition = None

IS_BRUSHING = False
BRUSHING_START = datetime.datetime.now()

input_height = 0
input_width = 0

CAMERA_WIDTH = 640
CAMERA_HEIGHT = 480

app = Flask(__name__)
socketio = SocketIO(app)


@app.route('/')
def root_route():
    return render_template('mirror.html')

@app.route('/stats/<string:user>')
def stats_route(user):
    connection = persistence.get_connection()
    result = persistence.get_tb_data_for_user(connection, user)
    connection.close()
    y = [res[1] for res in result]
    return jsonify(y)

@socketio.on('connect')
def on_connect():
    print('Client connected')


@socketio.on('disconnect')
def on_disconnect():
    print('Client disconnected')


@socketio.on('camera_frame')
def handle_camera_frame_event(json_input, methods=['POST']):

    if 'framedata' in json_input:
        val = json_input['framedata'].split(',')[1]
        img_data = base64.b64decode(val)
        img = Image.open(io.BytesIO(img_data))

        img = img.convert('RGB').resize(
            (input_width, input_height), Image.ANTIALIAS)

        bounding_boxes = detect_objects(interpreter, img, threshold=0.4)

        # Detect bushing event

        global IS_BRUSHING

        for obj in bounding_boxes:
            if obj['class'] == 'toothbrush':
                print('##### Brush detected #####')
                _h = obj['bounding']['ymax'] - obj['bounding']['ymin']
                _w = obj['bounding']['xmax'] - obj['bounding']['xmin']

                if _h > _w:
                    IS_BRUSHING = True
                    BRUSHING_START = datetime.datetime.now()

                break
 
        ############

        matched_person = face_recognition.match_person_in_image(np.array(img))
        if matched_person != None:
            print("detected " + matched_person, file=sys.stderr)

        json_response = json.dumps({
            'matchedPerson': matched_person,
            'isBrushing': IS_BRUSHING,
            'boundingBoxes': bounding_boxes
            })
        socketio.emit('response_message', json_response)

def try_get_env(name):
    try:
        val = os.environ[name]
        return val
    except:
        return None


def load_labels(path):
    """Loads the labels file. Supports files with or without index numbers."""
    with open(path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
        labels = {}
        for row_number, content in enumerate(lines):
            pair = re.split(r'[:\s]+', content.strip(), maxsplit=1)
            if len(pair) == 2 and pair[0].strip().isdigit():
                labels[int(pair[0])] = pair[1].strip()
            else:
                labels[row_number] = pair[0].strip()
    return labels


def set_input_tensor(interpreter, image):
    """Sets the input tensor."""
    print(interpreter.get_input_details()[0]['index'])
    tensor_index = interpreter.get_input_details()[0]['index']
    input_tensor = interpreter.tensor(tensor_index)()[0]
    input_tensor[:, :] = image


def get_output_tensor(interpreter, index):
    """Returns the output tensor at the given index."""
    output_details = interpreter.get_output_details()[index]
    tensor = np.squeeze(interpreter.get_tensor(output_details['index']))
    return tensor


def detect_objects(interpreter, image, threshold):
    """Returns a list of detection results, each a dictionary of object info."""
    set_input_tensor(interpreter, image)
    interpreter.invoke()

    # Get all output details
    boxes = get_output_tensor(interpreter, 0)
    classes = get_output_tensor(interpreter, 1)
    scores = get_output_tensor(interpreter, 2)
    count = int(get_output_tensor(interpreter, 3))
    
    results = []
    for i in range(count):
        if scores[i] >= threshold:
            
            ymin, xmin, ymax, xmax = boxes[i]
    
            # calculate actual points
            xmin = int(xmin * CAMERA_WIDTH)
            xmax = int(xmax * CAMERA_WIDTH)
            ymin = int(ymin * CAMERA_HEIGHT)
            ymax = int(ymax * CAMERA_HEIGHT)

            result = {
                'bounding_box': {
                    'xmin': xmin,
                    'xmax': xmax,
                    'ymin': ymin,
                    'ymax': ymax
                },
                'class': labels[int(classes[i])],
                'score': str(scores[i])
            }
            results.append(result)
    return results


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

    dirname = os.path.dirname(__file__)
    object_detection_static_path = os.path.join(
        dirname, 'object_detection/static')

    # Initialize globals
    connection = persistence.get_connection()
    persistence.drop_all_data(connection)
    persistence.create_schema_if_not_exists(connection)
    persistence.create_dummy_data(connection)
    connection.close()

    labels = load_labels(os.path.join(
        object_detection_static_path, 'coco_labels.txt'))
    interpreter = Interpreter(os.path.join(
        object_detection_static_path, 'detect.tflite'))
    interpreter.allocate_tensors()
    face_recognition = FaceRecognition()

    _, input_height, input_width, _ = interpreter.get_input_details()[0]['shape']

    print('Starting server')
    socketio.run(app, host='0.0.0.0', debug=debug, port=port, use_reloader=use_reloader)