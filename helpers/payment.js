
async function PaymentProcess(dataPay) {
    try {
        console.log(dataPay);
        
        // Step 1: Get token
        let tokenResponse = await fetch('https://accept.paymob.com/api/auth/tokens', {
            method: 'post',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ "api_key": "ZXlKaGJHY2lPaUpJVXpVeE1pSXNJblI1Y0NJNklrcFhWQ0o5LmV5SmpiR0Z6Y3lJNklrMWxjbU5vWVc1MElpd2ljSEp2Wm1sc1pWOXdheUk2TVRBeE16Z3lOeXdpYm1GdFpTSTZJbWx1YVhScFlXd2lmUS5ERDNjeEdfaWZTYlNDOURQYnZsTVhVcXZ4VDFOc21FRll2OFcyR2lxVlNrR1AtcTMzYWRFSXNrT05BbV93N2pzWGJtVTFMWWkycXNMS2JDNGs3UGN0Zw==" })
        });

        let tokenData = await tokenResponse.json();
        let token = tokenData.token;

        // Step 2: Create order
        let orderResponse = await fetch('https://accept.paymob.com/api/ecommerce/orders', {
            method: 'post',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                "auth_token": token,
                "delivery_needed": "false",
                "amount_cents": (dataPay.price * 100).toString(),
                "currency": "EGP",
                "items": [],
            })
        });

        let orderDataResponse = await orderResponse.json();
        let orderId = orderDataResponse.id;

        // إعداد بيانات الفاتورة بناءً على بيانات المستخدم
        let billingData = {
            "apartment": "N/A",
            "email": dataPay.email,
            "floor":  "N/A",
            "first_name":dataPay.firstName,
            "street":  "Unknown Street",
            "building":  "N/A",
            "phone_number":"+201098583817",
            "shipping_method": "PKG",
            "postal_code": "00000",
            "city":"Cairo",
            "country": "EG",
            "last_name":dataPay.lastName,
            "state": "N/A"
        };

        // Step 3: Create payment key
        let paymentResponse = await fetch('https://accept.paymob.com/api/acceptance/payment_keys', {
            method: 'post',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                "auth_token": token,
                "amount_cents": (dataPay.price * 100).toString(),
                "expiration": 3600,
                "order_id": orderId,
                "billing_data": billingData,
                "currency": "EGP",
                "integration_id": 4907669,
                "redirection_url": "http://localhost:5173/success-payment"
            })
        });

        let paymentData = await paymentResponse.json();
        return {
            orderId,
            iframURL : `https://accept.paymob.com/api/acceptance/iframes/889545?payment_token=${paymentData.token}`
        }
        
    } catch (error) {
        console.error("Error processing payment:", error);
        throw error;
    }
}

module.exports = { PaymentProcess };