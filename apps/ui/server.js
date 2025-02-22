import { createServer } from 'http'
import { parse } from 'url'
import next from 'next'
import api from './api.js'
 
const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = 3000

const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()
 
app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true)
      const { pathname, query } = parsedUrl

      if (pathname.startsWith('/api/')) {
        return await api(req, res)
      }

      if (pathname.startsWith('/_next')) {
        return await handle(req, res)
      }

      Object.defineProperty(req, 'url', {
        value: '/',
        writable: true
      })

      await app.render(req, res, '/', query)
    } catch (err) {
      console.error('Error occurred handling', req.url, err)
      res.statusCode = 500
      res.end('internal server error')
    }
  })
    .once('error', (err) => {
      console.error(err)
      process.exit(1)
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`)
    })
})