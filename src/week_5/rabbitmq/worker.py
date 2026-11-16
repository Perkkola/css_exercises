import json
import pika
from xprint import xprint
import json
import time
from db_and_event_definitions import (
    CUSTOMERS_DATABASE,
    RIDES_DATABASE,
    TicketEvent,
    CustomerEvent,
)
from xprint import xprint


class TicketWorker:

    def __init__(self, worker_id):
        # Do not edit the init method.
        # Set the variables appropriately in the methods below.
        self.connection = None
        self.channel = None
        self.worker_id = worker_id
        self.ticket_event_exchange = "ticket_events_exchange"
        self.queue_name = "ticket_event"
        self.queue_name_suffixes = ["1", "2"]
        self.dead_letter_exchange = "ticket_events_dead_letter_exchange"
        self.dead_letter_queue = "ticket_events_dead_letter_queue"
        self.dead_letter_routing_key = "ticket_events_dead_letter_routing_key"
        self.ticket_events = []
        self.customer_event_producer = None
        self.customer_db = CUSTOMERS_DATABASE

    def initialize_rabbitmq(self):
        # To implement - Initialize the RabbitMQ connection, channel, exchanges and queues here
        # Also initialize the customer_event_producer used for publishing customer events
        xprint("TicketWorker {}: initialize_rabbitmq() called".format(self.worker_id))
        self.connection = pika.BlockingConnection(
            pika.ConnectionParameters(host="localhost")
        )
        self.channel = self.connection.channel()

        # Dead letter exchange + queue for nacked (invalid) ticket events
        self.channel.exchange_declare(
            exchange=self.dead_letter_exchange, exchange_type="direct"
        )
        self.channel.queue_declare(queue=self.dead_letter_queue)
        self.channel.queue_bind(
            queue=self.dead_letter_queue,
            exchange=self.dead_letter_exchange,
            routing_key=self.dead_letter_routing_key,
        )

        # Consistent hash exchange for ticket events (routing key = customer_id)
        self.channel.exchange_declare(
            exchange=self.ticket_event_exchange, exchange_type="x-consistent-hash"
        )

        # Per-worker queue; rejected messages are dead-lettered
        self.queue_name = "{}_{}".format(self.queue_name, self.worker_id)
        self.channel.queue_declare(
            queue=self.queue_name,
            arguments={
                "x-dead-letter-exchange": self.dead_letter_exchange,
                "x-dead-letter-routing-key": self.dead_letter_routing_key,
            },
        )
        # For a consistent hash exchange the binding key is the weight of the queue
        self.channel.queue_bind(
            queue=self.queue_name,
            exchange=self.ticket_event_exchange,
            routing_key="1",
        )
        self.channel.basic_qos(prefetch_count=1)

        self.customer_event_producer = CustomerEventProducer(
            self.connection, self.worker_id
        )
        self.customer_event_producer.initialize_rabbitmq()

    def handle_ticket_event(self, ch, method, properties, body):
        # To implement - This is the callback that is passed to "on_message_callback" when a message is received
        xprint("TicketWorker {}: handle_event() called".format(self.worker_id))
        # Handle the application logic and the publishing of events here
        ticket_event = TicketEvent(**json.loads(body))
        self.ticket_events.append(ticket_event)

        customer_id = ticket_event.customer_id
        ride_number = ticket_event.ride_number
        if customer_id not in self.customer_db or ride_number not in RIDES_DATABASE:
            xprint(
                "TicketWorker {}: unknown customer {} or ride {}, rejecting".format(
                    self.worker_id, customer_id, ride_number
                )
            )
            ch.basic_nack(delivery_tag=method.delivery_tag, requeue=False)
            return

        cost = RIDES_DATABASE[ride_number]
        balance = self.customer_db[customer_id]
        if balance >= cost:
            balance -= cost
            self.customer_db[customer_id] = balance
            status = "approved"
        else:
            status = "rejected"

        customer_event = CustomerEvent(
            customer_id,
            ride_number,
            cost,
            ticket_event.purchase_time,
            status,
            balance,
        )
        self.customer_event_producer.publish_customer_event(customer_event)
        ch.basic_ack(delivery_tag=method.delivery_tag)

    def start_consuming(self):
        # To implement - Start consuming from Rabbit
        xprint("TicketWorker {}: start_consuming() called".format(self.worker_id))
        # Use self.worker_id as suffix for queue name
        self.channel.basic_consume(
            queue=self.queue_name, on_message_callback=self.handle_ticket_event
        )
        self.channel.start_consuming()

    def close(self):
        # Do not edit this method
        try:
            xprint("Closing worker with id = {}".format(self.worker_id))
            self.channel.stop_consuming()
            time.sleep(1)
            self.channel.close()
            self.customer_event_producer.close()
            time.sleep(1)
            self.connection.close()
        except Exception as e:
            print(
                "Exception {} when closing worker with id = {}".format(
                    e, self.worker_id
                )
            )


class CustomerEventProducer:

    def __init__(self, connection, worker_id):
        # Do not edit the init method.
        self.worker_id = worker_id
        # Reusing connection created in TicketWorker
        self.channel = connection.channel()
        self.customer_event_exchange = "customer_events_exchange"

    def initialize_rabbitmq(self):
        # To implement - Initialize the RabbitMq connection, channel, exchange and queue here
        xprint(
            "CustomerEventProducer {}: initialize_rabbitmq() called".format(
                self.worker_id
            )
        )
        self.channel.exchange_declare(
            exchange=self.customer_event_exchange, exchange_type="topic"
        )

    def publish_customer_event(self, customer_event):
        xprint(
            "{}: CustomerEventProducer: Publishing customer event {}".format(
                self.worker_id, vars(customer_event)
            )
        )
        # To implement - publish a message to the Rabbitmq here
        # Use json.dumps(vars(customer_event)) to convert the ticket_event object to JSON
        self.channel.basic_publish(
            exchange=self.customer_event_exchange,
            routing_key=customer_event.customer_id,
            body=json.dumps(vars(customer_event)),
        )

    def close(self):
        # Do not edit this method
        self.channel.close()
