/* email-receipt.js — optional custom email receipts */

exports.handler = async function(event, context) {
  console.log("email-receipt.js loaded");

  // TODO:
  // 1. Parse order data
  // 2. Send email via SendGrid / Resend / Mailgun
  // 3. Return success message

  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Email receipt placeholder" })
  };
};
