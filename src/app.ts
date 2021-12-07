export const qiankun = {
  // 应用加载之前
  async bootstrap(props: any) {
    console.log('gencode app bootstrap', props);
    return Promise.resolve();
  },
  // 应用 render 之前触发
  async mount(props: any) {
    return new Promise((resolve, reject) => {
      // Always reject with an Error.
      resolve(console.log('gencode app mount', props));
    });
  },
  // 应用卸载之后触发
  async unmount(props: any) {
    console.log('gencode app unmount', props);
    return Promise.resolve();
  },
};
