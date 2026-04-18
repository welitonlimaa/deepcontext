export function createPoller(fn, interval = 2000) {
  let timer = null;

  const start = () => {
    if (timer) return;

    timer = setInterval(fn, interval);
  };

  const stop = () => {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  };

  return { start, stop };
}