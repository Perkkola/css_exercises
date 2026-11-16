from concurrent import futures
import logging
import sys

import grpc
from proto import delivery_pb2
from proto import delivery_pb2_grpc

MAX_DISTANCE = 10.0  # km


class Delivery(delivery_pb2_grpc.DeliveryServiceServicer):
    def __init__(self, port):
        self.port = port

    def ScheduleDelivery(self, request, context):
        if request.distance > MAX_DISTANCE:
            return delivery_pb2.DeliveryResponse(
                status=delivery_pb2.DeliveryResponse.REJECTED,
                message="Destination too far.",
                server_port=self.port,
            )

        return delivery_pb2.DeliveryResponse(
            status=delivery_pb2.DeliveryResponse.ACCEPTED,
            trackingCode=f"TRK-{request.orderID}",
            message="",
            server_port=self.port,
        )


def serve():
    if len(sys.argv) < 2:
        print("Usage: python delivery_server.py <PORT>")
        sys.exit(1)

    port = sys.argv[1]
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))

    delivery_pb2_grpc.add_DeliveryServiceServicer_to_server(Delivery(port), server)
    server.add_insecure_port("[::]:" + port)
    server.start()
    print(f"Delivery gRPC server running on port {port}...")
    server.wait_for_termination()


if __name__ == "__main__":
    logging.basicConfig()
    serve()
