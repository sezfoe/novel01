let storyData;
let currentPage = 0;
let storyText;
let bg;

function loadYAML(callback) {
  fetch('../yaml/script.yaml')
    .then(res => res.text())
    .then(text => {
      storyData = jsyaml.load(text);
      callback();
    })
    .catch(error => {
      console.error('載入 YAML 失敗:', error);
    });
}

class NovelScene extends Phaser.Scene {
  constructor() {
    super({ key: 'NovelScene' });
    this.lineIndex = 0;
    this.isTyping = false;
    this.typingEvent = null;
    this.currentLineText = '';
    this.currentTypingIndex = 0;
  }

  preload() {}

  create() {
    this.lineIndex = 0;
    this.isTyping = false;
    this.typingEvent = null;
    this.currentTypingIndex = 0;

    this.input.on('pointerdown', (pointer) => {
      if (pointer.rightButtonDown()) {
        this.showFullPage();
      } else {
        this.handleNext();
      }
    });

    this.game.canvas.oncontextmenu = function (e) {
      e.preventDefault();
    };

    storyText = this.add.text(50, 200, '', {
      font: '24px sans-serif',
      fill: '#ffffff',
      wordWrap: { width: window.innerWidth - 100 },
      lineSpacing: 10 // 新增行距參數，數值可依需求調整
    });

    this.loadPage();
  }

  showFullPage() {
    // 停止任何正在進行的逐字顯示
    if (this.typingEvent) {
      this.time.removeEvent(this.typingEvent);
      this.typingEvent = null;
    }
    this.isTyping = false;
    this.lineIndex = this.lines.length;
    this.currentTypingIndex = this.lines.length - 1;
    // 顯示本頁所有內容
    storyText.setText(this.lines.join('\n'));
  }

  loadPage() {
    if (!storyData || !storyData.pages) {
      console.error('故事資料未正確載入');
      return;
    }

    let page = storyData.pages[currentPage];
    if (!page) {
      console.error('找不到頁面資料:', currentPage);
      return;
    }

    this.cameras.main.setBackgroundColor(page.background || '#000');
    this.lines = page.lines || [];
    this.lineIndex = 0;
    this.currentTypingIndex = 0;
    storyText.setText('');
    this.showNextLine(true);
  }

  showNextLine(isFirst = false) {
    if (!this.lines) return;
    if (this.lineIndex < this.lines.length) {
      this.typeLine(this.lines[this.lineIndex], this.lineIndex);
      this.currentTypingIndex = this.lineIndex;
      this.lineIndex++;
    } else if (!isFirst) {
      this.nextPage();
    }
  }

  typeLine(line, idx) {
    if (this.typingEvent) {
      this.time.removeEvent(this.typingEvent);
      this.typingEvent = null;
    }
    this.isTyping = true;
    let currentText = '';
    for (let i = 0; i < idx; i++) {
      currentText += this.lines[i] + '\n';
    }
    this.currentLineText = '';
    let charIndex = 0;
    this.typingEvent = this.time.addEvent({
      delay: 35,
      repeat: line.length - 1,
      callback: () => {
        this.currentLineText += line[charIndex];
        storyText.setText(currentText + this.currentLineText);
        charIndex++;
        if (charIndex === line.length) {
          this.isTyping = false;
          this.typingEvent = null;
        }
      }
    });
  }

  handleNext() {
    if (this.isTyping) {
      if (this.typingEvent) {
        this.time.removeEvent(this.typingEvent);
        this.typingEvent = null;
      }
      let currentText = '';
      for (let i = 0; i < this.currentTypingIndex; i++) {
        currentText += this.lines[i] + '\n';
      }
      this.currentLineText = this.lines[this.currentTypingIndex];
      storyText.setText(currentText + this.currentLineText);
      this.isTyping = false;
    } else {
      this.showNextLine();
    }
  }

  handlePrev() {
    if (this.isTyping) {
      if (this.typingEvent) {
        this.time.removeEvent(this.typingEvent);
        this.typingEvent = null;
      }
      let currentText = '';
      for (let i = 0; i < this.currentTypingIndex; i++) {
        currentText += this.lines[i] + '\n';
      }
      this.currentLineText = this.lines[this.currentTypingIndex];
      storyText.setText(currentText + this.currentLineText);
      this.isTyping = false;
    } else {
      this.prevPage();
    }
  }

  nextPage() {
    if (currentPage < storyData.pages.length - 1) {
      currentPage++;
      this.loadPage();
    }
  }

  prevPage() {
    if (currentPage > 0) {
      currentPage--;
      this.loadPage();
    }
  }
}

loadYAML(() => {
  const game = new Phaser.Game({
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    scene: NovelScene
  });

  window.addEventListener('resize', () => {
    game.scale.resize(window.innerWidth, window.innerHeight);
  });
});
