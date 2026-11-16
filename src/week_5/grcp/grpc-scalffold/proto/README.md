To regenerate .py files run this command outside the proto directory:

python -m grpc_tools.protoc -I./proto --python_out=proto --pyi_out=proto --grpc_python_out=proto ./proto/order.proto
