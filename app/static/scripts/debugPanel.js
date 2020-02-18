'use strict';

class DebugPanel {

    constructor() {
        this.video = document.getElementById('video');
        navigator.mediaDevices.getUserMedia({ video: { width: CAMERA_WIDTH, height: CAMERA_HEIGHT } }).then((stream) => this.video.srcObject = stream);

        this.boundingBoxCanvas = document.getElementById('recognition-canvas');
        this.boundingBoxCanvas.width = CAMERA_WIDTH;
        this.boundingBoxCanvas.height = CAMERA_HEIGHT;
        this.debugText = document.querySelector('#debug-text pre')

        this.debugPanel = paper.image('static/images/debugPanel.svg', SCREEN_WIDTH - 400, 310, 400, 1000);
        this.webcam = paper.image('static/images/webcamPanel.svg', SCREEN_WIDTH - 1000, 10, 1000, 300);
        this.gif = paper.image('static/images/fingerprintYellow.gif', SCREEN_WIDTH - 870, 80, 230, 150);

        this.group = paper.g(this.debugPanel, this.webcam, this.gif);
    }

    hide() {
        this.enabled = false;
        this.group.attr({ visibility: 'hidden' });
        this.boundingBoxCanvas.style.display = 'none';
        this.video.style.display = 'none';
        this.debugText.style.display = 'none';
    }

    show() {
        this.enabled = true;
        this.group.attr({ visibility: '' });
        this.boundingBoxCanvas.style.display = 'block';
        this.video.style.display = 'block';
        this.debugText.style.display = 'block';
    }

    adaptTo(state, fullJson) {
        if (state.debugPanelHidden) {
            this.hide();
        } else {
            this.show();
            this.displayDebugInfo(fullJson);
        }
    }

    displayDebugInfo(json) {
        if (!this.enabled) {
            return;
        }
        this.debugText.innerHTML = JSON.stringify(json, undefined, 2);

        const boundingBoxCanvasContext = this.boundingBoxCanvas.getContext('2d');
        boundingBoxCanvasContext.clearRect(0, 0, CAMERA_WIDTH, CAMERA_HEIGHT);

        json.boundingBoxes.forEach(el => {
            if (el['class'] !== 'person') {
                return;
            }

            const bb = el['bounding_box'];
            const xDist = bb['xmax'] - bb['xmin'];
            const yDist = bb['ymax'] - bb['ymin'];

            boundingBoxCanvasContext.strokeStyle = "#FF9900";
            boundingBoxCanvasContext.lineWidth = 5;
            boundingBoxCanvasContext.beginPath();
            boundingBoxCanvasContext.rect(bb['xmin'], bb['ymin'], xDist, yDist);
            boundingBoxCanvasContext.stroke();
        });
    }

}