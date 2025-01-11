import { LightningElement, api, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class LoadingBar extends LightningElement {
    _timeValue = 1;         // Private variable to store time value
    @api timeUnit = 'minutes'; // Time unit from external field
    
    @track progress = 0;
    @track isRunning = false;
    @track displayTime = '0:00';
    
    totalMilliseconds = 0;
    remainingMilliseconds = 0;
    timerId;

    // Getter for progress bar style
    get progressStyle() {
        return `width: ${this.progress}%`;
    }

    // Getter and Setter for timeValue
    @api
    get timeValue() {
        return this._timeValue;
    }
    
    set timeValue(value) {
        this._timeValue = value;
        if (this.isRunning) {
            this.resetTimer();
        }
        this.startTimer();
    }

    startTimer() {
        if (!this._timeValue || this._timeValue <= 0) {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error',
                    message: 'Invalid time value received',
                    variant: 'error'
                })
            );
            return;
        }

        // Convert time to milliseconds
        this.totalMilliseconds = this._timeValue * (this.timeUnit === 'minutes' ? 60000 : 3600000);
        this.remainingMilliseconds = this.totalMilliseconds;
        this.isRunning = true;

        // Start the timer
        this.timerId = setInterval(() => {
            this.updateProgress();
        }, 1000); // Update every second

        // Dispatch event when timer starts
        this.dispatchEvent(new CustomEvent('timerstart', {
            detail: {
                timeValue: this._timeValue,
                timeUnit: this.timeUnit
            }
        }));
    }

    updateProgress() {
        if (this.remainingMilliseconds <= 0) {
            this.completeTimer();
            return;
        }

        this.remainingMilliseconds -= 1000;
        this.progress = ((this.totalMilliseconds - this.remainingMilliseconds) / this.totalMilliseconds) * 100;
        this.updateDisplayTime();
    }

    updateDisplayTime() {
        const minutes = Math.floor(this.remainingMilliseconds / 60000);
        const seconds = Math.floor((this.remainingMilliseconds % 60000) / 1000);
        this.displayTime = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    completeTimer() {
        clearInterval(this.timerId);
        this.progress = 100;
        this.isRunning = false;
        this.displayTime = '0:00';
        
        // Dispatch event when timer completes
        this.dispatchEvent(new CustomEvent('timercomplete'));
        
        this.dispatchEvent(
            new ShowToastEvent({
                title: 'Complete',
                message: 'Timer completed!',
                variant: 'success'
            })
        );
    }

    resetTimer() {
        clearInterval(this.timerId);
        this.progress = 0;
        this.isRunning = false;
        this.displayTime = '0:00';
        this.remainingMilliseconds = 0;

        // Dispatch event when timer resets
        this.dispatchEvent(new CustomEvent('timerreset'));
    }

    disconnectedCallback() {
        if (this.timerId) {
            clearInterval(this.timerId);
        }
    }
}