const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const { exec } = require('child_process');
const path = require('path');

const app = express();
const port = 3000; // You can change the port if needed
const homeListFile = '/etc/pihole/home.list';

// Middleware to parse JSON body
app.use(bodyParser.json());

// Function to check if IP + record is present in home.list
function isRecordPresent(IP, record) {
  try {
    const data = fs.readFileSync(homeListFile, 'utf8');
    const lines = data.trim().split('\n');
    for (const line of lines) {
      const [storedIP, storedRecord] = line.trim().split(' ');
      if (storedIP === IP && storedRecord === record) {
        return true;
      }
    }
    return false;
  } catch (err) {
    console.error(`Error reading ${homeListFile}: ${err.message}`);
    return false;
  }
}

// POST endpoint to accept JSON input for adding a record
app.post('/add', (req, res) => {
    const { IP, record } = req.body;
    if (!IP || !record) {
      return res.status(400).json({ error: 'Both IP and record fields are required' });
    }
      // Check if the record is present
  if (isRecordPresent(IP, record)) {
    return res.status(409).json({ message: 'Record already present' });
  }

  
    // Copy home.list to home.list.old or create home.list.old if it doesn't exist
    const sourceFilePath = "/etc/pihole/home.list"
    const destinationFilePath = "/etc/pihole/home.list.old"
    
    fs.copyFile(sourceFilePath, destinationFilePath, (err) => {
      if (err && err.code !== 'ENOENT') {
        console.error('Error copying file:', err);
        return res.status(500).json({ error: 'Error copying home.list to home.list.old' });
      }
  
      // Add the record to home.list
      fs.appendFile(sourceFilePath, `${IP} ${record}\n`, (err) => {
        if (err) {
          console.error('Error appending record to home.list:', err);
          return res.status(500).json({ error: 'Error appending record to home.list' });
        }
        
        // Restart pihole-FTL service
        exec('service pihole-FTL restart', (error, stdout, stderr) => {
          if (error) {
            console.error(`Error restarting pihole-FTL service: ${error.message}`);
            return res.status(500).json({ error: 'Error restarting pihole-FTL service' });
          }
          if (stderr) {
            console.error(`pihole-FTL service restart stderr: ${stderr}`);
          }
          console.log(`pihole-FTL service restart stdout: ${stdout}`);
          // Sending back the success response
          res.json({ message: 'Record added successfully and pihole-FTL service restarted' });
        });
      });
    });
  });
  
// delete endpoint to accept JSON input for deleting a record
app.post('/delete', (req, res) => {
  const { IP, record } = req.body;
  if (!IP || !record) {
    return res.status(400).json({ error: 'Both IP and record fields are required' });
  }

  // Check if the record is present
  if (!isRecordPresent(IP, record)) {
    return res.status(404).json({ message: 'Record not found' });
  }

  // Remove the record from home.list
  try {
    const data = fs.readFileSync(homeListFile, 'utf8');
    const newData = data.split('\n').filter(line => {
      const [storedIP, storedRecord] = line.trim().split(' ');
      return !(storedIP === IP && storedRecord === record);
    }).join('\n');
    fs.writeFileSync(homeListFile, newData);
  } catch (err) {
    console.error(`Error deleting record from ${homeListFile}: ${err.message}`);
    return res.status(500).json({ error: 'Error deleting record' });
  }

  // Restart pihole-FTL service
  exec('service pihole-FTL restart', (error, stdout, stderr) => {
    if (error) {
      console.error(`Error restarting pihole-FTL service: ${error.message}`);
      return res.status(500).json({ error: 'Error restarting pihole-FTL service' });
    }
    if (stderr) {
      console.error(`pihole-FTL service restart stderr: ${stderr}`);
    }
    console.log(`pihole-FTL service restart stdout: ${stdout}`);
    // Sending back the success response
    res.json({ message: 'Record deleted successfully and pihole-FTL service restarted' });
  });
});

// reset endpoint to for resetting the record.
app.get('/reset', (req, res) => {

  // Copy home.list to home.list.old or create home.list.old if it doesn't exist
  const sourceFilePath = "/etc/pihole/home.list.old"
  const destinationFilePath = "/etc/pihole/home.list"
  fs.copyFile(sourceFilePath, destinationFilePath, (err) => {
    if (err && err.code !== 'ENOENT') {
      console.error('Error copying file:', err);
      return res.status(500).json({ error: 'Error copying home.list to home.list.old' });
    }
    // Restart pihole-FTL service
    exec('service pihole-FTL restart', (error, stdout, stderr) => {
      if (error) {
        console.error(`Error restarting pihole-FTL service: ${error.message}`);
        return res.status(500).json({ error: 'Error restarting pihole-FTL service' });
      }
      if (stderr) {
        console.error(`pihole-FTL service restart stderr: ${stderr}`);
      }
      console.log(`pihole-FTL service restart stdout: ${stdout}`);
      // Sending back the success response
      res.json({ message: 'Record added successfully and pihole-FTL service restarted' });
    });
  });

});

// Route to handle GET requests
app.get('/', (req, res) => {
    try {
      // Read the home.list file and parse its contents
      const data = fs.readFileSync(homeListFile, 'utf8');
      const lines = data.trim().split('\n');
      const records = lines.map(line => {
        const [IP, record] = line.trim().split(' ');
        return { IP, record };
      });
  
      // Send the records as JSON response
      res.json(records);
    } catch (err) {
      console.error(`Error reading ${homeListFile}: ${err.message}`);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});