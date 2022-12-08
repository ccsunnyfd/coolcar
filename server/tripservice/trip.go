package trip

import (
	trippb "coolcar/proto/gen/go"
	"context"
)

// Service implements trip service.
type Service struct {
	trippb.UnimplementedTripServiceServer
}

func ( *Service) GetTrip(c context.Context, req *trippb.GetTripRequest) (*trippb.GetTripResponse, error) {
	return &trippb.GetTripResponse{
		Id: req.Id,
		Trip: 	&trippb.Trip{
			Start: "abc",
			End: "def",
			DurationSec: 3600,
			FeeCent: 10000,
			StartPos: &trippb.Location{
				Latitude: 31.13,
				Longitude: 121.13,
			},
			EndPos: &trippb.Location{
				Latitude: 31.22,
				Longitude: 121.14,
			},
			PathLocations: []*trippb.Location{
				{
					Latitude: 31.11,
					Longitude: 121.10,
				},
				{
					Latitude: 31.12,
					Longitude: 121.11,
				},
			},
			Status: trippb.TripStatus_IN_PROGRESS,
		},
	}, nil
}