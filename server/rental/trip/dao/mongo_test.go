package dao

import (
	"context"
	"os"
	"testing"

	rentalpb "coolcar/rental/api/gen/v1"
	"coolcar/shared/id"
	"coolcar/shared/mongo/objid"
	"coolcar/shared/mongo/testing"
)

func TestGetTrip(t *testing.T) {
	c := context.Background()
	mc, err := mongotesting.NewClient(c)
	if err != nil {
		t.Fatalf("cannot connect mongodb: %v", err)
	}
	m := NewMongo(mc.Database("coolcar"))
	acct := id.AccountID("account1")

	tr, err := m.CreateTrip(c, &rentalpb.Trip{
		AccountId: acct.String(),
		CarId: "car1",
		Start: &rentalpb.LocationStatus{
			PoiName: "startpoint",
			Location: &rentalpb.Location{
				Latitude: 30,
				Longitude: 120,
			},
		},
		End: &rentalpb.LocationStatus{
			PoiName: "endpoint",
			FeeCent: 10000,
			KmDriven: 35,
			Location: &rentalpb.Location{
				Latitude: 35,
				Longitude: 115,
			},
		},
		Status: rentalpb.TripStatus_FINISHED,
	})
		
	if err != nil {
		t.Fatalf("cannot create trip: %v", err)
	}

	t.Logf("inserted row %s with updatedat %v", tr.ID, tr.UpdatedAt)

	got, err := m.GetTrip(c, objid.ToTripID(tr.ID), acct)
	if err != nil {
		t.Errorf("cannot get trip: %v", err)
	}
	t.Logf("got trip: %+v", got)
}

func TestMain(m *testing.M) {
	os.Exit(mongotesting.RunWithMongoInDocker(m))
}