//
//  GPSManager.swift
//  helper
//
//  Created by echo on 2017. 9. 11..
//  Copyright © 2017년 echo. All rights reserved.
//

import CoreLocation
import SocketIO

class GPSManager : NSObject, CLLocationManagerDelegate {
    var locationManager: CLLocationManager!
    let socket = SocketIOClient(socketURL: URL(string: "http://ec2-13-124-203-7.ap-northeast-2.compute.amazonaws.com:3000")!)

    override init() {
        super.init()
        
        locationManager = CLLocationManager()

        locationManager.desiredAccuracy = kCLLocationAccuracyBest
        locationManager.delegate = self
        locationManager.requestAlwaysAuthorization()
        
        socket.connect()
        socket.on(clientEvent: .connect) {data, ack in
            self.locationManager.startUpdatingLocation()
        }
    }
    
    func locationManager(_ manager: CLLocationManager,
                         didUpdateLocations locations: [CLLocation])
    {
        let latestLocation: CLLocation = locations[locations.count - 1]

        socket.emit("gps", [
            "latitude": latestLocation.coordinate.latitude,
            "longitude": latestLocation.coordinate.longitude
        ])
        print(latestLocation.coordinate.latitude, latestLocation.coordinate.longitude)
    }
    
    func locationManager(_ manager: CLLocationManager,
                         didFailWithError error: Error) {
        print(error)
    }
}
