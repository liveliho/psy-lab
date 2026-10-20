// 路由句柄：由 app.js 在启动时注入，供各视图调用（避免循环依赖）
export const nav = {
  render: () => {},
  replace: (hash) => location.replace(hash),
};
