'use strict';

class StatsPanel {

    constructor() {
    }

    adaptTo(state) {
        let colors = ['#26A67B', '#40E5AD', '#83FFD6', '#B4FFE6'];
        if (state.currentlyMatchedPerson === KNOWN_PERSONS.KYLO) {
            colors = ['#B50900', '#E4281D', '#EA746D', '#FFC6C3'];
        }

        if (state.statsPanelHidden) {
            this.hide();
            return;
        }

        if (state.matchedPersonChanged || state.updateStats) {

            fetch(`/stats/${state.currentlyMatchedPerson}`)
                .then((response) => {
                    return response.json();
                })
                .then((stats) => {

                    // I have spent hours of hours on this until I found this solution. I don't understand why it happens,
                    // but in these 2 situations the panels must spawn at its original position (=on the right side).
                    let errorCase1 = false;
                    let errorCase2 = false;
                    if (state.statsPanelPositionChanged && state.matchedPersonChanged) {
                        errorCase1 = true;
                        if (state.updateStats && state.statsPanelPreviousPosition === POSITIONS.LEFT) {
                            errorCase2 = true;
                        }
                    }

                    // adapt UI: don't display the graph to children like Anakin
                    if (state.currentlyMatchedPerson === KNOWN_PERSONS.ANAKIN) {
                        if (this.graphGroup) {
                            this.graphGroup.remove();
                        }
                    } else {
                        this.displayGraph(stats.tbh, colors, state.statsPanelCurrentPosition, errorCase1, errorCase2);
                    }
                    this.displayAchievements(state.style, state.accentColor, stats.acv, state.statsPanelCurrentPosition, errorCase1, errorCase2);

                    if (!state.matchedPersonChanged && state.updateStats) {
                        this.displayNewlyEarnedAchievements(stats.acv);
                    }

                    if (state.statsPanelPositionChanged) {
                        this.moveTo(state.statsPanelCurrentPosition);
                    }

                    this.previousAchievements = stats.acv;
                });

        } else if (state.statsPanelPositionChanged) {
            this.moveTo(state.statsPanelCurrentPosition);
        }
    }

    hide() {
        if (this.graphGroup) {
            this.graphGroup.remove();
        }
        if (this.iconGroup) {
            this.iconGroup.remove();
        }
    }

    moveTo(position) {
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

    displayGraph(measures, colors, position, errorCase1, errorCase2) {
        if (this.graphGroup) {
            this.graphGroup.remove();
        }

        const elements = [];
        const times = ['3d ago', '2d ago', '1d ago', 'today'];

        const potential_diff = times.length - measures.length;
        if (potential_diff) {
            for (let i = 0; i < potential_diff; i++) {
                measures.unshift(0);
            }
        }

        times.forEach((time, i) => {

            // if no measurement present for that day, then use default value
            const measure = measures.length > i ? measures[i] : 0;
            const barHeight = 35;
            const barWidth = Math.pow(measure, 1.5) / Math.pow(Math.max(...measures), 1.5) * 100;
            const x = SCREEN_WIDTH - 180;
            const y = 440 + barHeight * i * 1.4;

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

        if (!errorCase1) {
            let distance = 0;
            if (position === POSITIONS.LEFT) {
                distance = -SCREEN_WIDTH + 350;
            }
            this.graphGroup.transform(`t${distance},0`);
        }
        if (errorCase2) {
            if (position === POSITIONS.RIGHT) {
                this.graphGroup.transform(`t${-SCREEN_WIDTH + 350},0`);
            }
        }
    }

    displayNewlyEarnedAchievements(achievements) {
        const newAchievements = achievements.filter(m => !this.previousAchievements.includes(m));
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

    displayAchievements(style, accentColor, achievements, position, errorCase1, errorCase2) {
        if (this.iconGroup) {
            this.iconGroup.remove();
        }

        const text = paper.text(SCREEN_WIDTH - 170, 685, 'MEDALS')
        text.attr({ fill: accentColor, 'font-size': 30, 'font-family': 'Starjedi', 'text-anchor': 'middle' });

        const diameter = 80;
        const trooperImg = paper.image(`static/images/iconTrooper${style}.svg`, SCREEN_WIDTH - 205, 710, diameter, diameter);
        const yodaImg = paper.image(`static/images/iconYoda${style}.svg`, SCREEN_WIDTH - 255, 820, 180, diameter);
        const chewbaccaImg = paper.image(`static/images/iconChewbacca${style}.svg`, SCREEN_WIDTH - 205, 930, 80, 90);

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

        if (!errorCase1) {
            let distance = 0;
            if (position === POSITIONS.LEFT) {
                distance = -SCREEN_WIDTH + 350;
            }
            this.iconGroup.transform(`t${distance},0`);
        }
        if (errorCase2) {
            if (position === POSITIONS.RIGHT) {
                this.iconGroup.transform(`t${-SCREEN_WIDTH + 350},0`);
            }
        }
    }

}