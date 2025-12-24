declare module '*.css' {
  const classes: { [key: string]: string };
  export default classes;
}

// 如果使用 CSS 模块功能 (*.module.css)
declare module '*.module.css' {
  const classes: { [key: string]: string };
  export default classes;
}
