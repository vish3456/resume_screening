const http = require('http');

http.get('http://localhost:4000/api/screening/history', (res) => {
    console.log("Status:", res.statusCode);
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        try {
            const parsed = JSON.parse(data);
            console.log("Data:", JSON.stringify(parsed, null, 2));
        } catch (e) {
            console.log("Raw Data:", data);
        }
    });
}).on('error', (err) => {
    console.error("Error connecting to server:", err.message);
});
