import { join } from 'path';
import { createServer } from 'http';
import sh from 'shelljs';
import * as print from './utils.print.mjs'

export const removeOldBuildFiles = ({ DIST_DIR }) => {
  print.removeOldBuildFiles()
  sh.rm('-rf', join(DIST_DIR, '*'))
}

export const copyIndexFile = ({ DIST_DIR, PUBLIC_DIR }) => {
  const indexSourcePath = join(PUBLIC_DIR, 'index.html')
  const indexTargetPath = join(DIST_DIR, 'index.html')
  sh.cp(indexSourcePath, indexTargetPath)
  print.copyIndexFile({ PUBLIC_DIR, DIST_DIR })
}

/**
 * Very elegant refresh solution from https://github.com/evanw/esbuild/issues/802#issuecomment-955776480
 * 1. Include `longPollCodeString` on page to be reloaded.
 * 2. Once page is loaded, the code will send a request to the reloadServer.
 * 3. The reload server will write back a 'keep-alive' header, then store the request
 * 4. On rebuild, call `refreshClients` to end the long-poll requests with a `write`
 * 5. The `longPollCodeString` will get the written message and reload the window
 * @param {int} port
 * @returns {string} longPollCodeString
 * @returns {function} refreshClients
 */
export const createReloadServer = ({ port }) => {
  const clientResponses = [];
  const server = createServer((req, res) => {
    return clientResponses.push(
      res.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Access-Control-Allow-Origin": "*",
        Connection: "keep-alive",
      }),
    );
  })
  server.listen(port)

  print.reloadServerReady({ port })

  return {
    longPollCodeString: `
  ;if (typeof window == 'object' && window.EventSource && !window.__reloadRequest) {
    (function() {
      window.__reloadRequest = new EventSource("http://localhost:${port}").onmessage = () => location.reload()
    })();
  };`,
    refreshClients: () => {
      console.log('Refreshing clients...')
      clientResponses.forEach((res) => res.write("data: update\n\n"));
    },
  }
}