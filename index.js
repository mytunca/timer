document.addEventListener("DOMContentLoaded", () => {
  const lsData = new LSData("list");
  const table = new Table("historyTable", lsData);
  const timer = new Timer(lsData);

  lsData.table = table;
  lsData.timer = timer;

  const buttonsDiv = document.querySelector("#buttons");
  new Button("Start / Stop", () => timer.toggle(), buttonsDiv);
  new Button("Clear", () => { lsData.data = []; timer.stop(); }, buttonsDiv);
})

class LSData {
  constructor(lsItemName) {
    this.lsItemName = lsItemName;
  }

  get data() {
    return JSON.parse(localStorage.getItem(this.lsItemName)) || [];
  }

  set data(newData) {
    localStorage.setItem(this.lsItemName, JSON.stringify(newData));
    if (this.table) this.table.render();
    if (this.timer) this.timer.render()
  }

  addItem(value) {
    this.data = [...this.data, value];
  }

  deleteItem(index) {
    this.data = this.data.filter((_, i) => i != index);
  }

  get totalTime() {
    return this.data.reduce((sum, row) => sum + (row.End && (row.End - row.Start) || 0), 0);
  }

  get lastRow() {
    const rows = this.data;
    return rows[rows.length - 1];
  }

  set lastRow(value) {
    const rows = this.data;
    rows[rows.length - 1] = value;
    this.data = rows;
  }
}

class Table {
  /**
   * @param {string} tableId 
   * @param {LSData} lsData 
   */
  constructor(tableId, lsData) {
    this.htmlEl = document.getElementById(tableId);
    this.tbody = this.htmlEl.querySelector("tbody");
    this.lsData = lsData;
    this.render();
  }

  render() {
    this.tbody.innerHTML = "";
    this.lsData.data.forEach((row, i) => {
      const start = new Date(Number(row.Start)).toLocaleString('tr-TR');
      const end = row.End ? new Date(Number(row.End)).toLocaleString('tr-TR') : "";
      const duration = row.End ? Timer.convertToDuration(row.End - row.Start) : "";

      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${start}</td><td>${end}</td><td>${duration}</td><td></td>`;

      if (end) new Button("✖", () => this.lsData.deleteItem(i), tr.lastElementChild);
      else tr.className = "active";

      this.tbody.insertBefore(tr, this.tbody.firstChild);
    });

    this.htmlEl.style.display = "none";
    if (this.lsData.data.length > 0) this.htmlEl.style.display = null;
  }
}

class Button {
  constructor(innerText, handleClick, elToAppend) {
    this.innerText = innerText;
    this.handleClick = handleClick;
    this.elToAppend = elToAppend;
    this.create();

  }
  create() {
    const button = document.createElement('button');
    button.innerText = this.innerText;
    button.onclick = this.handleClick;
    this.elToAppend.appendChild(button);
    this.el = button;
  }
}

class Timer {
  /**
  * @param {LSData} lsData
  */
  constructor(lsData) {
    this.lsData = lsData;

    const timerDiv = document.querySelector("#timer");
    const currentTimerDiv = document.createElement('div');
    currentTimerDiv.className = "current-timer";
    timerDiv.appendChild(currentTimerDiv);
    this.currentTimerDiv = currentTimerDiv;

    const allTimeCountDiv = document.createElement('div');
    timerDiv.appendChild(allTimeCountDiv);
    this.allTimeCountDiv = allTimeCountDiv;

    const noteSpan = document.createElement('span');
    noteSpan.className = "note";
    noteSpan.innerText = "After starting the timer, it continues to run even if you close the browser.";
    timerDiv.appendChild(noteSpan);

    if (this.isRunning) {
      this.starting = this.lsData.lastRow.Start;
      this.start();
    }

    this.render();

  }

  render() {
    this.currentTimerDiv.innerText = Timer.convertToDuration(this.currentTime);
    this.allTimeCountDiv.innerText = `Your Total Working Time: ${Timer.convertToDuration(this.currentTime + this.lsData.totalTime)}`;
  }

  //Adds a new row to the timer list
  start() {
    if (!this.isRunning) {
      const now = new Date().getTime();
      this.lsData.addItem({ Start: now });
      this.starting = now;
    }

    this.intervalId = setInterval(() => {
      this.render();
    }, 250);
  }

  //stops the current timer
  stop() {
    this.lsData.lastRow = { ...this.lsData.lastRow, End: new Date().getTime() };
    clearInterval(this.intervalId);
    this.starting = null;
    this.render();
  }

  get isRunning() {
    const lastRow = this.lsData.lastRow;
    return lastRow && !lastRow.End || false;
  }

  get currentTime() {
    return this.starting ? new Date().getTime() - this.starting : 0;
  }

  toggle() {
    if (this.isRunning) this.stop();
    else this.start();
  }

  static convertToDuration(ms) {
    return new Date(ms).toISOString().slice(11, 19);
  }
}