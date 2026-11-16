from google.protobuf.internal import enum_type_wrapper as _enum_type_wrapper
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from typing import ClassVar as _ClassVar, Optional as _Optional, Union as _Union

DESCRIPTOR: _descriptor.FileDescriptor

class DeliveryRequest(_message.Message):
    __slots__ = ("orderID", "distance")
    ORDERID_FIELD_NUMBER: _ClassVar[int]
    DISTANCE_FIELD_NUMBER: _ClassVar[int]
    orderID: str
    distance: float
    def __init__(self, orderID: _Optional[str] = ..., distance: _Optional[float] = ...) -> None: ...

class DeliveryResponse(_message.Message):
    __slots__ = ("status", "trackingCode", "message", "server_port")
    class Status(int, metaclass=_enum_type_wrapper.EnumTypeWrapper):
        __slots__ = ()
        ACCEPTED: _ClassVar[DeliveryResponse.Status]
        REJECTED: _ClassVar[DeliveryResponse.Status]
    ACCEPTED: DeliveryResponse.Status
    REJECTED: DeliveryResponse.Status
    STATUS_FIELD_NUMBER: _ClassVar[int]
    TRACKINGCODE_FIELD_NUMBER: _ClassVar[int]
    MESSAGE_FIELD_NUMBER: _ClassVar[int]
    SERVER_PORT_FIELD_NUMBER: _ClassVar[int]
    status: DeliveryResponse.Status
    trackingCode: str
    message: str
    server_port: str
    def __init__(self, status: _Optional[_Union[DeliveryResponse.Status, str]] = ..., trackingCode: _Optional[str] = ..., message: _Optional[str] = ..., server_port: _Optional[str] = ...) -> None: ...
