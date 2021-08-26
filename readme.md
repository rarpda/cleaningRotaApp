Install java

Installing dynamodb locally for testing 
https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DynamoDBLocal.DownloadingAndRunning.html


Start local endpoint
java -D"java.library.path=./DynamoDBLocal_lib" -jar DynamoDBLocal.jar

create table  with entries
aws dynamodb create-table --cli-input-json file://test/databaseStarter.json --endpoint-url http://localhost:8000

aws dynamodb batch-write-item --request-items file://test/mockData.json --endpoint-url http://localhost:8000

