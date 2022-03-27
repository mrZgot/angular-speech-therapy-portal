const functions = require("firebase-functions");
const axios = require("axios");
const { v4: uuidv4 } = require("uuid");

const admin = require("firebase-admin");

const app = !admin.apps.length ? admin.initializeApp() : admin.app();
const db = admin.database();
let defaultPayment;

exports.pay = functions.https.onRequest(async (request, response) => {
  if (request.method !== "POST") {
    response.status(405).end();
  }

  functions.logger.debug(
    "request.body",
    JSON.stringify(request.body, null, "  ")
  );
  const orderId = request.body.id;
  functions.logger.debug("orderId:", orderId);

  const payment = await createPayment(orderId);

  try {
    const alfaResponse = await axios.post(getPaymentUrl(payment), undefined, {
      headers: {
        "Content-type": "application/x-www-form-urlencoded",
      },
    });
    functions.logger.debug("Alfa Bank API response.data: ", alfaResponse.data);
    response.send(alfaResponse.data);
  } catch (e) {
    functions.logger.error("Alfa Bank API error: ", e);
    response.status(500).send("Unexpected error occurred. Please try later");
  }
});

exports.callback = functions.https.onRequest(async (request, response) => {
  try {
    functions.logger.info(
      "Alfa Bank API payment callback: ",
      request.url,
      request.params
    );
    response.status(200).end();
  } catch (e) {
    functions.logger.error("Alfa Bank API payment callback error: ", e);
    response.status(200).end();
    //response.status(500).send("Unexpected error occurred. Please try later");
  }
});

exports.confirmPayment = functions.https.onRequest(
  async (request, response) => {
    functions.logger.info(
      "Alfa Bank API payment confirmation: ",
      request.url,
      request.params,
      request.query
    );
    response.status(200).end();
  }
);

exports.rejectPayment = functions.https.onRequest(async (request, response) => {
  functions.logger.info(
    "Alfa Bank API payment rejection: ",
    request.url,
    request.params,
    request.query
  );
  response.status(200).end();
});

exports.test = functions.https.onRequest(async (request, response) => {
  try {
    const value = await createPayment(
      "2021_5_30_15_dawRBLNTpDV5gep3mG9TyGAACrE3"
    );
    response.status(200).send(value);
  } catch (e) {
    functions.logger.error("Alfa Bank API payment callback error: ", e);
    response.status(500).send("Unexpected error occurred. Please try later");
  }
});

async function createPayment(orderId) {
  const token = uuidv4();
  const orderRef = db.ref(`events/${orderId}`);
  const paymentsRef = db.ref(`payments/${token}`);

  const shortIdRef = db.ref(`shortIds/${orderId.substring(orderId.lastIndexOf() + 1)}`);
  const snapshot = await orderRef.once("value");
  const shortId = snapshot.val();

  orderRef.update({
    paymentToken: token,
  });

  paymentsRef.set(orderId);

  return {
    ...(await getDefaultPayment()),
    orderNumber: shortId,
    // TODO: поменять на страницу подтверждения заказа в UI
    returnUrl: `${process.env.BASE_FUNCTIONS_URL}/orders-confirmPayment?token=${token}`,
    // TODO: поменять на страницу отмены заказа в UI
    failUrl: `${process.env.BASE_FUNCTIONS_URL}/orders-rejectPayment?token=${token}`,
    dynamicCallbackUrl: `${process.env.BASE_FUNCTIONS_URL}/orders-callback?token=${token}`,
  };
}

async function getDefaultPayment() {
  if (!defaultPayment) {
    const configurationRef = db.ref("configuration");
    const snapshot = await configurationRef.once("value");
    const configuration = snapshot.val();
    functions.logger.info(configuration);
    defaultPayment = {
      amount: configuration.price * 100,
      currency: configuration.currency,
      userName: process.env.ACQUIRING_API_USER_NAME,
      password: process.env.ACQUIRING_API_PASSWORD,
    };
  }

  return defaultPayment;
}

function getPaymentUrl(payment) {
  functions.logger.debug("payment: ", JSON.stringify(payment, null, "  "));

  const url = new URL(process.env.BASE_ACQUIRING_API_URL);
  for (let key in payment) {
    url.searchParams.append(key, payment[key]);
  }

  functions.logger.debug("Alfa Bank API url: ", url.toString());

  return url.toString();
}
