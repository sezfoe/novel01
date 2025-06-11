let storyData;
let currentPage = 0;
let storyText;
let bg;

function loadYAML(callback) {
  fetch('script.yaml')
    .then(res => res.text())
    .then(text => {
      storyData = jsyaml.load(text);
      callback();
    });
}

class NovelScene extends Phaser.Scene {
  constructor() {
    super({ key: 'NovelScene' });
  }

  preload() {
    // 可加載圖片或音效
  }

  create() {
    this.input.keyboard.on('keydown-RIGHT', () => this.nextPage());
    this.input.keyboard.on('keydown-LEFT', () => this.prevPage());

    storyText = this.add.text(50, 200, '', {
      font: '24px sans-serif',
      fill: '#ffffff',
      wordWrap: { width: 700 }
    });

    this.loadPage();
  }

  loadPage() {
    let page = storyData.pages[currentPage];
    this.cameras.main.setBackgroundColor(page.background || '#000');
    storyText.setText(page.text || '');
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
  new Phaser.Game({
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    scene: NovelScene
  });
});
