//
//  ViewController.swift
//  helper
//
//  Created by echo on 2017. 9. 8..
//  Copyright © 2017년 echo. All rights reserved.
//

import UIKit

class ViewController:
    UIViewController {
    
    var bluetoothManager:BluetoothManager!
    var gpsManager:GPSManager!
    
    override func viewDidLoad() {
        super.viewDidLoad()
        bluetoothManager = BluetoothManager()
        gpsManager = GPSManager()
    }
    
    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }
}

