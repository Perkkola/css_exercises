from concurrent import futures
import json
import logging
import sys

import grpc
from proto import order_pb2
from proto import order_pb2_grpc
from proto import delivery_pb2_grpc
from proto import delivery_pb2

FOOD_MENU = ["chips", "fish", "burger", "pizza", "pasta", "salad"]
DRINK_MENU = ["water", "fizzy drink", "juice", "smoothie", "coffee", "beer"]
DESSERT_MENU = [
    "ice cream",
    "chocolate cake",
    "cheese cake",
    "brownie",
    "pancakes",
    "waffles",
]


class Order(order_pb2_grpc.OrderServiceServicer):
    def __init__(self, port, delivery_stub):
            self.port = port
            self.delivery_stub = delivery_stub

    def FoodOrder(self, request, context):
        for item_name in request.items:
            if item_name not in FOOD_MENU:
                return order_pb2.OrderResponse(
                    status=order_pb2.OrderResponse.REJECTED,
                    message=f"Invalid item(s)",
                    orderID=request.orderID,
                    itemMessage=[
                    order_pb2.items(itemName=item_name)
                    for item_name in request.items
                ]
                )
            
        delivery_request = delivery_pb2.DeliveryRequest(
            orderID=request.orderID,
            distance=request.distance,
        )

        delivery_response = self.delivery_stub.ScheduleDelivery(delivery_request)

        return order_pb2.OrderResponse(
            status=delivery_response.status,
            message=delivery_response.message,
            trackingCode=delivery_response.trackingCode if delivery_response.status == delivery_pb2.DeliveryResponse.ACCEPTED else "",
            deliveryServerPort=delivery_response.server_port,
            orderID=request.orderID,
            itemMessage=[
                order_pb2.items(itemName=item_name)
                for item_name in request.items
            ]
        )

    def DrinkOrder(self, request, context):
        for item_name in request.items:
            if item_name not in DRINK_MENU:
                return order_pb2.OrderResponse(
                    status=order_pb2.OrderResponse.REJECTED,
                    message=f"Invalid item(s)",
                    orderID=request.orderID,
                    itemMessage=[
                        order_pb2.items(itemName=item_name)
                        for item_name in request.items
                    ]
                )

        delivery_request = delivery_pb2.DeliveryRequest(
                    orderID=request.orderID,
                    distance=request.distance,
                )
        
        delivery_response = self.delivery_stub.ScheduleDelivery(delivery_request)
        
        return order_pb2.OrderResponse(
            status=delivery_response.status,
            message=delivery_response.message,
            trackingCode=delivery_response.trackingCode if delivery_response.status == delivery_pb2.DeliveryResponse.ACCEPTED else "",
            deliveryServerPort=delivery_response.server_port,
            orderID=request.orderID,
            itemMessage=[
                order_pb2.items(itemName=item_name)
                for item_name in request.items
            ]
        )

    def DessertOrder(self, request, context):
        for item_name in request.items:
            if item_name not in DESSERT_MENU:
                return order_pb2.OrderResponse(
                    status=order_pb2.OrderResponse.REJECTED,
                    message=f"Invalid item(s)",
                    orderID=request.orderID,
                    itemMessage=[
                        order_pb2.items(itemName=item_name)
                        for item_name in request.items
                    ]
                )

        delivery_request = delivery_pb2.DeliveryRequest(
                    orderID=request.orderID,
                    distance=request.distance,
                )
        
        delivery_response = self.delivery_stub.ScheduleDelivery(delivery_request)
        
        return order_pb2.OrderResponse(
            status=delivery_response.status,
            message=delivery_response.message,
            trackingCode=delivery_response.trackingCode if delivery_response.status == delivery_pb2.DeliveryResponse.ACCEPTED else "",
            deliveryServerPort=delivery_response.server_port,
            orderID=request.orderID,
            itemMessage=[
                order_pb2.items(itemName=item_name)
                for item_name in request.items
            ]
        )

    def MealOrder(self, request, context):
        food = request.items[0] if len(request.items) > 0 else None
        drink = request.items[1] if len(request.items) > 1 else None
        dessert = request.items[2] if len(request.items) > 2 else None

        if food not in FOOD_MENU or drink not in DRINK_MENU or dessert not in DESSERT_MENU or len(request.items) != 3:
            return order_pb2.OrderResponse(
                status=order_pb2.OrderResponse.REJECTED,
                message=f"Invalid item(s)",
                orderID=request.orderID,
                itemMessage=[
                    order_pb2.items(itemName=item_name)
                    for item_name in request.items
                ]
            )

        delivery_request = delivery_pb2.DeliveryRequest(
                    orderID=request.orderID,
                    distance=request.distance,
                )
        
        delivery_response = self.delivery_stub.ScheduleDelivery(delivery_request)
        
        return order_pb2.OrderResponse(
            status=delivery_response.status,
            message=delivery_response.message,
            trackingCode=delivery_response.trackingCode if delivery_response.status == delivery_pb2.DeliveryResponse.ACCEPTED else "",
            deliveryServerPort=delivery_response.server_port,
            orderID=request.orderID,
            itemMessage=[
                order_pb2.items(itemName=item_name)
                for item_name in request.items
            ]
        )


def serve():
    if len(sys.argv) < 3:
            print("Usage: python order_server.py <PORT> <DELIVERY_TARGET>")
            sys.exit(1)

    port = sys.argv[1]
    delivery_target = sys.argv[2]
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))

    delivery_channel = grpc.insecure_channel(
    delivery_target,
    options=[(
        "grpc.service_config",
        json.dumps({
            "loadBalancingConfig": [{"round_robin": {}}]
        }),
    )],
)
    stub = delivery_pb2_grpc.DeliveryServiceStub(delivery_channel)

    order_servicer = Order(port, stub)
    order_pb2_grpc.add_OrderServiceServicer_to_server(order_servicer, server)

    server.add_insecure_port(f"127.0.0.1:{port}")
    server.start()
    server.wait_for_termination()

if __name__ == "__main__":
    logging.basicConfig()
    serve()
