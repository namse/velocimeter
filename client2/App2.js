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
import calculate from './calculate';

const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);
const VELOCIMITER_ID = '10CC61C6-C670-4748-86E5-145ADF83AA82';
const CSC_MEASUREMENT_CHARACTERISTIC = '2A5B';
const CSC_SERVICE = '1816';



export default class App2 extends Component {
  constructor(props) {
    super(props);

    this.state = {
      cumulativeWheelRevolutions: 0,
      lastWheelEventTime: 0,
      cumulativeCrankRevolutions: 0,
      lastCrankEventTime: 0,
    };
  }
  componentDidMount() {
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
      const flags = value[0];
      const isWheel = flags & 1 !== 0;
      const isCrank = flags & 2 !== 0;

      const cumulativeWheelRevolutions = !isWheel
      ? 0
      : (value[1]
        + value[2] * 256
        + value[3] * 256 * 256
        + value[4] * 256 * 256);

      const lastWheelEventTime = !isWheel
      ? 0
      : (value[5]
        + value[6] * 256);

      let cumulativeCrankRevolutions;
      let lastCrankEventTime;
      if (!isCrank) {
        cumulativeCrankRevolutions = 0;
        lastCrankEventTime = 0;
      } else {
        if (isWheel) {
          cumulativeCrankRevolutions = (value[7]
            + value[8] * 256);

          lastCrankEventTime = (value[9]
            + value[10] * 256);
        } else {
          cumulativeCrankRevolutions = (value[1]
            + value[2] * 256);

          lastCrankEventTime = (value[3]
            + value[4] * 256);
        }
      }


      this.setState({
        cumulativeWheelRevolutions,
        lastWheelEventTime,
        cumulativeCrankRevolutions,
        lastCrankEventTime,
      });
    });
  }
  render() {
    const {
      cumulativeWheelRevolutions,
      lastWheelEventTime,
      cumulativeCrankRevolutions,
      lastCrankEventTime,
    } = this.state;
    return (
      <View style={styles.container}>
        <Text style={styles.welcome}>
          cumulativeWheelRevolutions: {cumulativeWheelRevolutions}
        </Text>
        <Text style={styles.welcome}>
          lastWheelEventTime: {lastWheelEventTime}
        </Text>
        <Text style={styles.welcome}>
          cumulativeCrankRevolutions: {cumulativeCrankRevolutions}
        </Text>
        <Text style={styles.welcome}>
          lastCrankEventTime: {lastCrankEventTime}
        </Text>
        <Text style={styles.instructions}>
          To get started, edit index.ios.js
        </Text>
        <Text style={styles.instructions}>
          Press Cmd+R to reload,{'\n'}
          Cmd+D or shake for dev menu
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
