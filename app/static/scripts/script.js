let socket;
let fabricCanvas;
let greetingTextInstance;
let streakIconImageInstances = [];
let streakIconText;
let lightsaberImageInstance;
let clockInstance;
let graphInstance;
let achievementsInstance;

let lastXPositionClock = 0;
let lastYPositionClock = 0;
let lastXPositionGraph = 0;
let lastYPositionGraph = 0;
let lastXPositionAchievements = 0;
let lastYPositionAchievements = 0;
let lastMatchedPerson;

const personas = {
    SENIOR: 'senior',
    CHILD: 'child',
    ADULT: 'adult',
};

function establishSocketConnection() {
    const camerWidth = 640;
    const camerHeight = 480;

    // trys to connect to the host that serves the page by default
    socket = io();

    socket.on('connection', (socket) => {
        console.log('connected to server');
        socket.emit('camera_frame', { camerWidth: camerWidth, camerHeight: camerHeight });
        socket.on('disconnect', () => {
            console.log('disconnected from server');
        });
    });

    // get video dom element
    const video = document.getElementById('video-canvas');

    const canv = document.getElementById('recognition-canvas');
    canv.width = camerWidth;
    canv.height = camerHeight;
    const ctx = canv.getContext('2d');

    // request access to webcam
    navigator.mediaDevices.getUserMedia({ video: { width: camerWidth, height: camerHeight } }).then((stream) => video.srcObject = stream);

    // returns a frame encoded in base64
    const getFrame = () => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d').drawImage(video, 0, 0);
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

        showDebugMessages(json, matchedPersona);

        if (matchedPerson !== lastMatchedPerson) {
            removeStreakIcons();
            removeUserGreeting();
            removeLightsaber();

            showUserGreeting(matchedPerson, matchedPersona);
            showStreakIcons(matchedPerson);
            showLighsaber(matchedPerson);
        }
        lastMatchedPerson = matchedPerson;

        json.boundingBoxes.forEach(el => {
            if (el['class'] !== 'person') {
                return
            }

            const bb = el['bounding_box'];
            const xDist = bb['xmax'] - bb['xmin'];
            const yDist = bb['ymax'] - bb['ymin'];

            const xCenter = bb['xmin'] + xDist / 2;
            const yCenter = bb['ymin'] + yDist / 2;

            ctx.clearRect(0, 0, camerWidth, camerHeight);
            ctx.strokeStyle = "#FFFFFF";
            ctx.beginPath();
            ctx.rect(bb['xmin'], bb['ymin'], xDist, yDist);
            ctx.stroke();
        });

    });

}

function assignMatchedPersonToPersona(matchedPerson) {
    if (!matchedPerson) {
        return undefined;
    }
    if (matchedPerson === 'anakin') {
        return personas.CHILD;
    } else if (matchedPerson === 'rey' || matchedPerson === 'kylo') {
        return personas.ADULT;
    } else if (matchedPerson === 'leia' || matchedPerson === 'luke') {
        return personas.SENIOR;
    }
}

function initializeCanvas() {
    document.getElementById('canvas').width = window.innerWidth;
    document.getElementById('canvas').height = window.innerHeight;
    fabricCanvas = new fabric.Canvas('canvas');

    /*            const clockImage = document.getElementById('clock');
                clockInstance = new fabric.Image(clockImage, {
                    left: 0,
                    top: 150
                });
                const graphImage = document.getElementById('graph');
                graphInstance = new fabric.Image(graphImage, {
                    left: 500,
                    top: 0
                });
                const achievementsImage = document.getElementById('achievements');
                achievementsInstance = new fabric.Image(achievementsImage, {
                    left: 1500,
                    top: 0
                });
                fabricCanvas.add(clockInstance);
                fabricCanvas.add(graphInstance);
                fabricCanvas.add(achievementsInstance);*/
}

function removeLightsaber() {
    if (lightsaberImageInstance) {
        fabricCanvas.remove(lightsaberImageInstance);
    }
}

function showLighsaber(matchedPerson) {
    if (matchedPerson) {
        let url;
        if (matchedPerson.toLowerCase() === 'kylo') {
            url = 'https://cdn3.iconfinder.com/data/icons/star-wars-color/424/lightsaber-darth-vader-512.png';
        } else if (matchedPerson.toLowerCase() === 'rey') {
            url = 'https://cdn3.iconfinder.com/data/icons/star-wars-color/424/lightsaber-luke-anh-512.png';
        }
        fabric.Image.fromURL(url, (img) => {
            img.set({
                top: 0,
                left: window.innerWidth - 150,
            });
            fabricCanvas.add(img);
            lightsaberImageInstance = img;
        });
    }
}

function removeStreakIcons() {
    if (streakIconImageInstances.length > 0) {
        streakIconImageInstances.forEach(img => {
            fabricCanvas.remove(img);
        })
    }
    if (streakIconText) {
        fabricCanvas.remove(streakIconText);
    }
}

function showStreakIcons(matchedPerson) {
    if (matchedPerson) {
        if (matchedPerson.toLowerCase() === 'rey' || matchedPerson.toLowerCase() === 'kylo') {
            streakIconText = new fabric.Text('Tooth brush streak counter:', {
                fontFamily: 'Starjedi',
                left: 0,
                top: 0,
                fill: '#FFFFFF',
                fontSize: 15
            });
            fabricCanvas.add(streakIconText);
        }
        if (matchedPerson.toLowerCase() === 'kylo') {
            for (let i = 0; i < 3; i++) {
                const image = document.getElementById('stormtrooper');
                let imageInstance = new fabric.Image(image, {
                    left: 0 + i * 50,
                    top: 20,
                });
                imageInstance.scaleToWidth(45);
                fabricCanvas.add(imageInstance);
                streakIconImageInstances.push(imageInstance);
            }
        } else if (matchedPerson.toLowerCase() === 'rey') {
            for (let i = 0; i < 5; i++) {
                const image = document.getElementById('r2d2');
                let imageInstance = new fabric.Image(image, {
                    left: 0 + i * 50,
                    top: 20,
                });
                imageInstance.scaleToWidth(45);
                fabricCanvas.add(imageInstance);
                streakIconImageInstances.push(imageInstance);
            }
        }
    }
}

function removeUserGreeting() {
    if (greetingTextInstance) {
        fabricCanvas.remove(greetingTextInstance);
    }
}

function showUserGreeting(matchedPerson, matchedPersona) {
    let greeting;

    // hide greeting when no person was recognized
    if (matchedPerson === null) {
        greeting = '';
    } else if (matchedPerson === '') {
        greeting = getGreetingForHourOfDay() + '.';
    } else {
        greeting = getGreetingForHourOfDay() + ',\n' + matchedPerson.charAt(0).toUpperCase() + matchedPerson.slice(1) + '.';
    }

    // adaptive font size depending on persona
    const fontSize = (matchedPersona == personas.SENIOR) ? 80 : 40;
    console.log(fontSize);

    greetingTextInstance = new fabric.Text(greeting, {
        fontFamily: 'Starjhol',
        left: 10,
        top: 800,
        fill: '#FFFFFF',
        fontSize: fontSize
    });
    fabricCanvas.add(greetingTextInstance);
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

function showDebugMessages(json, matchedPersona) {
    json.matchedPersona = matchedPersona;
    document.querySelector('#debug-text p').innerHTML = JSON.stringify(json);
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