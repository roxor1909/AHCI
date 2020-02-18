'use strict';

class StatsPanel {

    constructor() {
    }

    /**
     * 
     * @param {*} person 
     * @param {*} position 
     * @param {boolean} forceUpdate Force to redraw all elements including fetch new data from the server backend.
     */
    adaptTo(person, position, forceUpdate = false) {
        this.accentColor = '#40e5ad';
        this.style = 'Green';

        let colors = ['#26A67B', '#40E5AD', '#83FFD6', '#B4FFE6'];
        if (person === KNOWN_PERSONS.KYLO) {
            colors = ['#B50900', '#E4281D', '#EA746D', '#FFC6C3'];
            this.accentColor = '#e4281d';
            this.style = 'Red';
        }

        if (this.lastMatchedPerson === person && forceUpdate === false) {
            this.moveTo(position);
            return;
        }
        this.lastMatchedPerson = person;

        fetch(`/stats/${person}`)
            .then((response) => {
                return response.json();
            })
            .then((stats) => {
                this.displayGraph(stats.tbh, colors);
                this.displayAchievements(stats.acv);
                this.displayNewlyEarnedAchievements(stats.acv);
                this.moveTo(position);
            });
    }

    hide() {
        this.lastMatchedPerson = undefined;
        if (this.graphGroup) {
            this.graphGroup.remove();
        }
        if (this.iconGroup) {
            this.iconGroup.remove();
        }
    }

    moveTo(position) {
        if (this.position === position) {
            return;
        }
        this.position = position;

        let distance = 0;
        if (position === POSITIONS.LEFT) {
            distance = -SCREEN_WIDTH + 350;
        }

        if (this.graphGroup) {
            this.graphGroup.animate({
                transform: `t${distance},0`,
            }, ANIMATION_DUR_IN_MILLI, EASING);
        }
        if (this.iconGroup) {
            this.iconGroup.animate({
                transform: `t${distance},0`,
            }, ANIMATION_DUR_IN_MILLI, EASING);
        }
    }

    displayGraph(measures, colors) {
        if (this.graphGroup) {
            this.graphGroup.remove();
        }

        const elements = [];
        const times = ['3d ago', '2d ago', '1d ago', 'today'];

        times.forEach((time, i) => {

            // if no measurement present for that day, then use default value
            const measure = measures.length > i ? measures[i] : 0;
            const barHeight = 33;
            const barWidth = Math.pow(measure, 1.5) / Math.pow(Math.max(...measures), 1.5) * 100;
            const x = SCREEN_WIDTH - 180;
            const y = 400 + barHeight * i * 1.4;

            const bar = paper.rect(x, y, 50, 50, 5).attr({
                fill: colors[i],
                height: barHeight,
                width: 0,
            });
            bar.animate({ width: barWidth }, 1100, mina.elastic);
            elements.push(bar);

            const text = paper.text(x - 80, y + barHeight / 2 + 5, time);
            text.attr({ fill: colors[i], 'font-size': 20, 'font-family': 'LLPIXEL3', 'text-anchor': 'start' });
            elements.push(text);
        });

        this.graphGroup = paper.group(...elements);
    }

    displayNewlyEarnedAchievements(achievements) {
        const newAchievements = achievements.filter(m => !this.previousAchievements.includes(m));
        console.log('old achievements:', this.previousAchievements);
        console.log('new achievements:', newAchievements);
        this.previousAchievements = achievements;

        setTimeout(() => {
            newAchievements.forEach(acv => {
                const capitalizedAcv = acv.charAt(0).toUpperCase() + acv.slice(1);
                let diameter = 500;
                let medal = paper.image(`static/images/achievement${capitalizedAcv}.svg`, SCREEN_WIDTH / 2 - diameter / 2, SCREEN_HEIGHT / 2 - diameter / 2, 100, 100);
                medal.animate({
                    width: diameter,
                    height: diameter,
                }, 1100, mina.elastic);
                setTimeout(() => {
                    medal.animate({
                        width: 0,
                        height: 0,
                    }, 300, mina.easein);
                }, 5000);
            });
        }, 6000);
    }

    displayAchievements(achievements) {
        if (this.iconGroup) {
            this.iconGroup.remove();
        }

        const text = paper.text(SCREEN_WIDTH - 170, 615, 'MEDALS')
        text.attr({ fill: this.accentColor, 'font-size': 30, 'font-family': 'Starjedi', 'text-anchor': 'middle' });

        const diameter = 80;
        const chewbaccaImg = paper.image(`static/images/iconChewbacca${this.style}.svg`, SCREEN_WIDTH - 205, 850, 80, 90);
        const trooperImg = paper.image(`static/images/iconTrooper${this.style}.svg`, SCREEN_WIDTH - 205, 650, diameter, diameter);
        const yodaImg = paper.image(`static/images/iconYoda${this.style}.svg`, SCREEN_WIDTH - 255, 750, 180, diameter);

        if (!achievements.includes('chewbacca')) {
            chewbaccaImg.attr({ opacity: 0.3 });
        }
        if (!achievements.includes('trooper')) {
            trooperImg.attr({ opacity: 0.3 });
        }
        if (!achievements.includes('yoda')) {
            yodaImg.attr({ opacity: 0.3 });
        }
        this.iconGroup = paper.g(text, chewbaccaImg, trooperImg, yodaImg);
    }

}