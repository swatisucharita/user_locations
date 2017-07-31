import onesignal from 'onesignal';
import {oneSignalCredentials} from './constants';

let client = onesignal(oneSignalCredentials.apikey, oneSignalCredentials.appId, true);

exports.addDevice = function(deviceId, osType){
  client.addDevice(deviceId, osType);
};

exports.updateDevice = function(onesignalId, newId){
  client.editDevice(onesignalId, newId);
};

exports.sendNotifications = function(message, data, ids=[]){
  client.createNotification(message, signal, ids);
};
