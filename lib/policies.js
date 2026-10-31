// Fill every [ADD] with your real policy before going live. Razorpay checks that these pages exist.
export const POLICIES = {
  shipping: { title: "Shipping policy", sections: [
    ["Where we ship", "We ship across India through Shiprocket."],
    ["Dispatch and delivery time", "[ADD: how many days to dispatch, and the usual delivery time]"],
    ["Shipping charge", "[ADD: flat charge, free above an amount, or free]. Any charge is shown at payment."],
    ["Tracking", "After dispatch you get a courier tracking ID. You can also check status on the Track order page with your order number and phone."]] },
  returns: { title: "Returns and refunds", sections: [
    ["Returns and exchanges", "[ADD: whether you accept returns or exchanges, within how many days, and the condition required]"],
    ["Wrong or damaged items", "[ADD: what customers should do and how fast you respond]"],
    ["Refunds", "[ADD: how and when refunds are paid, for example to the original payment method within X working days]"],
    ["Cancellations", "[ADD: until when an order can be cancelled]"]] },
  privacy: { title: "Privacy policy", sections: [
    ["What we collect", "When you order we collect your name, phone number, delivery address and optional email so we can deliver your order."],
    ["How we use it", "We use it to process payment, ship your order and send you its status. Payments are handled by Razorpay and deliveries by Shiprocket, so they receive the details they need to do that."],
    ["Your choices", "[ADD: how a customer can ask you to correct or delete their data, and your contact email]"]] },
  terms: { title: "Terms of service", sections: [
    ["Orders", "Placing an order is an offer to buy. We confirm it once payment succeeds. Items are available while stock lasts."],
    ["Prices and payment", "Prices are in Indian rupees. Payment is taken online through Razorpay."],
    ["Product details", "We list exact measurements for each size. Colours can look slightly different on different screens."],
    ["Contact and disputes", "[ADD: business name, address, email, and the governing law or city for disputes]"]] },
};
