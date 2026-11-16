import grpc
from proto import order_pb2, order_pb2_grpc

request = order_pb2.OrderRequest(
    orderID="12345abc",
    items=["fizzy drink", "water", "water"],
    distance=4.8,
)

with grpc.insecure_channel("127.0.0.1:50051") as channel:
    stub = order_pb2_grpc.OrderServiceStub(channel)
    for _ in range(10):
        response = stub.DrinkOrder(request, timeout=5)
        print(response.deliveryServerPort, response)