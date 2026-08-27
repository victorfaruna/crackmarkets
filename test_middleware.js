const http = require('http');

// 1. Create a mock backend server
const server = http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/api/auth/refresh') {
    console.log('[Mock Backend] Received refresh request with headers:', req.headers);
    // Create an expired token initially, but since we are mocking refresh,
    // let's send back a token that is valid.
    // A valid JWT needs 3 parts. Let's make an expiration far in the future.
    const mockPayload = Buffer.from(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 3600 })).toString('base64');
    const newAccessToken = `header.${mockPayload}.signature`;
    
    res.writeHead(200, {
      'Set-Cookie': [
        `access_token=${newAccessToken}; Path=/; HttpOnly`,
        'refresh_token=new_refresh_token; Path=/; HttpOnly'
      ],
      'Content-Type': 'application/json'
    });
    res.end(JSON.stringify({ message: 'Refreshed' }));
  } else {
    res.writeHead(404);
    res.end();
  }
});

server.listen(5000, async () => {
  console.log('[Mock Backend] Listening on port 5000');

  // 2. Make request to NextJS app (assuming it is running on 3000)
  try {
    console.log('[Test Client] Requesting /dashboard with only a refresh token...');
    const response = await fetch('http://localhost:3000/dashboard', {
      method: 'GET',
      headers: {
        'Cookie': 'refresh_token=old_refresh_token',
      },
      redirect: 'manual' // We want to see if it redirects to login or proceeds
    });

    console.log('[Test Client] Response status:', response.status);
    console.log('[Test Client] Response headers:');
    response.headers.forEach((value, name) => {
      console.log(`  ${name}: ${value}`);
    });

  } catch (err) {
    console.error('[Test Client] Request failed:', err);
  } finally {
    server.close();
  }
});
