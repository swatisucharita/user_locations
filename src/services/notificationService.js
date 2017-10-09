import onesignal from 'onesignal';
import { oneSignalCredentials } from './constants';

let client = onesignal(oneSignalCredentials.apikey, oneSignalCredentials.appId, true);

class NotificationService {
  addDevice(deviceId, osType) {
    return client.addDevice(deviceId, osType);
  }

  updateDevice(onesignalId, newId) {
    client.editDevice(onesignalId, newId);
  }

  sendNotifications(message, data, ids = []) {
    client.createNotification(message, data, ids);
  }
}

let notificationService = new NotificationService();
export default notificationService;
