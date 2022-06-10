
  ;if (typeof window == 'object' && window.EventSource && !window.__reloadRequest) {
    (function() {
      window.__reloadRequest = new EventSource("http://localhost:7071").onmessage = () => location.reload()
    })();
  };
(() => {
})();
//# sourceMappingURL=/entry-client-esbuild.js.map
