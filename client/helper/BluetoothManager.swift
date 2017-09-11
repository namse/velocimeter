//
//  BluetoothManager.swift
//  helper
//
//  Created by echo on 2017. 9. 11..
//  Copyright © 2017년 echo. All rights reserved.
//

import Foundation
import UIKit
import CoreBluetooth
import SocketIO

class BluetoothManager: NSObject,
    CBCentralManagerDelegate,
    CBPeripheralDelegate {
    
    var manager:CBCentralManager!
    var peripheral:CBPeripheral!
    
    let calculator:Calculator = Calculator()
    let VELOCIMETER_UUID =
        UUID(uuidString: "10CC61C6-C670-4748-86E5-145ADF83AA82")
    let CSC_SERVICE =
        CBUUID(string: "1816")
    let CSC_MEASUREMENT_CHARACTERISTIC =
        CBUUID(string: "2A5B")
    
    let socket = SocketIOClient(socketURL: URL(string: "http://ec2-13-124-203-7.ap-northeast-2.compute.amazonaws.com:3000")!, config: [.compress])
    
    override init() {
        super.init()
        
        manager = CBCentralManager(delegate: self, queue: nil)
        socket.connect()
    }
    
    func scan() {
        let options = [CBCentralManagerScanOptionAllowDuplicatesKey: true]
        manager.scanForPeripherals(withServices: [CSC_SERVICE], options: options)
    }
    
    func centralManagerDidUpdateState(_ central: CBCentralManager) {
        print(central.state)
        if central.state == CBManagerState.poweredOn {
            scan()
        } else {
            print("Bluetooth not available.")
        }
    }
    
    func centralManager(_ central: CBCentralManager, didDiscover peripheral: CBPeripheral, advertisementData: [String : Any], rssi RSSI: NSNumber) {
        print(peripheral.identifier)
        if (peripheral.identifier == VELOCIMETER_UUID) {
            manager.stopScan()
            self.peripheral = peripheral
            self.peripheral.delegate = self;
            manager.connect(peripheral, options: nil)
            print("tryconnect")
        }
    }
    
    func centralManager(_ central: CBCentralManager, didConnect peripheral: CBPeripheral) {
        print("connected")
        peripheral.discoverServices([CSC_SERVICE])
    }
    
    func peripheral(_ peripheral: CBPeripheral, didDiscoverServices error: Error?) {
        print("didDiscoverServices")
        for service in peripheral.services! {
            peripheral.discoverCharacteristics([CSC_MEASUREMENT_CHARACTERISTIC], for: service)
        }
    }
    
    func peripheral(_ peripheral: CBPeripheral, didDiscoverCharacteristicsFor service: CBService, error: Error?) {
        print("didDiscover")
        for characteristic in service.characteristics! {
            let thisCharacteristic = characteristic as CBCharacteristic
            print(thisCharacteristic.uuid, CSC_MEASUREMENT_CHARACTERISTIC)
            if thisCharacteristic.uuid == CSC_MEASUREMENT_CHARACTERISTIC {
                peripheral.setNotifyValue(
                    true,
                    for: thisCharacteristic
                )
            }
        }
    }
    func peripheral(_ peripheral: CBPeripheral, didUpdateValueFor characteristic: CBCharacteristic, error: Error?) {
        print("didupdate")
        if characteristic.uuid == CSC_MEASUREMENT_CHARACTERISTIC {
            calculator.update(characteristic.value)
            print(calculator.velocity(), calculator.cadence())
            socket.emit("velocity", calculator.velocity());
            socket.emit("cadence", Double(calculator.cadence()));
        }
    }
    
    func centralManager(_ central: CBCentralManager, didFailToConnect peripheral: CBPeripheral, error: Error?) {
        print("error", error)
        scan()
    }
    
    func centralManager(_ central: CBCentralManager, didDisconnectPeripheral peripheral: CBPeripheral, error: Error?) {
        print("error", error)
        scan()
    }
}

