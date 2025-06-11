const yamlPath = 'yaml/script.yaml'; // 新增這行

async function create() {
    try {
        const response = await fetch(yamlPath); // 修改這行
        const yamlText = await response.text();
        storyData = jsyaml.load(yamlText);
        console.log('storyData:', storyData);
    } catch (error) {
        console.error('載入 YAML 失敗:', error);
        return;
    }
    // ...existing code...
}