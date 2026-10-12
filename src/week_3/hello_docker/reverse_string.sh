#!/bin/sh

if [ -z "$STRING" ]
then
    /bin/echo -n "STRING is empty"
else
    len=${#STRING}
    i=$((len - 1))
    while [ $i -ge 0 ]; do
        /bin/echo -n "${STRING:$i:1}"
            i=$((i - 1))
    done
    /bin/echo
fi
