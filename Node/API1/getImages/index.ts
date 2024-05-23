import { AzureFunction, Context, HttpRequest } from "@azure/functions";

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  context.log("HTTP trigger function processed a request.");

  const documents = context.bindings.documents;

  if (documents) {
    context.res = {
      body: documents,
    };
  } else {
    context.res = {
      status: 404,
      body: "No documents found.",
    };
  }
};

export default httpTrigger;
