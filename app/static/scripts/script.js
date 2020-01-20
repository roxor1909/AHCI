const PERSONAS = {
    SENIOR: 'senior',
    CHILD: 'child',
    ADULT: 'adult',
    OTHER_HUMAN: 'other human',
    NONE: 'none'
};
const KNOWN_PERSONS = ['leia', 'luke', 'anakin', 'rey', 'kylo'];
const CAMERA_WIDTH = 640;
const CAMERA_HEIGHT = 480;
const PADDING_LEFT = 30;
const PADDING_TOP = 30;
const UI_UPDATE_DELAY_MS = 000;

let socket;
let fabricCanvas;

let userTextInstance;
let userIconImageInstance;

let gamificationBadgesIconInstance;
let streakIconImageInstances = [];
let streakIconText;

let lightsaberImageInstance;

let graphImageInstance;

let clockInstance;

let graphInstance;

let achievementsInstance;

let timerTextInstance;
let timerIconImageInstance;
let currentTimerValueInSeconds;
let timerRefreshIntervalId;

let lastXPositionClock = 0;
let lastYPositionClock = 0;
let lastXPositionGraph = 0;
let lastYPositionGraph = 0;
let lastXPositionAchievements = 0;
let lastYPositionAchievements = 0;
let lastMatchedPerson;

let globalFontSize = 0;
let globalIconWidth = 0;

let lastUserInterfaceUpdate = new Date();

function establishSocketConnection() {

    // trys to connect to the host that serves the page by default
    socket = io();

    socket.on('connection', (socket) => {
        console.log('connected to server');
        socket.emit('camera_frame', { camerWidth: CAMERA_WIDTH, camerHeight: CAMERA_HEIGHT });
        socket.on('disconnect', () => {
            console.log('disconnected from server');
        });
    });

    // get video dom element
    const videoCanvas = document.getElementById('video-canvas');

    const boundingBoxCanvas = document.getElementById('recognition-canvas');
    boundingBoxCanvas.width = CAMERA_WIDTH;
    boundingBoxCanvas.height = CAMERA_HEIGHT;

    // request access to webcam
    navigator.mediaDevices.getUserMedia({ video: { width: CAMERA_WIDTH, height: CAMERA_HEIGHT } }).then((stream) => videoCanvas.srcObject = stream);

    // returns a frame encoded in base64
    const getFrame = () => {
        const canvas = document.createElement('canvas');
        canvas.width = videoCanvas.videoWidth;
        canvas.height = videoCanvas.videoHeight;
        canvas.getContext('2d').drawImage(videoCanvas, 0, 0);
        const data = canvas.toDataURL();
        return data;
    }

    const sendMessage = (data) => {
        socket.emit('camera_frame', { framedata: data });
    };

    setInterval(() => {
        sendMessage(getFrame());
    }, 1000);

    socket.on('response_message', (msg) => {
        const json = JSON.parse(msg);

        let matchedPerson = json.matchedPerson;
        if (json.matchedPerson) {
            matchedPerson = matchedPerson.toLowerCase();
        }
        const matchedPersona = assignMatchedPersonToPersona(matchedPerson);

        // debugging is automatically enabled for all faces excluding Leia, Luke, Anakin, Kylo and Rey.
        if (matchedPersona === PERSONAS.OTHER_HUMAN) {
            showDebugMessages(json, matchedPersona, videoCanvas, boundingBoxCanvas);
        } else {
            hideDebugMessages(videoCanvas, boundingBoxCanvas);
        }

        // update UI only every 5 seconds
        if (new Date() - lastUserInterfaceUpdate > UI_UPDATE_DELAY_MS) {
            if (matchedPerson !== lastMatchedPerson) {
                updateUserInterface(matchedPerson, matchedPersona);
                lastMatchedPerson = matchedPerson;
            }
            lastUserInterfaceUpdate = new Date();
        }
    });

}

function updateUserInterface(matchedPerson, matchedPersona) {
    if (matchedPersona == PERSONAS.OTHER_HUMAN || matchedPersona == PERSONAS.NONE) {
        removeGamificationBadges();
        removeUserGreeting();
        removeLightsaber();
        removeGraph();
        removeTimer();
    } else {
        // adaptive font size depending on persona
        globalFontSize = (matchedPersona == PERSONAS.SENIOR) ? 120 : 80;
        globalIconWidth = (matchedPersona == PERSONAS.SENIOR) ? 60 : 40;

        removeGamificationBadges();
        removeUserGreeting();
        removeLightsaber();
        removeGraph();
        removeTimer();

        showUserGreeting(matchedPerson, matchedPersona);
        showGamificationBadges(matchedPerson);
        showLighsaber(matchedPerson);
        showGraph(matchedPerson, matchedPersona);
        showTimer();
    }
}

function removeTimer() {
    if (timerRefreshIntervalId) {
        clearInterval(timerRefreshIntervalId);
        timerRefreshIntervalId = null;
    }
    if (timerTextInstance) {
        fabricCanvas.remove(timerTextInstance);
        timerTextInstance = null;
    }
    if (timerIconImageInstance) {
        fabricCanvas.remove(timerIconImageInstance);
        timerIconImageInstance = null;
    }
}

function showTimer() {
    // if timer text is defined, then the timer is already running.
    if (timerTextInstance) {
        return;
    }

    currentTimerValueInSeconds = 0;

    // timer icon
    let url = 'static/images/clock-solid.png';
    fabric.Image.fromURL(url, (img) => {
        img.set({
            top: PADDING_TOP + globalFontSize * 1.5,
            left: PADDING_LEFT,
        });
        img.scaleToWidth(globalIconWidth);
        fabricCanvas.add(img);
        timerIconImageInstance = img;
    });

    const updateTimer = () => {
        if (timerTextInstance) {
            fabricCanvas.remove(timerTextInstance);
        }

        let seconds = (currentTimerValueInSeconds % 60).toString().split('.')[0];
        if (seconds < 10) {
            seconds = '0' + seconds;
        }
        let minutes = (currentTimerValueInSeconds / 60).toString().split('.')[0];
        timerTextInstance = new fabric.Text(`${minutes}:${seconds}`, {
            fontFamily: '"Courier New", Courier, monospace',
            top: PADDING_TOP + globalFontSize * 1.5,
            left: globalIconWidth + PADDING_LEFT + 10,
            fill: '#FFFFFF',
            fontSize: globalFontSize
        });
        fabricCanvas.add(timerTextInstance);
        currentTimerValueInSeconds++;
    };

    updateTimer();

    // timer text
    timerRefreshIntervalId = setInterval(updateTimer, 1000);
}

function removeGraph() {
    if (graphImageInstance) {
        fabricCanvas.remove(graphImageInstance);
    }
}

function showGraph(matchedPerson, matchedPersona) {
    if (matchedPersona == PERSONAS.ADULT) {
        let url = `static/images/graph_${matchedPerson}.png`;
        fabric.Image.fromURL(url, (img) => {
            img.set({
                top: window.innerHeight - 160,
                left: 0
            });
            img.scaleToWidth(400);
            fabricCanvas.add(img);
            graphImageInstance = img;
        });
    }
}

function assignMatchedPersonToPersona(matchedPerson) {
    if (matchedPerson && matchedPerson === 'unkown') {
        return PERSONAS.OTHER_HUMAN;
    }
    if (matchedPerson === 'anakin') {
        return PERSONAS.CHILD;
    } else if (matchedPerson === 'rey' || matchedPerson === 'kylo') {
        return PERSONAS.ADULT;
    } else if (matchedPerson === 'leia' || matchedPerson === 'luke') {
        return PERSONAS.SENIOR;
    }
    return PERSONAS.NONE;
}

function initializeCanvas() {
    document.getElementById('canvas').width = window.innerWidth;
    document.getElementById('canvas').height = window.innerHeight;
    fabricCanvas = new fabric.Canvas('canvas');
}

function removeLightsaber() {
    if (lightsaberImageInstance) {
        fabricCanvas.remove(lightsaberImageInstance);
    }
}

function showLighsaber(matchedPerson) {
    if (matchedPerson && (matchedPerson === 'kylo' || matchedPerson === 'rey' || matchedPerson === 'anakin')) {
        fabric.Image.fromURL(`static/images/lightsaber_${matchedPerson}.png`, (img) => {
            img.set({
                top: window.innerHeight - 420,
                left: window.innerWidth - 60,
                angle: 45,
                originX: 'left',
                originY: 'top'
            });
            fabricCanvas.add(img);
            lightsaberImageInstance = img;
        });
    }
}

function removeGamificationBadges() {
    if (gamificationBadgesIconInstance) {
        fabricCanvas.remove(gamificationBadgesIconInstance);
    }
    if (streakIconImageInstances.length > 0) {
        streakIconImageInstances.forEach(img => {
            fabricCanvas.remove(img);
        })
    }
    if (streakIconText) {
        fabricCanvas.remove(streakIconText);
    }
}

function showGamificationBadges(matchedPerson) {
    if (matchedPerson) {
        if (KNOWN_PERSONS.includes(matchedPerson)) {
            fabric.Image.fromURL('static/images/star-solid.png', (img) => {
                img.set({
                    top: PADDING_TOP + globalFontSize * 2.7,
                    left: PADDING_LEFT,
                });
                img.scaleToWidth(globalIconWidth);
                fabricCanvas.add(img);
                gamificationBadgesIconInstance = img;
            });
        }

        // TODO: call API to retrieve badges

        for (let i = 0; i < 3; i++) {
            fabric.Image.fromURL('static/images/yoda.png', (img) => {
                img.set({
                    top: PADDING_TOP + globalFontSize * 2.7,
                    left: PADDING_LEFT + 60,
                });
                img.scaleToWidth(globalIconWidth * 3);
                fabricCanvas.add(img);
                streakIconImageInstances.push(img);
            });
/*            let imageInstance = new fabric.Image(image, {
                top: PADDING_TOP + globalFontSize * 3,
                left: globalIconWidth + PADDING_LEFT + 10 + i * globalIconWidth * 1.5,
            });*/
        }
    }
}

function removeUserGreeting() {
    if (userTextInstance) {
        fabricCanvas.remove(userTextInstance);
    }
    if (userIconImageInstance) {
        fabricCanvas.remove(userIconImageInstance);
    }
}

function showUserGreeting(matchedPerson, matchedPersona) {
    fabric.Image.fromURL('static/images/user-solid.png', (img) => {
        img.set({
            top: PADDING_TOP + 10,
            left: PADDING_LEFT,
        });
        img.scaleToWidth(globalIconWidth);
        fabricCanvas.add(img);
        userIconImageInstance = img;
    });

    let greeting;

    // hide greeting when no person was recognized
    if (matchedPerson === null) {
        greeting = '';
    } else if (matchedPerson === '') {
        greeting = 'Hello stranger.';
    } else {
        greeting = matchedPerson.charAt(0).toUpperCase() + matchedPerson.slice(1);
    }

    userTextInstance = new fabric.Text(greeting, {
        fontFamily: '"Courier New", Courier, monospace',
        top: PADDING_TOP + 10,
        left: globalIconWidth + PADDING_LEFT + 10,
        fill: '#FFFFFF',
        fontSize: globalFontSize
    });
    fabricCanvas.add(userTextInstance);
}

function getGreetingForHourOfDay() {
    const h = new Date().getHours();
    if (h < 4) {
        return 'Good night';
    } else if (h < 11) {
        return 'Good morning';
    } else if (h < 17) {
        return 'Good afternoon';
    } else if (h < 21) {
        return 'Good evening';
    }
    return 'Good night';
}

function hideDebugMessages(videoCanvas, boundingBoxCanvas) {
    videoCanvas.style.display = 'none';
    boundingBoxCanvas.display = 'none';
    boundingBoxCanvas.getContext('2d').clearRect(0, 0, CAMERA_WIDTH, CAMERA_HEIGHT);
    document.querySelector('#debug-text pre').style.display = 'none';
}

function showDebugMessages(json, matchedPersona, videoCanvas, boundingBoxCanvas) {
    json.matchedPersona = matchedPersona;
    document.querySelector('#debug-text pre').style.display = 'block';
    document.querySelector('#debug-text pre').innerHTML = JSON.stringify(json, undefined, 2);

    videoCanvas.style.display = 'block';
    boundingBoxCanvas.display = 'block';

    const boundingBoxCanvasContext = boundingBoxCanvas.getContext('2d');
    boundingBoxCanvasContext.clearRect(0, 0, CAMERA_WIDTH, CAMERA_HEIGHT);

    json.boundingBoxes.forEach(el => {
        if (el['class'] !== 'person') {
            return
        }

        const bb = el['bounding_box'];
        const xDist = bb['xmax'] - bb['xmin'];
        const yDist = bb['ymax'] - bb['ymin'];

        const xCenter = bb['xmin'] + xDist / 2;
        const yCenter = bb['ymin'] + yDist / 2;

        boundingBoxCanvasContext.strokeStyle = "#FFFFFF";
        boundingBoxCanvasContext.beginPath();
        boundingBoxCanvasContext.rect(bb['xmin'], bb['ymin'], xDist, yDist);
        boundingBoxCanvasContext.stroke();
    });
}

/*
            if (lastXPositionClock != json.clock.x || lastYPositionClock != json.clock.y) {
                lastXPositionClock = json.clock.x;
                lastYPositionClock = json.clock.y;
                fabricCanvas.item(0).animate('left', json.clock.x, {
                    duration: 1000,
                    onChange: fabricCanvas.renderAll.bind(fabricCanvas)
                });
                fabricCanvas.item(0).animate('top', json.clock.y, {
                    duration: 1000,
                    onChange: fabricCanvas.renderAll.bind(fabricCanvas)
                });
            }
            if (lastXPositionGraph != json.graph.x || lastYPositionGraph != json.graph.y) {
                lastXPositionGraph = json.graph.x;
                lastYPositionGraph = json.graph.y;
                fabricCanvas.item(1).animate('left', json.graph.x, {
                    duration: 1000,
                    onChange: fabricCanvas.renderAll.bind(fabricCanvas)
                });
                fabricCanvas.item(1).animate('top', json.graph.y, {
                    duration: 1000,
                    onChange: fabricCanvas.renderAll.bind(fabricCanvas)
                });
            }
            if (lastXPositionAchievements != json.achievements.x || lastYPositionAchievements != json.achievements.y) {
                lastXPositionAchievements = json.achievements.x;
                lastYPositionAchievements = json.achievements.y;
                fabricCanvas.item(2).animate('left', json.achievements.x, {
                    duration: 1000,
                    onChange: fabricCanvas.renderAll.bind(fabricCanvas)
                });
                fabricCanvas.item(2).animate('top', json.achievements.y, {
                    duration: 1000,
                    onChange: fabricCanvas.renderAll.bind(fabricCanvas)
                });
            }*/

(function () {
    establishSocketConnection();
    initializeCanvas();
})();