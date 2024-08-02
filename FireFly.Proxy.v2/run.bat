@echo off

echo Starting GameServer...
start cmd /k "cargo run --bin gameserver"

echo Starting SDK_SERVER...
start cmd /k "cargo run --bin sdkserver"

echo Starting Proxy...
cd "Proxy"
start FreeSR.Tool.Proxy.exe
