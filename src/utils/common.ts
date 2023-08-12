/**
 * 打开一个新标签页
 * 因为 window.open 会被浏览器拦截，打开多个标签页的话，老的标签页会被新的替换掉
 * 导致最多只能打开一个新标签页，所以需要用这种方式来打开多个标签页
 */
export const openNewTab = (href: string) => {
  const a = document.createElement('a');
  a.setAttribute('href', href);
  a.setAttribute('target', '_blank');
  a.setAttribute('id', 'startTelMedicine');
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};
