document.addEventListener("DOMContentLoaded", () => {
  new Button("Başla / Bitir", () => Timer.toggle());
  new Button("Temizle", () => {Data.rows = []; Timer.stop();});

  Timer.create();
  Table.create();

})

const Data = {
  get rows() {
    return JSON.parse(localStorage.getItem("list")) || [];
  },

  set rows(value) {
    localStorage.setItem("list", JSON.stringify(value));
    Table.render();
  },

  addRow(value) {
    const rows = this.rows;
    rows.push(value);
    this.rows = rows;
  },

  get lastRow() {
    const rows = this.rows;
    return rows[rows.length - 1];
  },

  set lastRow(value) {
    const rows = this.rows;
    rows[rows.length - 1] = value;
    this.rows = rows;
  },

  get totalTime() {
    return this.rows.reduce((sum, row) => sum + (row.End && (row.End - row.Start) || 0), 0);
  }
}

const Table = {
  create() {
    const table = document.createElement('table');
    this.htmlEl = table;
    const thead = document.createElement('thead');
    thead.innerHTML = "<tr><th>Başlangıç</th><th>Bitiş</th><th>Süre</th></tr>";
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    table.appendChild(tbody);
    this.tbody = tbody;

    document.querySelector("#root").appendChild(table);
    this.render();
  },

  render() {
    this.tbody.innerHTML = "";
    const data = Data.rows.reverse();
    data.forEach(row => this.addRow(row));

    this.htmlEl.style.display = "none";
    if (data.length > 0) this.htmlEl.style.display = "block";
  },

  addRow(row) {
    const start = new Date(Number(row.Start)).toLocaleString('tr-TR');
    const end = row.End ? new Date(Number(row.End)).toLocaleString('tr-TR') : "";
    const duration = row.End ? Timer.convertToDuration(row.End - row.Start) : "";

    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${start}</td><td>${end}</td><td>${duration}</td>`;
    if (!end) tr.className = "active";
    this.tbody.append(tr);
  }
}

class Button {
  constructor(innerText, handleClick) {
    this.innerText = innerText;
    this.handleClick = handleClick;
    this.create();

  }
  create() {
    const button = document.createElement('button');
    button.innerText = this.innerText;
    button.onclick = this.handleClick;
    document.querySelector("#buttons").appendChild(button);
    this.el = button;
  }
}

const Timer = {
  create() {
    const root = document.querySelector("#root");

    const allTimeCountDiv = document.createElement('div');
    root.appendChild(allTimeCountDiv);
    this.allTimeCountDiv = allTimeCountDiv;

    const currentTimerDiv = document.createElement('div');
    currentTimerDiv.className = "current-timer"
    root.appendChild(currentTimerDiv);
    this.currentTimerDiv = currentTimerDiv;

    const noteSpan = document.createElement('span');
    noteSpan.className = "note";
    noteSpan.innerText = "Sayacı başlattıktan sonra tarayıcıyı kapatsanız dahi çalışmaya devam eder.";
    root.appendChild(noteSpan);

    this.currentTime = 0;
    this.render()
    if (this.isRunning) {
      this.starting = Data.lastRow.Start;
      this.start();
    }
  },

  render() {
    this.currentTimerDiv.innerText = this.convertToDuration(this.currentTime);
    this.allTimeCountDiv.innerText = `Toplam Çalışma Süreniz: ${this.convertToDuration(this.currentTime + Data.totalTime)}`;
  },

  //Adds a new row to the timer list
  start() {
    if (!this.isRunning) {
      const now = new Date().getTime();
      Data.addRow({ Start: now });
      this.starting = now;
    }

    this.intervalId = setInterval(() => {
      this.currentTime = new Date() - this.starting;
      this.render();
    }, 75);
  },

  //stops the current timer
  stop() {
    const now = new Date().getTime();
    Data.lastRow = { ...Data.lastRow, End: now };
    clearInterval(this.intervalId);
    this.currentTime = 0;
    this.render();
  },

  get isRunning() {
    const lastRow = Data.lastRow;
    return lastRow && !lastRow.End || false;
  },

  toggle() {
    if (this.isRunning) this.stop();
    else this.start();
  },

  convertToDuration(ms) {
    return new Date(ms).toISOString().slice(11, 23);
  }
}

