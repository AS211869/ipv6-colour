ip6tables -t nat -p tcp -A PREROUTING -d 2a0e:8f02:f019:2f0::/64 -j REDIRECT --to-port 16161