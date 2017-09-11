//
//  calculator.h
//  helper
//
//  Created by echo on 2017. 9. 8..
//  Copyright © 2017년 echo. All rights reserved.
//

#ifndef calculator_h
#define calculator_h

#include <UIKit/UIKit.h>


// CSC ( Cycling Speed And Cadence) example code

@interface Calculator : NSObject
{
    // for CSC data handling
    int wheel_size_;
    unsigned int curr_wheel_revs_;
    unsigned int curr_crank_revs_;
    double distance_;
    double total_distance_;
    double prev_wheel_event_;
    double curr_wheel_event_;
    double curr_crank_event_;
    double prev_crank_event_;
    unsigned int prev_wheel_revs_;
    unsigned int prev_crank_revs_;
    unsigned int exer_wheel_revs_;
    unsigned int last_wheel_rounds_;
    time_t last_wheel_event_;
    time_t last_crank_event_;
    double last_speed_;
    int last_cadence_;
    int max_wheel_time_;
    
}
- (id) init;
- (void) update:(NSData*) value;
- (double) velocity;
- (int) cadence;
@end
#endif /* calculator_h */
