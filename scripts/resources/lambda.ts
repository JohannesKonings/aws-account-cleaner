import {
  LambdaClient,
  DeleteFunctionCommand,
  DeleteEventSourceMappingCommand,
} from "@aws-sdk/client-lambda";

export async function deleteLambdaFunction(functionArn: string) {
  const client = new LambdaClient();
  const command = new DeleteFunctionCommand({
    FunctionName: functionArn,
  });

  try {
    await client.send(command);
    console.log(`Deleted Lambda function: ${functionArn}`);
  } catch (error) {
    console.error(`Error deleting Lambda function ${functionArn}:`, error);
    throw error;
  }
}

export async function deleteEventSourceMapping(mappingArn: string) {
  const client = new LambdaClient();
  const esmUuid = mappingArn.split(":").pop();
  const command = new DeleteEventSourceMappingCommand({
    UUID: esmUuid,
  });

  try {
    await client.send(command);
    console.log(`Deleted Event Source Mapping: ${mappingArn}`);
  } catch (error) {
    console.error(`Error deleting Event Source Mapping ${mappingArn}:`, error);
    throw error;
  }
}
