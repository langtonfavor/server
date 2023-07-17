const express = require('express');
const app = express();
const path = require('path');
const fs = require('fs');

// Serve static files from the Angular app
app.use(express.static(path.join(__dirname, 'dist/client')));

// API endpoint to get directory listing
app.get('/api/directory', (req, res) => {
  const directoryPath = req.query.path || '.'; // Get the directory path from the query parameter, defaulting to the current directory

  try {
    const directoryListing = fs.readdirSync(directoryPath, { withFileTypes: true }).map((file) => {
      const filePath = path.join(directoryPath, file.name);
      const stats = fs.statSync(filePath);
      const isDirectory = stats.isDirectory();

      return {
        name: file.name,
        path: filePath,
        size: stats.size,
        extension: isDirectory ? '' : path.extname(file.name).slice(1),
        createdDate: stats.birthtime.toISOString().slice(0, 10),
        permissions: getPermissionsString(stats),
        isDirectory: isDirectory,
      };
    });

    res.json(directoryListing);
  } catch (error) {
    console.error('Failed to fetch directory listing:', error);
    res.status(500).json({ error: 'Failed to fetch directory listing.' });
  }
});

// Handle other routes and send the Angular app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/client/index.html'));
});

// Start the server
const port = 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

function getPermissionsString(stats) {
  const userPermissions = getPermissionString(stats.mode, 6, 7, 8);
  const groupPermissions = getPermissionString(stats.mode, 3, 4, 5);
  const otherPermissions = getPermissionString(stats.mode, 0, 1, 2);

  return userPermissions + groupPermissions + otherPermissions;
}

function getPermissionString(mode, readBit, writeBit, executeBit) {
  return [
    (mode & (1 << readBit)) ? 'r' : '-',
    (mode & (1 << writeBit)) ? 'w' : '-',
    (mode & (1 << executeBit)) ? 'x' : '-',
  ].join('');
}
