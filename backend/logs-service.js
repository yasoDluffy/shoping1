const StorageService = require('./storage-service');
const storageService = new StorageService();

class LogsService {
    constructor() {}

    async writeLogs(requestType, action) {
        const logs = (await storageService.readData('logs.json')).serverRequests;

        const updatedLogs = [...logs, { requestType, action, date: new Date() }];

        await storageService.writeData('logs.json', { serverRequests: updatedLogs });
    }
  
}


module.exports = LogsService;
