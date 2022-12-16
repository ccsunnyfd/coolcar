API_PROTO_FILES=$(shell find . -name *.proto)
PROTO_PATH=./${DOMAIN}/api
GO_OUT_PATH=./${DOMAIN}/api/gen/v1
PBTS_BIN_DIR=../wx/miniprogram/node_modules/.bin
PBTS_OUT_DIR="../wx/miniprogram/service/proto_gen"

All: grpc gateway pbjs pbts

.PHONY: init
init:
	-mkdir -p $(GO_OUT_PATH)

.PHONY: pbtsmkdir
pbtsmkdir:
	-mkdir -p $(PBTS_OUT_DIR)/${DOMAIN}

.PHONY: grpc
# generate grpc code
grpc: init
	protoc --proto_path=$(PROTO_PATH) \
           --go_out=paths=source_relative:$(GO_OUT_PATH) \
           --go-grpc_out=paths=source_relative:$(GO_OUT_PATH) \
           $(PROTO_PATH)/*.proto

.PHONY: gateway
# generate gateway code
gateway:
	protoc --proto_path=$(PROTO_PATH) \
           --grpc-gateway_out=paths=source_relative,grpc_api_configuration=$(PROTO_PATH)/${DOMAIN}.yaml:$(GO_OUT_PATH) \
           $(PROTO_PATH)/*.proto

.PHONY: pbjs_pre1
pbjs_pre1: pbtsmkdir
	$(PBTS_BIN_DIR)/pbjs -t static \
            -w es6 $(PROTO_PATH)/${DOMAIN}.proto \
            --no-create --no-encode --no-decode --no-verify --no-delimited -o \
            $(PBTS_OUT_DIR)/${DOMAIN}/${DOMAIN}_pb_tmp.js

.PHONY: pbjs_pre2
pbjs_pre2:  pbjs_pre1
	echo 'import * as $$protobuf from "protobufjs";\n' > $(PBTS_OUT_DIR)/${DOMAIN}/${DOMAIN}_pb.js

.PHONY: pbjs
pbjs:   pbjs_pre1 pbjs_pre2
	cat $(PBTS_OUT_DIR)/${DOMAIN}/${DOMAIN}_pb_tmp.js >> $(PBTS_OUT_DIR)/${DOMAIN}/${DOMAIN}_pb.js
	rm $(PBTS_OUT_DIR)/${DOMAIN}/${DOMAIN}_pb_tmp.js

.PHONY: pbts
pbts: pbjs
	$(PBTS_BIN_DIR)/pbts -o $(PBTS_OUT_DIR)/${DOMAIN}/${DOMAIN}_pb.d.ts \
            $(PBTS_OUT_DIR)/${DOMAIN}/${DOMAIN}_pb.js

.PHONY: mongo
mongo:
	docker-compose up -d