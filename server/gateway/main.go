package main

import (
	authpb "coolcar/auth/api/gen/v1"
	rentalpb "coolcar/rental/api/gen/v1"
	"coolcar/shared/server"
	"log"
	"net/http"

	"github.com/grpc-ecosystem/grpc-gateway/v2/runtime"
	"golang.org/x/net/context"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
	"google.golang.org/protobuf/encoding/protojson"
)

func main() {
	lg, err := server.NewZapLogger()
	if err != nil {
		log.Fatalf("cannot create zap logger: %v", err)
	}
	c := context.Background()
	c, cancel := context.WithCancel(c)
	defer cancel()

	mux := runtime.NewServeMux(runtime.WithMarshalerOption(runtime.MIMEWildcard, &runtime.JSONPb{
				MarshalOptions: protojson.MarshalOptions{
					UseEnumNumbers: true,
					UseProtoNames:  true,
				},
			},
	))

	serverConfig := []struct {
		name string
		addr string
		registerFunc func(ctx context.Context, mux *runtime.ServeMux, endpoint string, opts []grpc.DialOption) (err error)
	} {
		{
			name: "auth",
			addr: ":8081",
			registerFunc: authpb.RegisterAuthServiceHandlerFromEndpoint,
		},
		{
			name: "trip",
			addr: ":8082",
			registerFunc: rentalpb.RegisterTripServiceHandlerFromEndpoint,
		},
		{
			name: "profile",
			addr: ":8082",
			registerFunc: rentalpb.RegisterProfileServiceHandlerFromEndpoint,
		},
	}

	for _, s := range serverConfig {
		err := s.registerFunc(
			c,
			mux,
			s.addr,
			[]grpc.DialOption{grpc.WithTransportCredentials(insecure.NewCredentials())},
		)
		if err != nil {
			lg.Sugar().Fatalf("cannot register service %s: %v", s.name, err)
		}
	}
	addr := ":8084"
	lg.Sugar().Infof("grpc gateway started at %s", addr)
	lg.Sugar().Fatal(http.ListenAndServe(addr, mux))
}
