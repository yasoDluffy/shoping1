const fs = require('fs-extra')
const path = require('path')

class StorageService {
    
    constructor() {
      this.rootStorage = path.join(__dirname, 'storage');
    }
  
    async readData(fileName) {
      try {
        const data = await fs.readFile(`${this.rootStorage}/${fileName}`, 'utf8');
        return JSON.parse(data);
      } catch (error) {
        console.error('Error reading data:', error);
      }
    }
  
    async writeData(fileName, jsonData) {
      try {
        await fs.writeFile(`${this.rootStorage}/${fileName}`, JSON.stringify(jsonData));
        console.log('Data written successfully!');
      } catch (error) {
        console.error('Error writing data:', error);
      }
    }
  
}


module.exports = StorageService;
