const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Serve your static files (index.html, sw.js, etc.)
app.use(express.static(__dirname));

// The CORS Proxy
app.use('/proxy', createProxyMiddleware({
    router: (req) => {
        if (!req.query.url) return 'http://localhost';
        return new URL(req.query.url).origin;
    },
    pathRewrite: (path, req) => {
        if (!req.query.url) return '/';
        const urlObj = new URL(req.query.url);
        return urlObj.pathname + urlObj.search;
    },
    changeOrigin: true,
    onProxyRes: function (proxyRes) {
        // Strip the headers that block iframes
        delete proxyRes.headers['x-frame-options'];
        delete proxyRes.headers['content-security-policy'];
    },
    onError: (err, req, res) => {
        console.error('Proxy Error:', err);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Proxy Error: Could not load the requested site.');
    }
}));

// Fallback to index.html for everything else
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
