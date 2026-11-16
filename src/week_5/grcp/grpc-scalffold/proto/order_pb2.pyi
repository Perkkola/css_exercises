from google.protobuf.internal import containers as _containers
from google.protobuf.internal import enum_type_wrapper as _enum_type_wrapper
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from collections.abc import Iterable as _Iterable, Mapping as _Mapping
from typing import ClassVar as _ClassVar, Optional as _Optional, Union as _Union

DESCRIPTOR: _descriptor.FileDescriptor

class OrderRequest(_message.Message):
    __slots__ = ("orderID", "items", "distance")
    ORDERID_FIELD_NUMBER: _ClassVar[int]
    ITEMS_FIELD_NUMBER: _ClassVar[int]
    DISTANCE_FIELD_NUMBER: _ClassVar[int]
    orderID: str
    items: _containers.RepeatedScalarFieldContainer[str]
    distance: float
    def __init__(self, orderID: _Optional[str] = ..., items: _Optional[_Iterable[str]] = ..., distance: _Optional[float] = ...) -> None: ...

class OrderResponse(_message.Message):
    __slots__ = ("orderID", "status", "itemMessage", "message", "trackingCode", "deliveryServerPort")
    class Status(int, metaclass=_enum_type_wrapper.EnumTypeWrapper):
        __slots__ = ()
        ACCEPTED: _ClassVar[OrderResponse.Status]
        REJECTED: _ClassVar[OrderResponse.Status]
    ACCEPTED: OrderResponse.Status
    REJECTED: OrderResponse.Status
    ORDERID_FIELD_NUMBER: _ClassVar[int]
    STATUS_FIELD_NUMBER: _ClassVar[int]
    ITEMMESSAGE_FIELD_NUMBER: _ClassVar[int]
    MESSAGE_FIELD_NUMBER: _ClassVar[int]
    TRACKINGCODE_FIELD_NUMBER: _ClassVar[int]
    DELIVERYSERVERPORT_FIELD_NUMBER: _ClassVar[int]
    orderID: str
    status: OrderResponse.Status
    itemMessage: _containers.RepeatedCompositeFieldContainer[items]
    message: str
    trackingCode: str
    deliveryServerPort: str
    def __init__(self, orderID: _Optional[str] = ..., status: _Optional[_Union[OrderResponse.Status, str]] = ..., itemMessage: _Optional[_Iterable[_Union[items, _Mapping]]] = ..., message: _Optional[str] = ..., trackingCode: _Optional[str] = ..., deliveryServerPort: _Optional[str] = ...) -> None: ...

class items(_message.Message):
    __slots__ = ("itemName",)
    ITEMNAME_FIELD_NUMBER: _ClassVar[int]
    itemName: str
    def __init__(self, itemName: _Optional[str] = ...) -> None: ...
