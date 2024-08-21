const SEC_TO_MILIS = 1000;
const HOUR_TO_SEC = 3600;
const MIN_TO_SEC = 60;

export const createTimer = () => {
  const $runningTaskTimer = $("#runningTaskTimer");
  const addZero = (x) => (x < 10 ? "0" + x : x);

  return {
    startTime: 0,
    time: [],
    interval: undefined,
    start(startTime) {
      this.startTime = startTime;
      this.calculateTime();
      this.updateDisplay();
      this.interval = setInterval(() => {
        this.calculateTime();
        this.updateDisplay();
      }, 1000);
    },
    calculateTime() {
      if (!this.startTime) return;
      const currentTime = new Date().getTime();
      const time = Math.floor((currentTime - this.startTime) / SEC_TO_MILIS);
      const hour = Math.floor(time / HOUR_TO_SEC);
      const min = Math.floor((time - hour * HOUR_TO_SEC) / MIN_TO_SEC);
      const sec = time % MIN_TO_SEC;
      this.time = [hour, min, sec];
    },
    stop() {
      this.startTime = 0;
      this.time = [];
      this.updateDisplay();
      this.interval && clearInterval(this.interval);
    },
    updateDisplay() {
      $runningTaskTimer.text(this.getTimeString());
      chrome.action.setBadgeText({ text: this.getBadgeText() });
    },
    getTimeString() {
      const [h, m, s] = this.time.map(addZero);
      return this.time.length ? `${h}:${m}:${s}` : "";
    },
    getBadgeText() {
      const [h, m, s] = this.time;
      return this.time.length ? `${h ? `${h}h` : ""}${m}m` : "";
    },
  };
};

export const Timer = createTimer();
