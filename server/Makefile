API_PROTO_FILES=$(shell find proto -name *.proto)
PBTS_BIN_DIR=../wx/miniprogram/node_modules/.bin
PBTS_OUT_DIR="../wx/miniprogram/service/proto_gen"

All: grpc gateway pbjs pbts

.PHONY: grpc
# generate grpc code
grpc:
	protoc --proto_path=proto \
           --go_out=paths=source_relative:proto/gen/go \
           --go-grpc_out=paths=source_relative:proto/gen/go \
           $(API_PROTO_FILES)

.PHONY: gateway
# generate gateway code
gateway:
	protoc --proto_path=proto \
           --grpc-gateway_out=paths=source_relative,grpc_api_configuration=proto/trip.yaml:proto/gen/go \
           $(API_PROTO_FILES)

.PHONY: pbjs_pre1
pbjs_pre1:
	$(PBTS_BIN_DIR)/pbjs -t static \
            -w es6 $(API_PROTO_FILES) \
            --no-create --no-encode --no-decode --no-verify --no-delimited -o \
            $(PBTS_OUT_DIR)/trip_pb_tmp.js

.PHONY: pbjs_pre2
pbjs_pre2:  pbjs_pre1
	echo 'import * as $$protobuf from "protobufjs";\n' > $(PBTS_OUT_DIR)/trip_pb.js

.PHONY: pbjs
pbjs:   pbjs_pre1 pbjs_pre2
	cat $(PBTS_OUT_DIR)/trip_pb_tmp.js >> $(PBTS_OUT_DIR)/trip_pb.js
	rm $(PBTS_OUT_DIR)/trip_pb_tmp.js

.PHONY: pbts
pbts:
	$(PBTS_BIN_DIR)/pbts -o $(PBTS_OUT_DIR)/trip_pb.d.ts \
            $(PBTS_OUT_DIR)/trip_pb.js
