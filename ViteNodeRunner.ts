import { createServer } from 'vite'
import { ViteNodeServer } from 'vite-node/server'
import { ViteNodeRunner } from 'vite-node/client'

// create vite server
const server = await createServer({
  optimizeDeps: {
    // It's recommended to disable deps optimization
    disabled: true,
  },
})
// this is need to initialize the plugins
await server.pluginContainer.buildStart({})

// create vite-node server
const node = new ViteNodeServer(server)

// create vite-node runner

const runner = new ViteNodeRunner({
  root: server.config.root,
  base: server.config.base,
  // when having the server and runner in a different context,
  // you will need to handle the communication between them
  // and pass to this function
  fetchModule(id) {
    return node.fetchModule(id)
  },
  resolveId(id, importer) {
    return node.resolveId(id, importer)
  },
})

// execute the file
await runner.executeFile('./src/index.ts')

// close the vite server
await server.close()