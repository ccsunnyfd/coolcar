package dao

import (
	"context"
	"os"
	"testing"

	"coolcar/shared/id"
	mgutil "coolcar/shared/mongo"
	"coolcar/shared/mongo/objid"
	"coolcar/shared/mongo/testing"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func TestResolveAccountID(t *testing.T) {
	c := context.Background()
	mc, err := mongotesting.NewClient(c)
	if err != nil {
		t.Fatalf("cannot connect mongodb: %v", err)
	}
	m := NewMongo(mc.Database("coolcar"))
	_, err = m.col.InsertMany(c, []interface{} {
		bson.M{
			mgutil.IDFieldName: objid.MustFromID(id.AccountID("6396f039ba6600ddab817643")),
			openIDField: "openid_1",
		},
		bson.M{
			mgutil.IDFieldName: objid.MustFromID(id.AccountID("6396f039ba6600ddab817644")),
			openIDField: "openid_2",
		},
	})
	if err != nil {
		t.Fatalf("cannot insert initial values: %v", err)
	}

	mgutil.NewObjID = func() primitive.ObjectID {
		return objid.MustFromID(id.AccountID("6396f039ba6600ddab817645"))
	}

	cases := []struct {
		name string
		openID string
		want string
	} {
		{
			name: "existing_user",
			openID: "openid_1",
			want: "6396f039ba6600ddab817643",
		},
		{
			name: "another_existing_user",
			openID: "openid_2",
			want: "6396f039ba6600ddab817644",
		},
		{
			name: "new_user",
			openID: "openid_3",
			want: "6396f039ba6600ddab817645",
		},
	}

	for _, cc := range cases {
		t.Run(cc.name, func(t *testing.T) {
			id, err := m.ResolveAccountID(context.Background(), cc.openID) 
			if err != nil {
				t.Errorf("failed resolve account id for %q: %v", cc.openID, err)
			}

			if id.String() != cc.want {
				t.Errorf("resolve account id: want: %q, got: %q", cc.want, id)
			}
		})
	}
}

func TestMain(m *testing.M) {
	os.Exit(mongotesting.RunWithMongoInDocker(m))
}