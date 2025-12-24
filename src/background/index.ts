// 背景脚本 - 在扩展的生命周期内持续运行
console.log('背景脚本已加载');

// 监听扩展安装事件
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('扩展已安装');
  }
  // 设置点击扩展图标时打开 side panel
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
});

export {};
