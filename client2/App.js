import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  NativeModules,
  NativeEventEmitter,
} from 'react-native';
import BleManager from 'react-native-ble-manager';
import io from 'socket.io-client';
import calculate from './calculate';

const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);
const VELOCIMITER_ID = '10CC61C6-C670-4748-86E5-145ADF83AA82';
const CSC_MEASUREMENT_CHARACTERISTIC = '2A5B';
const CSC_SERVICE = '1816';
const serverURL = 'http://ec2-13-124-203-7.ap-northeast-2.compute.amazonaws.com:3000';

export default class App2 extends Component {
  constructor(props) {
    super(props);

    this.state = {
      velocity: 0,
      cadence: 0,
      isSocketConnected: false,
    };
  }
  componentDidMount() {
    this.initBleManager();
    this.initSocketIO();
  }
  initSocketIO() {
    const socket = io(serverURL);
    socket.on('connect', () => {
      this.setState({
        isSocketConnected: true,
      });
    });
    socket.on('disconnect', () => {
      this.setState({
        isSocketConnected: false,
      });
    });
    this.socket = socket;
  }
  onNewData(cadence, velocity) {
    this.setState({
      cadence,
      velocity,
    });
    const {
      isSocketConnected,
      socket
    } = this.state;
    if (isSocketConnected) {
      this.socket.emit('velocity', velocity);
      this.socket.emit('cadence', cadence);
    }
  }
  initBleManager() {
    BleManager.start({showAlert: false});
    BleManager.connect(VELOCIMITER_ID)
    .then(() => {
      console.log('connected');
      return BleManager.retrieveServices(VELOCIMITER_ID);
    })
    .then((peripheralData) =>
      BleManager.startNotification(VELOCIMITER_ID, CSC_SERVICE, CSC_MEASUREMENT_CHARACTERISTIC))
    .then(() => {
      console.log('Notification started');
    })
    .catch((err) => console.log(err));

    bleManagerEmitter.addListener('BleManagerDidUpdateValueForCharacteristic', ({
      value,
      peripheral,
      characteristic,
    }) => {
      if (characteristic !== CSC_MEASUREMENT_CHARACTERISTIC) {
        console.log(characteristic);
        return;
      }
      const {
        cadence,
        velocity,
      } = calculate(value);
      this.onNewData(cadence, velocity);
    });
  }
  render() {
    const {
      cadence,
      velocity,
      isSocketConnected,
    } = this.state;
    return (
      <View style={styles.container}>
        <Text style={styles.welcome}>
          cadence: {cadence}
        </Text>
        <Text style={styles.welcome}>
          velocity: {velocity}
        </Text>
        <Text style={styles.welcome}>
          isSocketConnected: {JSON.stringify(isSocketConnected)}
        </Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});

AppRegistry.registerComponent('client', () => client);
