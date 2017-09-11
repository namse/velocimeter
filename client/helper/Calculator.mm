//
//  Calculator.m
//  helper
//
//  Created by echo on 2017. 9. 8..
//  Copyright © 2017년 echo. All rights reserved.
//

#import <Foundation/Foundation.h>
#import "Calculator.h"


@implementation Calculator
struct cscflags
{
    uint8_t _wheel_revolutions_present:1;
    uint8_t _crank_revolutions_present:1;
    uint8_t _reserved:6;
};

#define MIN_SPEED_VALUE 2.5
#define MAX_CEVENT_TIME 4
#define MAX_EVENT_TIME  64.0
#define KSPEED_UNINIT -1
#define KCADENCE_UNINT -1

- (id) init
{
    self = [super init];
    if(self){
        prev_wheel_event_ = 0;
        curr_wheel_event_ = 0;
        curr_crank_event_ = 0;
        prev_crank_event_ = 0;
        prev_wheel_revs_  = 0;
        curr_wheel_revs_  = 0;
        prev_crank_revs_  = 0;
        curr_crank_revs_  = 0;
        exer_wheel_revs_  = 0;
        last_wheel_event_ = 0;
        last_wheel_rounds_ = 0;
        last_crank_event_  = 0;
        last_speed_ = KSPEED_UNINIT;
        last_cadence_ = KCADENCE_UNINT;
        wheel_size_ = 2170; // default 2000 mm wheel size
        max_wheel_time_ = (int)((wheel_size_*0.001*1*3.6)/MIN_SPEED_VALUE);
    }
    return self;
}

- (void) update:(NSData*) value {
    
    const uint8_t *report_data( (const uint8_t*)[value bytes] );
    int data_size([value length]);
    
    cscflags flags={0};
    memcpy(&flags,report_data,sizeof(flags));
    int offset(sizeof(flags));
    
    time_t abs_time = time(NULL);
    
    // if speed present can be combo sensor or speed sensor only
    if( flags._wheel_revolutions_present )
    {
        prev_wheel_revs_ = curr_wheel_revs_;
        
        memcpy(&curr_wheel_revs_,report_data+offset,4);
        offset += 4;
        
        prev_wheel_event_ = curr_wheel_event_;
        
        uint16_t tmp_curr_wheel_event_(0);
        memcpy(&tmp_curr_wheel_event_,report_data+offset,sizeof(tmp_curr_wheel_event_));
        curr_wheel_event_ = (double)tmp_curr_wheel_event_/1024.0;
        offset += sizeof(tmp_curr_wheel_event_);
        
        if( last_speed_ == KSPEED_UNINIT )
        {
            // skip first packet
            last_speed_ = 0;
            last_wheel_event_  = abs_time;
        }
        else
        {
            double event_diff = curr_wheel_event_;
            if( prev_wheel_event_ )
            {
                if( prev_wheel_event_ <= curr_wheel_event_ )
                    event_diff = curr_wheel_event_ - prev_wheel_event_;
                else
                {
                    // rollover
                    event_diff = curr_wheel_event_ + ( ((double)0xFFFF/1024.0) - prev_wheel_event_);
                }
            }
            
            unsigned int wheel_rounds(curr_wheel_revs_ - prev_wheel_revs_);
            
            if( curr_wheel_revs_ < prev_wheel_revs_ )
            {
                prev_wheel_revs_ = curr_wheel_revs_;
                wheel_rounds = 0;
            }
            
            if( wheel_rounds > 0 )	last_wheel_rounds_ = wheel_rounds;
            
            exer_wheel_revs_ += wheel_rounds;
            double speed(0);
            if( (!event_diff || !wheel_rounds) && (abs_time-last_wheel_event_) < max_wheel_time_ )
            {
                speed = last_speed_;
                exer_wheel_revs_ += last_wheel_rounds_;
            }
            if( event_diff && wheel_rounds )
            {
                speed = ((((double)wheel_size_*0.001)*wheel_rounds)/event_diff)*3.6;
                last_wheel_event_ = abs_time;
            }
            
            last_speed_ = speed;
            distance_ = ((double)wheel_size_*0.001)*exer_wheel_revs_; // in meters
            total_distance_ = ((double)wheel_size_*0.001)*curr_wheel_revs_; // in meters, assumption that the wheel size has been the same
        }
    }
    
    // if cadence present can be combo sensor or cadence sensor only
    if( flags._crank_revolutions_present )
    {
        prev_crank_revs_ = curr_crank_revs_;
        
        memcpy(&curr_crank_revs_ ,report_data+offset,2);
        offset += 2;
        
        int crank_rounds( curr_crank_revs_ - prev_crank_revs_ );
        if( curr_crank_revs_ < prev_crank_revs_ )
        {
            prev_crank_revs_ = (0xFFFF - prev_crank_revs_);
            crank_rounds = curr_crank_revs_ - prev_crank_revs_;
        }
        
        prev_crank_event_ = curr_crank_event_;
        
        uint16_t tmp_curr_crank_event_(0);
        memcpy(&tmp_curr_crank_event_,report_data+offset,sizeof(tmp_curr_crank_event_));
        offset += sizeof(tmp_curr_crank_event_);
        
        curr_crank_event_ = (double)tmp_curr_crank_event_/1024.0;
        if( last_cadence_ == KCADENCE_UNINT )
        {
            // skip first packet
            last_crank_event_ = abs_time;
            last_cadence_ = 0;
        }
        else
        {
            double event_diff = curr_crank_event_;
            
            if( prev_crank_event_ )
            {
                if( prev_crank_event_ <= curr_crank_event_ )
                    event_diff = curr_crank_event_ - prev_crank_event_;
                else
                {
                    // rollover
                    event_diff = curr_crank_event_ + ( ((double)0xFFFF/1024.0) - prev_crank_event_);
                }
            }
            
            if( (!event_diff || !crank_rounds) && (abs_time-last_crank_event_) < MAX_CEVENT_TIME )
            {
                // do nothing last_cadence_
            }
            else if( event_diff && crank_rounds )
            {
                last_cadence_ = (int)((crank_rounds/event_diff)*60.0);
                last_crank_event_ = abs_time;
            }
            else
            {
                last_cadence_ = 0;
            }
        }
    }
}

- (double) velocity {
    return last_speed_;
}

- (int) cadence {
    return last_cadence_;
}

@end
