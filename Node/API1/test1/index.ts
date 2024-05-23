import { AzureFunction, Context, HttpRequest } from "@azure/functions";

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  const secret = process.env.SECRET_2;
  context.log("HTTP trigger function processed a request.");
  context.log(`This is secret #2: ${secret}`);
  const name = req.query.name || (req.body && req.body.name);
  const today = new Date();
  const dateString = today.toISOString().split("T")[0];
  const responseMessage = name
    ? "Hello, " + name + ". This HTTP triggered function executed successfully."
    : `This HTTP triggered function executed successfully. Pass a name in the query string or in the request body for a personalized response. Also, here's todays date: ${dateString}!`;

  const cities = ["Berlin", "Paris", "Rome", "Prague", "Vienna"];
  const randomCity = cities[Math.floor(Math.random() * cities.length)];
  context.log(`Enqueuing city: ${randomCity}`);
  context.log(process.env.QUEUE_ACCESS_KEY);
  context.bindings.outputQueueItem = randomCity;

  context.res = {
    // status: 200, /* Defaults to 200 */
    body: responseMessage,
  };
};

export default httpTrigger;
