'use strict';

class State {
    constructor() {
        this.previousAchievements = [];
        this.currentAchievements = [];

        // '#E4281D' or '#40E5AD'
        this.accentColor = undefined;
        // 'Red' or 'Green'
        this.style = undefined;

        this.previouslyMatchedPerson = undefined;
        this.currentlyMatchedPerson = undefined;
        this.matchedPersonChanged = false;
        this.currentlyMatchedPersonIsUnkown = true;
        this.currentlyNoMatchedPerson = true;

        this.previouslyWasBrushing = false;
        this.currentlyIsBrushing = false;
        this.isBrushingChanged = false;

        this.updateStats = false;
        this.startTimer = false;
        this.stopTimer = false;
        this.timerIsActive = false;

        this.centerPanelPreviousPosition = POSITIONS.BOTTOM;
        this.centerPanelCurrentPosition = POSITIONS.BOTTOM;
        this.centerPanelPositionChanged = false;
        this.sidePanelCurrentPosition = POSITIONS.RIGHT;
        this.sidePanelPositionChanged = false;
        this.statsPanelCurrentPosition = POSITIONS.RIGHT;
        this.statsPanelPositionChanged = false;

        this.centerPanelHidden = true;
        this.debugPanelHidden = true;
        this.sidePanelHidden = true;
        this.statsPanelHidden = true;
    }
}

class RuleInterpreter {
    constructor() {
        this.state = new State();
    }

    evaluateState(json) {
        this.setAccentColorAndStyle(json);
        this.setMatchedPerson(json);
        this.setIsBrushing(json);
        this.setStartStopTimer(json);
        this.setPanelsHiddenOrVisible();
        return this.state;
    }

    setAccentColorAndStyle(json) {
        if (json.matchedPerson === KNOWN_PERSONS.KYLO) {
            this.state.style = 'Red';
            this.state.accentColor = '#E4281D';
        } else {
            this.state.style = 'Green';
            this.state.accentColor = '#40E5AD';
        }
    }

    setMatchedPerson(json) {
        this.state.matchedPersonChanged = false;
        this.state.updateStats = false;
        if (this.state.currentlyMatchedPerson !== json.matchedPerson) {
            this.state.matchedPersonChanged = true;
            this.state.updateStats = true;
        }
        this.state.previouslyMatchedPerson = this.state.currentlyMatchedPerson;
        this.state.currentlyMatchedPerson = json.matchedPerson;

        this.state.currentlyMatchedPersonIsUnkown = false;
        this.state.currentlyNoMatchedPerson = false;
        if (this.state.currentlyMatchedPerson === KNOWN_PERSONS.UNKNOWN) {
            this.state.currentlyMatchedPersonIsUnkown = true;
        } else if (this.state.currentlyMatchedPerson === undefined || this.state.currentlyMatchedPerson === null) {
            this.state.currentlyNoMatchedPerson = true;
        }
    }

    setIsBrushing(json) {
        this.state.isBrushingChanged = false;
        if (this.state.currentlyIsBrushing !== json.isBrushing) {
            this.state.isBrushingChanged = true;
        }
        this.state.previouslyWasBrushing = this.state.currentlyIsBrushing;
        this.state.currentlyIsBrushing = json.isBrushing;
        // update stats after completing toothbrushing
        if (this.state.previouslyWasBrushing && !this.state.currentlyIsBrushing) {
            this.state.updateStats = true;
        }
    }

    setStartStopTimer(json) {
        this.state.startTimer = false;
        this.state.stopTimer = false;
        if (!this.state.previouslyWasBrushing && this.state.currentlyIsBrushing) {
            this.state.startTimer = true;
        } else if (this.state.previouslyWasBrushing && !this.state.currentlyIsBrushing) {
            this.state.stopTimer = true;
        }

        this.state.timerIsActive = json.isBrushing;        
    }

    setPanelsHiddenOrVisible() {
        this.state.centerPanelHidden = true;
        this.state.sidePanelHidden = true;
        this.state.statsPanelHidden = true;
        this.state.debugPanelHidden = true;
        if (this.state.currentlyMatchedPersonIsUnkown) {
            this.state.debugPanelHidden = false;
        } else if (!this.state.currentlyMatchedPersonIsUnkown && !this.state.currentlyNoMatchedPerson) {
            this.state.centerPanelHidden = false;
            this.state.sidePanelHidden = false;
            this.state.statsPanelHidden = false;
    
        }
    }

}