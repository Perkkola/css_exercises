#!/bin/sh

if [ -z "$NUMBER" ]
then
    /bin/echo -n "NUMBER is empty"
else
    if [ "$NUMBER" -lt 0 ]; then
        /bin/echo -n "NUMBER must be a non-negative integer"
        exit 1
    fi

    result=1
    i=1
    while [ $i -le "$NUMBER" ]; do
        result=$(( result * i ))
        i=$(( i + 1 ))
    done

    /bin/echo "$result"
fi
