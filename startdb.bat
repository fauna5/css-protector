@mkdir %~dp0data\db 2> nul
start cmd /C mongod --dbpath %~dp0\data